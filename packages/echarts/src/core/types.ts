import { CanvasProps } from '@tarojs/components/types/Canvas'
import { EChartOption, EChartsLoadingOption, ECharts } from 'echarts'
import { CSSProperties } from 'react'
export type { EChartOption, ECharts as EChartsInstance, EChartsLoadingOption } from 'echarts'

export type Opts = {
  devicePixelRatio?: number | undefined
  renderer?: string | undefined
  width?: number | string | undefined
  height?: number | string | undefined
}

export type EChartsProps = CanvasProps & {
  echarts: any
  className?: string
  style?: CSSProperties
  option: EChartOption
  theme?: string | Record<string, any>
  notMerge?: boolean
  lazyUpdate?: boolean
  showLoading?: boolean
  loadingOption?: EChartsLoadingOption
  /**
   *  https://echarts.apache.org/zh/api.html#echarts.init
   */
  opts?: Opts
  onChartReady?: (instance: ECharts) => void
  onEvents?: Record<string, (...args: any[]) => void>
  isPage?: boolean
}

export type InitEchart = {
  devicePixelRatio: number | undefined
  width: number | string | undefined
  height: number | string | undefined
}
