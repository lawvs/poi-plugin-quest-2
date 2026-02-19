// Unified entry point for @fn-sphere/filter.
// Loads the pre-bundled CJS module so poi's webpack never encounters the
// ESM-only package directly.  Run `npm run build:vendor` before building.

/* eslint-disable @typescript-eslint/no-require-imports */
const mod =
  require('../../build/vendor/fn-sphere') as typeof import('@fn-sphere/filter')

export const countNumberOfRules = mod.countNumberOfRules
export const createFilterTheme = mod.createFilterTheme
export const defaultGetLocaleText = mod.defaultGetLocaleText
export const FilterBuilder = mod.FilterBuilder
export const FilterSphereProvider = mod.FilterSphereProvider
export const useFilterGroup = mod.useFilterGroup
export const useFilterSphere = mod.useFilterSphere
export const useRootRule = mod.useRootRule
export const useView = mod.useView

export type {
  FilterGroup,
  FilterSchemaContext,
  FilterTheme,
} from '@fn-sphere/filter'
export type { MultiSelectProps } from '@fn-sphere/filter/dist/views/components'
