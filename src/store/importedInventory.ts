import type { InventorySnapshot } from '../analysis'
import {
  emptyImportedInventoryState,
  ImportedCsvMeta,
  ImportedInventoryState,
  normalizeImportedInventoryState,
} from '../importedInventory/types'
import { useStore } from './store'

export type { ImportedCsvMeta, ImportedInventoryState }

export const useImportedInventory = (): ImportedInventoryState =>
  normalizeImportedInventoryState(useStore().store.importedInventory)

export const useImportedInventorySnapshot = (): InventorySnapshot =>
  normalizeImportedInventoryState(useStore().store.importedInventory)

export const useImportedInventoryActions = () => {
  const { store, updateStore } = useStore()

  const setImportedShips = (
    ships: ImportedInventoryState['ships'],
    shipCsv: ImportedCsvMeta,
  ) =>
    updateStore({
      importedInventory: {
        ...store.importedInventory,
        ships,
        shipCsv,
      },
    })

  const setImportedEquipments = (
    equipments: ImportedInventoryState['equipments'],
    equipmentCsv: ImportedCsvMeta,
  ) =>
    updateStore({
      importedInventory: {
        ...store.importedInventory,
        equipments,
        equipmentCsv,
      },
    })

  const clearImportedInventory = () =>
    updateStore({
      importedInventory: emptyImportedInventoryState,
    })

  return {
    setImportedShips,
    setImportedEquipments,
    clearImportedInventory,
  }
}
