<template>
  <div class="login-container">
    
    <star-sky class="star-sky"></star-sky>
    <login-form key="login"></login-form>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import StarSky from '../../components/StarSky.vue'; // 背景组件
import LoginForm from './LoginForm.vue'; // 导入登录表单组件


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



.star-sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

/* 添加媒体查询，优化移动设备显示 */
@media (max-width: 768px) {
  .login-form {
    width: 90%;
    max-width: 350px;
    padding: 20px;
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
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: none;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;
  box-sizing: border-box;
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

.register-account {
  text-align: left;
  margin-top: 15px;
  float: left;
}

.form-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 15px;
}

.remember-me {
  text-align: left;
  margin: 0;
}

.forgot-password {
  text-align: right;
  margin: 0;
}

.forgot-password a {
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.forgot-password a:hover {
  color: white;
  text-decoration: underline;
}

body {
  margin: 0;
  padding: 0;
}

/* 过渡动画样式 */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

.login-form {
  /* 确保表单有固定宽度，以便动画正常工作 */
  width: 350px;
  /* 添加定位，使动画效果更平滑 */
  position: relative;
  z-index: 1;
}
</style>