import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// 初始化应用时检查登录状态
const authStore = useAuthStore()

// 页面刷新时的处理逻辑
async function handlePageRefresh() {
  // 检测 Pinia 中是否有令牌
  if (!authStore.token && !authStore.isLoggedIn) {
    // 如果没有令牌且用户未登录，尝试刷新令牌
    try {
      const refreshSuccess = await authStore.refreshToken()
      if (refreshSuccess && authStore.token) {
        // 刷新成功，设置令牌刷新定时器
        authStore.setRefreshTimer()
        // 获取用户信息
        await authStore.fetchUserInfo()
      }
    } catch (error) {
      console.error('页面刷新时刷新令牌失败:', error)
      // 刷新失败，不做处理
    }
  } else if (authStore.token) {
    // 如果有令牌，设置令牌刷新定时器
    authStore.setRefreshTimer()
    // 如果有令牌但没有 userInfo，获取用户信息
    if (!authStore.userInfo) {
      authStore.fetchUserInfo()
    }
  }
}

// 处理页面刷新
handlePageRefresh()

app.use(ElementPlus)
app.use(router)
app.mount('#app')
