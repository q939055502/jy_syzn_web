// src/api/interceptors/response.js
// 响应拦截器配置

import apiClient from '../apiClient';
import { useAuthStore } from '../../stores/auth';

// 令牌刷新状态管理
let isRefreshing = false;
// 存储等待令牌刷新的请求队列
let refreshSubscribers = [];

/**
 * 将请求添加到等待队列
 * @param {Function} callback - 刷新成功后的回调函数
 */
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * 通知所有等待的请求，令牌已刷新
 * @param {string} newToken - 新的访问令牌
 */
const notifyRefreshSubscribers = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
};

/**
 * 清除认证状态
 */
const clearAuthState = () => {
  const authStore = useAuthStore();
  authStore.clearAuthState();
};

/**
 * 响应拦截器
 * @param {Object} response - axios 响应对象
 * @returns {Object} - 直接返回后端响应数据
 */
export const responseInterceptor = (response) => {
  // 直接返回后端原始数据，让 service 层处理
  return response.data;
};

/**
 * 响应拦截器错误处理
 * @param {Object} error - 响应错误对象
 * @returns {Promise} - 拒绝的 Promise，包含处理后的错误信息
 */
export const responseInterceptorError = async (error) => {

  
  // 401 错误特殊处理：尝试刷新令牌
  if (error.response && error.response.status === 401) {
    const originalRequest = error.config;
    
    // 检查是否是刷新令牌的请求
    const isRefreshTokenRequest = originalRequest.url.includes('/auth/refresh') && originalRequest.method === 'post';
    
    if (!isRefreshTokenRequest) {
      // 如果不是刷新令牌的请求，尝试刷新令牌
      if (!isRefreshing) {
        // 标记开始刷新
        isRefreshing = true;
        
        try {
          // 刷新令牌
          const authStore = useAuthStore();
          const success = await authStore.refreshToken();
          
          if (success) {
            // 刷新成功，获取新令牌
            const newToken = authStore.token;
            
            // 更新 apiClient 默认请求头
            apiClient.defaults.headers['Authorization'] = `Bearer ${newToken}`;
            
            // 重新设置原始请求的 Authorization 头
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            
            // 通知所有等待的请求，令牌已刷新
            notifyRefreshSubscribers(newToken);
            
            // 重置刷新状态
            isRefreshing = false;
            
            // 重新发送当前请求
            return apiClient(originalRequest);
          } else {
            throw new Error('刷新令牌失败');
          }
        } catch (refreshError) {
          // 刷新失败，重置状态
          isRefreshing = false;
          // 通知所有等待的请求，刷新失败
          notifyRefreshSubscribers(null);
          // 清除认证状态
          clearAuthState();
          // 终止后续错误处理
          return Promise.reject(refreshError);
        }
      } else {
        // 正在刷新令牌，将当前请求添加到等待队列
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (newToken) {
              // 令牌刷新成功，更新请求头并重试
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            } else {
              // 令牌刷新失败，拒绝 Promise
              reject(error);
            }
          });
        });
      }
    } else {
      // 刷新令牌的请求失败，清除认证状态
      clearAuthState();
      // 终止后续错误处理
      return Promise.reject(error);
    }
  }
  
  // 提取后端返回的具体错误信息
  let errorMessage = error.message;
  
  // 检查是否有响应数据
  if (error.response && error.response.data) {
    const responseData = error.response.data;
    // 检查是否有后端返回的错误信息
    if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.detail) {
      errorMessage = responseData.detail;
    } else if (typeof responseData === 'string') {
      errorMessage = responseData;
    }
    
    // 将后端返回的具体错误信息添加到 error 对象中
    error.responseData = responseData;
    error.message = errorMessage;
  }
  
  // 抛出包含具体错误信息的错误对象
  return Promise.reject(error);
};
