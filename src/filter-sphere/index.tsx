import { FilterBuilder, FilterSphereProvider } from '@fn-sphere/filter'
import React from 'react'
import { useAdvancedFilterContext } from './context'
import { PresetCollection } from './preset-collection'
import { blueprintTheme } from './theme'

export { AdvancedFilterProvider, useAdvancedFilterContext } from './context'

export const AdvancedFilterBuilder = () => {
  const { context } = useAdvancedFilterContext()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <PresetCollection />
      <FilterSphereProvider context={context} theme={blueprintTheme}>
        <FilterBuilder />
      </FilterSphereProvider>
    </div>
  )
}

export const useAdvancedFilterPredicate = () => {
  const { predicate } = useAdvancedFilterContext()
  return predicate
}
