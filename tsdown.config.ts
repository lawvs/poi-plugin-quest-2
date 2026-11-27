import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { index: 'src/index.ts' },
  outDir: 'dist',
  format: ['cjs'],
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    'styled-components',
    'i18next',
    'react-i18next',
    /^@blueprintjs\//,
  ],
  outExtensions: () => ({ js: '.js' }),
  sourcemap: true,
  treeshake: true,
  shims: false,
  target: false,
})
