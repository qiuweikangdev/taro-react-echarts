import { useEffect } from 'react';

export default function useMount (fn: () => void) {
  useEffect(() => {
    fn?.();
  }, []);
};
