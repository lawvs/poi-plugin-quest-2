import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { observePluginStore, observePoiStore } from './store'
import { name as PACKAGE_NAME } from '../../package.json'
import type { GameQuest, PoiQuestState, PoiState } from './types'

export const useActiveQuest = () => {
  const [activeQuests, setActiveQuests] = useState<PoiQuestState>({})

  useEffect(() => {
    const listener = (activeQuests: PoiQuestState) =>
      setActiveQuests(activeQuests)

    return observePoiStore(listener, activeQuestsSelector)
  }, [])

  return activeQuests
}

export const activeQuestsSelector = (state: PoiState): PoiQuestState =>
  state?.info?.quests?.activeQuests ?? {}

export const usePluginTranslation = () => {
  return useTranslation(PACKAGE_NAME)
}

export const useGameQuest = () => {
  const [quests, setQuests] = useState<GameQuest[] | null>(null)
  useEffect(() => {
    const listener = (quests: GameQuest[] | null) => setQuests(quests)
    // See reducer.ts
    return observePluginStore(listener, (i) => i?._?.questList)
  }, [])
  return quests
}

const useActiveTab = () => {
  const [activeMainTab, setActiveMainTab] = useState<string>('<unknown>')

  useEffect(() => {
    const listener = (activeMainTab: string) => setActiveMainTab(activeMainTab)
    // poooi/poi/views/redux/ui.es
    return observePoiStore(listener, (state) => state.ui.activeMainTab)
  }, [])

  return activeMainTab
}

export const useIsQuestPluginTab = () => {
  const activeMainTab = useActiveTab()
  return activeMainTab === PACKAGE_NAME
}
