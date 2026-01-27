<template>
  <div 
    class="layout-container" 
    :class="{ 'dark': settingStore.isDark }"
    :style="themeStyles"
  >
    <el-container class="layout">
      <!-- 左侧菜单 -->
      <el-aside v-if="!globalStore.isMobile" :width="menuWidth" class="aside">
        <div class="logo-container">
          <h1 class="logo" :class="{ 'collapsed': isCollapse }">检测标准管理系统</h1>
        </div>
        <!-- 左侧菜单内容 -->
        <div class="aside-menu">
          <el-menu 
            :default-active="route.path"
            class="el-menu-vertical-demo"
            :collapse="isCollapse"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/">
              <el-icon><House /></el-icon>
              <template #title>首页</template>
            </el-menu-item>
            <el-menu-item index="/detection-standard">
              <el-icon><Document /></el-icon>
              <template #title>检评规范</template>
            </el-menu-item>
            <el-menu-item index="/category-management">
              <el-icon><Document /></el-icon>
              <template #title>分类管理</template>
            </el-menu-item>
            <el-menu-item index="/detection-object">
              <el-icon><Document /></el-icon>
              <template #title>检测对象</template>
            </el-menu-item>
            <el-menu-item index="/detection-item">
              <el-icon><Document /></el-icon>
              <template #title>检测项目</template>
            </el-menu-item>
            <el-menu-item index="/detection-param">
              <el-icon><Document /></el-icon>
              <template #title>检测参数</template>
            </el-menu-item>
            <el-menu-item index="/delegation-form-template">
              <el-icon><Document /></el-icon>
              <template #title>委托模板</template>
            </el-menu-item>
            <el-menu-item index="/user-management">
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item index="/role-management">
              <el-icon><Setting /></el-icon>
              <template #title>角色管理</template>
            </el-menu-item>
            <el-menu-item index="/permission-management">
              <el-icon><Setting /></el-icon>
              <template #title>权限管理</template>
            </el-menu-item>
            <el-menu-item index="/system-settings">
              <el-icon><Setting /></el-icon>
              <template #title>系统设置</template>
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>
      
      <!-- 主内容容器 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="header">
          <div class="header-content">
            <!-- 左侧菜单折叠按钮 -->
            <el-button 
              type="text" 
              @click="toggleMenuCollapse"
              class="menu-collapse-btn"
            >
              <el-icon>
                <Menu v-if="!isCollapse" />
                <CaretRight v-else />
              </el-icon>
            </el-button>
            
            <!-- 右侧功能区 -->
            <div class="header-right">
              <!-- 主题切换按钮 -->
              <div 
                class="dark-switch" 
                :class="{ 'is-checked': settingStore.isDark }" 
                @click="toggleDarkMode"
              >
                <span class="switch-core">
                  <div class="switch-action">
                    <el-icon v-if="!settingStore.isDark"><Sunny /></el-icon>
                    <el-icon v-if="settingStore.isDark"><Moon /></el-icon>
                  </div>
                </span>
              </div>
              
              <!-- 用户信息 -->
              <user-info />
            </div>
          </div>
        </el-header>
        
        <!-- 标签页 -->
        <el-tabs 
          v-model:active-name="route.path"
          class="tabs-container"
          type="card"
          @tab-click="handleTabClick"
          @tab-remove="handleTabRemove"
        >
          <el-tab-pane 
            v-for="tab in tabs" 
            :key="tab.path"
            :label="tab.title"
            :name="tab.path"
            :closable="tab.path !== '/'"
          >
          </el-tab-pane>
        </el-tabs>
        
        <!-- 主内容区域 -->
        <el-main class="main-content">
          <!-- 路由视图 -->
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 移动端侧边栏抽屉 -->
    <el-drawer
      v-if="globalStore.isMobile"
      v-model="drawerVisible"
      direction="ltr"
      size="230px"
      :with-header="false"
    >
      <div class="logo-container">
        <h1 class="logo">检测标准管理系统</h1>
      </div>
      <el-menu 
        :default-active="route.path"
        class="el-menu-vertical-demo"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        <el-menu-item index="/detection-standard">
          <el-icon><Document /></el-icon>
          <template #title>检评规范</template>
        </el-menu-item>
        <el-menu-item index="/delegation-form-template">
          <el-icon><Document /></el-icon>
          <template #title>委托单模板</template>
        </el-menu-item>
        <el-menu-item index="/category-management">
          <el-icon><Document /></el-icon>
          <template #title>分类管理</template>
        </el-menu-item>
        <el-menu-item index="/detection-group">
          <el-icon><Document /></el-icon>
          <template #title>检测项目组</template>
        </el-menu-item>
        <el-menu-item index="/detection-item">
          <el-icon><Document /></el-icon>
          <template #title>检测项目</template>
        </el-menu-item>
        <el-menu-item index="/detection-object">
          <el-icon><Document /></el-icon>
          <template #title>检测对象</template>
        </el-menu-item>
        <el-menu-item index="/field-guide">
          <el-icon><Document /></el-icon>
          <template #title>现场指南</template>
        </el-menu-item>
        <el-menu-item index="/user-management">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="/role-management">
          <el-icon><Setting /></el-icon>
          <template #title>角色管理</template>
        </el-menu-item>
        <el-menu-item index="/permission-management">
          <el-icon><Setting /></el-icon>
          <template #title>权限管理</template>
        </el-menu-item>
        <el-menu-item index="/system-settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useSettingStore } from '../stores/setting';
