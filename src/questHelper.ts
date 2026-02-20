import { memoize } from 'micro-memoize'
import newQuestData from '../build/kcQuestsData/quests-scn-new.json'
import prePostQuest from '../build/prePostQuest.json'
import questCategory from '../build/questCategory.json'
import questCodeMap from '../build/questCodeMap.json'
import { GameQuest, QUEST_API_STATE } from './poi/types'

export type DocQuest = {
  /**
   * Wiki ID, for example 'A1'
   */
  code: string
  name: string
  desc: string
  /**
   * Quest rewards
   */
  rewards?: string
  /**
   * Quest details, only in KcWiki
   */
  memo2?: string
  /**
   * Only in kcanotify
   */
  unlock?: number[] | string | unknown
  /**
   * Only in kcanotify
   */
  tracking?: number[][]
  /**
   * Only in KcWiki
   */
  pre?: string[]
}

export type UnionQuest = {
  /**
   * Same as {@link GameQuest.api_no}
   */
  gameId: number
  gameQuest?: GameQuest
  docQuest: DocQuest
}

const dailyQuest = new Set(questCategory.dailyQuest)
const weeklyQuest = new Set(questCategory.weeklyQuest)
const monthlyQuest = new Set(questCategory.monthlyQuest)
const quarterlyQuest = new Set(questCategory.quarterlyQuest)
const yearlyQuest = new Set(questCategory.yearlyQuest)
const singleQuest = new Set(questCategory.singleQuest)
const newQuest = new Set(newQuestData.map((gameId) => +gameId))

export const isInProgressQuest = (quest: GameQuest) =>
  quest.api_state === QUEST_API_STATE.IN_PROGRESS ||
  quest.api_state === QUEST_API_STATE.COMPLETED

export const isDailyQuest = (quest: UnionQuest) => dailyQuest.has(quest.gameId)
export const isWeeklyQuest = (quest: UnionQuest) =>
  weeklyQuest.has(quest.gameId)
export const isMonthlyQuest = (quest: UnionQuest) =>
  monthlyQuest.has(quest.gameId)
export const isQuarterlyQuest = (quest: UnionQuest) =>
  quarterlyQuest.has(quest.gameId)
export const isYearlyQuest = (quest: UnionQuest) =>
  yearlyQuest.has(quest.gameId)
export const isSingleQuest = (quest: UnionQuest) =>
  singleQuest.has(quest.gameId)

export const hasNewQuest = newQuestData.length > 0
export const isNewQuest = (quest: UnionQuest) => newQuest.has(quest.gameId)
export const newQuestNumber = newQuestData.length

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

const CategoryMap = {
  [QUEST_CATEGORY.Composition]: {
    type: QUEST_CATEGORY.Composition,
    wikiSymbol: 'A',
    color: '#19BB2E',
  },
  [QUEST_CATEGORY.Sortie]: {
    type: QUEST_CATEGORY.Sortie,
    wikiSymbol: 'B',
    color: '#e73939',
  },
  [QUEST_CATEGORY.Exercise]: {
    type: QUEST_CATEGORY.Exercise,
    wikiSymbol: 'C',
    color: '#87da61',
  },
  [QUEST_CATEGORY.Expedition]: {
    type: QUEST_CATEGORY.Expedition,
    wikiSymbol: 'D',
    color: '#16C2A3',
  },
  [QUEST_CATEGORY.SupplyOrDocking]: {
    type: QUEST_CATEGORY.SupplyOrDocking,
    wikiSymbol: 'E',
    color: '#E2C609',
  },
  [QUEST_CATEGORY.Arsenal]: {
    type: QUEST_CATEGORY.Arsenal,
    wikiSymbol: 'F',
    color: '#805444',
  },
  [QUEST_CATEGORY.Modernization]: {
    type: QUEST_CATEGORY.Modernization,
    wikiSymbol: 'G',
    color: '#c792e8',
  },
  [QUEST_CATEGORY.Unknown]: {
    type: QUEST_CATEGORY.Unknown,
    wikiSymbol: '?',
    color: '#fff',
  },
} as const

/**
 * Ported from https://github.com/poooi/poi/blob/da75b507e8f67615a39dc4fdb466e34ff5b5bdcf/views/components/main/parts/task-panel.es#L48-L71
 */
