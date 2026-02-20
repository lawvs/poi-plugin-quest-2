import { FilterBuilder, FilterSphereProvider } from './vendor'
import React from 'react'
import { useAdvancedFilterContext } from './context'
import { PresetCollection } from './preset-collection'
import { blueprintTheme } from './theme'
import { useShowFilterBuilder } from '../store/advancedFilter'

export { AdvancedFilterProvider, useAdvancedFilterContext } from './context'

export const AdvancedFilterBuilder = () => {
  const { context } = useAdvancedFilterContext()
  const { showFilterBuilder } = useShowFilterBuilder()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <PresetCollection />
      {showFilterBuilder && (
        <FilterSphereProvider context={context} theme={blueprintTheme}>
          <FilterBuilder />
        </FilterSphereProvider>
      )}
    </div>
  )
}

export const useAdvancedFilterPredicate = () => {
  const { predicate } = useAdvancedFilterContext()
  return predicate
}
