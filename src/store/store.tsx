import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
} from 'react'
import { IN_POI } from '../poi'
import { ALL_TYPE_TAG, ALL_CATEGORY_TAG } from '../tags'
import { name as PACKAGE_NAME } from '../../package.json'
import { createGlobalState, useMount, useUpdateEffect } from 'react-use'

export const initialState = {
  searchInput: '',
  typeTags: {
    [ALL_TYPE_TAG.name]: true,
  } as Record<string, boolean>,
  categoryTags: {
    [ALL_CATEGORY_TAG.name]: true,
  } as Record<string, boolean>,
  largeCard: null as null | string,
  syncWithGame: IN_POI,
  preferKcwikiData: true,
}

export type State = typeof initialState

// Persist state
const STORAGE_KEY = PACKAGE_NAME

const useStorage = (
  store: State,
  setState: (state: State) => void,
  merge = true
) => {
  // Load storage at mount
  useMount(() => {
    const stringStore = localStorage.getItem(STORAGE_KEY)
    if (stringStore == null) {
      return
    }
    const parsedStorage: State = JSON.parse(stringStore)
    // TODO use deep merge
    const storageStore = merge ? { ...store, ...parsedStorage } : parsedStorage
    setState(storageStore)
  })

  // Save storage when store change
  useUpdateEffect(() => {
    const serializedStore = JSON.stringify(store)
    localStorage.setItem(STORAGE_KEY, serializedStore)
  }, [store])
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

const useGlobalState = createGlobalState<State>(initialState)

export const StoreProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, setState] = useGlobalState()
  useStorage(state, setState)
  return (
    <SetStateContext.Provider value={setState}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </SetStateContext.Provider>
  )
}

export const useStore = () => {
  const store = useContext(StateContext)
  const setStore = useContext(SetStateContext)
  const updateStore = useCallback(
    (newStore: Partial<State>) => setStore({ ...store, ...newStore }),
    [setStore, store]
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
