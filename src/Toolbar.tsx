import { Button, InputGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import type { ChangeEvent } from 'react'
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { usePluginTranslation } from './poi/hooks'
import { QUEST_STATUS, UnionQuest } from './questHelper'
import { PROGRESS_TAG, useQuest } from './store'
import {
  useFilterProgressTag,
  useFilterTags,
  useSyncGameTagEffect,
} from './store/filterTags'
import { useGlobalQuestStatusQuery } from './store/gameQuest'
import { useSearchInput, useStableSearchWords } from './store/search'
import { CATEGORY_TAGS, CategoryTags, TYPE_TAGS, TypeTags } from './tags'
import { And, Or } from './utils'

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;

  & > * + * {
    margin-top: 8px;
  }
`

export const SearchInput: React.FC = () => {
  const { t } = usePluginTranslation()
  const { searchInput, setSearchInput } = useSearchInput()

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setSearchInput(event.target.value),
    [setSearchInput]
  )

  const handleClear = useCallback(() => setSearchInput(''), [setSearchInput])

  return (
    <InputGroup
      value={searchInput}
      onChange={handleChange}
      placeholder={t('Search')}
      leftIcon={IconNames.SEARCH}
      rightElement={
        <>
          {!!searchInput && (
            <Button icon={IconNames.CROSS} onClick={handleClear} />
          )}
        </>
      }
      type="text"
    />
  )
}

export const Toolbar = () => {
  // TODO remove
  useSyncGameTagEffect()

  return (
    <ToolbarWrapper>
      <SearchInput></SearchInput>
      <CategoryTags />
      <TypeTags />
    </ToolbarWrapper>
  )
}

const useInputStringFilter = () => {
  const searchKeywords = useStableSearchWords()
  const stringFilter = useCallback(
    (quest: UnionQuest) => {
      if (!searchKeywords || !searchKeywords.length) {
        return true
      }
      const text = `${quest.docQuest.code} ${quest.docQuest.name} ${
        quest.docQuest.desc
      } ${quest.docQuest.memo ?? ''} ${quest.docQuest.memo2 ?? ''}`
      return searchKeywords.some((keyword) =>
        text.toUpperCase().includes(keyword)
      )
    },
    [searchKeywords]
  )
  return stringFilter
}

const useToolbarFilter = (): ((quest: UnionQuest) => boolean) => {
  const searchFilter = useInputStringFilter()
  const { typeTags, categoryTags } = useFilterTags()

  const { progressTag } = useFilterProgressTag()
  const questStatusQuery = useGlobalQuestStatusQuery()

  const progressTagFilter = useCallback(
    (quest: UnionQuest): boolean => {
      const questStatus = questStatusQuery(quest.gameId)
      switch (progressTag) {
        case PROGRESS_TAG.All:
          return true
        case PROGRESS_TAG.Locked:
          return (
            questStatus === QUEST_STATUS.LOCKED ||
            questStatus === QUEST_STATUS.UNKNOWN
          )
        case PROGRESS_TAG.Unlocked:
          return (
            questStatus === QUEST_STATUS.DEFAULT ||
            questStatus === QUEST_STATUS.IN_PROGRESS ||
            questStatus === QUEST_STATUS.COMPLETED
          )
        case PROGRESS_TAG.AlreadyCompleted:
          return (
            questStatus === QUEST_STATUS.COMPLETED ||
            questStatus === QUEST_STATUS.ALREADY_COMPLETED
          )
        default:
          console.warn('Unknown progressTag type!', progressTag)
      }
      return true
    },
    [progressTag, questStatusQuery]
  )

  const typeTagsFilter = Or(
    ...TYPE_TAGS.filter((tag) => typeTags[tag.name]).map((tag) => tag.filter)
  )
  const categoryTagsFilter = Or(
    ...CATEGORY_TAGS.filter((tag) => categoryTags[tag.name]).map(
      (tag) => tag.filter
    )
  )

  const toolbarFilter = And(
    searchFilter,
    typeTagsFilter,
    categoryTagsFilter,
    progressTagFilter
  )

  return toolbarFilter
}

export const useFilterQuest = () => {
  const toolbarFilter = useToolbarFilter()
  return useQuest().filter(toolbarFilter)
}
