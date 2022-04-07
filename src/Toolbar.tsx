import { Button, InputGroup, Intent, Tag, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import type { ChangeEvent } from 'react'
import React, { useCallback } from 'react'
import { useThrottle } from 'react-use'
import styled from 'styled-components'
import { IN_POI } from './poi/env'
import { usePluginTranslation } from './poi/hooks'
import type { UnionQuest } from './questHelper'
import { useQuest, useSyncWithGame } from './store'
import { useFilterTags, useSyncGameTagEffect } from './store/filterTags'
import { useSearchInput } from './store/search'
import {
  ALL_CATEGORY_TAG,
  ALL_TYPE_TAG,
  CATEGORY_TAGS,
  TYPE_TAGS,
} from './tags'

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;

  & > * + * {
    margin-top: 8px;
  }
`

const TagsWrapper = styled.div`
  margin-left: -4px;
  margin-right: -4px;

  & > * {
    margin: 4px;
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
      <Button
        icon={IconNames.EXCHANGE}
        intent={intent}
        disabled={!IN_POI}
        onClick={handleClick}
      />
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

const Tags = () => {
  const { t } = usePluginTranslation()

  useSyncGameTagEffect()

  const { typeTags, categoryTags, setCategoryTags, setTypeTags } =
    useFilterTags()

  return (
    <>
      <TagsWrapper>
        {CATEGORY_TAGS.map(({ name }) => (
          <Tag
            onClick={() => setCategoryTags(name)}
            intent={
              categoryTags[name]
                ? name === ALL_CATEGORY_TAG.name
                  ? 'success'
                  : 'primary'
                : 'none'
            }
            interactive={true}
            key={name}
          >
            {t(name)}
          </Tag>
        ))}
      </TagsWrapper>
      <TagsWrapper>
        {TYPE_TAGS.map((tag) => (
          <Tag
            onClick={() => setTypeTags(tag.name)}
            intent={
              typeTags[tag.name]
                ? tag.name === ALL_TYPE_TAG.name
                  ? 'success'
                  : 'primary'
                : 'none'
            }
            interactive={true}
            key={tag.name}
          >
            {t(tag.name)}
            {'suffix' in tag && ' ' + tag.suffix}
          </Tag>
        ))}
      </TagsWrapper>
    </>
  )
}

export const Toolbar = () => {
  return (
    <ToolbarWrapper>
      <SearchInput></SearchInput>
      <Tags></Tags>
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
      } ${quest.docQuest.memo ?? ''}`
      return searchKeywords.some((keyword) =>
        text.toUpperCase().includes(keyword)
      )
    },
    [searchKeywords]
  )
  return stringFilter
}

const And =
  <T extends (...args: any[]) => boolean>(...fnArray: T[]) =>
  (...args: Parameters<T>) =>
    fnArray.every((fn) => fn(...args))

const Or =
  <T extends (...args: any[]) => boolean>(...fnArray: T[]) =>
  (...args: Parameters<T>) =>
    fnArray.some((fn) => fn(...args))

const useToolbarFilter = () => {
  const stringFilter = useInputStringFilter()
  const { typeTags, categoryTags } = useFilterTags()

  const typeTagsFilter = Or(
    ...TYPE_TAGS.filter((tag) => typeTags[tag.name]).map((tag) => tag.filter)
  )
  const categoryTagsFilter = Or(
    ...CATEGORY_TAGS.filter((tag) => categoryTags[tag.name]).map(
      (tag) => tag.filter
    )
  )
  const toolbarFilter = And(stringFilter, typeTagsFilter, categoryTagsFilter)
  return toolbarFilter
}

export const useFilterQuest = () => {
  const toolbarFilter = useToolbarFilter()
  return useQuest().filter(toolbarFilter)
}
