import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PACKAGE_NAME } from './env'
import {
  exportPoiState,
  importPoiState,
  observePluginStore,
  observePoiStore,
} from './store'
import { GameQuest, PoiQuestState, PoiState, QuestTab } from './types'

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
  // @ts-expect-error we declared a incorrect types in i18n/index.ts
  return useTranslation(PACKAGE_NAME)
}

const emptyArray: GameQuest[] = []
/**
 * Use `useGlobalGameQuest` instead
 *
 * Only use this hook to set context
 */
export const useGameQuest = () => {
  const [quests, setQuests] = useState<GameQuest[]>([])
  useEffect(() => {
    const listener = (quests: GameQuest[] | null) =>
      setQuests(quests ?? emptyArray)
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
      (state) => state?.ui?.activeMainTab ?? UNKNOWN_TAB,
    )
  }, [])

  return activeMainTab
}

export const useIsQuestPluginTab = () => {
  const activeMainTab = useActiveTab()
  return activeMainTab === PACKAGE_NAME
}

const checkQuestList = (questList: unknown): questList is GameQuest[] => {
  if (!Array.isArray(questList)) {
    return false
  }
  // just a simple check
  return questList.every((q) => q && q.api_no)
}

export const useStateExporter = () => {
  const exportQuestDataToClipboard = async () => {
    const state = await exportPoiState()
    if (!state?.ext[PACKAGE_NAME]._.questList) {
      console.error('poi state', state)
      throw new Error('Failed to export quest data! questList not found!')
    }
    return navigator.clipboard.writeText(
      JSON.stringify(state?.ext[PACKAGE_NAME]._.questList),
    )
  }
  const importAsPoiState = (stateString: string) => {
    const maybeQuestList: unknown = JSON.parse(stateString)

    if (!checkQuestList(maybeQuestList)) {
      console.error(maybeQuestList)
      throw new Error('Failed to import quest state! Incorrect data format!')
    }

    importPoiState({
      ext: {
        [PACKAGE_NAME]: {
          _: { questList: maybeQuestList, tabId: QuestTab.ALL },
        },
      },
      ui: {
        activeMainTab: '',
        activeFleetId: undefined,
        activePluginName: undefined,
      },
      plugins: [],
    })
  }
  return {
    exportQuestDataToClipboard,
    importAsPoiState,
  }
}
