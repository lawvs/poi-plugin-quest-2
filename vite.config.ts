import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        /^(react|react-dom|styled-components|i18next|react-i18next)(\/|$)/,
        /^@blueprintjs\//,
      ],
      output: { interop: 'auto' },
    },
    minify: false,
    outDir: 'dist',
    sourcemap: true,
  },
})
