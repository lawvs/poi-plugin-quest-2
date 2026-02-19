'use strict'

const fs = require('fs')
const path = require('path')

// __dirname = <plugin root>/scripts/
const vendorDir = path.join(__dirname, '..', 'build', 'vendor')

// Check if vendor directory exists and is not empty
if (!fs.existsSync(vendorDir)) {
  console.warn(
    '[poi-plugin-quest-2] vendor directory not found, skipping CJS compatibility patch',
  )
  process.exit(0)
}

const vendorFiles = fs
  .readdirSync(vendorDir)
  .filter((file) => file.endsWith('.cjs'))
if (vendorFiles.length === 0) {
  console.warn(
    '[poi-plugin-quest-2] vendor directory is empty or contains no .cjs files, skipping CJS compatibility patch',
  )
  process.exit(0)
}

let pkgJsonPath
try {
  pkgJsonPath = require.resolve('@fn-sphere/filter/package.json')
} catch {
  // Not installed (e.g. devDependencies skipped), nothing to do
  console.warn(
    '[poi-plugin-quest-2] @fn-sphere/filter not found, skipping CJS compatibility patch',
  )
  process.exit(0)
}

const pkgDir = path.dirname(pkgJsonPath)
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'))

if (pkg.exports?.['.']?.['require']) {
  // Already patched
  console.log(
    '[poi-plugin-quest-2] @fn-sphere/filter already patched for CJS compatibility, skipping',
  )
  process.exit(0)
}

// Copy all .cjs vendor files into a single flat directory inside the package.
// All files must stay in the same directory so that relative require() paths
// (e.g. shared chunks like ./en-US-*.cjs) resolve correctly.
// .cjs extension forces the CJS loader even inside a "type":"module" package.
const cjsDir = path.join(pkgDir, 'dist', 'cjs')
fs.mkdirSync(cjsDir, { recursive: true })

for (const file of vendorFiles) {
  fs.copyFileSync(path.join(vendorDir, file), path.join(cjsDir, file))
}

// Add "require" conditions so Electron/CJS can load the package
pkg.exports['.']['require'] = './dist/cjs/fn-sphere-filter.cjs'
pkg.exports['./locales']['require'] = './dist/cjs/fn-sphere-locales.cjs'
fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n')

console.log(
  '[poi-plugin-quest-2] Patched @fn-sphere/filter for CJS compatibility',
)
