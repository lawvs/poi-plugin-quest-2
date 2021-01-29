// See https://dev.poooi.app/docs/plugin-exports.html

/**
 * The plugin will be started as a new-window or not for default.
 */
export const windowMode = false
export const pluginDidLoad = () => {}
export const pluginWillUnload = () => {}
export { App as reactClass } from './App'
export const reducer = (state: any) => state
