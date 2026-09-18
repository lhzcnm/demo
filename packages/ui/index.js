import { fileURLToPath, URL } from 'node:url'
import { build } from 'vite'

import vue from '@vitejs/plugin-vue'
import Imports from 'unplugin-auto-import/vite'
import dts from 'vite-plugin-dts'

function resolve(path) {
  return fileURLToPath(new URL(path, import.meta.url))
}

await build({
  configFile: false,
  plugins: [
    vue(),
    Imports({ imports: ['vue'] }),
    dts({
      rollupTypes: true,
      tsconfigPath: 'tsconfig.app.json'
    }),
  ],
  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },
  build: {
    lib: {
      entry: [
        resolve('src/index.ts'),
        resolve('src/preset.ts'),
        resolve('src/resolver.ts')
      ],
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        'dayjs',
        '@iconify/vue',
        '@floating-ui/vue',
        '@vueuse/core',
        'tailwind-merge',
        'tailwind-variants',
      ],
      output: {
        assetFileNames: 'index.css'
      }
    },
  }
})
