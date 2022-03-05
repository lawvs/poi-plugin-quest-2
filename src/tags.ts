import { IN_POI } from './poi/env'
import {
  isDailyQuest,
  isMonthlyQuest,
  isQuarterlyQuest,
  isWeeklyQuest,
  isYearlyQuest,
  isCompositionQuest,
  isSortieQuest,
  isExerciseQuest,
  isExpeditionQuest,
  isSupplyOrDockingQuest,
  isArsenalQuest,
  isModernizationQuest,
  isUnknownCategoryQuest,
  isInProgressQuest,
  isSingleQuest,
  hasNewQuest,
  isNewQuest,
  newQuestNumber,
} from './questHelper'
import type { UnionQuest } from './questHelper'

const yes = () => true as const

export const ALL_CATEGORY_TAG = {
  name: 'All',
  filter: yes,
} as const

export const ALL_TYPE_TAG = ALL_CATEGORY_TAG

const withDocQuest =
  (filterFn: (q: UnionQuest['docQuest']) => boolean) =>
  (unionQuest: UnionQuest) =>
    filterFn(unionQuest.docQuest)

export const CATEGORY_TAGS = [
  ALL_CATEGORY_TAG,
  { name: 'Composition', filter: withDocQuest(isCompositionQuest) },
  { name: 'Sortie', filter: withDocQuest(isSortieQuest) },
  { name: 'Exercise', filter: withDocQuest(isExerciseQuest) },
  { name: 'Expedition', filter: withDocQuest(isExpeditionQuest) },
  { name: 'Supply / Docking', filter: withDocQuest(isSupplyOrDockingQuest) },
  { name: 'Arsenal', filter: withDocQuest(isArsenalQuest) },
  { name: 'Modernization', filter: withDocQuest(isModernizationQuest) },
  { name: 'Others', filter: withDocQuest(isUnknownCategoryQuest) },
] as const

export const TYPE_TAGS = [
  ALL_TYPE_TAG,
  ...(IN_POI ? [{ name: 'In Progress', filter: isInProgressQuest }] : []),
  ...(hasNewQuest
    ? [{ name: 'New', filter: isNewQuest, suffix: newQuestNumber }]
    : []),
  { name: 'Daily', filter: isDailyQuest },
  { name: 'Weekly', filter: isWeeklyQuest },
  { name: 'Monthly', filter: isMonthlyQuest },
  { name: 'Quarterly', filter: isQuarterlyQuest },
  { name: 'Yearly', filter: isYearlyQuest },
  { name: 'One-time', filter: isSingleQuest },
] as const

// TODO tag In Progress / Lock / Completed

export const ALL_TAGS = [...CATEGORY_TAGS, ...TYPE_TAGS]
