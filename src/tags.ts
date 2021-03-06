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
} from './questHelper'

const yes = () => true as const

export const ALL_CATEGORY_TAG = {
  name: 'All',
  filter: yes,
} as const

export const ALL_TYPE_TAG = ALL_CATEGORY_TAG

export const CATEGORY_TAGS = [
  ALL_CATEGORY_TAG,
  { name: 'Composition', filter: isCompositionQuest },
  { name: 'Sortie', filter: isSortieQuest },
  { name: 'Exercise', filter: isExerciseQuest },
  { name: 'Expedition', filter: isExpeditionQuest },
  { name: 'Supply / Docking', filter: isSupplyOrDockingQuest },
  { name: 'Arsenal', filter: isArsenalQuest },
  { name: 'Modernization', filter: isModernizationQuest },
  { name: 'Others', filter: isUnknownCategoryQuest },
] as const

export const TYPE_TAGS = [
  ALL_TYPE_TAG,
  { name: 'In Progress', filter: isInProgressQuest },
  { name: 'Daily', filter: isDailyQuest },
  { name: 'Weekly', filter: isWeeklyQuest },
  { name: 'Monthly', filter: isMonthlyQuest },
  { name: 'Quarterly', filter: isQuarterlyQuest },
  { name: 'Yearly', filter: isYearlyQuest },
  // TODO add one-time
] as const

// TODO tag In Progress / Lock / Completed

export const ALL_TAGS = [...CATEGORY_TAGS, ...TYPE_TAGS]
