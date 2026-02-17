import { Button, HTMLSelect, InputGroup, MenuItem } from '@blueprintjs/core'
import { MultiSelect } from '@blueprintjs/select'
import { createFilterTheme, FilterTheme } from '@fn-sphere/filter'
import type { MultiSelectProps } from '@fn-sphere/filter/dist/views/components'
import type { ChangeEvent } from 'react'
import React, { useCallback, useMemo } from 'react'

type Option<T> = { value: T; label: string }

const MultipleSelect: FilterTheme['components']['MultipleSelect'] = <T,>(
  props: MultiSelectProps<T>,
) => {
  const options = props.options ?? []
  const value = useMemo(() => props.value ?? [], [props.value])
  const onChange = props.onChange
  const selectedOptions = options.filter((opt) => value.includes(opt.value))

  const handleItemSelect = useCallback(
    (item: Option<T>) => {
      const isSelected = value.includes(item.value)
      const next = isSelected
        ? value.filter((v) => v !== item.value)
        : [...value, item.value]
      onChange?.(next)
    },
    [value, onChange],
  )

  const handleRemove = useCallback(
    (_tag: React.ReactNode, index: number) => {
      const removed = selectedOptions[index]
      if (!removed) return
      onChange?.(value.filter((v) => v !== removed.value))
    },
    [value, selectedOptions, onChange],
  )

  const handleClear = useCallback(() => {
    onChange?.([])
  }, [onChange])

  return (
    <MultiSelect<Option<T>>
      items={options}
      selectedItems={selectedOptions}
      onItemSelect={handleItemSelect}
      itemRenderer={(item, { handleClick, modifiers, ref }) => {
        if (!modifiers.matchesPredicate) return null
        return (
          <MenuItem
            ref={ref}
            key={item.label}
            text={item.label}
            icon={value.includes(item.value) ? 'tick' : 'blank'}
            active={modifiers.active}
            onClick={handleClick}
            shouldDismissPopover={false}
          />
        )
      }}
      tagRenderer={(item) => item.label}
      tagInputProps={{
        onRemove: handleRemove,
      }}
      onClear={selectedOptions.length > 0 ? handleClear : undefined}
      itemPredicate={(query, item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      }
      popoverProps={{ minimal: true }}
      placeholder=""
    />
  )
}

export const blueprintTheme = createFilterTheme({
  components: {
    Button: (props) => (
      <Button
        outlined={true}
        small
        minimal
        {...(props as React.ComponentProps<typeof Button>)}
      />
    ),
    Input: ({ onChange, ...props }) => {
      const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event.target.value)
        },
        [onChange],
      )
      return (
        <InputGroup
          small
          {...(props as React.ComponentProps<typeof InputGroup>)}
          onChange={handleChange}
        />
      )
    },
    Select: ({ options = [], value, onChange, ...props }) => {
      const selectedIdx = options.findIndex((option) => option.value === value)
      const handleChange = useCallback(
        (event: ChangeEvent<HTMLSelectElement>) => {
          const index = Number(event.target.value)
          const selectedOption = options[index]
          if (!selectedOption) return
          onChange?.(selectedOption.value)
        },
        [options, onChange],
      )
      return (
        <HTMLSelect
          {...(props as React.ComponentProps<typeof HTMLSelect>)}
          value={selectedIdx === -1 ? '' : String(selectedIdx)}
          onChange={handleChange}
        >
          <option value="" disabled />
          {options.map(({ label }, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ))}
        </HTMLSelect>
      )
    },
    MultipleSelect,
  },
})
