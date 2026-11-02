import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // MVP 阶段 Element Plus 全量引入（省去按需引入配置成本），放宽告警阈值
    chunkSizeWarningLimit: 1500,
    // Element Plus 全量引入体积较大，按依赖拆包避免单 chunk 过大
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          echarts: ['echarts']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: false,
    proxy: {
      // 本地联调代理：前端 /api/* -> 后端 http://localhost:8080/*
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
