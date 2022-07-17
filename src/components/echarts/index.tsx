import Taro, { nextTick } from '@tarojs/taro'
import { Canvas } from '@tarojs/components'
import { useEffect, useRef, useState, useMemo, FC } from 'react'
import { isString, isFunction, isEqual, pick, uniqueId, compareVersion } from './utils'
import WxCanvas from './wx-canvas'
import { usePrevious, useMount, useUnMount } from '../../hooks'
import { EChartsReactProps, InitEchart } from './types'

const Echarts: FC<EChartsReactProps> = ({ echarts, canvasId: pCanvasId, ...props }) => {
  const canvasRef = useRef<HTMLDivElement | HTMLCanvasElement | null>(null)
  const [isInitialResize, setIsInitialResize] = useState<boolean>(true)
  const prevProps = usePrevious<EChartsReactProps>(props)
  const canvasId = useMemo(() => pCanvasId || uniqueId('canvas_'), [pCanvasId])
  const canvasProps = useMemo(
    () => [
      'disableScroll',
      'disableScroll',
      'onTouchStart',
      'onTouchMove',
      'onTouchEnd',
      'onTouchCancel',
      'onLongTap',
      'onError',
      'nativeProps',
      'className',
      'key',
      'id',
      'hidden',
      'animation',
    ],
    [],
  )

  useMount(() => {
    nextTick(() => {
      initChart()
    })
  })

  useUnMount(() => {
    dispose()
  })

  useEffect(() => {
    const pickKeys = [
      'theme',
      'option',
      'onEvents',
      'notMerge',
      'lazyUpdate',
      'showLoading',
      'loadingOption',
    ]
    if (!isEqual(pick(props, pickKeys), pick(prevProps, pickKeys))) {
      // 需要销毁后重新实例化
      dispose()
      initChart()
    }

    /**
     * 当样式和类发生变化
     */
    if (
      !isEqual(prevProps?.style, props.style) ||
      !isEqual(prevProps?.className, props.className)
    ) {
      resize(canvasRef.current)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props])

  // 大小变化
  const resize = canvas => {
    const echartsInstance = echarts.getInstanceByDom(canvas)
    // 调整大小不应在第一次渲染时发生，因为它会取消初始 echarts 动画
    if (!isInitialResize) {
      try {
        echartsInstance.resize({ width: 'auto', height: 'auto' })
      } catch (e) {
        console.warn(e)
      }
    }
    setIsInitialResize(false)
  }

  const initEchartsInstance = async ({ dom, width, height, devicePixelRatio }: InitEchart) => {
    const { theme, opts } = props
    return new Promise(resolve => {
      const charts = echarts.init(dom, theme, {
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
        const echartsInstance = echarts.getInstanceByDom(dom)
        echartsInstance.on('finished', () => {
          echarts.dispose(dom)
          // 获取渲染后的width、height
          const newOpts = {
            width: dom.clientWidth,
            height: dom.clientHeight,
            devicePixelRatio,
            ...opts,
          }
          resolve(echarts.init(dom, theme, newOpts))
        })
      } else {
        resolve(charts)
      }
    })
  }

  const updateEChartsOption = ({ dom }: Pick<InitEchart, 'dom'>) => {
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
    const echartInstance = echarts.getInstanceByDom(dom)
    if (echartInstance) {
      // 2. 设置option
      echartInstance.hideLoading()
      echartInstance.setOption(option, notMerge, lazyUpdate)
      // 3. 显示加载动画效果
      if (showLoading) echartInstance.showLoading(loadingOption)
    }

    return echartInstance
  }

  const bindEvents = (instance, events) => {
    function _bindEvent(eventName, func) {
      if (isString(eventName) && isFunction(func)) {
        instance.on(eventName, param => {
          func(param, instance)
        })
      }
    }

    // loop and bind
    for (const eventName in events) {
      if (Object.prototype.hasOwnProperty.call(events, eventName)) {
        _bindEvent(eventName, events[eventName])
      }
    }
  }

  const renderEcharts = async ({ dom, width, height, devicePixelRatio }: InitEchart) => {
    const { onEvents, onChartReady } = props
    // 1. 初始化图表
    await initEchartsInstance({ dom, width, height, devicePixelRatio })
    // 2. 更新echarts实例
    const echartsInstance = updateEChartsOption({ dom })
    // 3. 绑定事件
    bindEvents(echartsInstance, onEvents || {})
    // 4. 图表渲染完成
    if (isFunction(onChartReady)) onChartReady?.(echartsInstance)
  }

  const dispose = () => {
    // 销毁echarts实例
    echarts?.dispose(canvasRef.current)
  }

  // 初始化微信小程序图表
  const initWexinChart = () => {
    const query = Taro.createSelectorQuery()
    query
      .select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec(res => {
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
            dom: (canvas as unknown) as HTMLDivElement | HTMLCanvasElement,
            width,
            height,
            devicePixelRatio: canvasDpr,
          })
        }
      })
  }

  const initChart = () => {
    if (Taro.getEnv() === Taro.ENV_TYPE.WEB && canvasRef.current) {
      const width = canvasRef.current?.clientWidth
      const height = canvasRef.current?.clientHeight
      canvasRef.current = canvasRef.current
      renderEcharts({
        dom: canvasRef.current,
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
        console.error('微信基础库版本过低，需大于等于 2.9.0')
      }
    }
  }
  return (
    <Canvas
      type='2d'
      id={canvasId}
      canvasId={canvasId}
      style={{ width: '100%', height: '300px', ...props.style }}
      ref={canvasRef}
      {...pick(props, canvasProps)}
    />
  )
}
export default Echarts
