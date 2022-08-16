import { useCallback } from 'react'
import { useUpdateEffect } from 'react-use'
import { useGameTab } from '../poi/hooks'
import { QuestTab } from '../poi/types'
import { CATEGORY_TAGS, TYPE_TAGS } from '../tags'
import {
  ALL_CATEGORY_TAG,
  ALL_TYPE_TAG,
  PROGRESS_TAG,
  useStore,
  useSyncWithGame,
} from './store'

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
  const setMultiTypeTags = useCallback(
    (data: Record<string, boolean>) => {
      updateStore({ typeTags: data })
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
    setMultiTypeTags,
    setTypeTagsAll,
  }
}

export const useFilterProgressTag = () => {
  const {
    store: { progressTag },
    updateStore,
  } = useStore()

  const toggleTag = useCallback(
    (tag: PROGRESS_TAG) => {
      if (progressTag === tag) {
        updateStore({ progressTag: PROGRESS_TAG.All })
        return
      }
      updateStore({ progressTag: tag })
    },
    [progressTag, updateStore]
  )

  return {
    progressTag,
    toggleTag,
  }
}

/**
 * @deprecated Should not update state when render
 */
export const useSyncGameTagEffect = () => {
  const { syncWithGame } = useSyncWithGame()
  const filterTags = useFilterTags()
  const tab = useGameTab()

  useUpdateEffect(() => {
    if (!syncWithGame) {
      return
    }
    switch (tab) {
      case QuestTab.ALL:
        filterTags.setTypeTagsAll()
        break
      case QuestTab.DAILY:
        filterTags.setTypeTags('Daily')
        break
      case QuestTab.WEEKLY:
        filterTags.setTypeTags('Weekly')
        break
      case QuestTab.MONTHLY:
        filterTags.setTypeTags('Monthly')
        break
      case QuestTab.IN_PROGRESS:
        filterTags.setTypeTags('In Progress')
        break
      case QuestTab.OTHERS:
        filterTags.setMultiTypeTags({ Quarterly: true, Yearly: true })
        break
      case QuestTab.ONCE:
        filterTags.setTypeTags('One-time')
        break
      default:
        break
    }
  }, [syncWithGame, tab])
}
