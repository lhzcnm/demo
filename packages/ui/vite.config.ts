import { resolve } from 'node:path'
import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'
import mdx from '@mdx-js/rollup'

import Imports from 'unplugin-auto-import/vite'
import Comps from 'unplugin-vue-components/vite'
import autoprefix from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import postcssImport from 'postcss-import'

export default defineConfig({
  plugins: [
    vue(),
    Imports({ imports: ['vue'] }),
    Comps({
      dirs: ['docs/components'],
      resolvers: [
        {
          type: 'component',
          resolve: (name: string) => {
            if (name.startsWith('X')) {
              return { name, from: '@/components' }
            }
          },
        },
      ]
    }),
    mdx({ jsxImportSource: 'vue' }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'docs'),
    },
  },
  css: {
    postcss: {
      plugins: [
        postcssImport(),
        autoprefix(),
        tailwindcss(),
      ]
    }
  }
})
