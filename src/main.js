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
        // 刷新成功，设置令牌刷新定时器和无操作超时计时器
        authStore.setRefreshTimer()
        authStore.setInactivityTimer()
        // 获取用户信息
        await authStore.fetchUserInfo()
      }
    } catch (error) {
      // 刷新失败，不做处理
    }
  } else if (authStore.token) {
    // 如果有令牌，设置令牌刷新定时器和无操作超时计时器
    authStore.setRefreshTimer()
    authStore.setInactivityTimer()
    // 如果有令牌但没有 userInfo，获取用户信息
    if (!authStore.userInfo) {
      authStore.fetchUserInfo()
    }
  }
}

// 处理页面刷新
async function initializeApp() {
  await handlePageRefresh()
  
  // 如果用户已登录，设置无操作超时计时器
  if (authStore.isLoggedIn) {
    authStore.setInactivityTimer()
  }
  
  // 添加用户交互事件监听器，用于重置无操作超时计时器
  const activityEvents = ['click', 'keydown', 'scroll', 'touchstart', 'mousemove']
  
  activityEvents.forEach(event => {
    document.addEventListener(event, () => {
      if (authStore.isLoggedIn) {
        authStore.resetInactivityTimer()
      }
    }, { capture: true })
  })
}

// 初始化应用
initializeApp()

app.use(ElementPlus)
app.use(router)
app.mount('#app')
