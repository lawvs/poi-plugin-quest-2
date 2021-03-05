import { Button, InputGroup, Intent, Tag, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import styled from 'styled-components'
import React, { useCallback } from 'react'
import type { ChangeEvent } from 'react'
import { useThrottle } from './utils'
import { useQuest, useStore } from './store'
import {
  ALL_TYPE_TAG,
  ALL_CATEGORY_TAG,
  TYPE_TAGS,
  CATEGORY_TAGS,
  ALL_TAGS,
} from './tags'
import type { KcanotifyQuestExt } from './questHelper'
import { IN_POI, usePluginTranslation } from './poi'

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

const SyncButton = () => {
  const { t } = usePluginTranslation()
  const {
    store: { syncWithGame },
    updateStore,
  } = useStore()
  const handleClick = useCallback(() => {
    updateStore({ syncWithGame: !syncWithGame })
  }, [syncWithGame, updateStore])
  return (
    <Tooltip content={t('Sync with game')}>
      <Button
        icon={IconNames.EXCHANGE}
        intent={syncWithGame ? Intent.SUCCESS : Intent.NONE}
        disabled={!IN_POI}
        onClick={handleClick}
      />
    </Tooltip>
  )
}

export const SearchInput: React.FC = () => {
  const { t } = usePluginTranslation()
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
      rightElement={<SyncButton></SyncButton>}
      type="text"
    />
  )
}

const Tags = () => {
  const { t } = usePluginTranslation()
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
    (quest: KcanotifyQuestExt) => {
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
    (quest: KcanotifyQuestExt) => {
      return [...tagsFilter, stringFilter].every((filter) => filter(quest))
    },
    [stringFilter, tagsFilter]
  )

  return toolbarFilter
}

export const useFilterQuest = () => {
  const toolbarFilter = useToolbarFilter()
  return useQuest().filter(toolbarFilter)
}
