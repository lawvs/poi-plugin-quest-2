import { useTranslation } from 'react-i18next'
import { name as PACKAGE_NAME } from '../package.json'
import type { PluginState } from './reducer'

// See https://github.com/poooi/poi/blob/master/views/redux/info/quests.es
export type GameQuest = {
  // 1 Default
  // 2 In progress
  // 3 Completed
  api_state: 1 | 2 | 3
  api_no: number
  api_title: string
  api_detail: string
  /**
   * 任务类别
   *
   * 1. Composition
   * 1. Sortie
   * 1. Exercise
   * 1. Expedition
   * 1. Supply/Docking
   * 1. Arsenal
   * 1. Modernization
   *
   * @see https://github.com/poooi/plugin-quest/blob/master/index.es#L49-L57
   */
  api_category: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  /**
   * 任务类型
   *
   * 1. One-time
   * 1. Daily
   * 1. Weekly
   * 1. -3rd/-7th/-0th
   * 1. -2nd/-8th
   * 1. Monthly
   * 1. Quarterly
   *
   * @see https://github.com/poooi/plugin-quest/blob/master/index.es#L69-L77
   */
  api_type: 1 | 2 | 3 | 4 | 5 | 6 | 7
  // Rewards 油弹钢铝
  api_get_material: [number, number, number, number]
  api_invalid_flag: 0
  api_label_type: 1
  // 0: Empty: [0.0, 0.5)
  // 1: 50%: [0.5, 0.8)
  // 2: 80%: [0.8, 1.0)
  api_progress_flag: 0 | 1 | 2
  api_select_rewards?: [
    {
      api_count: number
      api_kind: number
      api_mst_id: number
      api_no: number
    }[]
  ]
  api_voice_id: 0
  api_bonus_flag: 1
}

type QuestListAction = {
  type: '@@Response/kcsapi/api_get_member/questlist'
  path: '/kcsapi/api_get_member/questlist'
  postBody: {
    api_verno: '1'
    api_tab_id:
      | '0' // All
      | '9' // In progress
      | '1' // Daily
      | '2' // Weekly
      | '3' // Monthly
      | '4' // Once
      | '5' // Others
  }
  body: {
    api_completed_kind: number
    // api_list.length
    api_count: number
    // In progress count
    api_exec_count: number
    api_exec_type: number
    api_list: GameQuest[]
  }
}

type OtherAction = {
  type: 'otherString' // TODO fix me
  path?: string
  postBody?: unknown
  body?: unknown
}

export type PoiAction = QuestListAction | OtherAction

export type PoiState = {
  ext: {
    // TODO fix use constant PACKAGE_NAME
    [packageName: string]: PluginState
  }
  [x: string]: any
}

type Store<S> = {
  getState: () => S
  subscribe: (listener: () => void) => () => void
}

// state.info.quests.activeQuests
export type PoiQuestState = Record<number, { time: number; detail: GameQuest }>

export const IN_POI = 'POI_VERSION' in globalThis

const noop = () => {}
const id = <T>(x: T) => x

/**
 * Prevent webpack early error
 * Module not found: Error: Can't resolve 'views/create-store'
 * TODO fix webpack warn
 * Critical dependency: the request of a dependency is an expression
 */
export const importFromPoi = <T = any>(path: string): Promise<T> => {
  if (!IN_POI) {
    return new Promise(() => {
      // Never resolve
    })
  }
  return import(path)
}

/**
 * See https://redux.js.org/api/store#subscribelistener
 */
const observeStore = <State, SelectedState = State>(
  store: Store<State>,
  onChange: (state: SelectedState) => void,
  selector: (s: State) => SelectedState = id as any
) => {
  let currentState: SelectedState

  const handleChange = () => {
    const nextState = selector(store.getState())
    if (nextState !== currentState) {
      currentState = nextState
      onChange(currentState)
    }
  }

  const unsubscribe = store.subscribe(handleChange)
  handleChange()
  return unsubscribe
}

export const observePoiStore = <SelectedState = PoiState>(
  onChange: (state: SelectedState) => void,
  selector: (state: PoiState) => SelectedState = id as any
) => {
  let valid = true
  let unsubscribe = noop
  getPoiStore().then((store) => {
    if (!valid) {
      return
    }
    unsubscribe = observeStore(store, onChange, selector)
  })

  return () => {
    valid = false
    unsubscribe()
  }
}

export const observePluginStore = <SelectedState = PluginState>(
  onChange: (state: SelectedState) => void,
  selector: (state: PluginState) => SelectedState = id as any
) => observePoiStore(onChange, (s) => selector(s?.ext[PACKAGE_NAME]))

const fallbackStore: Store<PoiState> = {
  getState: noop as () => PoiState,
  subscribe: () => (() => {}) as () => () => void,
}

let globalStore: Store<PoiState> | null = null
/**
 * Get poi global Store if in poi env
 */
export const getPoiStore: () => Promise<Store<PoiState>> = async () => {
  if (globalStore !== null) {
    return globalStore
  }
  if (IN_POI) {
    try {
      const { store } = await importFromPoi('views/create-store')
      globalStore = store
      return store
    } catch (error) {
      console.warn('Load global store error', error)
    }
  }
  globalStore = fallbackStore
  return fallbackStore
}

export const activeQuestsSelector = (state: PoiState): PoiQuestState =>
  state?.info?.quests?.activeQuests ?? {}

export const usePluginTranslation = () => {
  return useTranslation(PACKAGE_NAME)
}
