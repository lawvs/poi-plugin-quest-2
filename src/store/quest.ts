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
  })

  return activeQuests
}

const useKcanotifyQuestMap = () => {
  const lang = useLanguage()
  return QuestData[lang]
}

const useKcanotifyQuest = () => {
  return Object.entries(useKcanotifyQuestMap()).map(([gameId, val]) => ({
    gameId,
    ...val,
  }))
}

const useGameQuest = () => {
  const [quests, setQuests] = useState<GameQuest[] | null>(null)
  useEffect(() => {
    const listener = (quests: GameQuest[] | null) => setQuests(quests)
    return observePluginStore(listener, (i) => i._.questList)
  })
  return quests
}

export const useQuest = () => {
  const activeQuest = useActiveQuest()
  const kcanotifyQuest = useKcanotifyQuest()

  return kcanotifyQuest.map(({ gameId, ...rest }) => ({
    gameId,
    active: gameId in activeQuest,
    ...rest,
  }))
}
