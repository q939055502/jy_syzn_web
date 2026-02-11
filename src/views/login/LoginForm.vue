<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="handleLogin">
      <h2 class="form-title">后台管理</h2>
      
      <div class="form-group">
        <label class="input-label">用户名</label>
        <el-input v-model="username" placeholder="请输入用户名" class="el-input-custom" />
      </div>
      <div class="form-group">
        <label class="input-label">密&#12288;码</label>
        <el-input v-model="password" type="password" placeholder="请输入密码" show-password class="el-input-custom" />
      </div>
      <el-button type="primary" native-type="submit" :loading="isLoading" class="login-btn">登录</el-button>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
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
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(64, 158, 255, 0.5);
  letter-spacing: 2px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-label {
  color: white;
  font-size: 14px;
  font-weight: 500;
  width: 20%;
  text-align: right;
  margin-right: 10px;
}

.el-input-custom {
  width: 75%;
}

/* 确保输入框背景和文字颜色正确 */
:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
}

:deep(.el-input__inner) {
  color: white;
  background-color: transparent;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

.login-btn {
  width: 100%;
}

/* 针对移动设备的响应式调整 */
@media (max-width: 768px) {
  .login-form {
    width: 90%;
    max-width: 350px;
    padding: 20px;
  }
  
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
  
  .el-input-custom {
    width: 100%;
  }
}
</style>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../../stores/auth';

// 获取路由实例
const router = useRouter();

// 获取用户认证状态存储
const authStore = useAuthStore();

// 定义响应式变量
const username = ref('');
const password = ref('');

// 从 store 获取状态
const isLoading = computed(() => authStore.getIsLoading);
const error = computed(() => authStore.getError);

// 处理登录
const handleLogin = async () => {
  try {
    // 准备登录表单数据
    const loginForm = {
      username: username.value,
      password: password.value
    };

    
    // 调用 store 的 login 方法处理登录
    const loginSuccess = await authStore.login(loginForm);
    if (loginSuccess) {
      // 登录成功，跳转到首页
      ElMessage.success('登录成功');
      router.push('/');
    } else {
      // 登录失败，清空密码
      ElMessage.error(error.value);
      password.value = '';
    }
  } catch (error) {
    password.value = ''; // 清空密码
    ElMessage.error('登录异常，请稍后重试: ' + (error.message || '未知错误'));
  }
};
</script>