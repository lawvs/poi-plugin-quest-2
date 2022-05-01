import type { TooltipProps } from '@blueprintjs/core'
import { Tag, Text, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import React, { forwardRef, useCallback } from 'react'
import styled from 'styled-components'
import { DocQuest, guessQuestCategory } from '../questHelper'
import { useFilterTags } from '../store/filterTags'
import { useQuestByCode } from '../store/quest'
import { useSearchInput } from '../store/search'

const TagWrapper = styled(Tag)`
  margin: 2px 4px;
  user-select: none;
  overflow: visible;

  & > span {
    cursor: pointer;
  }
`

const QuestTooltip = forwardRef<
  Tooltip,
  Omit<TooltipProps, 'content'> & {
    quest: DocQuest
    children: React.ReactNode
  }
>(({ quest, children, ...props }, ref) => {
  if (!quest) {
    return <>{children}</>
  }
  return (
    <Tooltip
      ref={ref}
      content={
        <>
          <div>{`${quest.code} - ${quest.name}`}</div>
          <Text>{quest.desc}</Text>
          {quest.memo2 && <b>{quest.memo2}</b>}
          {quest.memo && <i>{quest.memo}</i>}
        </>
      }
      placement={'top'}
      {...props}
    >
      {children}
    </Tooltip>
  )
})

export const QuestTag = ({ code }: { code: string }) => {
  const { setSearchInput } = useSearchInput()
  const { setCategoryTagsAll, setTypeTagsAll } = useFilterTags()
  const maybeQuest = useQuestByCode(code)

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

  if (!maybeQuest) {
    return (
      <TagWrapper
        icon={IconNames.HELP}
        style={{ color: fontColor, background: indicatorColor }}
      >
        {code}
      </TagWrapper>
    )
  }

  const quest = maybeQuest
  return (
    <QuestTooltip quest={quest}>
      <TagWrapper
        onClick={handleClick}
        interactive
        style={{ color: fontColor, background: indicatorColor }}
      >
        {code}
      </TagWrapper>
    </QuestTooltip>
  )
}
