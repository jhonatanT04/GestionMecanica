import { useCallback, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useAsyncData<T>(fetcher: () => Promise<T>): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })

  const load = useCallback(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => load(), [load])

  return { ...state, refetch: load }
}