import { useGlobalStore } from '../stores/global';
import UserInfo from './UserInfo.vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  House, Document, User, Setting, 
  Menu, CaretRight, Sunny, Moon 
} from '@element-plus/icons-vue';

// 初始化 store
const settingStore = useSettingStore();
const globalStore = useGlobalStore();
const route = useRoute();
const router = useRouter();

// 响应式状态
const isCollapse = ref(false);
const drawerVisible = ref(false);
const activeTab = ref('/');
const tabs = ref([
  {
    path: '/',
    title: '首页'
  }
]);

// 计算属性
const menuWidth = computed(() => {
  return isCollapse.value ? '60px' : '230px';
});

// 主题样式计算属性，用于设置全局CSS变量
const themeStyles = computed(() => {
  const isDark = settingStore.isDark;
  
  return {
    // 全局颜色变量
    '--color-primary': '#409eff',
    '--color-success': '#67c23a',
    '--color-warning': '#e6a23c',
    '--color-danger': '#f56c6c',
    '--color-info': '#909399',
    
    // 背景色变量
    '--bg-primary': isDark ? '#1a1a1a' : '#ffffff',
    '--bg-secondary': isDark ? '#2a2a2a' : '#f5f7fa',
    '--bg-tertiary': isDark ? '#333333' : '#f0f2f5',
    
    // 文字颜色变量
    '--text-primary': isDark ? '#ffffff' : '#333333',
    '--text-secondary': isDark ? '#cccccc' : '#666666',
    '--text-tertiary': isDark ? '#999999' : '#909399',
    
    // 边框颜色变量
    '--border-color': isDark ? '#404040' : '#ebeef5',
    
    // 菜单相关变量
    '--menu-bg': isDark ? '#333842' : '#ffffff',
    '--menu-text': isDark ? '#ffffff' : '#333333',
    '--menu-active-text': isDark ? '#409eff' : '#409eff',
    
    // 表格相关变量
    '--table-header-bg': isDark ? '#2a2a2a' : '#f5f7fa',
    '--table-row-bg': isDark ? '#1a1a1a' : '#ffffff',
    '--table-row-hover-bg': isDark ? '#2a2a2a' : '#f5f7fa',
    '--table-row-stripe-bg': isDark ? '#1f1f1f' : '#fafafa',
    
    // 卡片相关变量
    '--card-bg': isDark ? '#2a2a2a' : '#ffffff',
    '--card-shadow': isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
    
    // 按钮相关变量
    '--btn-primary-bg': isDark ? '#409eff' : '#409eff',
    '--btn-danger-bg': isDark ? '#f56c6c' : '#f56c6c',
    
    // 输入框相关变量
    '--input-bg': isDark ? '#2a2a2a' : '#ffffff',
    '--input-text': isDark ? '#ffffff' : '#333333',
    '--input-border': isDark ? '#333333' : '#dcdfe6'
  };
});

// 方法
const toggleMenuCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

const toggleDarkMode = () => {
  settingStore.updateDarkMode(!settingStore.isDark);
};

// 处理菜单选中
const handleMenuSelect = (index) => {
  // 添加标签页
  const routeInfo = router.getRoutes().find(r => r.path === index);
  if (routeInfo && routeInfo.meta && routeInfo.meta.title) {
    const existingTab = tabs.value.find(tab => tab.path === index);
    if (!existingTab) {
      tabs.value.push({
        path: index,
        title: routeInfo.meta.title
      });
    }
  }
  // 直接导航，标签页active状态会自动更新
  router.push(index);
};

// 处理标签页点击
const handleTabClick = (tab) => {
  const path = tab.paneName;
  router.push(path);
};

// 处理标签页关闭
const handleTabRemove = (name) => {
  const index = tabs.value.findIndex(tab => tab.path === name);
  if (index > -1) {
    tabs.value.splice(index, 1);
  }
  
  // 如果关闭的是当前激活标签，切换到其他标签
  if (route.path === name) {
    const newActiveTab = tabs.value[index > 0 ? index - 1 : 0];
    router.push(newActiveTab.path);
  }
};

