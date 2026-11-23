import { Icon, IconSize, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import React from 'react'
import type { QuestAnalysis, QuestAnalysisStatus } from '../../analysis'
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
        <Icon icon={IconNames.LOCK} size={IconSize.LARGE}></Icon>
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
        <Icon icon={IconNames.TICK} size={IconSize.LARGE}></Icon>
      </Tooltip>
    )
  },
  [QUEST_STATUS.UNKNOWN]: function AlreadyCompleted() {
    const { t } = usePluginTranslation()
    return (
      <Tooltip content={t('Unknown')}>
        <Icon icon={IconNames.HELP} size={IconSize.LARGE}></Icon>
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

export const countMissingEntries = (entries: string[]) =>
  entries.reduce((total, entry) => {
    const matched = entry.match(/x(\d+)$/)
    if (!matched) {
      return total + 1
    }
    return total + Number(matched[1])
  }, 0)

export const getQuestAnalysisIntent = (status: QuestAnalysisStatus) => {
  switch (status) {
    case 'ready':
      return 'success' as const
    case 'missing_ships':
    case 'missing_equipments':
    case 'missing_inventory':
      return 'warning' as const
    case 'missing_both':
      return 'danger' as const
    case 'not_applicable':
    case 'unsupported':
    default:
      return 'none' as const
  }
}

export const getQuestAnalysisSummary = (
  analysis: QuestAnalysis,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  switch (analysis.status) {
    case 'ready':
      return t('Requirement Ready')
    case 'missing_ships':
      return t('Missing Ships Summary', {
        number: countMissingEntries(analysis.missingShips),
      })
    case 'missing_equipments':
      return t('Missing Equipments Summary', {
        number: countMissingEntries(analysis.missingEquipments),
      })
    case 'missing_both':
      return t('Missing Ships and Equipments')
    case 'missing_inventory':
      return t('Inventory Missing Summary')
    case 'not_applicable':
      return t('Not Applicable Summary')
    case 'unsupported':
    default:
      return t('Requirement Unsupported')
  }
}
