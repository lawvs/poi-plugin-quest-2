import { Button, InputGroup, Intent, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import type { ChangeEvent } from 'react'
import React, { useCallback } from 'react'
import { useThrottle } from 'react-use'
import styled from 'styled-components'
import { usePluginTranslation } from './poi/hooks'
import type { UnionQuest } from './questHelper'
import { useQuest, useSyncWithGame } from './store'
import { useFilterTags, useSyncGameTagEffect } from './store/filterTags'
import { useSearchInput } from './store/search'
import { CategoryTags, CATEGORY_TAGS, TypeTags, TYPE_TAGS } from './tags'
import { And, Or } from './utils'

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;

  & > * + * {
    margin-top: 8px;
  }
`

const SyncButton = () => {
  const { t } = usePluginTranslation()
  const { searchInput } = useSearchInput()
  const { syncWithGame, toggleSyncWithGame } = useSyncWithGame()
  const handleClick = useCallback(() => {
    toggleSyncWithGame()
  }, [toggleSyncWithGame])
  const intent = syncWithGame
    ? searchInput
      ? Intent.WARNING
      : Intent.SUCCESS
    : Intent.NONE
  return (
    <Tooltip content={t('Sync with game')}>
      <Button icon={IconNames.EXCHANGE} intent={intent} onClick={handleClick} />
    </Tooltip>
  )
}

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
          <SyncButton></SyncButton>
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
  const { searchInput } = useSearchInput()
  const throttledSearchInput = useThrottle(searchInput)
  const searchKeywords = throttledSearchInput
    .split(' ')
    // Remove empty string
    .filter((i) => !!i)
    .map((i) => i.toUpperCase())

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

const useToolbarFilter = () => {
  const searchFilter = useInputStringFilter()
  const { typeTags, categoryTags } = useFilterTags()

  const typeTagsFilter = Or(
    ...TYPE_TAGS.filter((tag) => typeTags[tag.name]).map((tag) => tag.filter)
  )
  const categoryTagsFilter = Or(
    ...CATEGORY_TAGS.filter((tag) => categoryTags[tag.name]).map(
      (tag) => tag.filter
    )
  )
  const toolbarFilter = And(searchFilter, typeTagsFilter, categoryTagsFilter)
  return toolbarFilter
}

export const useFilterQuest = () => {
  const toolbarFilter = useToolbarFilter()
  return useQuest().filter(toolbarFilter)
}
