import { GameQuest, PoiAction, QuestTab } from './poi/types'

const initState = {
  questList: null as null | GameQuest[],
  tabId: QuestTab.ALL,
}

export type PluginState = { _: typeof initState }

export const reducer = (
  state = initState,
  action: PoiAction,
): typeof initState => {
  switch (action.type) {
    case '@@Response/kcsapi/api_get_member/questlist': {
      const { body, postBody } = action

      return {
        ...state,
        questList: body.api_list,
        tabId: postBody.api_tab_id,
      }
    }
    default:
      return state
  }
}
