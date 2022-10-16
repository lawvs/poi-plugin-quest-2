import { Icon, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import React from 'react'
import {
  IconArsenal,
  IconCompleted,
  IconComposition,
  IconExercise,
  IconExpedition,
  IconInProgress,
  IconModernization,
  IconSortie,
  IconSupplyDocking,
} from '../../../build/assets'
import { usePluginTranslation } from '../../poi/hooks'
import { QUEST_CATEGORY, QUEST_STATUS } from '../../questHelper'

export const questStatusMap: Record<QUEST_STATUS, React.FC> = {
  [QUEST_STATUS.LOCKED]: function Locked() {
    const { t } = usePluginTranslation()
    return (
      <Tooltip content={t('Locked', { number: '' })}>
        <Icon icon={IconNames.LOCK} iconSize={Icon.SIZE_LARGE}></Icon>
      </Tooltip>
    )
  },
  // Display nothing
  [QUEST_STATUS.DEFAULT]: () => null,
  [QUEST_STATUS.IN_PROGRESS]: function InProgress() {
    const { t } = usePluginTranslation()
    return (
      <Tooltip content={t('In Progress', { number: '' })}>
        <img src={IconInProgress}></img>
      </Tooltip>
    )
  },
  [QUEST_STATUS.COMPLETED]: function Completed() {
    const { t } = usePluginTranslation()
    return (
      <Tooltip content={t('Completed')}>
        <img src={IconCompleted}></img>
      </Tooltip>
    )
  },
  [QUEST_STATUS.ALREADY_COMPLETED]: function AlreadyCompleted() {
    const { t } = usePluginTranslation()
    return (
      <Tooltip content={t('Already Completed', { number: '' })}>
        <Icon icon={IconNames.TICK} iconSize={Icon.SIZE_LARGE}></Icon>
      </Tooltip>
    )
  },
  [QUEST_STATUS.UNKNOWN]: function AlreadyCompleted() {
    const { t } = usePluginTranslation()
    return (
      <Tooltip content={t('Unknown')}>
        <Icon icon={IconNames.HELP} iconSize={Icon.SIZE_LARGE}></Icon>
      </Tooltip>
    )
  },
}

// transparent GIF pixel
const PLACEHOLDER =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

export const questIconMap = {
  [QUEST_CATEGORY.Composition]: IconComposition,
  [QUEST_CATEGORY.Sortie]: IconSortie,
  [QUEST_CATEGORY.Exercise]: IconExercise,
  [QUEST_CATEGORY.Expedition]: IconExpedition,
  [QUEST_CATEGORY.SupplyOrDocking]: IconSupplyDocking,
  [QUEST_CATEGORY.Arsenal]: IconArsenal,
  [QUEST_CATEGORY.Modernization]: IconModernization,
  [QUEST_CATEGORY.Unknown]: PLACEHOLDER,
} as const
