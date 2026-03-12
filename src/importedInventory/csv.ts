import type { OwnedEquipment, OwnedShip } from '../analysis'
import type { ImportedCsvFormat } from './types'

type CsvRecord = Record<string, string>

type ParsedShipCsv = {
  ships: OwnedShip[]
  format: ImportedCsvFormat
}

type ParsedEquipmentCsv = {
  equipments: OwnedEquipment[]
  format: ImportedCsvFormat
}

const LEGACY_SHIP_REQUIRED_HEADERS = ['艦名', '艦種']
const EXTERNAL_SHIP_REQUIRED_HEADERS = ['艦 ID', '艦名', '艦種', '後續改造']

const LEGACY_EQUIPMENT_REQUIRED_HEADERS = ['裝備名稱', '類別ID']
const EXTERNAL_EQUIPMENT_REQUIRED_HEADERS = [
  'ID (Instance)',
  'Master ID',
  '裝備名稱',
  '類別ID',
]

const SHIP_TYPE_NAME_TO_ID: Record<string, number> = {
  海防艦: 1,
  駆逐艦: 2,
  驅逐艦: 2,
  軽巡洋艦: 3,
  輕巡洋艦: 3,
  练习巡洋舰: 21,
  練習巡洋艦: 21,
  重雷装巡洋艦: 4,
  重雷裝巡洋艦: 4,
  重巡洋艦: 5,
  航空巡洋艦: 6,
  正規空母: 11,
  装甲空母: 18,
  裝甲空母: 18,
  軽空母: 7,
  輕空母: 7,
  水上機母艦: 16,
  工作艦: 19,
}

const REMODEL_SUFFIXES = [
  '改二特',
  '改二戊',
  '改二丁',
  '改二丙',
  '改二乙',
  '改二甲',
  '改二',
  '改',
] as const

const REMODEL_RANK_BY_SUFFIX: Record<(typeof REMODEL_SUFFIXES)[number], number> = {
  改: 1,
  改二: 2,
  改二甲: 2,
  改二乙: 2,
  改二丙: 2,
  改二丁: 2,
  改二戊: 2,
  改二特: 2,
}

const REMODEL_ALIASES: Record<string, string[]> = {
  龍鳳改二: ['大鯨', '龍鳳', '龍鳳改', '龍鳳改二'],
  龍鳳改二戊: ['大鯨', '龍鳳', '龍鳳改', '龍鳳改二', '龍鳳改二戊'],
  龍鳳改二護: ['大鯨', '龍鳳', '龍鳳改', '龍鳳改二', '龍鳳改二護'],
}

const EQUIPMENT_ID_HEADERS = ['Master ID', '裝備 ID']
const EQUIPMENT_INSTANCE_ID_HEADERS = ['ID (Instance)', '裝備個體 ID']
const SHIP_INSTANCE_ID_HEADERS = ['艦 ID', 'Instance ID']
const SHIP_MASTER_ID_HEADERS = ['Master ID', '艦娘 ID']
const SHIP_NAME_HEADERS = ['艦名', '艦娘名稱(日文原名)', '艦娘名稱']
const SHIP_TYPE_HEADERS = ['艦種', '艦種名稱']
const SHIP_CLASS_HEADERS = ['艦級ID', '艦級 ID', 'Class ID']
const NEXT_REMODEL_HEADERS = ['後續改造', '後续改造', 'Next Remodel']
const EQUIPMENT_NAME_HEADERS = ['裝備名稱', '装備名称', 'Equipment Name']
const EQUIPMENT_TYPE_HEADERS = ['類別ID', '类别ID', 'Type2', 'Type ID']

const MISSING_CELL_VALUES = new Set(['', 'NA', 'N/A', '-', 'null', 'undefined'])

const stripBom = (text: string) => text.replace(/^\uFEFF/, '')

const parseCsvRows = (text: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        value += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === ',') {
      row.push(value)
      value = ''
      continue
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }
      row.push(value)
      value = ''
      if (row.some((cell) => cell.trim().length > 0)) {
        rows.push(row)
      }
      row = []
      continue
    }

    value += char
  }

  row.push(value)
  if (row.some((cell) => cell.trim().length > 0)) {
    rows.push(row)
  }
  return rows
}

const parseCsvRecords = (text: string): CsvRecord[] => {
  const rows = parseCsvRows(stripBom(text))
  if (rows.length < 2) {
    return []
  }

  const headers = rows[0].map((header) => header.trim())
  return rows.slice(1).map((row) =>
    Object.fromEntries(
      headers.map((header, index) => [header, String(row[index] ?? '').trim()]),
    ),
  )
}

