/**
 * See https://dev.poooi.app/docs/api-poi-utils.html#notifications
 */
import { IN_POI } from './env'

export const toast = (message: string) => {
  if (!IN_POI) {
    // eslint-disable-next-line no-console
    console.log('[Toast]', message)
    return
  }
  window.toast(message)
}

export const tips = {
  log(message: string) {
    if (!IN_POI) {
      // eslint-disable-next-line no-console
      console.log('[log]', message)
      return
    }
    // @ts-expect-error poi env
    window.log(message) // display on the information bar below game window
  },
  warn(message: string) {
    if (!IN_POI) {
      console.warn('[warn]', message)
      return
    }
    // @ts-expect-error poi env
    window.warn(message) // display on the information bar below game window
  },
  error(message: string) {
    if (!IN_POI) {
      console.error('[error]', message)
      return
    }
    // @ts-expect-error poi env
    window.error(message) // display on the information bar below game window
  },
  success(message: string) {
    if (!IN_POI) {
      // eslint-disable-next-line no-console
      console.log('[success]', message)
      return
    }
    // @ts-expect-error poi env
    window.success(message) // display on the information bar below game window
  },
}
