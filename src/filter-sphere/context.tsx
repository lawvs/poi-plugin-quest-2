import type { FilterGroup, FilterSchemaContext } from '@fn-sphere/filter'
import { defaultGetLocaleText, useFilterSphere } from '@fn-sphere/filter'
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { Namespace, TFuncKey } from 'react-i18next'
import { usePluginTranslation } from '../poi/hooks'
import type { UnionQuest } from '../questHelper'
import { useFilterRule } from '../store/filterRule'
import type { FilterableQuest } from './schema'
import { filterableQuestSchema, mapQuestToFilterable } from './schema'

type AdvancedFilterContextValue = {
  context: FilterSchemaContext<FilterableQuest>
  predicate: (quest: UnionQuest) => boolean
  filterRule: FilterGroup
  reset: (rule?: FilterGroup) => void
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
  const { filterRule: savedRule, setFilterRule } = useFilterRule()

  const getLocaleText = useCallback(
    (key: string) => {
      const translated = t(key as TFuncKey<Namespace<'en-US'>, undefined>)
      if (translated !== key) return translated
      return defaultGetLocaleText(key)
    },
    [t],
  )

  const handleRuleChange = useCallback(
    ({ filterRule }: { filterRule: FilterGroup }) => {
      setFilterRule(filterRule)
    },
    [setFilterRule],
  )

  const {
    context,
    predicate: rawPredicate,
    filterRule,
    reset,
  } = useFilterSphere<FilterableQuest>({
    schema: filterableQuestSchema,
    defaultRule: savedRule ?? undefined,
    onRuleChange: handleRuleChange,
    getLocaleText,
  })

  const predicate = useMemo(
    () => (quest: UnionQuest) => rawPredicate(mapQuestToFilterable(quest)),
    [rawPredicate],
  )

  const value = useMemo(
    () => ({ context, predicate, filterRule, reset }),
    [context, predicate, filterRule, reset],
  )

  return (
    <AdvancedFilterContext.Provider value={value}>
      {children}
    </AdvancedFilterContext.Provider>
  )
}

export const useAdvancedFilterContext = () => {
  const ctx = useContext(AdvancedFilterContext)
  if (!ctx) {
    throw new Error(
      'useAdvancedFilterContext must be used within AdvancedFilterProvider',
    )
  }
  return ctx
}