const assertRecords = (records: CsvRecord[], kind: string) => {
  if (!records.length) {
    throw new Error(`${kind} CSV is empty or unreadable`)
  }
}

const hasHeaders = (record: CsvRecord, headers: string[]) =>
  headers.every((header) => header in record)

const formatMissingHeaders = (
  record: CsvRecord,
  headers: string[],
  kind: string,
): never => {
  const missingHeaders = headers.filter((header) => !(header in record))
  throw new Error(
    `${kind} CSV is missing required columns: ${missingHeaders.join(', ')}`,
  )
}

const normalizeCell = (value: string) => value.trim()

const isMissingCell = (value: string | undefined | null) =>
  value == null || MISSING_CELL_VALUES.has(normalizeCell(value))

const findHeader = (record: CsvRecord, headers: string[]) =>
  headers.find((header) => header in record)

const getRecordValue = (record: CsvRecord, headers: string[]) => {
  const header = findHeader(record, headers)
  return header ? normalizeCell(record[header]) : ''
}

const toShipTypeId = (shipTypeName: string) => SHIP_TYPE_NAME_TO_ID[shipTypeName] ?? -1

const getRemodelRankBySuffix = (name: string) => {
  const matchedSuffix = REMODEL_SUFFIXES.find((suffix) => name.endsWith(suffix))
  return matchedSuffix ? REMODEL_RANK_BY_SUFFIX[matchedSuffix] : 0
}

const buildSuffixCompatibleNames = (name: string) => {
  for (const suffix of REMODEL_SUFFIXES) {
    if (!name.endsWith(suffix)) {
      continue
    }

    const baseName = name.slice(0, -suffix.length)
    if (!baseName) {
      break
    }

    const compatibleNames = [baseName]
    if (REMODEL_RANK_BY_SUFFIX[suffix] >= 1) {
      compatibleNames.push(`${baseName}改`)
    }
    if (REMODEL_RANK_BY_SUFFIX[suffix] >= 2) {
      compatibleNames.push(`${baseName}改二`)
    }
    compatibleNames.push(name)

    return Array.from(new Set(compatibleNames))
  }

  return [name]
}

const buildNamePredecessorMap = (records: CsvRecord[]) => {
  const predecessorMap: Record<string, string[]> = {}

  records.forEach((record) => {
    const name = getRecordValue(record, SHIP_NAME_HEADERS)
    const nextName = getRecordValue(record, NEXT_REMODEL_HEADERS)
    if (isMissingCell(name) || isMissingCell(nextName) || name === nextName) {
      return
    }

    predecessorMap[nextName] = Array.from(
      new Set([...(predecessorMap[nextName] ?? []), name]),
    )
  })

  return predecessorMap
}

const buildCompatibleProfile = (
  name: string,
  predecessorMap: Record<string, string[]> = {},
) => {
  const names = new Set<string>()
  const visited = new Set<string>()
  const queue = [name]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) {
      continue
    }
    visited.add(current)

    names.add(current)
    buildSuffixCompatibleNames(current).forEach((entry) => names.add(entry))
    ;(REMODEL_ALIASES[current] ?? []).forEach((entry) => names.add(entry))
    ;(predecessorMap[current] ?? []).forEach((predecessor) => queue.push(predecessor))
  }

  const remodelRankMemo: Record<string, number> = {}
  const buildRemodelRank = (current: string): number => {
    if (current in remodelRankMemo) {
      return remodelRankMemo[current]
    }

    const predecessorRank = Math.max(
      0,
      ...(predecessorMap[current] ?? []).map((predecessor) => buildRemodelRank(predecessor) + 1),
    )
    const rank = Math.max(getRemodelRankBySuffix(current), predecessorRank)
    remodelRankMemo[current] = rank
    return rank
  }

  return {
    compatibleNames: Array.from(names),
    remodelRank: buildRemodelRank(name),
  }
}

const detectShipCsvFormat = (records: CsvRecord[]): ImportedCsvFormat => {
  assertRecords(records, 'Ship')
  const record = records[0]

  if (hasHeaders(record, EXTERNAL_SHIP_REQUIRED_HEADERS)) {
    return 'external_csv'
  }

  if (hasHeaders(record, LEGACY_SHIP_REQUIRED_HEADERS)) {
    return 'legacy_localized_csv'
  }

  return formatMissingHeaders(record, LEGACY_SHIP_REQUIRED_HEADERS, 'Ship')
}

