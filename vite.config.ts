import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'fn-sphere': resolve(
          __dirname,
          'node_modules/@fn-sphere/filter/dist/index.js',
        ),
      },
      formats: ['cjs'],
      fileName: (_, entryAlias) => `${entryAlias}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'zod'],
    },
    minify: false,
    outDir: 'build/vendor',
    sourcemap: true,
  },
})
