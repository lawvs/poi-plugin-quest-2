import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from './store'

// Fix https://github.com/streamich/react-use/issues/2488
// Ported from https://hooks-guide.netlify.app/community/useThrottle
const useThrottle = <T>(value: T, limit = 200) => {
  const [throttledValue, setThrottledValue] = useState(value)
  // eslint-disable-next-line react-hooks/purity
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
    (value: string) =>
      updateStore({ searchInput: value, advancedSearchMode: false }),
    [updateStore],
  )
  return {
    searchInput,
    setSearchInput,
  }
}

export const useSearchMode = () => {
  const {
    store: { advancedSearchMode },
    updateStore,
  } = useStore()
  const setAdvancedSearchMode = useCallback(
    (val: boolean) => updateStore({ advancedSearchMode: val }),
    [updateStore],
  )
  return { advancedSearchMode, setAdvancedSearchMode }
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

export const useHighlightWords = () => {
  const searchWords = useStableSearchWords()
  const { advancedSearchMode } = useSearchMode()
  // Should not show highlight when in advanced search mode
  const highlightWords = advancedSearchMode ? [] : searchWords
  return highlightWords
}
