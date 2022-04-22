import { Card, Elevation, H5, Text } from '@blueprintjs/core'
import React, { forwardRef } from 'react'
import type { StyledComponentProps } from 'styled-components'
import { usePluginTranslation } from '../../poi/hooks'
import { getPrePost, guessQuestCategory, QUEST_STATUS } from '../../questHelper'
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
  desc: string | JSX.Element
  tip?: string
  tip2?: string
  status?: QUEST_STATUS
  preQuest?: string[]
}

const CardAction = ({ gameId }: { gameId: number }) => {
  const { t } = usePluginTranslation()

  const preQuests = getPrePost(gameId)

  return (
    <CardActionWrapper>
      <TagsWrapper>
        {!!preQuests.pre.length && (
          <>
            <SpanText>{t('Requires')}</SpanText>
            {preQuests.pre.map((i) => (
              <QuestTag key={i} code={i}></QuestTag>
            ))}
          </>
        )}
      </TagsWrapper>

      <TagsWrapper>
        {!!preQuests.post.length && (
          <>
            <SpanText>{t('Unlocks')}</SpanText>
            {preQuests.post.map((i) => (
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
>(
  (
    {
      gameId,
      code,
      name,
      desc,
      tip,
      tip2,
      status = QUEST_STATUS.DEFAULT,
      ...props
    },
    ref
  ) => {
    const headIcon = questIconMap[guessQuestCategory(code).type]
    const TailIcon = questStatusMap[status]

    return (
      <FlexCard
        ref={ref}
        elevation={Elevation.ZERO}
        interactive={false}
        {...props}
      >
        <CardMedia src={headIcon}></CardMedia>
        <CardBody>
          <H5>{[code, name].filter((i) => i != undefined).join(' - ')}</H5>
          <Text>{desc}</Text>
          {tip2 && <b>{tip2}</b>}
          {tip && <i>{tip}</i>}

          <CardAction gameId={gameId}></CardAction>
        </CardBody>

        <CardTail>
          <TailIcon />
        </CardTail>
      </FlexCard>
    )
  }
)
