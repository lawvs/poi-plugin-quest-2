import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react'
import { useMount, useUpdateEffect } from 'react-use'
import type { FilterGroup } from '../filter-sphere/vendor'
import type { QUEST_DATA } from '../../build'
import { PACKAGE_NAME } from '../poi/env'
import type { QuestStateCache } from '../questPeriod'
import { yes } from '../utils'
import { GameQuestProvider } from './gameQuest'

export const ALL_CATEGORY_TAG = {
  name: 'All',
  filter: yes,
} as const

export const ALL_TYPE_TAG = ALL_CATEGORY_TAG

export enum PROGRESS_TAG {
  All = 'All',
  Unlocked = 'Unlocked',
  Locked = 'Locked',
  AlreadyCompleted = 'AlreadyCompleted',
}

type Unpacked<T> = T extends (infer U)[] ? U : T
export type DataSource = Unpacked<typeof QUEST_DATA>['key']

export const initialState = {
  searchInput: '',
  typeTags: {
    [ALL_TYPE_TAG.name]: true,
  } as Record<string, boolean>,
  categoryTags: {
    [ALL_CATEGORY_TAG.name]: true,
  } as Record<string, boolean>,
  progressTag: PROGRESS_TAG.All,
  syncWithGame: false as const,
  /**
   * @deprecated
   */
  preferKcwikiData: true,
  dataSource: null as DataSource | null,
  advancedSearchMode: false,
  filterRule: null as FilterGroup | null,
  filterPresets: [] as Array<{
    id: string
    name: string
    rule: FilterGroup
  }>,
  activePresetId: null as string | null,
  showFilterBuilder: true,
  /**
   * 「最后一次看到每个任务处于什么状态」的记录，按任务 id 索引并持久化。
   *
   * 游戏的任务列表只能反映「此刻可见」的任务，而「已完成」的任务领奖后就会消失，
   * 所以完成状态只能靠这份记录。记录带时间戳，周期性任务跨周期后自动失效。
   */
  questStateCache: {} as QuestStateCache,
}

export type State = typeof initialState

// Persist state
const STORAGE_KEY = PACKAGE_NAME

const useStorage = <T,>(initialValue: T) => {
  const [state, setState] = useState<T>(initialValue)
  // Load storage at mount
  useMount(() => {
    try {
      const stringStore = localStorage.getItem(STORAGE_KEY)
      if (stringStore == null) {
        return
      }
      const parsedStorage: T = JSON.parse(stringStore)
      setState({ ...initialState, ...parsedStorage })
    } catch (error) {
      console.error('Failed to load storage', error)
    }
  })

  // Save storage when store change
  useUpdateEffect(() => {
    const serializedStore = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serializedStore)
  }, [state])

  return [state, setState] as const
}

export const getStorage = () => {
  const stringStore = localStorage.getItem(STORAGE_KEY)
  if (stringStore == null) {
    return
  }
  return JSON.parse(stringStore) as State
}

const StateContext = createContext<State>(initialState)
const SetStateContext = createContext<Dispatch<SetStateAction<State>>>(() => {})

export const StoreProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, setState] = useStorage<State>(initialState)
  // GameQuestProvider 需要读写下面的 store，所以放在 Provider 内部
  return (
    <SetStateContext.Provider value={setState}>
      <StateContext.Provider value={state}>
        <GameQuestProvider>{children}</GameQuestProvider>
      </StateContext.Provider>
    </SetStateContext.Provider>
  )
}

export const useStore = () => {
  const store = useContext(StateContext)
  const setStore = useContext(SetStateContext)
  const updateStore = useCallback(
    (newStore: Partial<State>) => {
      setStore((previousStore) => ({ ...previousStore, ...newStore }))
    },
    [setStore],
  )

  return { store, setStore, updateStore }
}

export const useRemoveStorage = () => {
  const { updateStore } = useStore()
  return () => {
    localStorage.removeItem(STORAGE_KEY)
    updateStore(initialState)
  }
}
