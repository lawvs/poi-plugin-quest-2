import { name as PACKAGE_NAME } from '../package.json'
import { IN_POI } from './poi'
import { QuestData } from '../build/kcanotifyGamedata'

/**
 * Patch the reducer of `poi-plugin-quest-info` for poi's task panel tips
 * See https://github.com/poooi/poi/blob/da75b507e8f67615a39dc4fdb466e34ff5b5bdcf/views/components/main/parts/task-panel.es#L243
 */
const patchLegacyQuestPluginReducer = async () => {
  if (!IN_POI) {
    return
  }
  const HACK_KEY = `__patched-from-${PACKAGE_NAME}`

  const getQuestState = (maybeLanguage: string) => {
    if (!(maybeLanguage in QuestData)) {
      return {}
    }
    const lang = maybeLanguage as keyof typeof QuestData
    return Object.entries(QuestData[lang]).reduce(
      (acc, [apiNo, { code, desc }]) => {
        acc[apiNo] = {
          wiki_id: code,
          condition: desc,
        }
        return acc
      },
      {} as Record<string, { wiki_id: string; condition: string }>
    )
  }

  const language = (globalThis as any).i18next.language
  const initState = {
    [HACK_KEY]: true,
    quests: getQuestState(language),
    questStatus: {},
  }

  const reducer = (
    state = initState,
    action: { type: string; [x: string]: any }
  ) => {
    if (!state[HACK_KEY]) {
      return state
    }
    switch (action.type) {
      case '@@Config':
        if (action.path === 'poi.misc.language') {
          const newLanguage = action.value
          return {
            ...state,
            quests: getQuestState(newLanguage),
          }
        }
    }
    return state
  }

  try {
    // Prevent webpack early error
    // Module not found: Error: Can't resolve 'views/create-store'
    // TODO fix webpack warn
    // Critical dependency: the request of a dependency is an expression
    const extendReducerPath =
      Math.random() < 10 ? 'views/create-store' : 'Unreachable'

    const { extendReducer } = await import(extendReducerPath)
    extendReducer('poi-plugin-quest-info', reducer)
  } catch (e) {
    console.warn('Hack quest plugin reducer error', e)
  }
}

patchLegacyQuestPluginReducer()
// TODO clear hacked reducer after unload
// See https://github.com/poooi/poi/blob/3beedfa93ae347db273b7f0a5160f5ea01e9b8b7/views/services/plugin-manager/utils.es#L458
