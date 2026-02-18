import { Button, InputGroup, Popover, Tag } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { countNumberOfRules } from '@fn-sphere/filter'
import React, { useCallback, useRef, useState } from 'react'
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

const PopoverContent = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px;
`

const SavePresetButton = ({ onSave }: { onSave: (name: string) => void }) => {
  const { t } = usePluginTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleConfirm = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed)
    setIsOpen(false)
    setName('')
  }, [name, onSave])

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onOpened={() => inputRef.current?.focus()}
      placement="bottom"
      content={
        <PopoverContent>
          <InputGroup
            inputRef={inputRef}
            size="small"
            placeholder={t('Preset name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              )
                handleConfirm()
            }}
          />
          <Button
            size="small"
            intent="primary"
            icon={IconNames.TICK}
            onClick={handleConfirm}
          />
        </PopoverContent>
      }
    >
      <Button
        size="small"
        variant="minimal"
        icon={IconNames.FLOPPY_DISK}
        onClick={() => {
          setName('')
          setIsOpen(true)
        }}
      >
        {t('Save Preset')}
      </Button>
    </Popover>
  )
}

const UpdatePresetButton = ({ onUpdate }: { onUpdate: () => void }) => {
  const { t } = usePluginTranslation()
  return (
    <Button
      size="small"
      variant="minimal"
      icon={IconNames.FLOPPY_DISK}
      onClick={onUpdate}
    >
      {t('Update Preset')}
    </Button>
  )
}

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

  const handleSaveNew = useCallback(
    (name: string) => {
      savePreset(name, filterRule)
    },
    [filterRule, savePreset],
  )

  const handleUpdate = useCallback(() => {
    if (!activePresetId) return
    updatePreset(activePresetId, filterRule)
    toast(t('Preset updated'))
  }, [activePresetId, filterRule, updatePreset, t])

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
      {activePresetId ? (
        <UpdatePresetButton onUpdate={handleUpdate} />
      ) : (
        <SavePresetButton onSave={handleSaveNew} />
      )}
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