export const getCategory = (api_category: number) => {
  switch (api_category) {
    case 1:
      return CategoryMap[QUEST_CATEGORY.Composition]
    case 2:
    case 8:
    case 9:
      return CategoryMap[QUEST_CATEGORY.Sortie]
    case 3:
      return CategoryMap[QUEST_CATEGORY.Exercise]
    case 4:
      return CategoryMap[QUEST_CATEGORY.Expedition]
    case 5:
      return CategoryMap[QUEST_CATEGORY.SupplyOrDocking]
    case 6:
      return CategoryMap[QUEST_CATEGORY.Arsenal]
    case 7:
      return CategoryMap[QUEST_CATEGORY.Modernization]
    case 0:
    // Unknown, fall through
    default:
      return CategoryMap[QUEST_CATEGORY.Unknown]
  }
}

/**
 * See https://wikiwiki.jp/kancolle/
 */
export const guessQuestCategory = (
  wikiId: string,
): (typeof CategoryMap)[keyof typeof CategoryMap] => {
  if (!wikiId || !wikiId.length) {
    return CategoryMap[QUEST_CATEGORY.Unknown]
  }
  switch (true) {
    case wikiId[0] === 'A':
      return CategoryMap[QUEST_CATEGORY.Composition]
    case wikiId[0] === 'B':
      return CategoryMap[QUEST_CATEGORY.Sortie]
    case wikiId[0] === 'C':
      return CategoryMap[QUEST_CATEGORY.Exercise]
    case wikiId[0] === 'D':
      return CategoryMap[QUEST_CATEGORY.Expedition]
    case wikiId[0] === 'E':
      return CategoryMap[QUEST_CATEGORY.SupplyOrDocking]
    case wikiId[0] === 'F':
      return CategoryMap[QUEST_CATEGORY.Arsenal]
    case wikiId[0] === 'G':
      return CategoryMap[QUEST_CATEGORY.Modernization]
    case wikiId[0] === '?':
      return CategoryMap[QUEST_CATEGORY.Unknown]
    default:
      // Try parse SB01, WA01, 2103B1
      return guessQuestCategory(wikiId.slice(1))
  }
}

export const isCompositionQuest = ({ code }: DocQuest) =>
  guessQuestCategory(code).type === QUEST_CATEGORY.Composition
export const isSortieQuest = ({ code }: DocQuest) =>
  guessQuestCategory(code).type === QUEST_CATEGORY.Sortie
export const isExerciseQuest = ({ code }: DocQuest) =>
  guessQuestCategory(code).type === QUEST_CATEGORY.Exercise
export const isExpeditionQuest = ({ code }: DocQuest) =>
  guessQuestCategory(code).type === QUEST_CATEGORY.Expedition
export const isSupplyOrDockingQuest = ({ code }: DocQuest) =>
  guessQuestCategory(code).type === QUEST_CATEGORY.SupplyOrDocking
export const isArsenalQuest = ({ code }: DocQuest) =>
  guessQuestCategory(code).type === QUEST_CATEGORY.Arsenal
export const isModernizationQuest = ({ code }: DocQuest) =>
  guessQuestCategory(code).type === QUEST_CATEGORY.Modernization
export const isUnknownCategoryQuest = ({ code }: DocQuest) =>
  // Starts with unknown character
  /^[^ABCDEFG]/.test(code)

export const getQuestPrePost = (gameId: number) => {
  if (!(gameId in prePostQuest)) {
    return { pre: [], post: [] }
  }
  return prePostQuest[String(gameId) as keyof typeof prePostQuest]
}

const getNoPostQuestIds = (): number[] => {
  const noPostQuestIds = []
  for (const [gameId, { post }] of Object.entries(prePostQuest)) {
    if (!post.length) {
      noPostQuestIds.push(+gameId)
    }
  }
  return noPostQuestIds
}

/**
 * Get quest id by quest code
 *
 * @example
 * ```ts
 * getQuestIdByCode('A1') // 101
 * ```
 */
export const getQuestIdByCode = (code: string) => {
  if (code in questCodeMap) {
    return questCodeMap[code as keyof typeof questCodeMap]
  }
  return null
}

export const getQuestCodeByGameId = (gameId: number) => {
  const questCode = Object.entries(questCodeMap).find(([, id]) => id === gameId)
  if (!questCode) {
    return null
  }
  return questCode[0]
}

/**
 * Get pre quest ids by quest id
 *
 * @example
 * ```ts
 * // Quest id A2's pre quest id is A1
 * getPreQuestIds(102) // [101]
 * ```
 */
export const getPreQuestIds = (gameId: number): number[] =>
  getQuestPrePost(gameId)
    .pre.map((code) => getQuestIdByCode(code))
    .filter(Boolean) as number[]

