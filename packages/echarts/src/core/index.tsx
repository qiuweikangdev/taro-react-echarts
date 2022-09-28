import Taro, { nextTick, useReady } from '@tarojs/taro'
import { Canvas, View } from '@tarojs/components'
import { useRef, useState, useMemo, FC, memo, useEffect, CSSProperties } from 'react'
import { isString, isFunction, isEqual, pick, uniqueId, compareVersion, tripleDefer } from './utils'
import WxCanvas from '../weapp/wx-canvas'
import { touchEnd, touchMove, touchStart } from '../weapp/wx-touch'
import { usePrevious, useUnMount, useUpdateEffect } from '../hooks'
import { EChartsProps, InitEchart, EChartsInstance } from './types'

const Echarts: FC<EChartsProps> = ({ echarts, isPage = true, canvasId: pCanvasId, ...props }) => {
  const canvasRef = useRef<HTMLDivElement | HTMLCanvasElement | null>()
  const chartRef = useRef<EChartsInstance>()
  const [isInitialResize, setIsInitialResize] = useState<boolean>(true)
  const prevProps = usePrevious<EChartsProps>(props)
  const canvasId = useMemo(() => pCanvasId || uniqueId('canvas_'), [pCanvasId])
  const canvasProps = useMemo(
    () => [
      'disableScroll',
      'disableScroll',
      'onTouchCancel',
      'onLongTap',
      'onError',
      'nativeProps',
      'className',
      'key',
      'hidden',
      'animation',
    ],
    [],
  )
  const canvasStyle = useMemo(
    () =>
      ({
        width: '100%',
        height: '300px',
        ...(props.style as CSSProperties),
      } as CSSProperties),
    [props.style],
  )
  /**
   * issues: https://github.com/NervJS/taro/issues/7116
   * 获取小程序渲染层的节点要在 onReady 生命周期，等同于 useReady hooks
   * 访问小程序渲染层的 DOM 节点。
   */
  useReady(() => {
    // 顶层页面级别才触发useReady 【注意Popup 、Dialog 等弹出层 都不是页面级别】
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP && isPage) {
      nextTick(() => {
        initChart()
      })
    }
  })

  useEffect(() => {
    if (Taro.getEnv() === Taro.ENV_TYPE.WEB || !isPage) {
      tripleDefer(() => {
        nextTick(() => {
          initChart()
        })
      })
    }
  }, [])

  useUnMount(() => {
    dispose()
  })

  useUpdateEffect(() => {
    if (
      !isEqual(prevProps?.theme, props.theme) ||
      !isEqual(prevProps?.opts, props.opts) ||
      !isEqual(prevProps?.onEvents, props.onEvents)
    ) {
      dispose()
      initChart() // re-render
      return
    }

    // update
    const pickKeys = ['option', 'notMerge', 'lazyUpdate', 'showLoading', 'loadingOption']
    if (!isEqual(pick(props, pickKeys), pick(prevProps, pickKeys))) {
      updateEChartsOption()
    }

    /**
     * resize: style 、className
     */
    if (
      !isEqual(prevProps?.style, props.style) ||
      !isEqual(prevProps?.className, props.className)
    ) {
      resize(canvasRef.current)
    }
  }, [props])

  // 大小变化
  const resize = (canvas) => {
    const echartsInstance = echarts.getInstanceByDom(canvas)
    // 调整大小不应在第一次渲染时发生，因为它会取消初始 echarts 动画
    if (!isInitialResize) {
      try {
        echartsInstance.resize({
          width: 'auto',
          height: 'auto',
        })
      } catch (e) {
        console.warn(e)
      }
    }
    setIsInitialResize(false)
  }

  const initEchartsInstance = async ({ width, height, devicePixelRatio }: InitEchart) => {
    const { theme, opts } = props
    return new Promise((resolve, reject) => {
      if (canvasRef.current) {
        chartRef.current = echarts.init(canvasRef.current, theme, {
          width,
          height,
          devicePixelRatio,
          ...opts,
        })
        if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
          /**
           * echart同一个dom下多次动态渲染值，防止值、事件重复互相影响
           * 每次init之后，先dispose释放下资源，再重新init
           */
          const echartsInstance = echarts.getInstanceByDom(canvasRef.current)
          echartsInstance.on('finished', () => {
            echarts.dispose(canvasRef.current)
            // 获取渲染后的width、height
            const newOpts = {
              width,
              height,
              devicePixelRatio,
              ...opts,
            }
            chartRef.current = echarts.init(canvasRef.current, theme, newOpts)
            resolve(chartRef.current)
          })
        } else {
          resolve(chartRef.current)
        }
      } else {
        reject(null)
      }
    })
  }

  const updateEChartsOption = () => {
    /**
     *  官方文档：https://echarts.apache.org/zh/api.html#echartsInstance.setOption
     */
    const {
      option,
      notMerge = true, // 不跟之前设置的option合并，保证每次渲染都是最新的option
      lazyUpdate = false, // 设置完 option 后是否不立即更新图表，默认为 false，即同步立即更新。如果为 true，则会在下一个 animation frame 中，才更新图表
      showLoading,
      loadingOption = null,
    } = props
    // 1. 获取echarts实例
    const echartInstance = echarts.getInstanceByDom(canvasRef.current)
    if (echartInstance) {
      // 2. 设置option
      echartInstance.setOption(option, notMerge, lazyUpdate)
      // 3. 显示加载动画效果
      if (showLoading) echartInstance.showLoading(loadingOption)
      else echartInstance.hideLoading()
    }

    return echartInstance
  }

  // 绑定事件
  const bindEvents = (instance, events) => {
    function _bindEvent(eventName, func) {
      if (isString(eventName) && isFunction(func)) {
        instance.on(eventName, (param) => {
          func(param, instance)
        })
      }
    }

    for (const eventName in events) {
      if (Object.prototype.hasOwnProperty.call(events, eventName)) {
        _bindEvent(eventName, events[eventName])
      }
    }
  }

  // 渲染图表
  const renderEcharts = async ({ width, height, devicePixelRatio }: InitEchart) => {
    const { onEvents, onChartReady } = props
    // 1. 初始化图表
    await initEchartsInstance({
      width,
      height,
      devicePixelRatio,
    })
    // 2. 更新echarts实例
    const echartsInstance = updateEChartsOption()
    // 3. 绑定事件
    bindEvents(echartsInstance, onEvents || {})
    // 4. 图表渲染完成
    if (isFunction(onChartReady)) onChartReady?.(echartsInstance)

    // 5. resize
    if (canvasRef.current) {
      resize(canvasRef.current)
    }
  }

  // 销毁echarts实例
  const dispose = () => {
    if (canvasRef.current) {
      echarts?.dispose(canvasRef.current)
    }
  }

  // 初始化微信小程序图表
  const initWexinChart = () => {
    const query = Taro.createSelectorQuery()
    query
      .select(`#${canvasId}`)
      .fields({
        node: true,
        size: true,
      })
      .exec((res) => {
        const [result] = res
        if (result) {
          const { node, width, height } = result || {}
          const canvasNode = node
          const canvasDpr = Taro.getSystemInfoSync().pixelRatio
          const ctx = canvasNode.getContext('2d')
          const canvas = new WxCanvas(ctx, true, canvasNode)
          echarts?.setCanvasCreator(() => {
            return canvas
          })
          canvasRef.current = canvas as any
          renderEcharts({
            width,
            height,
            devicePixelRatio: canvasDpr,
          })
        }
      })
  }

  // 初始化图表
  const initChart = () => {
    if (Taro.getEnv() === Taro.ENV_TYPE.WEB && canvasRef.current) {
      const width = props.style?.width || canvasRef.current?.clientWidth || window.innerWidth
      const height = props.style?.height || canvasRef.current?.clientHeight || 300
      renderEcharts({
        width,
        height,
        devicePixelRatio: window.devicePixelRatio,
      })
    } else {
      const version = Taro.getSystemInfoSync().SDKVersion
      const canUseNewCanvas = compareVersion(version, '2.9.0') >= 0
      if (canUseNewCanvas) {
        // console.log('微信基础库版本大于2.9.0，开始使用<canvas type="2d"/>');
        // 2.9.0 可以使用 <canvas type="2d"></canvas>
        initWexinChart()
      } else {
        console.error(`当前基础库为${version}, 微信基础库版本过低，需大于等于 2.9.0`)
      }
    }
  }

  // container component
  const renderContainerComponent = useMemo(() => {
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      return (
        <Canvas
          type='2d'
          id={canvasId}
          canvasId={canvasId}
          style={canvasStyle}
          ref={canvasRef}
          onTouchStart={(event) => touchStart({ chart: chartRef.current, event })}
          onTouchMove={(event) => touchMove({ chart: chartRef.current, event })}
          onTouchEnd={(event) => touchEnd({ chart: chartRef.current, event })}
          {...pick(props, canvasProps)}
        />
      )
    }
    return <View ref={canvasRef} id={canvasId} style={canvasStyle} />
  }, [props, canvasProps, canvasId])

  return renderContainerComponent
}

export default memo(Echarts)
