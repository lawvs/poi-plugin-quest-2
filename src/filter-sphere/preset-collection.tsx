import { Button, InputGroup, Popover, Tag } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { countNumberOfRules } from './vendor'
import type { FilterGroup } from './vendor'
import React, { cloneElement, useCallback, useRef, useState } from 'react'
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

const NameInputPopover = ({
  defaultName,
  placeholder,
  onConfirm,
  children,
}: {
  defaultName?: string
  placeholder?: string
  onConfirm: (name: string) => void
  children: React.ReactElement
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleConfirm = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm(trimmed)
    setIsOpen(false)
    setName('')
  }, [name, onConfirm])

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
            placeholder={placeholder}
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
      {cloneElement(children, {
        onClick: () => {
          setName(defaultName ?? '')
          setIsOpen(true)
        },
      })}
    </Popover>
  )
}

type Preset = { id: string; name: string; rule: FilterGroup }

const PresetTag = ({
  preset,
  isActive,
  onSwitch,
  onRename,
  onDelete,
}: {
  preset: Preset
  isActive: boolean
  onSwitch: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}) => {
  const { t } = usePluginTranslation()

  const tag = (
    <Tag
      icon={IconNames.Tag}
      intent={isActive ? 'primary' : 'none'}
      interactive={true}
      onClick={isActive ? undefined : () => onSwitch(preset.id)}
      onRemove={(e) => {
        e.stopPropagation()
        onDelete(preset.id)
      }}
    >
      {preset.name}
      {countNumberOfRules(preset.rule) > 0 &&
        ` (${countNumberOfRules(preset.rule)})`}
    </Tag>
  )

  if (isActive) {
    return (
      <NameInputPopover
        defaultName={preset.name}
        placeholder={t('Preset name')}
        onConfirm={(name) => onRename(preset.id, name)}
      >
        {tag}
      </NameInputPopover>
    )
  }

  return tag
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
    renamePreset,
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
        <PresetTag
          key={preset.id}
          preset={preset}
          isActive={activePresetId === preset.id}
          onSwitch={handleSwitch}
          onRename={renamePreset}
          onDelete={deletePreset}
        />
      ))}
      {activePresetId ? (
        <UpdatePresetButton onUpdate={handleUpdate} />
      ) : (
        <NameInputPopover
          placeholder={t('Preset name')}
          onConfirm={handleSaveNew}
        >
          <Button size="small" variant="minimal" icon={IconNames.FLOPPY_DISK}>
            {t('Save Preset')}
          </Button>
        </NameInputPopover>
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
