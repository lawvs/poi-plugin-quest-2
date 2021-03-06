import {
  patchLegacyQuestPluginReducer,
  clearPatchLegacyQuestPluginReducer,
} from './patch'
// See https://dev.poooi.app/docs/plugin-exports.html

/**
 * The plugin will be started as a new-window or not for default.
 */
export const windowMode = false
/**
 * @env poi
 */
export const pluginDidLoad = () => {
  patchLegacyQuestPluginReducer()
}
/**
 * @env poi
 */
export const pluginWillUnload = () => {
  clearPatchLegacyQuestPluginReducer()
}
export { App as reactClass } from './App'
export { Settings as settingsClass } from './Settings'
export { reducer } from './reducer'
/**
 * Game response URI list for poi to switch to the plugin.
 */
export const switchPluginPath = ['/kcsapi/api_get_member/questlist']
