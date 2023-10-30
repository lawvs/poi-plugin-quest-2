import type { PluginState } from '../reducer'

export enum QUEST_API_STATE {
  DEFAULT = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
}

// See https://github.com/poooi/poi/blob/master/views/redux/info/quests.es
export type GameQuest = {
  api_state: QUEST_API_STATE
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
    }[],
  ]
  api_voice_id: 0
  api_bonus_flag: 1
}

export enum QuestTab {
  ALL = '0',
  IN_PROGRESS = '9',
  DAILY = '1',
  WEEKLY = '2',
  MONTHLY = '3',
  ONCE = '4',
  OTHERS = '5',
}

type QuestListAction = {
  type: '@@Response/kcsapi/api_get_member/questlist'
  path: '/kcsapi/api_get_member/questlist'
  postBody: {
    api_verno: '1'
    api_tab_id: QuestTab
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
  ui: {
    activeMainTab: string
    activeFleetId?: number
    activePluginName?: string
  }
  ext: {
    // TODO fix use constant PACKAGE_NAME
    [packageName: string]: PluginState
  }
  plugins: { id: string; enabled: boolean; [x: string]: unknown }[]
  [x: string]: any
}

export type Store<S> = {
  getState: () => S
  subscribe: (listener: () => void) => () => void
}

// state.info.quests.activeQuests
export type PoiQuestState = Record<number, { time: number; detail: GameQuest }>
