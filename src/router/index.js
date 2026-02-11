import { createRouter, createWebHistory,createWebHashHistory  } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Layout from '../components/Layout.vue'
import HomeView from '../views/HomeView.vue'
import Login from '../views/login/Login.vue'
import CategoryManagement from '../views/detection/CategoryManagement.vue'
import DetectionStandard from '../views/detection/DetectionStandard.vue'
import DetectionItem from '../views/detection/DetectionItem.vue'
import DetectionParam from '../views/detection/DetectionParam.vue'
import DetectionObject from '../views/detection/DetectionObject.vue'
import DelegationFormTemplate from '../views/detection/DelegationFormTemplate.vue'
import UserManagement from '../views/UserManagement.vue'
import SystemSettings from '../views/SystemSettings.vue'
import RoleManagement from '../views/RoleManagement.vue'
import PermissionManagement from '../views/PermissionManagement.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 公开路由 - 检测项目指南
    {
      path: '/detection-guide',
      name: 'DetectionGuide',
      component: () => import('../views/detectionGuide/DetectionGuide.vue'),
      meta: { title: '检测项目指南', requiresAuth: false }
    },
    {
      path: '/',
      name: 'Layout',
      component: Layout,
      children: [
        {
          path: '',
          name: 'HomeView',
          component: HomeView,
          meta: { title: '首页' }
        },
        {
          path: '/delegation-form-template',
          name: 'DelegationFormTemplate',
          component: DelegationFormTemplate,
          meta: { title: '委托模板' }
        },
        {
          path: '/detection-standard',
          name: 'DetectionStandard',
          component: DetectionStandard,
          meta: { title: '检评规范' }
        },
        {
          path: '/category-management',
          name: 'CategoryManagement',
          component: CategoryManagement,
          meta: { title: '分类管理' }
        },
        {
          path: '/detection-object',
          name: 'DetectionObject',
          component: DetectionObject,
          meta: { title: '检测对象' }
        },
        {
          path: '/detection-item',
          name: 'DetectionItem',
          component: DetectionItem,
          meta: { title: '检测项目' }
        },
        {
          path: '/detection-param',
          name: 'DetectionParam',
          component: DetectionParam,
          meta: { title: '检测参数' }
        },
        {
          path: '/user-management',
          name: 'UserManagement',
          component: UserManagement,
          meta: { title: '用户管理' }
        },
        {
          path: '/role-management',
          name: 'RoleManagement',
          component: RoleManagement,
          meta: { title: '角色管理' }
        },
        {
          path: '/permission-management',
          name: 'PermissionManagement',
          component: PermissionManagement,
          meta: { title: '权限管理' }
        },
        {
          path: '/system-settings',
          name: 'SystemSettings',
          component: SystemSettings,
          meta: { title: '系统设置' }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

// 添加导航守卫，确保只有登录用户才能访问受保护的路由
router.beforeEach(async (to, from, next) => {
  // 从 Pinia 获取 token
  const authStore = useAuthStore()
  const token = authStore.token
  
  // 检查路由是否需要验证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  
  // 如果是登录页面，直接放行
  if (to.name === 'login') {
    next()
    return
  }
  
  // 如果路由不需要验证，直接放行
  if (!requiresAuth) {
    next()
    return
  }
  
  // 如果需要验证但未登录
  if (!token && !authStore.isLoggedIn) {
    // 尝试刷新令牌
    try {
      const refreshSuccess = await authStore.refreshToken()
      if (refreshSuccess && authStore.token) {
        // 刷新成功，设置令牌刷新定时器
        authStore.setRefreshTimer()
        // 放行
        next()
        return
      }
    } catch (error) {
      // 刷新失败，不做处理
    }
    next({ name: 'login' })
    return
  }
  
  // 已登录，放行
  next()
})

export default router