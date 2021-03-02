import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { activeQuestsSelector, observePoiStore, PoiQuestState } from './poi'
import { ALL_TYPE_TAG, ALL_CATEGORY_TAG } from './tags'

export const initialState = {
  searchInput: '',
  typeTags: {
    [ALL_TYPE_TAG.name]: true,
  } as Record<string, boolean>,
  categoryTags: {
    [ALL_CATEGORY_TAG.name]: true,
  } as Record<string, boolean>,
  syncWithGame: true,
}

export type State = typeof initialState

const StateContext = createContext<State>(initialState)
const SetStateContext = createContext<Dispatch<SetStateAction<State>>>(() => {})

export const StoreProvider = ({ children }: { children: React.ReactChild }) => {
  const [state, setState] = useState(initialState)
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

export const useActiveQuests = () => {
  const [activeQuests, updateActiveQuests] = useState<PoiQuestState>({})

  useEffect(() => {
    const listener = (activeQuests: PoiQuestState) => {
      updateActiveQuests(activeQuests)
    }
    const unsubscribe = observePoiStore(activeQuestsSelector, listener)
    return unsubscribe
  })

  return activeQuests
}
