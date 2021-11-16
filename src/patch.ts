import { name as PACKAGE_NAME } from '../package.json'
import { getPoiStore, importFromPoi } from './poi'
import { QuestData } from '../build/kcanotifyGamedata'
import { KcwikiQuestData } from '../build/kcQuestsData'
import {
  checkIsKcwikiSupportedLanguages,
  getStorage,
  isSupportedLanguages,
} from './store'
import type { i18n } from 'i18next'

const LEGACY_QUEST_PLUGIN_ID = 'poi-plugin-quest-info'
const HACK_KEY = `__patched-from-${PACKAGE_NAME}`

/**
 * @env poi
 */
const isLegacyQuestPluginEnabled = async () => {
  const poiStore = await getPoiStore()
  const legacyQuestPlugin = poiStore
    .getState()
    .plugins.find((i) => i.id === LEGACY_QUEST_PLUGIN_ID)
  if (legacyQuestPlugin && legacyQuestPlugin.enabled) {
    return true
  }
  return false
}

const getQuestState = (maybeLanguage: string) => {
  const supported = isSupportedLanguages(maybeLanguage)
  if (!supported) {
    return {}
  }
  const preferKcwikiData = getStorage()?.preferKcwikiData ?? true
  const kcwikiSupported = checkIsKcwikiSupportedLanguages(maybeLanguage)

  const data =
    preferKcwikiData && kcwikiSupported
      ? KcwikiQuestData[maybeLanguage]
      : QuestData[maybeLanguage]

  return Object.entries(data).reduce((acc, [apiNo, { code, desc }]) => {
    acc[apiNo] = {
      wiki_id: code,
      condition: desc,
    }
    return acc
  }, {} as Record<string, { wiki_id: string; condition: string }>)
}

/**
 * Patch the reducer of `poi-plugin-quest-info` for poi's task panel tips
 * See https://github.com/poooi/poi/blob/da75b507e8f67615a39dc4fdb466e34ff5b5bdcf/views/components/main/parts/task-panel.es#L243
 * @env poi
 */
export const patchLegacyQuestPluginReducer = async () => {
  if (await isLegacyQuestPluginEnabled()) {
    // no clear if legacy quest plugin enabled
    return
  }

  const i18next: i18n = await importFromPoi('views/env-parts/i18next')
  const language = i18next.language
  const initState = {
    [HACK_KEY]: true,
    quests: getQuestState(language),
    questStatus: {},
  }

  const reducer = (
    state = initState,
    action: { type: string; [x: string]: any }
  ) => {
    switch (action.type) {
      case '@@Config':
        // change language
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
    const { extendReducer } = await importFromPoi('views/create-store')
    extendReducer(LEGACY_QUEST_PLUGIN_ID, reducer)
  } catch (e) {
    console.warn('Hack quest plugin reducer error', e)
  }
}

/**
 * Clear hacked reducer after unload
 * See https://github.com/poooi/poi/blob/3beedfa93ae347db273b7f0a5160f5ea01e9b8b7/views/services/plugin-manager/utils.es#L451
 * @env poi
 */
export const clearPatchLegacyQuestPluginReducer = async () => {
  if (await isLegacyQuestPluginEnabled()) {
    // no clear if legacy quest plugin enabled
    return
  }
  try {
    const { extendReducer } = await importFromPoi('views/create-store')
    const clearReducer = undefined
    extendReducer('poi-plugin-quest-info', clearReducer)
  } catch (e) {
    console.warn('Clear hack quest plugin reducer error', e)
  }
}
