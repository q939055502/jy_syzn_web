// src/stores/auth.js
// 用户认证状态管理

import { defineStore } from 'pinia';
import { authService } from '../services/authService';
import { getTokenRemainingTime } from '../utils/jwt';

// 定义用户认证状态存储
export const useAuthStore = defineStore('auth', {
  // 状态
  state: () => ({
    // 用户信息
    userInfo: null,
    // 登录状态
    isLoggedIn: false,
    // 加载状态
    isLoading: false,
    // 错误信息
    error: null,
    // token
    token: '',
    // 令牌刷新定时器
    refreshTimer: null,
    // 无操作超时定时器
    inactivityTimer: null,
    // 无操作超时时间（秒），默认15分钟
    inactivityTimeout: 15 * 60
  }),
  
  // 计算属性（getters）
  getters: {
    /**
     * 获取用户信息
     * @returns {Object|null} - 用户信息
     */
    getUserInfo: (state) => state.userInfo,

    /**
     * 获取登录状态
     * @returns {boolean} - 登录状态
     */
    getIsLoggedIn: (state) => state.isLoggedIn,

    /**
     * 获取加载状态
     * @returns {boolean} - 加载状态
     */
    getIsLoading: (state) => state.isLoading,

    /**
     * 获取错误信息
     * @returns {string|null} - 错误信息
     */
    getError: (state) => state.error,

    /**
     * 获取 token
     * @returns {string} - token
     */
    getToken: (state) => state.token
  },

  // 动作（actions）
  actions: {
    /**
     * 登录
     * @param {Object} loginForm - 登录表单数据
     * @returns {Promise<boolean>} - 登录结果
     */
    async login(loginForm) {
      this.isLoading = true;
      this.error = null;

      try {
        // 调用 Service 层的登录方法
        const result = await authService.login(loginForm);

        if (result.success) {
          // 登录成功，保存 token
          this.token = result.data.token;
          this.isLoggedIn = true;
          
          // 自动获取用户信息
          await this.fetchUserInfo();
          
          // 设置令牌刷新定时器和无操作超时计时器
          this.setRefreshTimer();
          this.setInactivityTimer();
          
          return true;
        } else {
          // 登录失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        this.error = error.message || '登录失败，请稍后重试';
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 获取用户信息
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchUserInfo() {
      try {
        const result = await authService.getUserInfo();
        if (result.success) {
          this.userInfo = result.data;
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },

    /**
     * 刷新令牌
     * @returns {Promise<boolean>} - 刷新结果
     */
    async refreshToken() {
      if (!this.token) return false;

      try {
        // 调用 Service 层的刷新令牌方法
        const result = await authService.refreshToken();

        if (result.success) {
          // 刷新成功，更新 token
          this.token = result.data.token;
          // 重置无操作计时器
          this.setInactivityTimer();
          return true;
        } else {
          // 刷新失败，清除本地状态
          this.clearAuthState();
          return false;
        }
      } catch (error) {
        // 处理异常，清除本地状态
        this.clearAuthState();
        return false;
      }
    },

    /**
     * 登出
     * @returns {Promise<boolean>} - 登出结果
     */
    async logout() {
      this.isLoading = true;
      this.error = null;

      try {
        // 调用 Service 层的登出方法
        await authService.logout();
      } catch (error) {
        // 处理异常，更新错误信息
        this.error = error.message || '登出失败，请稍后重试';
      } finally {
        // 无论登出请求是否成功，都清除本地状态
        this.clearAuthState();
        this.isLoading = false;
      }
      
      return true;
    },

    /**
     * 清除认证状态
     */
    clearAuthState() {
      this.userInfo = null;
      this.token = '';
      this.isLoggedIn = false;
      this.clearRefreshTimer();
      this.clearInactivityTimer();
    },

    /**
     * 清除令牌刷新定时器
     */
    clearRefreshTimer() {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    },

    /**
     * 设置无操作超时计时器
     */
    setInactivityTimer() {
      // 清除现有的无操作计时器
      this.clearInactivityTimer();
      
      // 如果没有登录，不设置计时器
      if (!this.isLoggedIn) return;
      
      // 设置无操作超时计时器
      this.inactivityTimer = setTimeout(() => {
        this.clearAuthState();
        // 跳转到登录页
        window.location.href = '/login';
      }, this.inactivityTimeout * 1000);
    },

    /**
     * 重置无操作超时计时器
     */
    resetInactivityTimer() {
      if (this.isLoggedIn) {
        this.setInactivityTimer();
      }
    },

    /**
     * 清除无操作超时计时器
     */
    clearInactivityTimer() {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
        this.inactivityTimer = null;
      }
    },

    /**
     * 设置令牌刷新定时器
     * @param {number} threshold - 提前刷新阈值（秒），默认 180 秒
     */
    setRefreshTimer(threshold = 180) {
      // 清除现有的定时器
      this.clearRefreshTimer();
      
      // 如果没有令牌，不设置定时器
      if (!this.token) return;
      
      // 计算令牌剩余过期时间
      const remainingTime = getTokenRemainingTime(this.token);
      if (remainingTime === null) {
        // 解析失败，按过期处理
        this.clearAuthState();
        return;
      }
      
      // 计算需要提前多久刷新
      const refreshTime = remainingTime - threshold;
      
      if (refreshTime > 0) {
        // 设置定时器，在令牌即将过期时自动刷新
        this.refreshTimer = setTimeout(async () => {
          const success = await this.refreshToken();
          // 刷新成功后，重新设置定时器
          if (success && this.token) {
            this.setRefreshTimer(threshold);
          }
        }, refreshTime * 1000);
      } else {
        // 令牌已经快过期，立即刷新
        this.refreshToken();
      }
    },

    /**
     * 清除错误信息
     */
    clearError() {
      this.error = null;
    }
  }
});
