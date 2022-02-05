import { useCallback } from 'react'
import {
  ALL_CATEGORY_TAG,
  ALL_TYPE_TAG,
  CATEGORY_TAGS,
  TYPE_TAGS,
} from '../tags'
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

  const setCategoryTagsAll = useCallback(() => {
    setCategoryTags(ALL_CATEGORY_TAG.name)
  }, [setCategoryTags])

  const setTypeTags = useCallback(
    (tagName: typeof TYPE_TAGS[number]['name']) => {
      updateStore({ typeTags: { [tagName]: true } })
    },
    [updateStore]
  )
  const setTypeTagsAll = useCallback(() => {
    setTypeTags(ALL_TYPE_TAG.name)
  }, [setTypeTags])

  return {
    categoryTags,
    typeTags,
    setCategoryTags,
    setCategoryTagsAll,
    setTypeTags,
    setTypeTagsAll,
  }
}
