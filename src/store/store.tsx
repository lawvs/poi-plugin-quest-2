import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react'
import { useMount, useUpdateEffect } from 'react-use'
import { PACKAGE_NAME } from '../poi/env'
import { noop, yes } from '../utils'
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
  preferKcwikiData: true,
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
  return (
    <GameQuestProvider>
      <SetStateContext.Provider value={setState}>
        <StateContext.Provider value={state}>{children}</StateContext.Provider>
      </SetStateContext.Provider>
    </GameQuestProvider>
  )
}

export const useStore = () => {
  const store = useContext(StateContext)
  const setStore = useContext(SetStateContext)
  const updateStore = useCallback(
    (newStore: Partial<State>) => {
      setStore((previousStore) => ({ ...previousStore, ...newStore }))
    },
    [setStore]
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

/**
 * @deprecated Use progress tag
 */
export const useSyncWithGame = () => {
  const setSyncWithGame = noop
  const toggleSyncWithGame = noop
  return {
    syncWithGame: false as const,
    setSyncWithGame,
    toggleSyncWithGame,
  }
}
