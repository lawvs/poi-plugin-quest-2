import type { TooltipProps } from '@blueprintjs/core'
import { Tag, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import React, { forwardRef, useCallback } from 'react'
import styled from 'styled-components'
import { DocQuest, guessQuestCategory, QUEST_STATUS } from '../questHelper'
import { useFilterTags } from '../store/filterTags'
import { useQuestByCode, useQuestStatus } from '../store/quest'
import { useSearchInput } from '../store/search'

const TagWrapper = styled(Tag)`
  margin: 2px 4px;
  user-select: ${({ interactive }) => (interactive ? 'none' : 'auto')};
  overflow: visible;

  & > span {
    cursor: ${({ interactive }) => (interactive ? 'pointer' : 'auto')};
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
          <div>{quest.desc}</div>
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

const getTagIcon = (questStatus: QUEST_STATUS) => {
  switch (questStatus) {
    case QUEST_STATUS.ALREADY_COMPLETED:
      return IconNames.TICK
    case QUEST_STATUS.LOCKED:
      return IconNames.LOCK
    default:
      return null
  }
}

export const QuestTag = ({ code }: { code: string }) => {
  const { setSearchInput } = useSearchInput()
  const { setCategoryTagsAll, setTypeTagsAll } = useFilterTags()
  const maybeQuest = useQuestByCode(code)
  const maybeGameId = maybeQuest?.gameId ?? null
  const questStatus = useQuestStatus(maybeGameId)
  const tagIcon = getTagIcon(questStatus)

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

  const quest = maybeQuest.docQuest
  return (
    <QuestTooltip quest={quest}>
      <TagWrapper
        interactive
        icon={tagIcon}
        onClick={handleClick}
        style={{ color: fontColor, background: indicatorColor }}
      >
        {code}
      </TagWrapper>
    </QuestTooltip>
  )
}