const detectEquipmentCsvFormat = (records: CsvRecord[]): ImportedCsvFormat => {
  assertRecords(records, 'Equipment')
  const record = records[0]

  if (hasHeaders(record, EXTERNAL_EQUIPMENT_REQUIRED_HEADERS)) {
    return 'external_csv'
  }

  if (hasHeaders(record, LEGACY_EQUIPMENT_REQUIRED_HEADERS)) {
    return 'legacy_localized_csv'
  }

  return formatMissingHeaders(
    record,
    LEGACY_EQUIPMENT_REQUIRED_HEADERS,
    'Equipment',
  )
}

const parseLegacyShipRecords = (records: CsvRecord[]): OwnedShip[] =>
  records
    .map((record, index) => {
      const name = getRecordValue(record, SHIP_NAME_HEADERS)
      if (isMissingCell(name)) {
        return null
      }

      const shipIdValue = getRecordValue(record, [...SHIP_MASTER_ID_HEADERS, ...SHIP_INSTANCE_ID_HEADERS])
      const shipId = Number(shipIdValue || index + 1)
      const shipClassValue = getRecordValue(record, SHIP_CLASS_HEADERS)
      const { compatibleNames, remodelRank } = buildCompatibleProfile(name)

      return {
        id: String(getRecordValue(record, SHIP_INSTANCE_ID_HEADERS) || index + 1),
        shipId: Number.isFinite(shipId) ? shipId : index + 1,
        name,
        shipType: toShipTypeId(getRecordValue(record, SHIP_TYPE_HEADERS)),
        shipClass:
          shipClassValue && Number.isFinite(Number(shipClassValue))
            ? Number(shipClassValue)
            : -1,
        compatibleNames,
        remodelRank,
      }
    })
    .filter(Boolean) as OwnedShip[]

const parseExternalShipRecords = (records: CsvRecord[]): OwnedShip[] => {
  const predecessorMap = buildNamePredecessorMap(records)

  return records
    .map((record, index) => {
      const name = getRecordValue(record, SHIP_NAME_HEADERS)
      if (isMissingCell(name)) {
        return null
      }

      const instanceId = getRecordValue(record, SHIP_INSTANCE_ID_HEADERS) || String(index + 1)
      const shipIdValue = getRecordValue(record, [...SHIP_MASTER_ID_HEADERS, ...SHIP_INSTANCE_ID_HEADERS])
      const shipId = Number(shipIdValue || index + 1)
      const shipClassValue = getRecordValue(record, SHIP_CLASS_HEADERS)
      const { compatibleNames, remodelRank } = buildCompatibleProfile(
        name,
        predecessorMap,
      )

      return {
        id: String(instanceId),
        shipId: Number.isFinite(shipId) ? shipId : index + 1,
        name,
        shipType: toShipTypeId(getRecordValue(record, SHIP_TYPE_HEADERS)),
        shipClass:
          shipClassValue && Number.isFinite(Number(shipClassValue))
            ? Number(shipClassValue)
            : -1,
        compatibleNames,
        remodelRank,
      }
    })
    .filter(Boolean) as OwnedShip[]
}

const parseEquipmentRecords = (records: CsvRecord[]): OwnedEquipment[] =>
  records
    .map((record, index) => {
      const name = getRecordValue(record, EQUIPMENT_NAME_HEADERS)
      if (isMissingCell(name)) {
        return null
      }

      const equipmentId = Number(getRecordValue(record, EQUIPMENT_ID_HEADERS) || index + 1)
      const type2 = Number(getRecordValue(record, EQUIPMENT_TYPE_HEADERS) || -1)

      return {
        id: String(getRecordValue(record, EQUIPMENT_INSTANCE_ID_HEADERS) || index + 1),
        equipmentId: Number.isFinite(equipmentId) ? equipmentId : index + 1,
        name,
        type2: Number.isFinite(type2) ? type2 : -1,
      }
    })
    .filter(Boolean) as OwnedEquipment[]

export const parseShipCsvImport = (text: string): ParsedShipCsv => {
  const records = parseCsvRecords(text)
  const format = detectShipCsvFormat(records)

  return {
    ships:
      format === 'external_csv'
        ? parseExternalShipRecords(records)
        : parseLegacyShipRecords(records),
    format,
  }
}

export const parseEquipmentCsvImport = (text: string): ParsedEquipmentCsv => {
  const records = parseCsvRecords(text)
  const format = detectEquipmentCsvFormat(records)

  return {
    equipments: parseEquipmentRecords(records),
    format,
  }
}

export const parseShipCsv = (text: string): OwnedShip[] => parseShipCsvImport(text).ships

export const parseEquipmentCsv = (text: string): OwnedEquipment[] =>
  parseEquipmentCsvImport(text).equipments
