import { useEffect, useState } from 'react'
import type { InventorySnapshot } from '../analysis'
import type { PoiState } from './types'
import { observePoiStore } from './store'

const emptyInventory: InventorySnapshot = {
  ships: [],
  equipments: [],
}

type InventoryStateSlice = {
  info?: PoiState['info']
  const?: PoiState['const']
}

type InventoryDependencyRefs = {
  ships?: NonNullable<PoiState['info']>['ships']
  equips?: NonNullable<PoiState['info']>['equips']
  shipMasters?: NonNullable<PoiState['const']>['$ships']
  equipmentMasters?: NonNullable<PoiState['const']>['$equips']
}

const getInventoryDependencyRefs = (
  state: InventoryStateSlice,
): InventoryDependencyRefs => ({
  ships: state.info?.ships,
  equips: state.info?.equips,
  shipMasters: state.const?.$ships,
  equipmentMasters: state.const?.$equips,
})

export const hasInventoryDependenciesChanged = (
  previous: InventoryDependencyRefs | null,
  next: InventoryDependencyRefs,
) =>
  previous == null ||
  previous.ships !== next.ships ||
  previous.equips !== next.equips ||
  previous.shipMasters !== next.shipMasters ||
  previous.equipmentMasters !== next.equipmentMasters

const buildPredecessorMap = (
  shipMasters: NonNullable<NonNullable<PoiState['const']>['$ships']>,
) => {
  const predecessorMap: Record<string, string[]> = {}

  Object.entries(shipMasters).forEach(([shipId, master]) => {
    const nextShipId = String(master?.api_aftershipid ?? '')
    if (!nextShipId || nextShipId === '0' || !(nextShipId in shipMasters)) {
      return
    }
    predecessorMap[nextShipId] = [...(predecessorMap[nextShipId] ?? []), shipId]
  })

  return predecessorMap
}

const buildCompatibleNames = (
  shipId: string,
  shipMasters: NonNullable<NonNullable<PoiState['const']>['$ships']>,
  predecessorMap: Record<string, string[]>,
) => {
  const names = new Set<string>()
  const queue = [shipId]

  while (queue.length > 0) {
    const currentShipId = queue.shift()!
    const master = shipMasters[currentShipId]
    const name = String(master?.api_name ?? '')
    if (name) {
      names.add(name)
    }
    ;(predecessorMap[currentShipId] ?? []).forEach((predecessorId) => {
      if (!queue.includes(predecessorId)) {
        queue.push(predecessorId)
      }
    })
  }

  return Array.from(names)
}

const buildRemodelRank = (
  shipId: string,
  predecessorMap: Record<string, string[]>,
): number => {
  const predecessors = predecessorMap[shipId] ?? []
  if (!predecessors.length) {
    return 0
  }
  return Math.max(
    ...predecessors.map(
      (predecessorId) => buildRemodelRank(predecessorId, predecessorMap) + 1,
    ),
  )
}

export const normalizeInventory = (state: InventoryStateSlice): InventorySnapshot => {
  const shipMasters = state.const?.$ships ?? {}
  const equipmentMasters = state.const?.$equips ?? {}
  const predecessorMap = buildPredecessorMap(shipMasters)

  const ships = Object.entries(state.info?.ships ?? {})
    .map(([instanceId, ship]) => {
      const shipId = Number(ship.api_ship_id)
      if (!Number.isFinite(shipId) || shipId <= 0) {
        return null
      }
      const shipIdKey = String(shipId)
      const master = shipMasters[shipIdKey]
      return {
        id: instanceId,
        shipId,
        name: String(master?.api_name ?? ''),
        shipType: Number(master?.api_stype ?? -1),
        shipClass: Number(master?.api_ctype ?? -1),
        compatibleNames: buildCompatibleNames(shipIdKey, shipMasters, predecessorMap),
        remodelRank: buildRemodelRank(shipIdKey, predecessorMap),
      }
    })
    .filter(Boolean) as InventorySnapshot['ships']

  const equipments = Object.entries(state.info?.equips ?? {})
    .map(([instanceId, equipment]) => {
      const equipmentId = Number(equipment.api_slotitem_id)
      if (!Number.isFinite(equipmentId) || equipmentId <= 0) {
        return null
      }
      const master = equipmentMasters[String(equipmentId)]
      return {
        id: instanceId,
        equipmentId,
        name: String(master?.api_name ?? ''),
        type2: Number(master?.api_type?.[2] ?? -1),
      }
    })
    .filter(Boolean) as InventorySnapshot['equipments']

  return {
    ships,
    equipments,
  }
}

export const usePoiInventory = () => {
  const [inventory, setInventory] = useState<InventorySnapshot>(emptyInventory)

  useEffect(() => {
    let previousRefs: InventoryDependencyRefs | null = null

    const listener = (state: PoiState) => {
      const slice = {
        info: state?.info,
        const: state?.const,
      }
      const nextRefs = getInventoryDependencyRefs(slice)
      if (!hasInventoryDependenciesChanged(previousRefs, nextRefs)) {
        return
      }
      previousRefs = nextRefs

      setInventory(normalizeInventory(slice))
    }

    return observePoiStore(listener)
  }, [])

  return inventory
}
