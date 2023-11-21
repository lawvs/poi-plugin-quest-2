import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from './store'

// Fix https://github.com/streamich/react-use/issues/2488
// Ported from https://hooks-guide.netlify.app/community/useThrottle
const useThrottle = <T>(value: T, limit = 200) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRan = useRef(Date.now())
  useEffect(() => {
    const handler = setTimeout(
      function () {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value)
          lastRan.current = Date.now()
        }
      },
      limit - (Date.now() - lastRan.current),
    )
    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])
  return throttledValue
}

export const useSearchInput = () => {
  const {
    store: { searchInput },
    updateStore,
  } = useStore()
  const setSearchInput = useCallback(
    (value: string) => updateStore({ searchInput: value }),
    [updateStore],
  )
  return {
    searchInput,
    setSearchInput,
  }
}

export const useStableSearchWords = () => {
  const { searchInput } = useSearchInput()
  const throttledSearchInput = useThrottle(searchInput)
  const searchKeywords = throttledSearchInput
    .split(' ')
    // Remove empty string
    .filter((i) => !!i)
    .map((i) => i.toUpperCase())

  return searchKeywords
}
