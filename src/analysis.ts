import type { UnionQuest } from './questHelper'
import { resolveQuestRequirement, SHIP_GROUPS } from './requirements'
import type { PositionRequirement, QuestRequirement, ShipRequirement } from './requirements'
import type { ImportedInventoryState } from './importedInventory/types'

export type OwnedShip = {
  id: string
  shipId: number
  name: string
  shipType: number
  shipClass: number
  compatibleNames: string[]
  remodelRank: number
}

export type OwnedEquipment = {
  id: string
  equipmentId: number
  name: string
  type2: number
}

export interface InventorySnapshot {
  ships: OwnedShip[]
  equipments: OwnedEquipment[]
}

export type QuestAnalysisStatus =
  | 'ready'
  | 'missing_ships'
  | 'missing_equipments'
  | 'missing_both'
  | 'missing_inventory'
  | 'not_applicable'
  | 'unsupported'

export type QuestAnalysisOrigin = 'curated' | 'inferred' | 'none'

export interface QuestAnalysis {
  gameId: number
  status: QuestAnalysisStatus
  origin: QuestAnalysisOrigin
  missingShips: string[]
  missingEquipments: string[]
  missingInventoryParts: Array<'ships' | 'equipments'>
  notes: string[]
  requirement: QuestRequirement | null
}

export interface QuestAnalysisSummary {
  ready: number
  missing_ships: number
  missing_equipments: number
  missing_both: number
  missing_inventory: number
  not_applicable: number
  unsupported: number
}

type ShipMatcher = {
  label: string
  count: number
  match: (ship: OwnedShip) => boolean
}

export interface ShipMatcherDebug {
  label: string
  count: number
  matchedShips: Array<{
    id: string
    name: string
    remodelRank: number
    compatibleNames: string[]
  }>
  missing: number
}

export interface EquipmentMatcherDebug {
  label: string
  count: number
  matchedEquipments: Array<{
    id: string
    name: string
    type2: number
  }>
  missing: number
}

export interface QuestAnalysisDebug {
  gameId: number
  status: QuestAnalysisStatus
  origin: QuestAnalysisOrigin
  shipMatchers: ShipMatcherDebug[]
  equipmentMatchers: EquipmentMatcherDebug[]
}

const resolveShipNames = (shipRequirement: ShipRequirement): string[] => {
  if (shipRequirement.group) {
    return SHIP_GROUPS[shipRequirement.group] ?? []
  }
  return shipRequirement.names ?? []
}

const matchPositionRequirement = (
  ship: OwnedShip,
  positionRequirement: PositionRequirement,
) =>
  ((positionRequirement.names ?? []).some((requiredName) =>
    ship.compatibleNames.includes(requiredName),
  ) &&
    ship.remodelRank >= (positionRequirement.minRemodelRank ?? 0)) ||
  (positionRequirement.shipTypes?.includes(ship.shipType) ?? false) ||
  (positionRequirement.shipClasses?.includes(ship.shipClass) ?? false)

const buildShipMatcher = (requirement: QuestRequirement): ShipMatcher[] => {
  const matchers: ShipMatcher[] = []

  requirement.positions?.flagship?.forEach((positionRequirement) => {
    matchers.push({
      label: positionRequirement.label,
      count: 1,
      match: (ship) => matchPositionRequirement(ship, positionRequirement),
    })
  })

  requirement.positions?.second?.forEach((positionRequirement) => {
    matchers.push({
      label: positionRequirement.label,
      count: 1,
      match: (ship) => matchPositionRequirement(ship, positionRequirement),
    })
  })

  requirement.ships?.forEach((shipRequirement) => {
    const names = resolveShipNames(shipRequirement)
    matchers.push({
      label: shipRequirement.label,
      count: shipRequirement.count ?? 1,
      match: (ship) =>
        ship.remodelRank >= (shipRequirement.minRemodelRank ?? 0) &&
        names.some((requiredName) => ship.compatibleNames.includes(requiredName)),
    })
  })

  requirement.shipTypes?.forEach((shipTypeRequirement) => {
    matchers.push({
      label: shipTypeRequirement.label,
      count: shipTypeRequirement.count,
      match: (ship) => shipTypeRequirement.shipTypes.includes(ship.shipType),
    })
  })

  requirement.shipClasses?.forEach((shipClassRequirement) => {
    matchers.push({
      label: shipClassRequirement.label,
      count: shipClassRequirement.count,
      match: (ship) => shipClassRequirement.shipClasses.includes(ship.shipClass),
    })
  })

  return matchers
}

const buildEquipmentDeficits = (
  requirement: QuestRequirement,
  inventory: InventorySnapshot,
): string[] =>
  (requirement.equipments ?? [])
    .map((equipmentRequirement) => {
      const matches = inventory.equipments.filter((equipment) => {
        if (equipmentRequirement.names?.includes(equipment.name)) {
          return true
        }
        if (equipmentRequirement.type2?.includes(equipment.type2)) {
          return true
        }
        return false
      }).length
      const missing = Math.max(0, equipmentRequirement.count - matches)
      return missing > 0 ? `${equipmentRequirement.label} x${missing}` : null
    })
    .filter(Boolean) as string[]

