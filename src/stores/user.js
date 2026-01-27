// src/stores/user.js
// 用户状态管理

import { defineStore } from 'pinia';
import { userService } from '../services/userService';

// 定义用户状态存储
export const useUserStore = defineStore('user', {
  // 状态
  state: () => ({
    // 用户信息
    userInfo: null,
    // 登录状态：根据 token 是否存在来判断登录状态
    isLoggedIn: !!localStorage.getItem('token'),
    // 加载状态
    isLoading: false,
    // 错误信息
    error: null,
    // token
    token: localStorage.getItem('token') || '',
    // refreshToken
    refreshToken: localStorage.getItem('refreshToken') || '',
    // 用户列表
    userList: [],
    // 总用户数
    totalUsers: 0,
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 10
    },
    // 用户列表加载状态
    isUserListLoading: false
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
    getToken: (state) => state.token,
    
    /**
     * 获取 refreshToken
     * @returns {string} - refreshToken
     */
    getRefreshToken: (state) => state.refreshToken,
    
    /**
     * 获取用户列表
     * @returns {Array} - 用户列表
     */
    users: (state) => state.userList,
    
    /**
     * 获取总用户数
     * @returns {number} - 总用户数
     */
    getTotalUsers: (state) => state.totalUsers,
    
    /**
     * 获取分页信息
     * @returns {Object} - 分页信息
     */
    getPagination: (state) => state.pagination,
    
    /**
     * 获取用户列表加载状态
     * @returns {boolean} - 用户列表加载状态
     */
    getIsUserListLoading: (state) => state.isUserListLoading,
    
    /**
     * 判断用户是否是管理员
     * @returns {boolean} - 是否是管理员
     */
    isAdmin: (state) => {
      // 检查用户信息中是否有 is_admin 字段，或者 roles 中是否包含 admin
      if (!state.userInfo) return false;
      return state.userInfo.is_admin || (state.userInfo.roles && state.userInfo.roles.includes('admin'));
    }
  },

  // 动作（actions）
  actions: {
    /**
     * 登录
     * @param {Object} loginForm - 登录表单数据
     * @returns {Promise<boolean>} - 登录结果
     */
    async login(loginForm) {
    // 设置加载状态
    this.isLoading = true;
    // 清除错误信息
    this.error = null;

    try {
      // 调用 Service 层的登录方法
      const result = await userService.login(loginForm);

      if (result.success) {
        // 登录成功，保存 token 和 refreshToken
        const token = result.data.token;
        const refreshToken = result.data.refreshToken;
        
        this.token = token;
        this.refreshToken = refreshToken;
        
        // 将 token 和 refreshToken 保存到本地存储
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        // 直接使用后端返回的用户信息，无需额外请求
        this.userInfo = result.data.user;
        this.isLoggedIn = true;
        
        return true;
      } else {
        // 登录失败，更新错误信息
        this.error = result.message;
        return false;
      }
    } catch (error) {
      // 处理异常，更新错误信息
      console.error('登录请求失败:', error.message);
      this.error = error.message || '登录失败，请稍后重试';
      return false;
    } finally {
      // 重置加载状态
      this.isLoading = false;
    }
  },

    /**
     * 刷新令牌
     * @returns {Promise<boolean>} - 刷新结果
     */
    async refreshToken() {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的刷新令牌方法
        const result = await userService.refreshToken(this.refreshToken);

        if (result.success) {
          // 刷新成功，更新 token 和 refreshToken（实现令牌轮转）
          const token = result.data.token;
          const refreshToken = result.data.refreshToken;
          
          this.token = token;
          this.refreshToken = refreshToken;
          
          // 将 token 和 refreshToken 保存到本地存储（令牌轮转）
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          
          return true;
        } else {
          // 刷新失败，清除本地状态
          this.userInfo = null;
          this.token = '';
          this.refreshToken = '';
          this.isLoggedIn = false;
          
          // 清除本地存储中的 token 和 refreshToken
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          return false;
        }
      } catch (error) {
        // 处理异常，清除本地状态
        console.error('刷新令牌失败:', error.message);
        this.userInfo = null;
        this.token = '';
        this.refreshToken = '';
        this.isLoggedIn = false;
        
        // 清除本地存储中的 token 和 refreshToken
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 获取用户信息
     * @returns {Promise<Object|null>} - 用户信息
     */
    async fetchUserInfo() {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的获取用户信息方法
        const result = await userService.getUserInfo();

        if (result.success) {
          // 获取成功，更新状态
          this.userInfo = result.data;
          this.isLoggedIn = true;
          
          return result.data;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return null;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        this.error = error.message || '获取用户信息失败，请稍后重试';
        return null;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 登出
     * @returns {Promise<boolean>} - 登出结果
     */
    async logout() {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的登出方法
        const result = await userService.logout();

        // 无论登出请求是否成功，都清除本地状态
        this.userInfo = null;
        this.token = '';
        this.refreshToken = '';
        this.isLoggedIn = false;
        
        // 清除本地存储中的 token 和 refreshToken
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        return result.success;
      } catch (error) {
        // 处理异常，更新错误信息
        this.error = error.message || '登出失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 检查登录状态
     * @returns {Promise<boolean>} - 登录状态
     */
    async checkLoginStatus() {
      // 如果已有 token，直接返回登录状态
      if (this.token) {
        return this.isLoggedIn;
      }

      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的检查登录状态方法
        const isLoggedIn = await userService.checkLoginStatus();
        
        // 更新登录状态
        this.isLoggedIn = isLoggedIn;
        
        return isLoggedIn;
      } catch (error) {
        // 处理异常，更新错误信息
        this.error = error.message || '检查登录状态失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 清除错误信息
     */
    clearError() {
      this.error = null;
    },

    /**
     * 获取用户列表
     * @param {Object} params - 查询参数
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchUserList(params = {}) {
      // 设置加载状态
      this.isUserListLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 构建查询参数，合并分页信息
        const queryParams = {
          page: this.pagination.currentPage,
          limit: this.pagination.pageSize,
          ...params
        };

        // 调用 Service 层的获取用户列表方法
        const result = await userService.getUserList(queryParams);

        if (result.success) {
          // 获取成功，更新状态
          this.userList = result.data || [];
          this.totalUsers = result.total || 0;
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取用户列表失败:', error.message);
        this.error = error.message || '获取用户列表失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isUserListLoading = false;
      }
    },

    /**
     * 更新分页信息
     * @param {Object} pagination - 分页信息
     */
    updatePagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination };
      // 重新获取用户列表
      this.fetchUserList();
    },

    /**
     * 更新用户状态
     * @param {number} userId - 用户ID
     * @param {boolean} status - 用户状态
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateUserStatus(userId, status) {
      try {
        // 调用 Service 层的更新用户状态方法
        const result = await userService.updateUserStatus(userId, status);

        if (result.success) {
          // 更新成功，更新本地用户列表
          const index = this.userList.findIndex(user => user.id === userId);
          if (index > -1) {
            this.userList[index].is_active = status;
          }
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新用户状态失败:', error.message);
        this.error = error.message || '更新用户状态失败，请稍后重试';
        return false;
      }
    },

    /**
     * 删除用户
     * @param {number} userId - 用户ID
     * @returns {Promise<boolean>} - 删除结果
     */
    async deleteUser(userId) {
      try {
        // 调用 Service 层的删除用户方法
        const result = await userService.deleteUser(userId);

        if (result.success) {
          // 删除成功，更新本地用户列表
          this.userList = this.userList.filter(user => user.id !== userId);
          this.totalUsers--;
          return true;
        } else {
          // 删除失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('删除用户失败:', error.message);
        this.error = error.message || '删除用户失败，请稍后重试';
        return false;
      }
    },

    /**
     * 批量删除用户
     * @param {Array} userIds - 用户ID数组
     * @returns {Promise<boolean>} - 删除结果
     */
    async batchDeleteUsers(userIds) {
      try {
        // 批量删除，逐个调用删除方法
        const results = await Promise.all(userIds.map(userId => this.deleteUser(userId)));
        // 检查是否所有删除都成功
        return results.every(result => result);
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('批量删除用户失败:', error.message);
        this.error = error.message || '批量删除用户失败，请稍后重试';
        return false;
      }
    },

    /**
     * 重置用户列表状态
     */
    resetUserListState() {
      this.userList = [];
      this.totalUsers = 0;
      this.pagination = {
        currentPage: 1,
        pageSize: 10
      };
      this.isUserListLoading = false;
      this.error = null;
    }
  }
});
