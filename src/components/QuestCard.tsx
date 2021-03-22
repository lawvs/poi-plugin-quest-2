import { Card, Elevation, H5, Text, Tooltip, Icon } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import React, { useState } from 'react'
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

const NormalBody: React.FC<{
  code: string
  name: string
  desc: string | JSX.Element
  tips?: string
}> = ({ code, name, tips, desc }) => (
  <CardBody>
    <H5>
      {[code, name].filter((i) => i != undefined).join(' - ')}
      {tips && (
        <Tooltip content={tips}>
          <IconWithMargin icon={IconNames.INFO_SIGN}></IconWithMargin>
        </Tooltip>
      )}
    </H5>
    <Text>{desc}</Text>
  </CardBody>
)

const MinimalBody: React.FC<{
  code: string
  name: string
  desc: string | JSX.Element
  tips?: string
}> = ({ code, name, tips, desc }) => (
  <CardBody>
    <Text>
      <Tooltip
        content={
          <>
            {desc}
            <br />
            {tips}
          </>
        }
      >
        {[code, name].filter((i) => i != undefined).join(' - ')}
      </Tooltip>
    </Text>
  </CardBody>
)

export const QuestCard: React.FC<{
  code: string
  name: string
  desc: string | JSX.Element
  tips?: string
  status?: QUEST_STATUS
}> = ({ code, name, desc, tips, status = QUEST_STATUS.Default }) => {
  const [minimal, setMinial] = useState(true)
  const indicatorColor = guessQuestCategory(code).color
  const headIcon = questIconMap[guessQuestCategory(code).type]
  const TailIcon = questStatusMap[status]

  if (minimal) {
    return (
      <FlexCard
        elevation={Elevation.ZERO}
        interactive={true}
        onClick={() => setMinial(!minimal)}
      >
        <CatIndicator color={indicatorColor}></CatIndicator>
        <MinimalBody
          code={code}
          name={name}
          desc={desc}
          tips={tips}
        ></MinimalBody>

        <CardTail>
          <TailIcon></TailIcon>
        </CardTail>
      </FlexCard>
    )
  }

  return (
    <FlexCard
      elevation={Elevation.ZERO}
      interactive={true}
      onClick={() => setMinial(!minimal)}
    >
      <CardMedia src={headIcon}></CardMedia>
      <NormalBody code={code} name={name} desc={desc} tips={tips}></NormalBody>

      <CardTail>
        <TailIcon></TailIcon>
      </CardTail>
    </FlexCard>
  )
}
