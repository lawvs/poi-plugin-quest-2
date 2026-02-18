# Advanced Search Mode with Filter Sphere — Implementation Summary

## Status: Implemented

## Overview

Added an advanced search mode powered by `@fn-sphere/filter` + `zod`, with a Blueprint.js-themed filter UI, preset/collection system, and full i18n support across 5 locales.

## Architecture

```
src/filter-sphere/
  schema.ts              # Zod schema + UnionQuest → FilterableQuest mapper
  theme.tsx              # Blueprint.js theme via createFilterTheme
  context.tsx            # AdvancedFilterProvider (React Context sharing useFilterSphere state)
  preset-collection.tsx  # Preset save/switch/rename/delete UI with Popover input
  index.tsx              # AdvancedFilterBuilder component + re-exports

src/store/
  store.tsx              # State: advancedSearchMode, filterRule, filterPresets, activePresetId
  filterRule.ts          # useFilterRule, useFilterPresets hooks
  search.ts              # useSearchMode, useSearchInput, useStableSearchWords
```

## Key Design Decisions

- **Single useFilterSphere instance** shared via `AdvancedFilterProvider` React Context (wraps app in `App.tsx`), avoiding duplicate hook instances
- **Flat Zod schema** with `mapQuestToFilterable()` transformer — Filter Sphere requires flat schemas but quest data is nested (`UnionQuest` → `FilterableQuest`)
- **Filter state merged into main store** — `filterRule`, `filterPresets`, `activePresetId` all persist via the existing localStorage mechanism in `store.tsx` (no separate storage key)
- **Blueprint.js theme** overrides: `Button`, `Input` (InputGroup), `Select` (HTMLSelect), `MultipleSelect` (Blueprint MultiSelect bridge), `FilterGroupContainer` (Card-based with depth-limited nesting)
- **i18n via `getLocaleText`** callback — tries plugin `t()` first, falls back to `defaultGetLocaleText`

## Filter Sphere Schema (`schema.ts`)

Fields exposed for filtering:

- `code` (string) — Quest wiki ID (e.g. "A1", "B3")
- `name` (string) — Quest name
- `desc` (string) — Quest description
- `rewards` (string) — Quest rewards
- `memo2` (string) — Quest details
- `category` (enum) — Composition/Sortie/Exercise/Expedition/SupplyOrDocking/Arsenal/Modernization
- `frequency` (enum) — Daily/Weekly/Monthly/Quarterly/Yearly/One-time

## Preset/Collection System (`preset-collection.tsx`)

Components:

- **`NameInputPopover`** — Reusable Popover + InputGroup for entering names (IME-safe via `e.nativeEvent.isComposing`)
- **`PresetTag`** — Renders a preset as a Blueprint Tag; click inactive to switch, click active to rename via popover, X to delete
- **`UpdatePresetButton`** — Simple button to overwrite active preset's rule
- **`PresetCollection`** — Orchestrates preset tags + save/update/clear buttons

Store hooks (`filterRule.ts`):

- `savePreset(name, rule)` — Creates new preset, sets as active
- `updatePreset(id, rule)` — Overwrites preset's filter rule
- `renamePreset(id, name)` — Renames preset
- `switchPreset(id)` — Activates preset, returns its rule for `reset()`
- `deletePreset(id)` — Removes preset, clears activePresetId if matching
- `clearActivePreset()` — Deactivates current preset

## Toolbar Integration (`Toolbar.tsx`)

- Toggle button (`IconNames.SERIES_FILTERED`) switches between simple/advanced mode
- **Simple mode**: SearchInput + CategoryTags + TypeTags (unchanged)
- **Advanced mode**: AdvancedFilterBuilder (PresetCollection + FilterBuilder)
- `useFilterQuest` branches: normal mode uses `useToolbarFilter()`, advanced mode uses `useAdvancedFilterPredicate()`

## Dependencies Added

- `@fn-sphere/filter` — Schema-driven filter UI
- `zod` (v4) — Schema validation (required by fn-sphere)

## Other Fixes

- `scripts/downloadSprites.ts` — Fixed `Buffer` → `Uint8Array` for TS compatibility with newer Node types
