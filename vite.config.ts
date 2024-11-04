import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    }
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      // 自动导入组件
      resolvers: [ElementPlusResolver()],
    }),
  ],
  publicDir: 'public',
  build: {
    watch: {
      include: ['src/**/*.ts', 'src/**/*.vue', 'public'],
      exclude: ['node_modules/**', 'dist/**']
    },
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js'
          }
          if (chunkInfo.name === 'content') {
            return 'content.js'
          }
          return '[name].js'
        },
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
}) 