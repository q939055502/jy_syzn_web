// src/api/interceptors/request.js
// 请求拦截器配置

import { useAuthStore } from '../../stores/auth';

/**
 * 请求拦截器
 * @param {Object} config - axios 请求配置对象
 * @returns {Object} - 处理后的请求配置
 */
export const requestInterceptor = (config) => {
  // 从 Pinia 获取 token
  const authStore = useAuthStore();
  const token = authStore.token;
  

  
  // 不为刷新令牌请求添加 Authorization 头
  if (token && !config.url.includes('/auth/refresh')) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};

/**
 * 请求拦截器错误处理
 * @param {Object} error - 请求错误对象
 * @returns {Promise} - 被拒绝的 Promise
 */
export const requestInterceptorError = (error) => {
  return Promise.reject(error);
};
