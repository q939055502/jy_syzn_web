import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 允许通过局域网IP访问
    // 配置代理，将 API 请求转发到后端服务器
    proxy: {
      '/api': {
        target: 'http://localhost:1314', // 后端服务器地址
        changeOrigin: true, // 允许跨域
        secure: false, // 不验证 SSL 证书
      }
    }
  },
})
