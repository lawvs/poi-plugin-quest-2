import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { IN_POI } from '../poi'
import { ALL_TYPE_TAG, ALL_CATEGORY_TAG } from '../tags'
import { name as PACKAGE_NAME } from '../../package.json'
import { useUpdateEffect } from '../utils'

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
}

export type State = typeof initialState

// Persist state
const STORAGE_KEY = PACKAGE_NAME
const getStorageOr = (defaultStore = initialState, merge = true): State => {
  const stringStore = localStorage.getItem(STORAGE_KEY)
  if (stringStore == null) {
    return defaultStore
  }
  const parsedStore = JSON.parse(stringStore)
  // TODO use deep merge
  const store = merge ? { ...defaultStore, ...parsedStore } : parsedStore
  return store
}

let onRemoveStorage: (() => void)[] = []
export const removeStorage = () => {
  localStorage.removeItem(STORAGE_KEY)
  onRemoveStorage.forEach((i) => i())
}

const useStorage = (store: State, onRemove = () => {}) => {
  useUpdateEffect(() => {
    const serializedStore = JSON.stringify(store)
    localStorage.setItem(STORAGE_KEY, serializedStore)
  }, [store])

  // TODO fix can not response instant at storybook env
  useEffect(() => {
    onRemoveStorage.push(onRemove)
    return () => {
      onRemoveStorage = onRemoveStorage.filter((i) => i !== onRemove)
    }
  })
}

const storageOrInitialState = getStorageOr(initialState)
const StateContext = createContext<State>(initialState)
const SetStateContext = createContext<Dispatch<SetStateAction<State>>>(() => {})

export const StoreProvider = ({ children }: { children: React.ReactChild }) => {
  const [state, setState] = useState(storageOrInitialState)
  const onStorageRemove = useCallback(() => {
    setState(initialState)
  }, [])
  useStorage(state, onStorageRemove)
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
