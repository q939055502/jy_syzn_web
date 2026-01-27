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
  
  return apiClient.post('/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

// 刷新令牌 API
export const refreshToken = (refreshToken) => {
  // 发送包含 refresh_token 字段的 JSON 对象
  return apiClient.post('/auth/refresh', {
    refresh_token: refreshToken
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// 获取用户信息 API
export const getUserInfo = () => {
  return apiClient.get('/auth/me');
};

// 登出 API
export const logout = () => {
  return apiClient.post('/auth/logout');
};

// 检查登录状态 API
export const checkLoginStatus = () => {
  // 从本地存储获取 token
  const token = localStorage.getItem('token');
  return new Promise((resolve) => {
    resolve(!!token);
  });
};

