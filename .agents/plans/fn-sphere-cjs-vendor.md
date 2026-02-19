# @fn-sphere/filter CJS Vendor Bundle — Implementation Summary

## Status: Implemented

## Problem

`@fn-sphere/filter` is ESM-only (no `"require"` in its exports map). poi/Electron uses
CommonJS and webpack cannot consume the package without erroring. Attempting to bundle it
via webpack/babel in poi's own build chain also fails.

## Solution

Pre-bundle `@fn-sphere/filter` into a single CJS file with Vite, load it via `require()`
inside a unified vendor module, and have all plugin source import from that module instead
of `@fn-sphere/filter` directly.

## File Changes

### `vite.config.ts`

- Single entry `fn-sphere` → `node_modules/@fn-sphere/filter/dist/index.js`
- Format: `cjs`, `outDir: 'build/vendor'`, `sourcemap: true`, `minify: false`
- External: `react`, `react-dom`, `zod` (available from poi's node_modules at runtime)
- No `@vitejs/plugin-react` plugin (no JSX in vendor build)
- Produces `build/vendor/fn-sphere.js` + `.map`

### `src/filter-sphere/vendor.ts` (new — the unified entry point)

```ts
const mod =
  require('../../build/vendor/fn-sphere') as typeof import('@fn-sphere/filter')

export const countNumberOfRules = mod.countNumberOfRules
export const createFilterTheme = mod.createFilterTheme
// ... all used runtime symbols

export type {
  FilterGroup,
  FilterSchemaContext,
  FilterTheme,
} from '@fn-sphere/filter'
export type { MultiSelectProps } from '@fn-sphere/filter/dist/views/components'
```

Runtime values come from the CJS bundle; types come from node_modules `.d.ts` (type-only,
no runtime cost). poi's webpack never sees `@fn-sphere/filter` as an import specifier.

### `package.json`

- Added `"build:vendor": "vite build"` script
- Updated `"release"` to: `npm run build && npm run build:vendor && changeset publish`

## Build Workflow

```bash
npm run build:vendor   # Vite → build/vendor/fn-sphere.js (CJS, ~pre-requisite)
npm run build          # poi/webpack compiles src/ → dist/ (uses build/vendor/ at runtime)
```

`build:vendor` must be run before `npm run build` or `tsc --noEmit` on a fresh checkout
since `build/vendor/fn-sphere.js` is gitignored.

## Why `require()` in vendor.ts?

- TypeScript with `module: commonjs` compiles ESM `import` → `require()` already, but the
  specifier `@fn-sphere/filter` would still be in the output, pointing webpack at the
  ESM-only package.
- Using `require('../../build/vendor/fn-sphere')` in vendor.ts makes webpack reference the
  pre-built CJS path directly — no alias config, no tsconfig-paths-webpack-plugin needed.
- `typeof import('@fn-sphere/filter')` type cast gives full TypeScript types without any
  runtime cost.