// 监听路由变化，添加标签页
watch(
  () => route.path,
  (newPath) => {
    // 添加标签页
    const routeInfo = router.getRoutes().find(r => r.path === newPath);
    if (routeInfo && routeInfo.meta && routeInfo.meta.title) {
      const existingTab = tabs.value.find(tab => tab.path === newPath);
      if (!existingTab) {
        tabs.value.push({
          path: newPath,
          title: routeInfo.meta.title
        });
      }
    }
  },
  { immediate: true }
);

// 生命周期钩子
onMounted(() => {
  // 初始化窗口宽度
  const updateWindowWidth = () => {
    globalStore.updateWindowWidth(window.innerWidth);
  };
  
  // 初始更新
  updateWindowWidth();
  
  // 监听窗口大小变化
  window.addEventListener('resize', updateWindowWidth);
  
  // 清理事件监听
  return () => {
    window.removeEventListener('resize', updateWindowWidth);
  };
});
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}

.layout-container.dark {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.layout {
  height: 100vh;
}

/* 左侧菜单 */
.aside {
  background-color: #333842;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 20px;
  border-bottom: 1px solid #404040;
}

.logo {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #3b82f6;
  transition: all 0.3s;
}

.logo.collapsed {
  font-size: 0;
  opacity: 0;
  overflow: hidden;
}

.logo-container {
  transition: all 0.3s;
  justify-content: center;
}

.aside-menu {
  height: calc(100% - 64px);
  overflow-y: auto;
}

/* 顶部导航栏 */
.header {
  background-color: var(--bg-primary);
  box-shadow: var(--card-shadow);
  height: 64px;
  padding: 0;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.layout-container.dark .header {
  background-color: var(--bg-primary);
  box-shadow: var(--card-shadow);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.menu-collapse-btn {
  font-size: 18px;
  margin-right: 10px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 主题切换按钮 */
.dark-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 20px;
  background-color: #dcdfe6;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.dark-switch.is-checked {
  background-color: #2a2a2a;
  border: 1px solid #404040;
}

.switch-core {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  transition: all 0.3s;
}

.switch-action {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: #ffffff;
  border-radius: 50%;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-switch.is-checked .switch-action {
  left: 22px;
  background-color: #ffffff;
}

.switch-action .el-icon {
  font-size: 12px;
  color: #333;
}

.dark-switch.is-checked .switch-action .el-icon {
  color: #333;
}

/* 主内容区域 */
.main-content {
  padding: 20px;
  background-color: var(--bg-secondary);
  transition: background-color 0.3s;
  overflow-y: auto;
}

/* 标签页样式 */
.tabs-container {
  margin: 0 20px 10px 20px;
  background-color: transparent;
}

/* 标签页样式 */
:deep(.el-tabs__item) {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-right-color: var(--border-color);
  margin-right: 0;
  border-radius: 4px 4px 0 0;
  font-weight: normal;
  padding: 8px 16px;
  transition: all 0.3s;
}

:deep(.el-tabs__item.is-active) {
  background-color: var(--bg-primary);
  color: var(--color-primary);
  border-color: var(--color-primary);
  border-bottom-color: var(--bg-primary);
  font-weight: bold;
  padding: 10px 18px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transform: translateY(-1px);
}

:deep(.el-tabs__item:hover) {
  color: var(--color-primary);
  background-color: var(--bg-tertiary);
}

:deep(.el-tabs__item.is-active:hover) {
  background-color: var(--bg-primary);
  color: var(--color-primary);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--color-primary);
  height: 3px;
}

:deep(.el-tabs__close-btn) {
  color: var(--text-tertiary);
  margin-left: 8px;
}

:deep(.el-tabs__item.is-active .el-tabs__close-btn) {
  color: var(--text-secondary);
}

:deep(.el-tabs__close-btn:hover) {
  color: var(--text-primary);
}

/* 深色主题下的标签页样式调整 */
.layout-container.dark :deep(.el-tabs__header) {
  background-color: transparent;
}

.layout-container.dark :deep(.el-tabs__nav-wrap) {
  background-color: transparent;
}

.layout-container.dark :deep(.el-tabs__nav) {
  background-color: transparent;
}

.layout-container.dark :deep(.el-tabs__nav-next),
.layout-container.dark :deep(.el-tabs__nav-prev) {
  color: var(--text-secondary);
}

.layout-container.dark :deep(.el-tabs__content) {
  background-color: transparent;
}

.layout-container.dark .main-content {
  background-color: var(--bg-primary);
}

/* Element Plus 组件样式覆盖 */
:deep(.el-menu-vertical-demo) {
  border-right: none;
}

:deep(.el-menu) {
  background-color: transparent;
  color: #ffffff;
}

:deep(.el-menu-item) {
  color: #ffffff;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.2);
  color: #409eff;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

.layout-container.dark :deep(.el-header) {
  background-color: #2a2a2a;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 10px;
  }
  
  .main-content {
    padding: 10px;
  }
}
</style>