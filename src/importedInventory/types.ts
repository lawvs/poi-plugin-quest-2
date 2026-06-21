import type { InventorySnapshot } from '../analysis'

export type ImportedCsvFormat = 'external_csv' | 'legacy_localized_csv'

export interface ImportedCsvMeta {
  fileName: string
  importedAt: string
  count: number
  format: ImportedCsvFormat
}

export interface ImportedInventoryState extends InventorySnapshot {
  shipCsv: ImportedCsvMeta | null
  equipmentCsv: ImportedCsvMeta | null
}

export const emptyImportedInventoryState: ImportedInventoryState = {
  ships: [],
  equipments: [],
  shipCsv: null,
  equipmentCsv: null,
}

const normalizeCsvMeta = (
  meta: Partial<ImportedCsvMeta> | null | undefined,
): ImportedCsvMeta | null => {
  if (!meta) {
    return null
  }

  return {
    fileName: typeof meta.fileName === 'string' ? meta.fileName : '',
    importedAt: typeof meta.importedAt === 'string' ? meta.importedAt : '',
    count: typeof meta.count === 'number' ? meta.count : 0,
    format:
      meta.format === 'external_csv' || meta.format === 'legacy_localized_csv'
        ? meta.format
        : 'legacy_localized_csv',
  }
}

export const normalizeImportedInventoryState = (
  state: Partial<ImportedInventoryState> | null | undefined,
): ImportedInventoryState => ({
  ships: state?.ships ?? [],
  equipments: state?.equipments ?? [],
  shipCsv: normalizeCsvMeta(state?.shipCsv),
  equipmentCsv: normalizeCsvMeta(state?.equipmentCsv),
})
