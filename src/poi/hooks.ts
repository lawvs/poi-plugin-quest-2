import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { observePluginStore, observePoiStore } from './store'
import { name as PACKAGE_NAME } from '../../package.json'
import { GameQuest, PoiQuestState, PoiState, QuestTab } from './types'
import { createGlobalState } from 'react-use'

export const activeQuestsSelector = (state: PoiState): PoiQuestState =>
  state?.info?.quests?.activeQuests ?? {}

export const useActiveQuest = () => {
  const [activeQuests, setActiveQuests] = useState<PoiQuestState>({})

  useEffect(() => {
    const listener = (activeQuests: PoiQuestState) =>
      setActiveQuests(activeQuests)

    return observePoiStore(listener, activeQuestsSelector)
  }, [])

  return activeQuests
}

export const usePluginTranslation = () => {
  return useTranslation(PACKAGE_NAME)
}

const useGlobalGameQuest = createGlobalState<GameQuest[]>([])

export const useGameQuest = () => {
  const [quests, setQuests] = useGlobalGameQuest()
  useEffect(() => {
    const listener = (quests: GameQuest[] | null) => setQuests(quests ?? [])
    // See reducer.ts
    return observePluginStore(listener, (i) => i?._?.questList)
  }, [setQuests])
  return quests
}

export const useGameTab = () => {
  const [tab, setTab] = useState<QuestTab>(QuestTab.ALL)
  useEffect(() => {
    const listener = (tabId: QuestTab | null) => setTab(tabId ?? QuestTab.ALL)
    return observePluginStore(listener, (i) => i?._?.tabId)
  }, [])
  return tab
}

const UNKNOWN_TAB = 'unknown'
const useActiveTab = () => {
  const [activeMainTab, setActiveMainTab] = useState<string>(UNKNOWN_TAB)

  useEffect(() => {
    const listener = (activeMainTab: string) => setActiveMainTab(activeMainTab)
    // poooi/poi/views/redux/ui.es
    return observePoiStore(
      listener,
      (state) => state?.ui?.activeMainTab ?? UNKNOWN_TAB
    )
  }, [])

  return activeMainTab
}

export const useIsQuestPluginTab = () => {
  const activeMainTab = useActiveTab()
  return activeMainTab === PACKAGE_NAME
}
