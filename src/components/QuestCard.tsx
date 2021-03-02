import { Card, Elevation, H5, Text, Tooltip, Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { getQuestCategory, QUEST_CATEGORY, QUEST_STATUS } from '../questHelper'
import { IconComposition } from '../../build/assets'
import { IconExpedition } from '../../build/assets'
import { IconArsenal } from '../../build/assets'
import { IconModernization } from '../../build/assets'
import { IconExercise } from '../../build/assets'
import { IconSortie } from '../../build/assets'
import { IconSupplyDocking } from '../../build/assets'
import { IconInProgress } from '../../build/assets'

const FlexCard = styled(Card)`
  display: flex;

  & > * + * {
    margin-left: 8px;
  }
`

const CardMedia = styled.img`
  width: 64px;
  height: 64px;
`

const CardBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`

const CardTail = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    height: 20px;
  }
`

// transparent GIF pixel
const PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

const questIconMap = {
  [QUEST_CATEGORY.Composition]: IconComposition,
  [QUEST_CATEGORY.Sortie]: IconSortie,
  [QUEST_CATEGORY.Exercise]: IconExercise,
  [QUEST_CATEGORY.Expedition]: IconExpedition,
  [QUEST_CATEGORY.SupplyOrDocking]: IconSupplyDocking,
  [QUEST_CATEGORY.Arsenal]: IconArsenal,
  [QUEST_CATEGORY.Modernization]: IconModernization,
  [QUEST_CATEGORY.Unknown]: PLACEHOLDER,
} as const

const questStatusMap = {
  [QUEST_STATUS.Locked]: function Locked() {
    const { t } = useTranslation()
    return (
      <Tooltip content={t('Locked')}>
        <Icon icon={IconNames.LOCK} iconSize={Icon.SIZE_LARGE}></Icon>
      </Tooltip>
    )
  },
  // Display nothing
  [QUEST_STATUS.Default]: () => null,
  [QUEST_STATUS.InProgress]: function InProgress() {
    const { t } = useTranslation()
    return (
      <Tooltip content={t('In Progress')}>
        <img src={IconInProgress}></img>
      </Tooltip>
    )
  },
  [QUEST_STATUS.Completed]: function Completed() {
    const { t } = useTranslation()
    return (
      <Tooltip content={t('Completed')}>
        <Icon icon={IconNames.TICK} iconSize={Icon.SIZE_LARGE}></Icon>
      </Tooltip>
    )
  },
}

const getIcon = (code: string): string => questIconMap[getQuestCategory(code)]

export const QuestCard: React.FC<{
  code: string
  name: string
  desc: string | JSX.Element
  status?: QUEST_STATUS
}> = ({ code, name, desc, status = QUEST_STATUS.Default }) => {
  const icon = getIcon(code)
  const TailIcon = questStatusMap[status]
  return (
    <FlexCard elevation={Elevation.TWO}>
      <CardMedia src={icon}></CardMedia>
      <CardBody>
        <H5>{[code, name].filter((i) => i != undefined).join(' ')}</H5>
        <Text>{desc}</Text>
      </CardBody>
      <CardTail>
        <TailIcon></TailIcon>
      </CardTail>
    </FlexCard>
  )
}
