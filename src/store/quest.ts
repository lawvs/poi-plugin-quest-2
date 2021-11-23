import { useCallback } from 'react'
import { checkIsKcwikiSupportedLanguages } from '.'
import { QuestData } from '../../build/kcanotifyGamedata'
import {
  useActiveQuest,
  useGameQuest,
  usePluginTranslation,
} from '../poi/hooks'
import { getCategory, KcanotifyQuestExt } from '../questHelper'
import { useKcwikiData } from './kcwiki'
import { useStore } from './store'

const DEFAULT_LANG = 'ja-JP'

export const checkIsKcanotifySupportedLanguages = (
  lang: string
): lang is keyof typeof QuestData => lang in QuestData

export const isSupportedLanguages = (
  lang: string
): lang is keyof typeof QuestData =>
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

const useQuestMap = () => {
  const lang = useLanguage()
  const kcwikiData = useKcwikiData(lang)
  if (kcwikiData) {
    return kcwikiData
  }
  return QuestData[lang]
}

export const useQuest = (): KcanotifyQuestExt[] => {
  const activeQuest = useActiveQuest()
  const questMap = useQuestMap()
  const gameQuest = useGameQuest()
  const {
    store: { syncWithGame },
  } = useStore()

  if (syncWithGame && gameQuest.length) {
    return gameQuest.map((quest) => {
      const gameId = String(quest.api_no)
      const active = gameId in activeQuest
      if (gameId in questMap) {
        return {
          gameId,
          active,
          ...questMap[gameId as unknown as keyof typeof questMap],
        }
      }

      // Not yet recorded quest
      // May be a new quest
      return {
        gameId,
        active,
        code: `${getCategory(quest.api_category).wikiSymbol}?`,
        name: quest.api_title,
        desc: quest.api_detail,
      }
    })
  } else {
    // Return all recorded quests
    return Object.entries(questMap).map(([gameId, val]) => ({
      gameId,
      active: gameId in activeQuest,
      ...val,
    }))
  }
}

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
