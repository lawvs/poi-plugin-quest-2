import type { GameQuest, PoiAction } from './poi'

const initState = {
  questList: null as null | GameQuest[],
}

export type PluginState = { _: typeof initState }

export const reducer = (
  state = initState,
  action: PoiAction
): typeof initState => {
  switch (action.type) {
    case '@@Response/kcsapi/api_get_member/questlist': {
      const { body } = action

      return {
        ...state,
        questList: body.api_list,
      }
    }
    default:
      return state
  }
}
