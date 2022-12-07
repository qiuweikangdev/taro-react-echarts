# taro-react-echarts

基于Taro3、React的H5和微信小程序多端图表组件

- 兼容H5、微信小程序

- 开箱即用，快速开发图表，满足在移动端各种可视化需求

- 支持自定义构建echarts

![](https://raw.githubusercontent.com/qiuweikangdev/taro-react-echarts/master/images/demo.png)

# 安装

```bash
npm install taro-react-echarts
```

# 导入组件

```js
import Echarts from 'taro-react-echarts'
```

# 参数说明

## Echarts

| 参数            | 描述                                                         | 类型    | 必传 | 默认值            |
| --------------- | ------------------------------------------------------------ | ------- | ---- | ----------------- |
| 本身参数        | 参考[Canvas](https://taro-docs.jd.com/taro/docs/components/canvas/) 【微信小程序】 |         |      |                   |
| `echarts`       | echarts对象，可[自定义构建](https://echarts.apache.org/zh/builder.html) | echarts | 是   |                   |
| `option`        | 参考[setOption](https://echarts.apache.org/zh/option.html#title) | object  | 是   |                   |
| `className`     | echarts类名                                                  | string  | 否   | `key`             |
| `style`         | echarts样式对象                                              | object  | 否   | {height: '300px'} |
| `className`     | echarts类名                                                  | string  | 否   |                   |
| `theme`         | echarts 的主题                                               | string  | 否   |                   |
| `notMerge`      | 默认为true,不跟之前设置的option合并，保证每次渲染都是最新的option | boolean | 否   | true              |
| `lazyUpdate`    | setOption 时，延迟更新数据                                   | boolean | 否   | false             |
| `showLoading`   | 图表渲染时，是否显示加载状态                                 | boolean | 否   |                   |
| `loadingOption` | 参考[loading配置项](https://echarts.apache.org/zh/api.html#echartsInstance.showLoading) | object  | 否   |                   |
| `opts`          | 参考[echarts. init](https://echarts.apache.org/zh/api.html#echarts.init) | string  | 否   |                   |
| `onEvents`      | 绑定 echarts 事件                                            | object  | 否   |                   |
| `isPage`        | 表示是否是顶层页面级别 【1、注意嵌套在Popup 、Dialog 、Picker等弹出层都不是页面级别，需要设置为false，否则可能会不显示 2、以及嵌套在Tabs标签页中如果出现显示不正常，可设置isPage为false, 因为都有可能不触发useReady】 | boolean | 否   | true              |

## Events

| 事件名            | 描述                             | 类型       | 必传  | 默认值 |
| -------------- | ------------------------------ | -------- | --- | --- |
| `onChartReady` | 当图表准备好时，将使用 echarts 对象作为参数回调函数 | Function | 否   |     |

# 使用

```js
import { useRef } from 'react'
import Echarts, { EChartOption, EchartsHandle } from 'taro-react-echarts'
import echarts from '@/assets/js/echarts.js'

export default function Demo() {
 const echartsRef = useRef<EchartsHandle>(null)
 const option: EChartOption = {
    legend: {
      top: 50,
      left: 'center',
      z: 100
    },
    tooltip: {
      trigger: 'axis',
      show: true,
      confine: true
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line'
      }
    ]
  }

  return (
      <Echarts
        echarts={echarts}
        option={option}
        ref={echartsRef}
      ></Echarts>
  );
}
```

# 友情推荐

| 项目                                                         | 描述                                             |
| ------------------------------------------------------------ | ------------------------------------------------ |
| [taro-react-table](https://github.com/qiuweikangdev/taro-react-table) | 基于 taro3、react 的 H5 和微信小程序多端表格组件 |
