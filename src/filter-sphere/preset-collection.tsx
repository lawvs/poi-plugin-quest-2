import { Button, Tag } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { countNumberOfRules } from '@fn-sphere/filter'
import React, { useCallback } from 'react'
import styled from 'styled-components'
import { usePluginTranslation } from '../poi/hooks'
import { toast } from '../poi/utils'
import { useFilterPresets } from '../store/filterRule'
import { useAdvancedFilterContext } from './context'

const PresetsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
`

export const PresetCollection = () => {
  const { t } = usePluginTranslation()
  const { filterRule, reset } = useAdvancedFilterContext()
  const {
    presets,
    activePresetId,
    savePreset,
    updatePreset,
    switchPreset,
    deletePreset,
    clearActivePreset,
  } = useFilterPresets()

  const handleSave = useCallback(() => {
    if (activePresetId) {
      updatePreset(activePresetId, filterRule)
      toast(t('Preset updated'))
      return
    }
    const name = prompt(t('Preset name'))
    if (!name?.trim()) return
    savePreset(name, filterRule)
  }, [t, filterRule, activePresetId, savePreset, updatePreset])

  const handleSwitch = useCallback(
    (id: string) => {
      const rule = switchPreset(id)
      if (rule) {
        reset(rule)
      }
    },
    [switchPreset, reset],
  )

  const handleClear = useCallback(() => {
    reset()
    clearActivePreset()
  }, [reset, clearActivePreset])

  return (
    <PresetsWrapper>
      {presets.map((preset) => (
        <Tag
          key={preset.id}
          icon={IconNames.Tag}
          intent={activePresetId === preset.id ? 'primary' : 'none'}
          interactive={true}
          onClick={() => handleSwitch(preset.id)}
          onRemove={(e) => {
            e.stopPropagation()
            deletePreset(preset.id)
          }}
        >
          {preset.name}
          {countNumberOfRules(preset.rule) > 0 &&
            ` (${countNumberOfRules(preset.rule)})`}
        </Tag>
      ))}
      <Button
        size="small"
        variant="minimal"
        icon={IconNames.FLOPPY_DISK}
        onClick={handleSave}
      >
        {activePresetId ? t('Update Preset') : t('Save Preset')}
      </Button>
      {activePresetId && (
        <Button
          size="small"
          variant="minimal"
          icon={IconNames.RESET}
          onClick={handleClear}
        >
          {t('Clear')}
        </Button>
      )}
    </PresetsWrapper>
  )
}
