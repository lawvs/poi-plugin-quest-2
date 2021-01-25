// @see https://github.com/poooi/plugin-ship-info/blob/cb251d3858ee793e39bffd2f336b94762e62b87c/shims/poi.d.ts
// @see https://github.com/poooi/poi/issues/2219

declare module 'views/components/etc/window-env' {
  import { Context, Component } from 'react'

  export const WindowEnv: Context<{ window: Window }>
}

declare module 'views/env-parts/i18next' {
  import { i18n } from 'i18next'

  const i18nextInstance: i18n
  export default i18nextInstance
}

declare module 'views/utils/selectors' {
  import { APIShip } from 'kcsapi/api_port/port/response'
  import {
    APIMstShip,
    APIMstShipgraph,
    APIMstStype,
    APIMstMaparea,
    APIMstMapinfo
  } from 'kcsapi/api_start2/getData/response'
  import { Selector } from 'reselect'
  interface Dictionary<T> {
    [index: string]: T
  }

  export interface IState {
    const: IConstState
    config: any
  }

  export interface IConstState {
    $shipgraph?: APIMstShipgraph[]
    $shipTypes?: Dictionary<APIMstStype>
    $ships?: Dictionary<APIMstShip>
    $maps?: Dictionary<APIMstMapinfo>
    $mapareas?: Dictionary<APIMstMaparea>
  }

  export interface IFCD {
    shipavatar: {
      marginMagics: Dictionary<any>
    }
    shiptag: any
  }

  export type IShipData = [APIShip?, APIMstShip?]

  export const configSelector: Selector<any, any>
  export const constSelector: Selector<any, IConstState>
  export const extensionSelectorFactory: (id: string) => Selector<any, any>
  export const fcdSelector: Selector<any, IFCD>
  export const fleetInExpeditionSelectorFactory: (id: number) => Selector<any, any>
  export const fleetShipsIdSelectorFactory: (id: number) => Selector<any, any>
  export const inRepairShipsIdSelector: Selector<any, any>
  export const shipDataSelectorFactory: (id: number) => Selector<any, IShipData>
  export const shipEquipDataSelectorFactory: (id: number) => Selector<any, any>
  export const equipDataSelectorFactory: (id: number) => Selector<any, any>
  export const shipsSelector: Selector<any, Dictionary<APIShip>>
  export const stateSelector: Selector<any, any>
  export const wctfSelector: Selector<any, any>
}

declare module 'views/components/etc/overlay' {
  export { Tooltip, Popover, Dialog } from '@blueprintjs/core'
}

declare module 'views/components/etc/avatar' {
  import { ComponentType } from 'react'
  export const Avatar: ComponentType<any>
}

declare module 'views/utils/tools' {
  export const resolveTime: (time: number) => string
}

declare module 'views/components/etc/icon' {
  import { ComponentType } from 'react'
  export const SlotitemIcon: ComponentType<any>
}

declare module 'views/utils/ship-img' {
  export const getShipImgPath: (id: number, type: string, damagaed: boolean, ip?: string, version?: number) => string
}

declare module 'views/create-store' {
  export const store: any
}

// extra

declare module 'views/services/plugin-manager/utils' {
  export function getNpmConfig (prefix: string): any
}