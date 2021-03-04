import { QuestData } from '../build/kcanotifyGamedata'

export type KcanotifyQuest = {
  code: string
  name: string
  desc: string
  memo?: string
  unlock?: number[]
  tracking?: number[][]
}

export type KcanotifyQuestExt = KcanotifyQuest & {
  gameId: string
  active?: boolean
}

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

export const isDailyQuest = (quest: KcanotifyQuestExt) =>
  dailyQuest.includes(quest.gameId)
export const isWeeklyQuest = (quest: KcanotifyQuestExt) =>
  weeklyQuest.includes(quest.gameId)
export const isMonthlyQuest = (quest: KcanotifyQuestExt) =>
  monthlyQuest.includes(quest.gameId)
export const isQuarterlyQuest = (quest: KcanotifyQuestExt) =>
  quarterlyQuest.includes(quest.gameId)
export const isYearlyQuest = (quest: KcanotifyQuestExt) =>
  yearlyQuest.includes(quest.gameId)

export enum QUEST_CATEGORY {
  Composition = '1',
  Sortie = '2',
  Exercise = '3',
  Expedition = '4',
  SupplyOrDocking = '5',
  Arsenal = '6',
  Modernization = '7',
  // NewSortie = '8',
  // OtherSortie = '9',
  Unknown = '0',
}

/**
 * TODO use api.category
 * See https://github.com/poooi/poi/blob/da75b507e8f67615a39dc4fdb466e34ff5b5bdcf/views/components/main/parts/task-panel.es#L48-L71
 */
export const getQuestCategory = (wikiId: string): QUEST_CATEGORY => {
  switch (true) {
    case wikiId.startsWith('A'):
      return QUEST_CATEGORY.Composition
    case wikiId.startsWith('B'):
      return QUEST_CATEGORY.Sortie
    case wikiId.startsWith('C'):
      return QUEST_CATEGORY.Exercise
    case wikiId.startsWith('D'):
      return QUEST_CATEGORY.Expedition
    case wikiId.startsWith('E'):
      return QUEST_CATEGORY.SupplyOrDocking
    case wikiId.startsWith('F'):
      return QUEST_CATEGORY.Arsenal
    case wikiId.startsWith('G'):
      return QUEST_CATEGORY.Modernization
    default:
      return QUEST_CATEGORY.Unknown
  }
}

export const isCompositionQuest = ({ code }: KcanotifyQuestExt) =>
  getQuestCategory(code) === QUEST_CATEGORY.Composition
export const isSortieQuest = ({ code }: KcanotifyQuestExt) =>
  getQuestCategory(code) === QUEST_CATEGORY.Sortie
export const isExerciseQuest = ({ code }: KcanotifyQuestExt) =>
  getQuestCategory(code) === QUEST_CATEGORY.Exercise
export const isExpeditionQuest = ({ code }: KcanotifyQuestExt) =>
  getQuestCategory(code) === QUEST_CATEGORY.Expedition
export const isSupplyOrDockingQuest = ({ code }: KcanotifyQuestExt) =>
  getQuestCategory(code) === QUEST_CATEGORY.SupplyOrDocking
export const isArsenalQuest = ({ code }: KcanotifyQuestExt) =>
  getQuestCategory(code) === QUEST_CATEGORY.Arsenal
export const isModernizationQuest = ({ code }: KcanotifyQuestExt) =>
  getQuestCategory(code) === QUEST_CATEGORY.Modernization
export const isUnknownCategoryQuest = ({ code }: KcanotifyQuestExt) =>
  getQuestCategory(code) === QUEST_CATEGORY.Unknown

export enum QUEST_STATUS {
  Locked,
  Default,
  InProgress,
  Completed,
}
