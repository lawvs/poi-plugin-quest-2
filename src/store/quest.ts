import { useCallback, useEffect, useState } from 'react'
import { QuestData } from '../../build/kcanotifyGamedata'
import {
  activeQuestsSelector,
  GameQuest,
  observePluginStore,
  observePoiStore,
  PoiQuestState,
  usePluginTranslation,
} from '../poi'
import { getCategory, KcanotifyQuestExt } from '../questHelper'
import { useKcwikiData } from './kcwiki'
import { useStore } from './store'

const DEFAULT_LANG = 'ja-JP'

export const useLanguage = () => {
  const { i18n } = usePluginTranslation()
  const language =
    i18n.language in QuestData
      ? (i18n.language as keyof typeof QuestData)
      : DEFAULT_LANG
  return language
}

const useActiveQuest = () => {
  const [activeQuests, setActiveQuests] = useState<PoiQuestState>({})

  useEffect(() => {
    const listener = (activeQuests: PoiQuestState) =>
      setActiveQuests(activeQuests)

    return observePoiStore(listener, activeQuestsSelector)
  }, [])

  return activeQuests
}

const useQuestMap = () => {
  const lang = useLanguage()
  const kcwikiData = useKcwikiData(lang)
  if (kcwikiData) {
    return kcwikiData
  }
  return QuestData[lang]
}

const useGameQuest = () => {
  const [quests, setQuests] = useState<GameQuest[] | null>(null)
  useEffect(() => {
    const listener = (quests: GameQuest[] | null) => setQuests(quests)
    // See reducer.ts
    return observePluginStore(listener, (i) => i?._?.questList)
  }, [])
  return quests
}

export const useQuest = (): KcanotifyQuestExt[] => {
  const activeQuest = useActiveQuest()
  const questMap = useQuestMap()
  const gameQuest = useGameQuest()
  const {
    store: { syncWithGame },
  } = useStore()

  if (syncWithGame) {
    if (gameQuest == null) {
      // TODO tip use to sync quest data
      return []
    }
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
