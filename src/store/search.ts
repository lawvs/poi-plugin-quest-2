import { useCallback } from 'react'
import { useStore } from './store'

export const useSearchInput = () => {
  const {
    store: { searchInput },
    updateStore,
  } = useStore()
  const setSearchInput = useCallback(
    (value: string) => updateStore({ searchInput: value }),
    [updateStore]
  )
  return {
    searchInput,
    setSearchInput,
  }
}
