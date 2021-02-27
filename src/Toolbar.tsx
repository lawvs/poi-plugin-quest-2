import { InputGroup, Tag } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import styled from 'styled-components'
import React, { useCallback } from 'react'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useThrottle } from './utils'
import { useStore } from './store'
import {
  ALL_TYPE_TAG,
  ALL_CATEGORY_TAG,
  TYPE_TAGS,
  CATEGORY_TAGS,
  ALL_TAGS,
} from './tags'
import type { KcanotifyQuestWithGameId } from './questHelper'
import { QuestData } from '../build/kcanotifyGamedata'

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;

  & > * + * {
    margin-top: 8px;
  }
`

const TagsWrapper = styled.div`
  padding: -4px;

  & > * {
    margin: 4px;
  }
`

export const SearchInput: React.FC = () => {
  const { t } = useTranslation()
  const { updateStore } = useStore()

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      updateStore({ searchInput: event.target.value }),
    [updateStore]
  )

  return (
    <InputGroup
      onChange={handleChange}
      placeholder={t('Search')}
      leftIcon={IconNames.SEARCH}
      type="text"
    />
  )
}

const Tags = () => {
  const { t } = useTranslation()
  const {
    store: { typeTags, categoryTags },
    updateStore,
  } = useStore()
  const withHandleClickTag = useCallback(
    (tagName: string, key: 'typeTags' | 'categoryTags') => () =>
      updateStore({ [key]: { [tagName]: true } }),
    [updateStore]
  )

  return (
    <>
      <TagsWrapper>
        {CATEGORY_TAGS.map(({ name }) => (
          <Tag
            onClick={withHandleClickTag(name, 'categoryTags')}
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
        {TYPE_TAGS.map(({ name }) => (
          <Tag
            onClick={withHandleClickTag(name, 'typeTags')}
            intent={
              typeTags[name]
                ? name === ALL_TYPE_TAG.name
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

const useToolbarFilter = () => {
  const {
    store: { searchInput, typeTags, categoryTags },
  } = useStore()
  const activatedTags = { ...typeTags, ...categoryTags }
  const activatedTagsName = ALL_TAGS.filter((tag) => activatedTags[tag.name])
  const tagsFilter = activatedTagsName.map((tag) => tag.filter)

  const throttledSearchInput = useThrottle(searchInput)
  const searchKeywords = throttledSearchInput
    ?.split(' ')
    .map((i) => i.toUpperCase())

  const stringFilter = useCallback(
    (quest: KcanotifyQuestWithGameId) => {
      const text = `${quest.code} ${quest.name} ${quest.desc}`
      if (!searchKeywords) {
        return true
      }
      return searchKeywords.some((keyword) =>
        text.toUpperCase().includes(keyword)
      )
    },
    [searchKeywords]
  )

  const toolbarFilter = useCallback(
    (quest: KcanotifyQuestWithGameId) => {
      return [...tagsFilter, stringFilter].every((filter) => filter(quest))
    },
    [stringFilter, tagsFilter]
  )

  return toolbarFilter
}

const DEFAULT_LANG = 'ja-JP'

export const useFilterQuest = () => {
  const { i18n } = useTranslation()
  const toolbarFilter = useToolbarFilter()

  const LANGUAGE =
    i18n.language in QuestData
      ? (i18n.language as keyof typeof QuestData)
      : DEFAULT_LANG

  return Object.entries(QuestData[LANGUAGE])
    .map(([gameId, val]) => ({ gameId, ...val }))
    .filter(toolbarFilter)
}
