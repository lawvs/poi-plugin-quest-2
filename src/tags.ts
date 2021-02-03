import {
  isDailyQuest,
  isMonthlyQuest,
  isQuarterlyQuest,
  isWeeklyQuest,
  isYearlyQuest,
} from './questHelper'

export const TAG_ALL = {
  name: 'All',
  filter() {
    return true
  },
} as const

export const TAGS = [
  TAG_ALL,
  {
    name: 'Daily',
    filter: isDailyQuest,
  },
  {
    name: 'Weekly',
    filter: isWeeklyQuest,
  },
  {
    name: 'Monthly',
    filter: isMonthlyQuest,
  },
  {
    name: 'Quarterly',
    filter: isQuarterlyQuest,
  },
  {
    name: 'Yearly',
    filter: isYearlyQuest,
  },
  // TODO tag In progress
] as const
