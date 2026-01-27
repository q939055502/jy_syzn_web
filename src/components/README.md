# 用户信息组件 (UserInfo)

一个基于 Element Plus 的用户信息组件，支持登录状态显示和用户操作。

## 功能特点

- ✅ 已登录状态：显示用户头像、名称和下拉菜单
- ✅ 未登录状态：显示登录按钮
- ✅ 支持头像显示，带有默认头像
- ✅ 下拉菜单包含：个人信息、设置、个人中心、退出登录
- ✅ 响应式设计，适配移动端
- ✅ 基于 Pinia 状态管理
- ✅ 与 Element Plus 风格一致

## 组件结构

### 1. UserInfo.vue

核心用户信息组件，包含登录/未登录状态显示和相关操作。

### 2. Layout.vue

示例布局组件，展示如何将 UserInfo 组件集成到应用中。

## 安装和使用

### 1. 确保已安装依赖

```bash
# 安装 Element Plus
npm install element-plus

# 安装 Pinia
npm install pinia

# 安装 Element Plus 图标
npm install @element-plus/icons-vue
```

### 2. 注册 Pinia

在 `main.js` 中注册 Pinia：

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(ElementPlus)
app.mount('#app')
```

### 3. 在组件中使用

#### 3.1 直接使用 UserInfo 组件

```vue
<template>
  <div class="app-container">
    <UserInfo />
  </div>
</template>

<script setup>
import UserInfo from './components/UserInfo.vue'
</script>
```

#### 3.2 使用 Layout 组件（推荐）

```vue
<template>
  <Layout>
    <!-- 页面内容 -->
    <div class="page-content">
      <h2>欢迎使用检测标准管理系统</h2>
      <p>这是系统的主页面内容。</p>
    </div>
  </Layout>
</template>

<script setup>
import Layout from './components/Layout.vue'
</script>
```

## 状态管理

组件使用 Pinia 进行状态管理，需要确保已创建 `user` store：

### user store 结构

```javascript
// src/stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    isLoggedIn: false,
    token: localStorage.getItem('token') || ''
  }),
  
  getters: {
    getIsLoggedIn: (state) => state.isLoggedIn,
    getUserInfo: (state) => state.userInfo
  },
  
  actions: {
    // 登录成功后调用
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      this.isLoggedIn = true
    },
    
    // 退出登录
    logout() {
      this.userInfo = null
      this.isLoggedIn = false
      localStorage.removeItem('token')
    }
  }
})
```

## 样式定制

组件支持通过 CSS 变量和自定义类名进行样式定制：

### CSS 变量

```css
/* 可以在 App.vue 或全局样式中添加 */
:root {
  /* 用户头像大小 */
  --user-avatar-size: 36px;
  
  /* 登录按钮颜色 */
  --login-btn-color: #3b82f6;
}
```

### 自定义类名

组件支持通过 `class` 属性添加自定义类名：

```vue
<UserInfo class="custom-user-info" />
```

## 响应式设计

- 在大屏设备上，显示完整的用户名和头像
- 在小屏设备（小于 768px）上，只显示头像，隐藏用户名

## 浏览器兼容性

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 更新日志

### v1.0.0

- 初始版本
- 支持登录/未登录状态显示
- 支持下拉菜单操作
- 响应式设计

## 许可证

MIT
