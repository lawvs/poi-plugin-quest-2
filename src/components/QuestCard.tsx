import { Card, Elevation, H5, Text, Tooltip, Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { usePluginTranslation } from '../poi'
import {
  guessQuestCategory,
  QUEST_CATEGORY,
  QUEST_STATUS,
} from '../questHelper'
import { IconComposition } from '../../build/assets'
import { IconExpedition } from '../../build/assets'
import { IconArsenal } from '../../build/assets'
import { IconModernization } from '../../build/assets'
import { IconExercise } from '../../build/assets'
import { IconSortie } from '../../build/assets'
import { IconSupplyDocking } from '../../build/assets'
import { IconInProgress } from '../../build/assets'
import { IconCompleted } from '../../build/assets'
import { useLargeCard } from '../store/quest'

const FlexCard = styled(Card)`
  display: flex;
  align-items: center;

  & > * + * {
    margin-left: 8px;
  }
`

const CardMedia = styled.img`
  width: 64px;
  height: 64px;
`

const CatIndicator = styled.span<{ color: string }>`
  height: 1em;
  width: 4px;
  background-color: ${({ color }) => color};
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

const IconWithMargin = styled(Icon)`
  margin-left: 8px;
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

const questStatusMap: Record<QUEST_STATUS, React.FC> = {
  [QUEST_STATUS.Locked]: function Locked() {
    const { t } = usePluginTranslation()
    return (
      <Tooltip content={t('Locked')}>
        <Icon icon={IconNames.LOCK} iconSize={Icon.SIZE_LARGE}></Icon>
      </Tooltip>
    )
  },
  // Display nothing
  [QUEST_STATUS.Default]: () => null,
  [QUEST_STATUS.InProgress]: function InProgress() {
    const { t } = usePluginTranslation()
    return (
      <Tooltip content={t('In Progress')}>
        <img src={IconInProgress}></img>
      </Tooltip>
    )
  },
  [QUEST_STATUS.Completed]: function Completed() {
    const { t } = usePluginTranslation()
    return (
      <Tooltip content={t('Completed')}>
        <img src={IconCompleted}></img>
      </Tooltip>
    )
  },
  [QUEST_STATUS.AlreadyCompleted]: function AlreadyCompleted() {
    const { t } = usePluginTranslation()
    return (
      <Tooltip content={t('Already Completed')}>
        <Icon icon={IconNames.TICK} iconSize={Icon.SIZE_LARGE}></Icon>
      </Tooltip>
    )
  },
}

type QuestCardProps = {
  code: string
  name: string
  desc: string | JSX.Element
  tips?: string
  status?: QUEST_STATUS
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  style?: React.CSSProperties
}

export const LargeQuestCard: React.FC<QuestCardProps> = ({
  code,
  name,
  desc,
  tips,
  status = QUEST_STATUS.Default,
  onClick,
  style,
}) => {
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
        <Tooltip content={tips} placement="top">
          <H5>
            {[code, name].filter((i) => i != undefined).join(' - ')}
            {tips && (
              <IconWithMargin icon={IconNames.INFO_SIGN}></IconWithMargin>
            )}
          </H5>
        </Tooltip>
        <Text>{desc}</Text>
      </CardBody>

      <CardTail>
        <TailIcon></TailIcon>
      </CardTail>
    </FlexCard>
  )
}

export const MinimalQuestCard: React.FC<QuestCardProps> = ({
  code,
  name,
  desc,
  tips,
  status = QUEST_STATUS.Default,
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
