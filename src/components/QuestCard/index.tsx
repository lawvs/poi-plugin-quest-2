import { Elevation, H5, Text } from '@blueprintjs/core'
import React, { useCallback } from 'react'
import { guessQuestCategory, QUEST_STATUS } from '../../questHelper'
import { useLargeCard } from '../../store/quest'
import { MinimalQuestCard } from './MinimalQuestCard'
import { CardBody, CardMedia, CardTail, FlexCard } from './styles'
import { questIconMap, questStatusMap } from './utils'

export type QuestCardProps = {
  code: string
  name: string
  desc: string | JSX.Element
  tips?: string
  status?: QUEST_STATUS
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  style?: React.CSSProperties
}

export const LargeQuestCard = ({
  code,
  name,
  desc,
  tips,
  status = QUEST_STATUS.DEFAULT,
  onClick,
  style,
}: QuestCardProps) => {
  const headIcon = questIconMap[guessQuestCategory(code).type]
  const TailIcon = questStatusMap[status]

  return (
    <FlexCard
      elevation={Elevation.ZERO}
      interactive={true}
      onClick={onClick}
      style={style}
    >
      <CardMedia src={headIcon}></CardMedia>
      <CardBody>
        <H5>{[code, name].filter((i) => i != undefined).join(' - ')}</H5>
        <Text>{desc}</Text>
        <Text tagName="i">{tips}</Text>
      </CardBody>

      <CardTail>
        <TailIcon />
      </CardTail>
    </FlexCard>
  )
}

export const QuestCard: React.FC<QuestCardProps & { gameId: string }> = ({
  gameId,
  ...props
}) => {
  const { largeCard, setLarge, setMinimal } = useLargeCard()
  const setQuestCardLarge = useCallback(
    () => setLarge(gameId),
    [gameId, setLarge]
  )
  return gameId === largeCard ? (
    <LargeQuestCard onClick={setMinimal} {...props}></LargeQuestCard>
  ) : (
    <MinimalQuestCard onClick={setQuestCardLarge} {...props}></MinimalQuestCard>
  )
}
