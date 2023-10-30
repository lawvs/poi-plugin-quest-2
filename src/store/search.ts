import { useCallback } from 'react'
import { useThrottle } from 'react-use'
import { useStore } from './store'

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
