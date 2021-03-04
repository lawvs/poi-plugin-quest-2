import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QuestData } from '../../build/kcanotifyGamedata'
import {
  activeQuestsSelector,
  GameQuest,
  observePluginStore,
  observePoiStore,
  PoiQuestState,
} from '../poi'
import type { KcanotifyQuestExt } from '../questHelper'
import { useStore } from './store'

const DEFAULT_LANG = 'ja-JP'

export const useLanguage = () => {
  const { i18n } = useTranslation()
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

const useKcanotifyQuestMap = () => {
  const lang = useLanguage()
  return QuestData[lang]
}

const useGameQuest = () => {
  const [quests, setQuests] = useState<GameQuest[] | null>(null)
  useEffect(() => {
    const listener = (quests: GameQuest[] | null) => setQuests(quests)
    return observePluginStore(listener, (i) => i._.questList)
  }, [])
  return quests
}

export const useQuest = (): KcanotifyQuestExt[] => {
  const activeQuest = useActiveQuest()
  const kcanotifyQuestMap = useKcanotifyQuestMap()
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
      if (gameId in kcanotifyQuestMap) {
        return {
          gameId,
          active,
          ...kcanotifyQuestMap[
            (gameId as unknown) as keyof typeof kcanotifyQuestMap
          ],
        }
      }

      // Not yet recorded quest
      // May be a new quest
      return {
        gameId,
        active,
        code: '?',
        name: quest.api_title,
        desc: quest.api_detail,
      }
    })
  } else {
    // Return all recorded quests
    return Object.entries(kcanotifyQuestMap).map(([gameId, val]) => ({
      gameId,
      active: gameId in activeQuest,
      ...val,
    }))
  }
}
