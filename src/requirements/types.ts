export type RequirementPosition = 'flagship' | 'second'

export interface ShipRequirement {
  label: string
  names?: string[]
  group?: string
  count?: number
  minRemodelRank?: number
}

export interface ShipTypeRequirement {
  label: string
  shipTypes: number[]
  count: number
}

export interface ShipClassRequirement {
  label: string
  shipClasses: number[]
  count: number
}

export interface PositionRequirement {
  label: string
  names?: string[]
  minRemodelRank?: number
  shipTypes?: number[]
  shipClasses?: number[]
}

export interface EquipmentRequirement {
  label: string
  count: number
  names?: string[]
  type2?: number[]
}

export interface ForbiddenRequirement {
  label: string
  shipTypes?: number[]
  equipmentType2?: number[]
}

export interface QuestRequirement {
  ships?: ShipRequirement[]
  shipTypes?: ShipTypeRequirement[]
  shipClasses?: ShipClassRequirement[]
  positions?: Partial<Record<RequirementPosition, PositionRequirement[]>>
  equipments?: EquipmentRequirement[]
  forbidden?: ForbiddenRequirement[]
  notes?: string[]
}
