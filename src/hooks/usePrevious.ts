import { useEffect, useRef } from 'react';

export default function usePrevious<T = unknown>(value) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
