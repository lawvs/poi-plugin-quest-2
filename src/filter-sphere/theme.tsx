import {
  Button,
  Card,
  HTMLSelect,
  InputGroup,
  MenuItem,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { MultiSelect } from '@blueprintjs/select'
import {
  createFilterTheme,
  FilterTheme,
  useFilterGroup,
  useRootRule,
  useView,
} from './vendor'
import type { MultiSelectProps } from './vendor'
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
        size="small"
        variant="outlined"
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
          size="small"
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
  templates: {
    FilterGroupContainer: ({ rule, children }) => {
      const { getLocaleText } = useRootRule()
      const {
        ruleState: { isRoot, depth },
        toggleGroupOp,
        appendChildRule,
        appendChildGroup,
        removeGroup,
      } = useFilterGroup(rule)
      const { ErrorBoundary } = useView('components')

      const text =
        rule.op === 'or'
          ? getLocaleText('operatorOr')
          : getLocaleText('operatorAnd')

      const handleToggleGroupOp = useCallback(() => {
        toggleGroupOp()
      }, [toggleGroupOp])

      const handleAddCondition = useCallback(() => {
        appendChildRule()
      }, [appendChildRule])

      const handleAddGroup = useCallback(() => {
        appendChildGroup()
      }, [appendChildGroup])

      const handleDeleteGroup = useCallback(() => {
        removeGroup()
      }, [removeGroup])

      return (
        <ErrorBoundary
          {...(!isRoot ? { onDelete: handleDeleteGroup } : undefined)}
        >
          <Card
            interactive
            compact
            elevation={depth as 0 | 1 | 2}
            style={{
              display: 'flex',
              alignItems: 'start',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Button icon={IconNames.Anchor} onClick={handleToggleGroupOp}>
              {text}
            </Button>
            {children}
            <div
              className="filter-sphere-filter-group-container-actions"
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              <Button icon={IconNames.Add} onClick={handleAddCondition}>
                {getLocaleText('addRule')}
              </Button>
              {depth < 3 && (
                <Button icon={IconNames.FolderNew} onClick={handleAddGroup}>
                  {getLocaleText('addGroup')}
                </Button>
              )}
              {!isRoot && (
                <Button
                  icon="trash"
                  intent="danger"
                  aria-label={getLocaleText('deleteGroup')}
                  onClick={handleDeleteGroup}
                ></Button>
              )}
            </div>
          </Card>
        </ErrorBoundary>
      )
    },
  },
})
