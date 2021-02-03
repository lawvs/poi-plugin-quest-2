import { InputGroup, Tag } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import styled from 'styled-components'
import { ChangeEvent, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useThrottle } from './utils'

import type { KcanotifyQuestWithGameId } from './types'
import { useStore } from './store'
import { TAG_ALL, TAGS } from './tags'

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
    store: { activatedTags },
    updateStore,
  } = useStore()
  const withHandleClickTag = useCallback(
    (tagName: string) => () =>
      updateStore({ activatedTags: { [tagName]: true } }),
    [updateStore]
  )

  return (
    <TagsWrapper>
      {TAGS.map(({ name }) => (
        <Tag
          onClick={withHandleClickTag(name)}
          intent={
            activatedTags[name]
              ? name === TAG_ALL.name
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

export const useToolbarFilter = () => {
  const {
    store: { searchInput, activatedTags },
  } = useStore()
  const activatedTagsName = TAGS.filter((tag) => activatedTags[tag.name])
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