const buildEquipmentMatcherDebug = (
  requirement: QuestRequirement,
  inventory: InventorySnapshot,
): EquipmentMatcherDebug[] =>
  (requirement.equipments ?? []).map((equipmentRequirement) => {
    const matchedEquipments = inventory.equipments
      .filter((equipment) => {
        if (equipmentRequirement.names?.includes(equipment.name)) {
          return true
        }
        if (equipmentRequirement.type2?.includes(equipment.type2)) {
          return true
        }
        return false
      })
      .map((equipment) => ({
        id: equipment.id,
        name: equipment.name,
        type2: equipment.type2,
      }))

    return {
      label: equipmentRequirement.label,
      count: equipmentRequirement.count,
      matchedEquipments,
      missing: Math.max(0, equipmentRequirement.count - matchedEquipments.length),
    }
  })

const buildShipDeficits = (
  requirement: QuestRequirement,
  inventory: InventorySnapshot,
): string[] =>
  buildShipMatcher(requirement)
    .map((matcher) => {
      const matches = inventory.ships.filter((ship) => matcher.match(ship)).length
      const missing = Math.max(0, matcher.count - matches)
      return missing > 0 ? `${matcher.label} x${missing}` : null
    })
    .filter(Boolean) as string[]

const canAssignShips = (matchers: ShipMatcher[], ships: OwnedShip[]): boolean => {
  const slots = matchers.flatMap((matcher) =>
    Array.from({ length: matcher.count }, (_, index) => ({
      key: `${matcher.label}-${index}`,
      match: matcher.match,
    })),
  )

  if (!slots.length) {
    return true
  }

  const orderedSlots = slots
    .map((slot) => ({
      ...slot,
      candidateIndexes: ships
        .map((ship, index) => (slot.match(ship) ? index : -1))
        .filter((index) => index !== -1),
    }))
    .sort((a, b) => a.candidateIndexes.length - b.candidateIndexes.length)

  const used = new Set<number>()

  const solve = (slotIndex: number): boolean => {
    if (slotIndex >= orderedSlots.length) {
      return true
    }

    const slot = orderedSlots[slotIndex]
    for (const candidateIndex of slot.candidateIndexes) {
      if (used.has(candidateIndex)) {
        continue
      }
      used.add(candidateIndex)
      if (solve(slotIndex + 1)) {
        return true
      }
      used.delete(candidateIndex)
    }
    return false
  }

  return solve(0)
}

export const analyzeQuestRequirement = (
  gameId: number,
  requirement: QuestRequirement | null | undefined,
  inventory: InventorySnapshot | ImportedInventoryState,
  origin: QuestAnalysisOrigin = 'curated',
): QuestAnalysis => {
  if (!requirement) {
    return {
      gameId,
      status: 'unsupported',
      origin: 'none',
      missingShips: [],
      missingEquipments: [],
      missingInventoryParts: [],
      notes: [],
      requirement: null,
    }
  }

  const requiresShips =
    Boolean(requirement.ships?.length) ||
    Boolean(requirement.shipTypes?.length) ||
    Boolean(requirement.shipClasses?.length) ||
    Boolean(requirement.positions?.flagship?.length) ||
    Boolean(requirement.positions?.second?.length)
  const requiresEquipments = Boolean(requirement.equipments?.length)
  const missingInventoryParts: Array<'ships' | 'equipments'> = []

  if (requiresShips && 'shipCsv' in inventory && !inventory.shipCsv) {
    missingInventoryParts.push('ships')
  }
  if (requiresEquipments && 'equipmentCsv' in inventory && !inventory.equipmentCsv) {
    missingInventoryParts.push('equipments')
  }

  if (missingInventoryParts.length > 0) {
    return {
      gameId,
      status: 'missing_inventory',
      origin,
      missingShips: [],
      missingEquipments: [],
      missingInventoryParts,
      notes: requirement.notes ?? [],
      requirement,
    }
  }

  const shipDeficits = buildShipDeficits(requirement, inventory)
  const equipmentDeficits = buildEquipmentDeficits(requirement, inventory)
  const shipReady = canAssignShips(buildShipMatcher(requirement), inventory.ships)
  const equipmentReady = equipmentDeficits.length === 0

  if (!shipReady && shipDeficits.length === 0) {
    shipDeficits.push('艦隊編成條件衝突 x1')
  }

  let status: QuestAnalysisStatus = 'ready'
  if (!shipReady && !equipmentReady) {
    status = 'missing_both'
  } else if (!shipReady) {
    status = 'missing_ships'
  } else if (!equipmentReady) {
    status = 'missing_equipments'
  }

  return {
    gameId,
    status,
    origin,
    missingShips: shipDeficits,
    missingEquipments: equipmentDeficits,
    missingInventoryParts: [],
    notes: requirement.notes ?? [],
    requirement,
  }
}

