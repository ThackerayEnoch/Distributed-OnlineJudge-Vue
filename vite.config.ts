import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';
import { prismjsPlugin } from 'vite-plugin-prismjs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    }),
    prismjsPlugin({
      languages: 'all', // 语言
      plugins: ['line-numbers','show-language','copy-to-clipboard','inline-color'],
      theme: 'okaidia',// 主题
      css: true,
  })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
