/*
 * @Author: qiuweikang 642827353@qq.com
 * @Date: 2022-07-14 11:07:15
 * @LastEditors: qiuweikang 642827353@qq.com
 * @LastEditTime: 2022-07-14 15:04:16
 * @FilePath: \demo\taro-ts\src\components\taro-react-echarts\hooks\usePrevious.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useEffect, useRef } from 'react';

export default function usePrevious<T = unknown>(value) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
