import { QuestData } from '../build/kcanotifyGamedata'
import type { KcanotifyQuestWithGameId } from './types'

const questStartsFilter = (str: string) =>
  Object.entries(QuestData['zh-CN'])
    .filter(([, quest]) => quest.name.startsWith(str))
    .map(([gameId]) => gameId)

export const dailyQuest = questStartsFilter('(日任)')
export const weeklyQuest = questStartsFilter('(周任)')
export const monthlyQuest = questStartsFilter('(月任)')
export const quarterlyQuest = questStartsFilter('(季任)')
// (年任) (年任 / x 月)
export const yearlyQuest = questStartsFilter('(年任')

export const isDailyQuest = (quest: KcanotifyQuestWithGameId) =>
  dailyQuest.includes(quest.gameId)
export const isWeeklyQuest = (quest: KcanotifyQuestWithGameId) =>
  weeklyQuest.includes(quest.gameId)
export const isMonthlyQuest = (quest: KcanotifyQuestWithGameId) =>
  monthlyQuest.includes(quest.gameId)
export const isQuarterlyQuest = (quest: KcanotifyQuestWithGameId) =>
  quarterlyQuest.includes(quest.gameId)
export const isYearlyQuest = (quest: KcanotifyQuestWithGameId) =>
  yearlyQuest.includes(quest.gameId)
