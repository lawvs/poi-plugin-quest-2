import { z } from 'zod'
import type { UnionQuest } from '../questHelper'
import {
  guessQuestCategory,
  isDailyQuest,
  isMonthlyQuest,
  isQuarterlyQuest,
  isSingleQuest,
  isWeeklyQuest,
  isYearlyQuest,
  QUEST_CATEGORY,
} from '../questHelper'

const questCategoryEnum = z.enum([
  'Composition',
  'Sortie',
  'Exercise',
  'Expedition',
  'SupplyOrDocking',
  'Arsenal',
  'Modernization',
  'Unknown',
])

const questFrequencyEnum = z.enum([
  'Daily',
  'Weekly',
  'Monthly',
  'Quarterly',
  'Yearly',
  'One-time',
  'Others',
])

export const filterableQuestSchema = z.object({
  category: questCategoryEnum.describe('Category'),
  name: z.string().describe('Name'),
  desc: z.string().describe('Description'),
  rewards: z.string().describe('Rewards'),
  memo2: z.string().describe('Details'),
  frequency: questFrequencyEnum.describe('Frequency'),
  code: z.string().describe('Code'),
})

export type FilterableQuest = z.infer<typeof filterableQuestSchema>

const categoryTypeToName: Record<string, FilterableQuest['category']> = {
  [QUEST_CATEGORY.Composition]: 'Composition',
  [QUEST_CATEGORY.Sortie]: 'Sortie',
  [QUEST_CATEGORY.Exercise]: 'Exercise',
  [QUEST_CATEGORY.Expedition]: 'Expedition',
  [QUEST_CATEGORY.SupplyOrDocking]: 'SupplyOrDocking',
  [QUEST_CATEGORY.Arsenal]: 'Arsenal',
  [QUEST_CATEGORY.Modernization]: 'Modernization',
  [QUEST_CATEGORY.Unknown]: 'Unknown',
}

const getFrequency = (quest: UnionQuest): FilterableQuest['frequency'] => {
  if (isDailyQuest(quest)) return 'Daily'
  if (isWeeklyQuest(quest)) return 'Weekly'
  if (isMonthlyQuest(quest)) return 'Monthly'
  if (isQuarterlyQuest(quest)) return 'Quarterly'
  if (isYearlyQuest(quest)) return 'Yearly'
  if (isSingleQuest(quest)) return 'One-time'
  return 'Others'
}

export const mapQuestToFilterable = (quest: UnionQuest): FilterableQuest => {
  const cat = guessQuestCategory(quest.docQuest.code)
  return {
    code: quest.docQuest.code,
    name: quest.docQuest.name,
    desc: quest.docQuest.desc,
    rewards: quest.docQuest.rewards ?? '',
    memo2: quest.docQuest.memo2 ?? '',
    category: categoryTypeToName[cat.type] ?? 'Unknown',
    frequency: getFrequency(quest),
  }
}
