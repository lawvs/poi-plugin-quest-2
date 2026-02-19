import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'fn-sphere-filter': resolve(
          __dirname,
          'node_modules/@fn-sphere/filter/dist/index.js',
        ),
        'fn-sphere-locales': resolve(
          __dirname,
          'node_modules/@fn-sphere/filter/dist/locales/index.js',
        ),
      },
      formats: ['cjs'],
      fileName: (_, entryAlias) => `${entryAlias}.cjs`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'zod'],
      output: {
        chunkFileNames: '[name]-[hash].cjs',
      },
    },
    minify: false,
    outDir: 'build/vendor',
    sourcemap: true,
  },
})
