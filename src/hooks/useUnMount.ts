import { useEffect } from 'react'

export default function useUnMount(fn: () => void) {
  useEffect(() => fn, [])
}
