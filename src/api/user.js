// src/api/user.js
// 用户相关 API

// 导入配置好的 axios 实例
import apiClient from './apiClient';

// 登录 API - 获取 Token
export const login = (params) => {
  // 使用 application/x-www-form-urlencoded 格式传递数据
  const formData = new URLSearchParams();
  formData.append('username', params.username);
  formData.append('password', params.password);
  
  return apiClient.post('/auth/token', formData);
};

// 刷新令牌 API
export const refreshToken = () => {
  // 发送空对象，refresh_token 由后端从 Cookie 中获取
  return apiClient.post('/auth/refresh', {});
};

// 获取用户信息 API
export const getUserInfo = () => {
  return apiClient.get('/auth/me');
};

// 登出 API
export const logout = () => {
  return apiClient.post('/auth/logout');
};