const getAllPreQuestIds = (gameId: number): number[] => {
  const set = new Set<number>()
  const queue = [gameId]
  while (queue.length) {
    const gameId = queue.shift()!
    getPreQuestIds(gameId).forEach((preGameId) => {
      if (set.has(preGameId)) {
        return
      }
      set.add(preGameId)
      queue.push(preGameId)
    })
  }
  return Array.from(set)
}

/**
 * Get post quest ids by quest id
 *
 * @example
 * ```ts
 * // Quest id A1's post quest id is A2
 * getPreQuestIds(101) // [102]
 * ```
 */
export const getPostQuestIds = (gameId: number): number[] =>
  getQuestPrePost(gameId)
    .post.map((code) => getQuestIdByCode(code))
    .filter(Boolean) as number[]

/**
 * @internal Export for test
 */
export const calcQuestMap = (
  inProgressQuests: number[],
  next: (gameId: number) => number[],
) => {
  const map: Record<number, true> = {}
  const queue: number[] = inProgressQuests.flatMap(next)
  while (queue.length) {
    const gameId = queue.shift()!
    if (gameId in map) {
      continue
    }
    map[gameId] = true

    next(gameId).forEach((nextGameId) => {
      queue.push(nextGameId)
    })
  }
  return map
}

export const getCompletedQuest = memoize(
  (inProgressQuest: number[]) => {
    const completedQuest = calcQuestMap(inProgressQuest, getPreQuestIds)
    // Check if the quest chain had completed
    // See https://github.com/lawvs/poi-plugin-quest-2/issues/83
    const noPostQuestIds = getNoPostQuestIds()
    noPostQuestIds.forEach((gameId) => {
      if (inProgressQuest.includes(gameId) || completedQuest[gameId]) {
        return
      }
      const preQuestIds = getAllPreQuestIds(gameId)
      const hasInProgressPreQuest = preQuestIds.some((preGameId) =>
        inProgressQuest.includes(preGameId),
      )
      if (hasInProgressPreQuest) {
        // The quest chain is not completed
        return
      }
      const hasCompletedPreQuest = preQuestIds.some(
        (preGameId) => completedQuest[preGameId],
      )
      if (!hasCompletedPreQuest) {
        // The quest chain is not unlocked
        return
      }
      preQuestIds.forEach((preGameId) => {
        completedQuest[preGameId] = true
      })
      completedQuest[gameId] = true
    })
    return completedQuest
  },
  {
    isKeyItemEqual: (cacheKeyArg, keyArg) => {
      if (Array.isArray(cacheKeyArg) && Array.isArray(keyArg)) {
        return cacheKeyArg.join(',') === keyArg.join(',')
      }
      return cacheKeyArg === keyArg
    },
  },
)

export const getLockedQuest = memoize(
  (inProgressQuest: number[]) => {
    const lockedQuest = calcQuestMap(inProgressQuest, getPostQuestIds)

    // Fix https://github.com/lawvs/poi-plugin-quest-2/issues/87
    // Since we check the quest chain in getCompletedQuest, we need to remove the completed quest from lockedQuest
    const completedQuest = getCompletedQuest(inProgressQuest)
    Object.keys(lockedQuest).forEach((gameId) => {
      if (completedQuest[+gameId]) {
        delete lockedQuest[+gameId]
      }
    })
    return lockedQuest
  },
  {
    isKeyItemEqual: (cacheKeyArg, keyArg) => {
      if (Array.isArray(cacheKeyArg) && Array.isArray(keyArg)) {
        return cacheKeyArg.join(',') === keyArg.join(',')
      }
      return cacheKeyArg === keyArg
    },
  },
)

export const questApiStateToQuestStatus = (
  state: QUEST_API_STATE | undefined,
): QUEST_STATUS => {
  switch (state) {
    case QUEST_API_STATE.DEFAULT:
      return QUEST_STATUS.DEFAULT
    case QUEST_API_STATE.COMPLETED:
      return QUEST_STATUS.COMPLETED
    case QUEST_API_STATE.IN_PROGRESS:
      return QUEST_STATUS.IN_PROGRESS
    default:
      return QUEST_STATUS.DEFAULT
  }
}

export enum QUEST_STATUS {
  LOCKED,
  DEFAULT,
  IN_PROGRESS,
  COMPLETED,
  ALREADY_COMPLETED,
  UNKNOWN,
}
