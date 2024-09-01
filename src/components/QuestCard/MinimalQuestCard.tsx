import { Card, Elevation, Text, Tooltip } from '@blueprintjs/core'
import React, { ComponentPropsWithoutRef, forwardRef } from 'react'
import { guessQuestCategory, QUEST_STATUS } from '../../questHelper'
import type { QuestCardProps } from './index'
import { CardBody, CardTail, CatIndicator, FlexCard } from './styles'
import { questStatusMap } from './utils'

/**
 * @deprecated
 */
export const MinimalQuestCard = forwardRef<
  Card,
  QuestCardProps & ComponentPropsWithoutRef<typeof FlexCard>
>(({ code, name, desc, tip, status = QUEST_STATUS.DEFAULT, ...props }, ref) => {
  const indicatorColor = guessQuestCategory(code).color
  const TailIcon = questStatusMap[status]

  return (
    <Tooltip
      targetTagName="div"
      content={
        <>
          {desc}
          <br />
          {tip}
        </>
      }
    >
      <FlexCard
        ref={ref}
        elevation={Elevation.ZERO}
        interactive={true}
        {...props}
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
})
