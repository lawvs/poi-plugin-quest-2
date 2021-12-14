import { Elevation, Text, Tooltip } from '@blueprintjs/core'
import React from 'react'
import { guessQuestCategory, QUEST_STATUS } from '../../questHelper'
import type { QuestCardProps } from './index'
import { CardBody, CardTail, CatIndicator, FlexCard } from './styles'
import { questStatusMap } from './utils'

export const MinimalQuestCard: React.FC<QuestCardProps> = ({
  code,
  name,
  desc,
  tips,
  status = QUEST_STATUS.DEFAULT,
  onClick,
  style,
}) => {
  const indicatorColor = guessQuestCategory(code).color
  const TailIcon = questStatusMap[status]

  return (
    <Tooltip
      targetTagName="div"
      content={
        <>
          {desc}
          <br />
          {tips}
        </>
      }
    >
      <FlexCard
        elevation={Elevation.ZERO}
        interactive={true}
        onClick={onClick}
        style={style}
      >
        <CatIndicator color={indicatorColor}></CatIndicator>
        <CardBody>
          <Text>{[code, name].filter((i) => i != undefined).join(' - ')}</Text>
        </CardBody>

        <CardTail>
          <TailIcon></TailIcon>
        </CardTail>
      </FlexCard>
    </Tooltip>
  )
}
