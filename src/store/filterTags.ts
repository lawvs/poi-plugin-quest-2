import { useCallback } from 'react'
import type { CATEGORY_TAGS, TYPE_TAGS } from '../tags'
import { useStore } from './store'

export const useFilterTags = () => {
  const {
    store: { categoryTags, typeTags },
    updateStore,
  } = useStore()
  const setCategoryTags = useCallback(
    (tagName: typeof CATEGORY_TAGS[number]['name']) => {
      updateStore({ categoryTags: { [tagName]: true } })
    },
    [updateStore]
  )
  const setTypeTags = useCallback(
    (tagName: typeof TYPE_TAGS[number]['name']) => {
      updateStore({ typeTags: { [tagName]: true } })
    },
    [updateStore]
  )

  return {
    categoryTags,
    typeTags,
    setCategoryTags,
    setTypeTags,
  }
}
