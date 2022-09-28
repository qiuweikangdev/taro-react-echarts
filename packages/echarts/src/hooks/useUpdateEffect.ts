import { useEffect } from 'react'
import useFirstMountState from './useFirstMountState'

export default function useUpdateEffect(effect, deps) {
  const isFirstMount = useFirstMountState() // 是否首次渲染

  useEffect(() => {
    if (!isFirstMount) {
      // 如果不是首次，则执行 effect 函数
      return effect()
    }
  }, deps)
}
