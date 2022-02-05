import { Elevation, H5, Text } from '@blueprintjs/core'
import React from 'react'
import styled from 'styled-components'
import { usePluginTranslation } from '../../poi/hooks'
import { guessQuestCategory, QUEST_STATUS } from '../../questHelper'
import { PreTaskTag } from '../PreTaskTag'
import { CardBody, CardMedia, CardTail, FlexCard } from './styles'
import { questIconMap, questStatusMap } from './utils'

export type QuestCardProps = {
  code: string
  name: string
  desc: string | JSX.Element
  tips?: string
  status?: QUEST_STATUS
  preTask?: string[]
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  style?: React.CSSProperties
}

const PreTaskTagWrapper = styled.div`
  display: flex;
  align-items: baseline;
`

export const LargeQuestCard = ({
  code,
  name,
  desc,
  tips,
  preTask,
  status = QUEST_STATUS.DEFAULT,
  onClick,
  style,
}: QuestCardProps) => {
  const headIcon = questIconMap[guessQuestCategory(code).type]
  const TailIcon = questStatusMap[status]
  const { t } = usePluginTranslation()

  return (
    <FlexCard
      elevation={Elevation.ZERO}
      interactive={false}
      onClick={onClick}
      style={style}
    >
      <CardMedia src={headIcon}></CardMedia>
      <CardBody>
        <H5>{[code, name].filter((i) => i != undefined).join(' - ')}</H5>
        <Text>{desc}</Text>
        {tips && <Text tagName="i">{tips}</Text>}
        <PreTaskTagWrapper>
          {!!preTask?.length && <Text tagName="span">{t('Requires')}</Text>}
          {preTask?.map((i) => (
            <PreTaskTag key={i} code={i}></PreTaskTag>
          ))}
        </PreTaskTagWrapper>
      </CardBody>

      <CardTail>
        <TailIcon />
      </CardTail>
    </FlexCard>
  )
}

export const QuestCard: React.FC<QuestCardProps & { gameId: string }> = ({
  ...props
}) => {
  return <LargeQuestCard {...props}></LargeQuestCard>
}
