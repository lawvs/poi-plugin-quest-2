import moize from 'moize'
import { useCallback } from 'react'
import { useGameQuest, usePluginTranslation } from '../poi/hooks'
import type { GameQuest } from '../poi/types'
import type { UnionQuest } from '../questHelper'
import {
  DocQuest,
  getCategory,
  getKcanotifyQuestData,
  getPostQuestIds,
  getPreQuestIds,
  getQuestIdByCode,
  QUEST_STATUS,
} from '../questHelper'
import { checkIsKcwikiSupportedLanguages, useKcwikiData } from './kcwiki'
import { useStore, useSyncWithGame } from './store'

const DEFAULT_LANG = 'ja-JP'

const checkIsKcanotifySupportedLanguages = (
  lang: string
): lang is keyof typeof kcaQuestData => {
  const kcaQuestData = getKcanotifyQuestData()
  return lang in kcaQuestData
}

export const isSupportedLanguages = (
  lang: string
): lang is keyof ReturnType<typeof getKcanotifyQuestData> =>
  checkIsKcanotifySupportedLanguages(lang) ||
  checkIsKcwikiSupportedLanguages(lang)

export const useLanguage = () => {
  const {
    i18n: { language },
  } = usePluginTranslation()
  const lang = checkIsKcanotifySupportedLanguages(language)
    ? language
    : DEFAULT_LANG
  return lang
}

const useQuestMap = (): Record<string, DocQuest> => {
  const lang = useLanguage()
  const kcwikiData = useKcwikiData(lang)
  if (kcwikiData) {
    return kcwikiData
  }
  const kcaQuestData = getKcanotifyQuestData()
  return kcaQuestData[lang]
}

export const useQuest = (): UnionQuest[] => {
  const docQuestMap = useQuestMap()
  const gameQuest = useGameQuest()
  const { syncWithGame } = useSyncWithGame()

  if (syncWithGame && gameQuest.length) {
    return gameQuest.map((quest) => {
      const gameId = quest.api_no
      if (gameId in docQuestMap) {
        return {
          gameId,
          gameQuest: quest,
          docQuest: docQuestMap[String(gameId) as keyof typeof docQuestMap],
        }
      }

      // Not yet recorded quest
      // May be a new quest
      return {
        gameId,
        gameQuest: quest,
        docQuest: {
          code: `${getCategory(quest.api_category).wikiSymbol}?`,
          name: quest.api_title,
          desc: quest.api_detail,
        },
      }
    })
  } else {
    // Return all recorded quests
    return Object.entries(docQuestMap).map(([gameId, val]) => ({
      gameId: +gameId,
      // Maybe empty
      gameQuest: gameQuest.find((quest) => quest.api_no === Number(gameId))!,
      docQuest: val,
    }))
  }
}

export const useQuestByCode = (code: string): UnionQuest | null => {
  const questMap = useQuestMap()
  const gameId = getQuestIdByCode(code)
  if (gameId && gameId in questMap) {
    return {
      gameId,
      docQuest: questMap[String(gameId) as keyof typeof questMap],
    }
  }
  return null
}

const calcQuestMap = moize(
  (gameQuest: GameQuest[], next: (gameId: number) => number[]) => {
    const map: Record<number, true> = {}
    const queue: number[] = gameQuest.map((quest) => quest.api_no)
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
  },
  {
    maxSize: 2,
  }
)

const useCompletedQuest = () => {
  const gameQuest = useGameQuest()
  const completedQuest = calcQuestMap(gameQuest, getPreQuestIds)
  return completedQuest
}

const useLockedQuest = () => {
  const gameQuest = useGameQuest()
  const lockedQuest = calcQuestMap(gameQuest, getPostQuestIds)
  return lockedQuest
}

export const useQuestStatus = (gameId: number | null) => {
  const completedQuest = useCompletedQuest()
  const lockedQuest = useLockedQuest()

  if (!gameId) {
    return QUEST_STATUS.DEFAULT
  }
  if (gameId in completedQuest) {
    return QUEST_STATUS.ALREADY_COMPLETED
  }
  if (gameId in lockedQuest) {
    return QUEST_STATUS.LOCKED
  }
  return QUEST_STATUS.DEFAULT
}

/**
 * @deprecated Not large card now
 */
export const useLargeCard = () => {
  const {
    store: { largeCard },
    updateStore,
  } = useStore()
  const setLarge = useCallback(
    (gameId: string) => updateStore({ largeCard: gameId }),
    [updateStore]
  )
  const setMinimal = useCallback(
    () => updateStore({ largeCard: null }),
    [updateStore]
  )
  return {
    largeCard,
    setLarge,
    setMinimal,
  }
}
