// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///D:/Project/OJ/Distributed-OnlineJudge-Vue/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/Project/OJ/Distributed-OnlineJudge-Vue/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Components from "file:///D:/Project/OJ/Distributed-OnlineJudge-Vue/node_modules/unplugin-vue-components/dist/vite.js";
import { PrimeVueResolver } from "file:///D:/Project/OJ/Distributed-OnlineJudge-Vue/node_modules/@primevue/auto-import-resolver/index.mjs";
import { prismjsPlugin } from "file:///D:/Project/OJ/Distributed-OnlineJudge-Vue/node_modules/vite-plugin-prismjs/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///D:/Project/OJ/Distributed-OnlineJudge-Vue/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    }),
    prismjsPlugin({
      languages: "all",
      // 语言
      plugins: ["line-numbers", "show-language", "copy-to-clipboard", "inline-color"],
      theme: "okaidia",
      // 主题
      css: true
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0XFxcXE9KXFxcXERpc3RyaWJ1dGVkLU9ubGluZUp1ZGdlLVZ1ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUHJvamVjdFxcXFxPSlxcXFxEaXN0cmlidXRlZC1PbmxpbmVKdWRnZS1WdWVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1Byb2plY3QvT0ovRGlzdHJpYnV0ZWQtT25saW5lSnVkZ2UtVnVlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XHJcbmltcG9ydCB7UHJpbWVWdWVSZXNvbHZlcn0gZnJvbSAnQHByaW1ldnVlL2F1dG8taW1wb3J0LXJlc29sdmVyJztcclxuaW1wb3J0IHsgcHJpc21qc1BsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLXByaXNtanMnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgQ29tcG9uZW50cyh7XHJcbiAgICAgIHJlc29sdmVyczogW1xyXG4gICAgICAgIFByaW1lVnVlUmVzb2x2ZXIoKVxyXG4gICAgICBdXHJcbiAgICB9KSxcclxuICAgIHByaXNtanNQbHVnaW4oe1xyXG4gICAgICBsYW5ndWFnZXM6ICdhbGwnLCAvLyBcdThCRURcdThBMDBcclxuICAgICAgcGx1Z2luczogWydsaW5lLW51bWJlcnMnLCdzaG93LWxhbmd1YWdlJywnY29weS10by1jbGlwYm9hcmQnLCdpbmxpbmUtY29sb3InXSxcclxuICAgICAgdGhlbWU6ICdva2FpZGlhJywvLyBcdTRFM0JcdTk4OThcclxuICAgICAgY3NzOiB0cnVlLFxyXG4gIH0pXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxVCxTQUFTLGVBQWUsV0FBVztBQUV4VixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUSx3QkFBdUI7QUFDL0IsU0FBUyxxQkFBcUI7QUFObUssSUFBTSwyQ0FBMkM7QUFTbFAsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osV0FBVztBQUFBLE1BQ1QsV0FBVztBQUFBLFFBQ1QsaUJBQWlCO0FBQUEsTUFDbkI7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELGNBQWM7QUFBQSxNQUNaLFdBQVc7QUFBQTtBQUFBLE1BQ1gsU0FBUyxDQUFDLGdCQUFlLGlCQUFnQixxQkFBb0IsY0FBYztBQUFBLE1BQzNFLE9BQU87QUFBQTtBQUFBLE1BQ1AsS0FBSztBQUFBLElBQ1QsQ0FBQztBQUFBLEVBQ0Q7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