export const debugQuestRequirement = (
  gameId: number,
  requirement: QuestRequirement | null | undefined,
  inventory: InventorySnapshot | ImportedInventoryState,
  origin: QuestAnalysisOrigin = 'curated',
): QuestAnalysisDebug => {
  const analysis = analyzeQuestRequirement(gameId, requirement, inventory, origin)
  if (!requirement) {
    return {
      gameId,
      status: analysis.status,
      origin: analysis.origin,
      shipMatchers: [],
      equipmentMatchers: [],
    }
  }

  const shipMatchers = buildShipMatcher(requirement).map((matcher) => {
    const matchedShips = inventory.ships
      .filter((ship) => matcher.match(ship))
      .map((ship) => ({
        id: ship.id,
        name: ship.name,
        remodelRank: ship.remodelRank,
        compatibleNames: ship.compatibleNames,
      }))

    return {
      label: matcher.label,
      count: matcher.count,
      matchedShips,
      missing: Math.max(0, matcher.count - matchedShips.length),
    }
  })

  return {
    gameId,
    status: analysis.status,
    origin: analysis.origin,
    shipMatchers,
    equipmentMatchers: buildEquipmentMatcherDebug(requirement, inventory),
  }
}

const buildStaticQuestAnalysis = (
  gameId: number,
  status: Extract<QuestAnalysisStatus, 'unsupported' | 'not_applicable'>,
): QuestAnalysis => ({
  gameId,
  status,
  origin: 'none',
  missingShips: [],
  missingEquipments: [],
  missingInventoryParts: [],
  notes: [],
  requirement: null,
})

export const buildQuestAnalysisMap = (
  quests: UnionQuest[],
  requirementMap: Record<number, QuestRequirement>,
  inventory: InventorySnapshot | ImportedInventoryState,
): Record<number, QuestAnalysis> =>
  Object.fromEntries(
    quests.map((quest) => {
      const resolvedRequirement = resolveQuestRequirement(
        quest,
        requirementMap[quest.gameId],
      )

      switch (resolvedRequirement.kind) {
        case 'curated':
          return [
            quest.gameId,
            analyzeQuestRequirement(
              quest.gameId,
              resolvedRequirement.requirement,
              inventory,
              'curated',
            ),
          ]
        case 'inferred':
          return [
            quest.gameId,
            analyzeQuestRequirement(
              quest.gameId,
              resolvedRequirement.requirement,
              inventory,
              'inferred',
            ),
          ]
        case 'not_applicable':
          return [quest.gameId, buildStaticQuestAnalysis(quest.gameId, 'not_applicable')]
        case 'unsupported':
        default:
          return [quest.gameId, buildStaticQuestAnalysis(quest.gameId, 'unsupported')]
      }
    }),
  )

export const summarizeQuestAnalysis = (
  analysisMap: Record<number, QuestAnalysis>,
): QuestAnalysisSummary => {
  const summary: QuestAnalysisSummary = {
    ready: 0,
    missing_ships: 0,
    missing_equipments: 0,
    missing_both: 0,
    missing_inventory: 0,
    not_applicable: 0,
    unsupported: 0,
  }

  Object.values(analysisMap).forEach((analysis) => {
    summary[analysis.status] += 1
  })

  return summary
}

export const isQuestRequirementReady = (
  analysis: QuestAnalysis | null | undefined,
) => analysis?.status === 'ready'

export const buildReadyQuestFilter =
  (analysisMap: Record<number, QuestAnalysis>) => (quest: UnionQuest) =>
    isQuestRequirementReady(analysisMap[quest.gameId])

export const buildQuestAnalysisDebugMap = (
  quests: UnionQuest[],
  requirementMap: Record<number, QuestRequirement>,
  inventory: InventorySnapshot | ImportedInventoryState,
): Record<number, QuestAnalysisDebug> =>
  Object.fromEntries(
    quests.map((quest) => {
      const resolvedRequirement = resolveQuestRequirement(
        quest,
        requirementMap[quest.gameId],
      )

      switch (resolvedRequirement.kind) {
        case 'curated':
          return [
            quest.gameId,
            debugQuestRequirement(
              quest.gameId,
              resolvedRequirement.requirement,
              inventory,
              'curated',
            ),
          ]
        case 'inferred':
          return [
            quest.gameId,
            debugQuestRequirement(
              quest.gameId,
              resolvedRequirement.requirement,
              inventory,
              'inferred',
            ),
          ]
        case 'not_applicable':
          return [
            quest.gameId,
            {
              gameId: quest.gameId,
              status: 'not_applicable',
              origin: 'none',
              shipMatchers: [],
              equipmentMatchers: [],
            },
          ]
        case 'unsupported':
        default:
          return [
            quest.gameId,
            {
              gameId: quest.gameId,
              status: 'unsupported',
              origin: 'none',
              shipMatchers: [],
              equipmentMatchers: [],
            },
          ]
      }
    }),
  )
