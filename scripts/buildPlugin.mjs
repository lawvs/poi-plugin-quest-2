import { build } from 'vite'

await build({
  configFile: false,
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
      fileName: () => 'plugin.cjs',
    },
    outDir: 'build',
    emptyOutDir: false,
    commonjsOptions: {
      include: [/node_modules/, /build\/vendor/, /filter-sphere\/vendor\.ts$/],
      extensions: ['.js', '.ts'],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        /^@blueprintjs\//,
        'i18next',
        'react-i18next',
        /^react\//,
        /^react-dom\//,
      ],
      output: { dynamicImportInCjs: false },
    },
  },
})
