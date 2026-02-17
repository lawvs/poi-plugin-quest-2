import type { FilterGroup, FilterSchemaContext } from '@fn-sphere/filter'
import {
  defaultGetLocaleText,
  FilterBuilder,
  FilterSphereProvider,
  useFilterSphere,
} from '@fn-sphere/filter'
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { usePluginTranslation } from '../poi/hooks'
import type { UnionQuest } from '../questHelper'
import type { FilterableQuest } from './schema'
import { filterableQuestSchema, mapQuestToFilterable } from './schema'
import { blueprintTheme } from './theme'

const STORAGE_KEY = 'poi-plugin-quest-2-filter-sphere-rule'

const loadSavedRule = (): FilterGroup | undefined => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : undefined
  } catch {
    return undefined
  }
}

type AdvancedFilterContextValue = {
  context: FilterSchemaContext<FilterableQuest>
  predicate: (quest: UnionQuest) => boolean
}

const AdvancedFilterContext = createContext<AdvancedFilterContextValue | null>(
  null,
)

export const AdvancedFilterProvider = ({
  children,
}: {
  children?: ReactNode
}) => {
  const { t } = usePluginTranslation()

  const getLocaleText = useCallback(
    (key: string) => {
      const translated = t(key as any)
      if (translated !== key) return translated
      return defaultGetLocaleText(key)
    },
    [t],
  )

  const handleRuleChange = useCallback(
    ({ filterRule }: { filterRule: FilterGroup }) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filterRule))
      } catch {
        // ignore
      }
    },
    [],
  )

  const { context, predicate: rawPredicate } = useFilterSphere<FilterableQuest>(
    {
      schema: filterableQuestSchema,
      defaultRule: loadSavedRule() ?? undefined,
      onRuleChange: handleRuleChange,
      getLocaleText,
    },
  )

  const predicate = useMemo(
    () => (quest: UnionQuest) => rawPredicate(mapQuestToFilterable(quest)),
    [rawPredicate],
  )

  const value = useMemo(() => ({ context, predicate }), [context, predicate])

  return (
    <AdvancedFilterContext.Provider value={value}>
      {children}
    </AdvancedFilterContext.Provider>
  )
}

const useAdvancedFilterContext = () => {
  const ctx = useContext(AdvancedFilterContext)
  if (!ctx) {
    throw new Error(
      'useAdvancedFilterContext must be used within AdvancedFilterProvider',
    )
  }
  return ctx
}

export const AdvancedFilterBuilder = () => {
  const { context } = useAdvancedFilterContext()
  return (
    <FilterSphereProvider context={context} theme={blueprintTheme}>
      <FilterBuilder />
    </FilterSphereProvider>
  )
}

export const useAdvancedFilterPredicate = () => {
  const { predicate } = useAdvancedFilterContext()
  return predicate
}
