<template>
  <div class="login-container">
    <!-- <star-sky class="star-sky"></star-sky> -->


    <form class="login-form" @submit.prevent="handleLogin">
      <h2 class="form-title">后台管理系统</h2>
      
      <!-- 错误信息提示 -->
      <!-- <el-alert v-if="error" type="error" :message="error" show-icon class="error-alert" /> -->
      
      <div class="form-group">
        <label class="input-label">用户名</label>
        <el-input v-model="username" placeholder="请输入用户名" class="el-input-custom" />
      </div>
      <div class="form-group">
        <label class="input-label">密&#12288;码</label>
        <!-- 使用 Element Plus 的 el-input 组件，并启用 show-password 属性 -->
        <el-input v-model="password" type="password" placeholder="请输入密码" show-password class="el-input-custom" />
      </div>
      <el-button type="primary" native-type="submit" :loading="isLoading" class="login-btn">登录</el-button>
    </form>
  </div>
</template>

<style scoped>
/* 自定义 Element Plus 输入框样式 */
.el-input-custom {
  width: 75%;
  margin-left: 10px;
}

/* 确保眼睛图标始终显示 */
:deep(.el-input__suffix) {
  pointer-events: auto;
  opacity: 1;
  transition: none;
}

:deep(.el-input__suffix-inner) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 确保输入框背景和文字颜色正确 */
:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
}

:deep(.el-input__inner) {
  color: white;
  background-color: transparent;
  border: none;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

/* 错误信息样式 */
.error-alert {
  margin-bottom: 20px;
}

/* 登录按钮样式 */
.login-btn {
  width: 100%;
}
</style>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../../stores/auth';
// Element Plus组件由unplugin-vue-components插件自动导入

// 获取路由实例
const router = useRouter();

// 获取用户认证状态存储
const userStore = useAuthStore();

// 定义响应式变量
const username = ref('');
const password = ref('');

// 从 store 获取状态
const isLoading = computed(() => userStore.getIsLoading);
const error = computed(() => userStore.getError);

// 处理登录
const handleLogin = async () => {
  try {
    // 准备登录表单数据
    const loginForm = {
      username: username.value,
      password: password.value
    };

    // 调用 store 的 login 方法处理登录
    const loginSuccess = await userStore.login(loginForm);
    if (loginSuccess) {
      // 登录成功，跳转到首页
      ElMessage.success('登录成功');
      router.push('/');
    } else {
      // 登录失败，清空密码
      ElMessage.error(error.value);
      password.value = '';
      // 显示错误信息（store 中已设置 error）
    }
  } catch (error) {
    password.value = ''; // 清空密码
    ElMessage.error('登录异常，请稍后重试: ' + (error.message || '未知错误'));
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}



/* 添加媒体查询，优化移动设备显示 */
@media (max-width: 768px) {
  .login-form {
    width: 90%;
    max-width: 350px;
    padding: 20px;
  }
  
  .form-input {
    width: 100%;
    margin-left: 0;
  }
}

.login-form {
  width: 350px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  color: white;
}

.form-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.form-input {
  width: 75%;
  padding: 12px 15px;
  border: none;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;
  box-sizing: border-box;
  margin-left: 10px;
}

.input-label {
  color: white;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
  width: 20%;
  text-align: right;
  margin-right: 10px;
}

/* 针对移动设备的响应式调整 */
@media (max-width: 768px) {
  .form-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .input-label {
    width: 100%;
    text-align: left;
    margin-right: 0;
    margin-bottom: 5px;
  }
  
  .form-input {
    width: 100%;
    margin-left: 0;
  }
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #2563eb;
}

.register-btn {
  margin-top: 15px;
  background-color: rgba(59, 130, 246, 0.7);
}

.register-btn:hover {
  background-color: rgba(37, 99, 235, 0.9);
}

.register-account {
  text-align: left;
  margin-top: 15px;
  float: left;
}

.form-group {
  margin-bottom: 20px;
}

body {
  margin: 0;
  padding: 0;
}

</style>