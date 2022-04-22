import { Tag } from '@blueprintjs/core'
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { guessQuestCategory } from '../questHelper'
import { useFilterTags } from '../store/filterTags'
import { useSearchInput } from '../store/search'

const TagWrapper = styled(Tag)`
  margin: 2px 4px;
  user-select: none;
  overflow: visible;

  & > span {
    cursor: pointer;
  }
`

export const QuestTag = ({ code }: { code: string }) => {
  const { setSearchInput } = useSearchInput()
  const { setCategoryTagsAll, setTypeTagsAll } = useFilterTags()

  const handleClick = useCallback(() => {
    setSearchInput(code)
    setCategoryTagsAll()
    setTypeTagsAll()
  }, [code, setCategoryTagsAll, setSearchInput, setTypeTagsAll])
  const indicatorColor = guessQuestCategory(code).color
  const fontColor =
    indicatorColor === '#fff' || indicatorColor === '#87da61'
      ? 'black'
      : 'white'
  return (
    <TagWrapper
      onClick={handleClick}
      interactive
      style={{ color: fontColor, background: indicatorColor }}
    >
      {code}
    </TagWrapper>
  )
}
