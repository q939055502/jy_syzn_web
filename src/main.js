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
if (authStore.getToken && !authStore.getUserInfo) {
  // 如果有 token 但没有 userInfo，获取用户信息
  authStore.fetchUserInfo()
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')
