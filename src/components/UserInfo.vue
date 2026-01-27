<template>
  <div class="user-info-container">
    <!-- 已登录状态 -->
    <el-dropdown v-if="isLoggedIn" trigger="hover" class="user-dropdown">
      <span class="el-dropdown-link">
        <span class="user-name">
          {{ userInfo?.name || userInfo?.username || '未知用户' }}
        </span>
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item disabled>
            <div class="dropdown-item-content">
              <div class="dropdown-user-info">
                <div class="dropdown-user-field">
                  <span class="field-label">姓名：</span>
                  <span class="field-value">{{ userInfo?.name || userInfo?.username || '未知用户' }}</span>
                </div>
                <div class="dropdown-user-field" v-if="userInfo?.username">
                  <span class="field-label">账号：</span>
                  <span class="field-value">{{ userInfo.username }}</span>
                </div>
              </div>
            </div>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <el-icon><Setting /></el-icon>
            <span>个人设置</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 未登录状态 -->
    <el-button v-else type="primary" @click="handleLogin" class="login-btn">
      <el-icon><User /></el-icon>
      <span>登录</span>
    </el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useSettingStore } from '../stores/setting';
import { ElMessage } from 'element-plus';
import { ArrowDown, Setting, User, SwitchButton } from '@element-plus/icons-vue';

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取路由实例
const router = useRouter();

// 获取用户认证状态存储
const userStore = useAuthStore();

// 计算属性
const isLoggedIn = computed(() => userStore.getIsLoggedIn);
const userInfo = computed(() => userStore.getUserInfo);

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

// 处理登录
const handleLogin = () => {
  router.push('/login');
};

// 处理退出登录
const handleLogout = async () => {
  try {
    await userStore.logout();
    ElMessage.success('退出登录成功');
    router.push('/login');
  } catch (error) {
    console.error('退出登录失败:', error);
    ElMessage.error(error.message || '退出登录失败，请稍后重试');
  }
};
</script>

<style scoped>
.user-info-container {
  display: flex;
  align-items: center;
}

/* 已登录状态样式 */
.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: transparent;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  color: var(--text-primary);
  white-space: nowrap;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-primary);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
}

.el-icon--right {
  font-size: 12px;
  color: var(--text-primary);
  margin-left: 2px;
}

/* 下拉菜单样式 */
.dropdown-item-content {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.dropdown-user-field {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.field-label {
  color: var(--text-secondary);
  font-weight: normal;
}

.field-value {
  color: var(--text-primary);
  font-weight: normal;
}

/* 未登录状态样式 */
.login-btn {
  display: flex;
  align-items: center;
}

/* 深色模式下的样式调整 */
:deep(.layout-container.dark) .user-dropdown {
  color: var(--text-primary);
}

:deep(.layout-container.dark) .login-btn {
  --el-button-primary-bg-color: var(--color-primary);
  --el-button-primary-border-color: var(--color-primary);
  --el-button-primary-hover-bg-color: var(--color-primary);
  --el-button-primary-hover-border-color: var(--color-primary);
  --el-button-primary-active-bg-color: var(--color-primary);
  --el-button-primary-active-border-color: var(--color-primary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-name {
    display: none;
  }
}
</style>