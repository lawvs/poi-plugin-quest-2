import type { FilterGroup } from '../filter-sphere/vendor'
import { useCallback } from 'react'
import { useStore } from './store'

export const useFilterRule = () => {
  const {
    store: { filterRule },
    updateStore,
  } = useStore()
  const setFilterRule = useCallback(
    (val: FilterGroup | null) => updateStore({ filterRule: val }),
    [updateStore],
  )
  return { filterRule, setFilterRule }
}

export const useFilterPresets = () => {
  const {
    store: { filterPresets, activePresetId },
    updateStore,
  } = useStore()

  const savePreset = useCallback(
    (name: string, rule: FilterGroup) => {
      const id = Math.random().toString(36).slice(2)
      const next = [...filterPresets, { id, name, rule }]
      updateStore({ filterPresets: next, activePresetId: id })
    },
    [filterPresets, updateStore],
  )

  const updatePreset = useCallback(
    (id: string, rule: FilterGroup) => {
      const next = filterPresets.map((p) => (p.id === id ? { ...p, rule } : p))
      updateStore({ filterPresets: next })
    },
    [filterPresets, updateStore],
  )

  const switchPreset = useCallback(
    (id: string) => {
      const preset = filterPresets.find((p) => p.id === id)
      if (!preset) return null
      updateStore({ activePresetId: id, filterRule: preset.rule })
      return preset.rule
    },
    [filterPresets, updateStore],
  )

  const deletePreset = useCallback(
    (id: string) => {
      const next = filterPresets.filter((p) => p.id !== id)
      updateStore({
        filterPresets: next,
        activePresetId: activePresetId === id ? null : activePresetId,
      })
    },
    [filterPresets, activePresetId, updateStore],
  )

  const renamePreset = useCallback(
    (id: string, name: string) => {
      const next = filterPresets.map((p) => (p.id === id ? { ...p, name } : p))
      updateStore({ filterPresets: next })
    },
    [filterPresets, updateStore],
  )

  const clearActivePreset = useCallback(() => {
    updateStore({ activePresetId: null })
  }, [updateStore])

  return {
    presets: filterPresets,
    activePresetId,
    savePreset,
    updatePreset,
    renamePreset,
    switchPreset,
    deletePreset,
    clearActivePreset,
  }
}
