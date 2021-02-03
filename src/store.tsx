import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react'
import { TAG_ALL } from './tags'

export const initialState = {
  searchInput: '',
  activatedTags: {
    [TAG_ALL.name]: true,
  } as Record<string, boolean>,
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
