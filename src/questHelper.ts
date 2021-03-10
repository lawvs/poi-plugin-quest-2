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

export const isInProgressQuest = (quest: KcanotifyQuestExt) => quest.active
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
 * Ported from https://github.com/poooi/poi/blob/da75b507e8f67615a39dc4fdb466e34ff5b5bdcf/views/components/main/parts/task-panel.es#L48-L71
 */
export const getCategory = (api_category: number) => {
  switch (api_category) {
    case 1:
      return {
        type: QUEST_CATEGORY.Composition,
        wikiSymbol: 'A',
        color: '#19BB2E',
      }
    case 2:
    case 8:
    case 9:
      return { type: QUEST_CATEGORY.Sortie, wikiSymbol: 'B', color: '#e73939' }
    case 3:
      return {
        type: QUEST_CATEGORY.Exercise,
        wikiSymbol: 'C',
        color: '#87da61',
      }
    case 4:
      return {
        type: QUEST_CATEGORY.Expedition,
        wikiSymbol: 'D',
        color: '#16C2A3',
      }
    case 5:
      return {
        type: QUEST_CATEGORY.SupplyOrDocking,
        wikiSymbol: 'E',
        color: '#E2C609',
      }
    case 6:
      return { type: QUEST_CATEGORY.Arsenal, wikiSymbol: 'F', color: '#805444' }
    case 7:
      return {
        type: QUEST_CATEGORY.Modernization,
        wikiSymbol: 'G',
        color: '#c792e8',
      }
    case 0:
    // Unknown, fall through
    default:
      return {
        type: QUEST_CATEGORY.Unknown,
        wikiSymbol: '?',
        color: '#fff',
      }
  }
}

/**
 * See https://wikiwiki.jp/kancolle/
 */
export const guessQuestCategory = (wikiId: string): QUEST_CATEGORY => {
  if (!wikiId || !wikiId.length) {
    return QUEST_CATEGORY.Unknown
  }
  switch (true) {
    case wikiId[0] === 'A':
      return QUEST_CATEGORY.Composition
    case wikiId[0] === 'B':
      return QUEST_CATEGORY.Sortie
    case wikiId[0] === 'C':
      return QUEST_CATEGORY.Exercise
    case wikiId[0] === 'D':
      return QUEST_CATEGORY.Expedition
    case wikiId[0] === 'E':
      return QUEST_CATEGORY.SupplyOrDocking
    case wikiId[0] === 'F':
      return QUEST_CATEGORY.Arsenal
    case wikiId[0] === 'G':
      return QUEST_CATEGORY.Modernization
    case wikiId[0] === '?':
      return QUEST_CATEGORY.Unknown
    default:
      // Try parse SB01, WA01, 2103B1
      return guessQuestCategory(wikiId.slice(1))
  }
}

export const isCompositionQuest = ({ code }: KcanotifyQuestExt) =>
  guessQuestCategory(code) === QUEST_CATEGORY.Composition
export const isSortieQuest = ({ code }: KcanotifyQuestExt) =>
  guessQuestCategory(code) === QUEST_CATEGORY.Sortie
export const isExerciseQuest = ({ code }: KcanotifyQuestExt) =>
  guessQuestCategory(code) === QUEST_CATEGORY.Exercise
export const isExpeditionQuest = ({ code }: KcanotifyQuestExt) =>
  guessQuestCategory(code) === QUEST_CATEGORY.Expedition
export const isSupplyOrDockingQuest = ({ code }: KcanotifyQuestExt) =>
  guessQuestCategory(code) === QUEST_CATEGORY.SupplyOrDocking
export const isArsenalQuest = ({ code }: KcanotifyQuestExt) =>
  guessQuestCategory(code) === QUEST_CATEGORY.Arsenal
export const isModernizationQuest = ({ code }: KcanotifyQuestExt) =>
  guessQuestCategory(code) === QUEST_CATEGORY.Modernization
export const isUnknownCategoryQuest = ({ code }: KcanotifyQuestExt) =>
  // Starts with unknown character
  /^[^ABCDEFG]/.test(code)

export enum QUEST_STATUS {
  Locked,
  Default,
  InProgress,
  Completed,
}
