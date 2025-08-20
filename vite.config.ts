import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import legacy from '@vitejs/plugin-legacy';
import prismjsPlugin from 'vite-plugin-prismjs';
import { resolve } from 'path';

export default defineConfig({
  base: '/app/', // 与 Nginx 和 WebVPN 路径匹配
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'), // 指定 HTML 入口
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      renderModernChunks: true,
      renderLegacyChunks: true,
      polyfills: ['es.promise', 'es.array.iterator'],
    }),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    prismjsPlugin({
      languages: 'all',
      plugins: ['line-numbers', 'show-language', 'copy-to-clipboard', 'inline-color'],
      theme: 'okaidia',
      css: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});