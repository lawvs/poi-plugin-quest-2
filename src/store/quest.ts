import { useCallback } from 'react'
import { useGameQuest, usePluginTranslation } from '../poi/hooks'
import {
  DocQuest,
  getCategory,
  getCompletedQuest,
  getKcanotifyQuestData,
  getLockedQuest,
  getQuestIdByCode,
  questApiStateToQuestStatus,
  QUEST_STATUS,
  UnionQuest,
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

export const useQuestStatus = (gameId: number | null) => {
  const gameQuest = useGameQuest()
  const gameQuestId = gameQuest.map((quest) => quest.api_no)
  const completedQuest = getCompletedQuest(gameQuestId)
  const lockedQuest = getLockedQuest(gameQuestId)

  if (!gameId) {
    return QUEST_STATUS.UNKNOWN
  }
  const theGameQuest = gameQuest.find((quest) => quest.api_no === gameId)
  if (theGameQuest) {
    return questApiStateToQuestStatus(theGameQuest.api_state)
  }
  if (gameId in lockedQuest) {
    return QUEST_STATUS.LOCKED
  }
  if (gameId in completedQuest) {
    return QUEST_STATUS.ALREADY_COMPLETED
  }
  return QUEST_STATUS.UNKNOWN
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
