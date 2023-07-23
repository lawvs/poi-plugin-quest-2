import { Card, Elevation, H5 } from '@blueprintjs/core'
import React, { forwardRef } from 'react'
import Highlighter from 'react-highlight-words'
import type { StyledComponentProps } from 'styled-components'
import { usePluginTranslation } from '../../poi/hooks'
import {
  QUEST_STATUS,
  getQuestPrePost,
  guessQuestCategory,
} from '../../questHelper'
import { useQuestStatus } from '../../store/quest'
import { useStableSearchWords } from '../../store/search'
import { QuestTag } from '../QuestTag'
import {
  CardActionWrapper,
  CardBody,
  CardMedia,
  CardTail,
  FlexCard,
  SpanText,
  TagsWrapper,
} from './styles'
import { questIconMap, questStatusMap } from './utils'

export type QuestCardProps = {
  gameId: number
  code: string
  name: string
  desc: string
  tip?: string
  tip2?: string
  status?: QUEST_STATUS
}

const CardAction = ({ gameId }: { gameId: number }) => {
  const { t } = usePluginTranslation()

  const prePostQuests = getQuestPrePost(gameId)

  return (
    <CardActionWrapper>
      <TagsWrapper>
        {!!prePostQuests.pre.length && (
          <>
            <SpanText>{t('Requires')}</SpanText>
            {prePostQuests.pre.map((i) => (
              <QuestTag key={i} code={i}></QuestTag>
            ))}
          </>
        )}
      </TagsWrapper>

      <TagsWrapper>
        {!!prePostQuests.post.length && (
          <>
            <SpanText>{t('Unlocks')}</SpanText>
            {prePostQuests.post.map((i) => (
              <QuestTag key={i} code={i}></QuestTag>
            ))}
          </>
        )}
      </TagsWrapper>
    </CardActionWrapper>
  )
}

export const QuestCard = forwardRef<
  Card,
  // eslint-disable-next-line @typescript-eslint/ban-types
  QuestCardProps & StyledComponentProps<typeof Card, any, {}, never>
>(({ gameId, code, name, desc, tip, tip2, ...props }, ref) => {
  const status = useQuestStatus(gameId)
  const headIcon = questIconMap[guessQuestCategory(code).type]
  const TailIcon = questStatusMap[status]
  const searchWords = useStableSearchWords()

  return (
    <FlexCard
      ref={ref}
      elevation={Elevation.ZERO}
      interactive={false}
      {...props}
    >
      <CardMedia src={headIcon}></CardMedia>
      <CardBody>
        <H5>
          <Highlighter
            searchWords={searchWords}
            autoEscape={false}
            textToHighlight={[code, name]
              .filter((i) => i != undefined)
              .join(' - ')}
          />
        </H5>
        <Highlighter
          searchWords={searchWords}
          autoEscape={false}
          textToHighlight={desc}
        />
        {tip2 && (
          <b>
            <Highlighter
              searchWords={searchWords}
              autoEscape={false}
              textToHighlight={tip2}
            />
          </b>
        )}
        {tip && (
          <i>
            <Highlighter
              searchWords={searchWords}
              autoEscape={false}
              textToHighlight={tip}
            />
          </i>
        )}

        <CardAction gameId={gameId}></CardAction>
      </CardBody>

      <CardTail>
        <TailIcon />
      </CardTail>
    </FlexCard>
  )
})
