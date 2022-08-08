// @see https://github.com/poooi/plugin-ship-info/blob/cb251d3858ee793e39bffd2f336b94762e62b87c/shims/globals.d.ts
// @see https://github.com/poooi/poi/blob/master/views/env.es#

interface IConfig {
  get: <T = any>(path: string, defaultValue: T) => T
  set: (path: string, value?: any) => void
}

declare namespace NodeJS {
  interface Global {
    config: IConfig
  }
}

interface Window {
  POI_VERSION: string
  ROOT: string
  APPDATA_PATH: string
  PLUGIN_PATH: string
  config: IConfig
  language: string
  getStore: (path?: string) => any
  isMain: boolean

  toast: (message: string) => void
  // log: (message: string) => void
  // warn: (message: string) => void
  // error: (message: string) => void
  // success: (message: string) => void
}
