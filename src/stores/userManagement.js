// src/stores/userManagement.js
// 用户管理状态管理

import { defineStore } from 'pinia';
import { userManagementService } from '../services/userManagementService';

// 定义用户管理状态存储
export const useUserManagementStore = defineStore('userManagement', {
  // 状态
  state: () => ({
    // 用户列表
    userList: [],
    // 总用户数
    totalUsers: 0,
    // 分页信息
    pagination: {
      currentPage: 1,
      pageSize: 1000
    },
    // 加载状态
    isLoading: false,
    // 删除加载状态
    isDeleting: false,
    // 错误信息
    error: null
  }),
  
  // 计算属性（getters）
  getters: {
    /**
     * 获取用户列表
     * @returns {Array} - 用户列表
     */
    getUserList: (state) => state.userList,
    
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
     * 获取删除加载状态
     * @returns {boolean} - 删除加载状态
     */
    getIsDeleting: (state) => state.isDeleting
  },

  // 动作（actions）
  actions: {
    /**
     * 获取用户列表
     * @param {Object} params - 查询参数
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchUserList(params = {}) {
      // 设置加载状态
      this.isLoading = true;
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
        const result = await userManagementService.getUserList(queryParams);

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
        this.isLoading = false;
      }
    },

    /**
     * 检查用户名是否存在
     * @param {string} username - 用户名
     * @returns {Promise<Object>} - 检查结果
     */
    async checkUsernameExists(username) {
      try {
        // 调用 Service 层的检查用户名是否存在方法
        const result = await userManagementService.checkUsernameExists(username);
        return result;
      } catch (error) {
        // 处理异常，返回错误信息
        console.error('检查用户名失败:', error.message);
        return {
          success: false,
          message: error.message || '检查用户名失败，请稍后重试'
        };
      }
    },

    /**
     * 创建用户
     * @param {Object} userData - 用户数据
     * @returns {Promise<boolean>} - 创建结果
     */
    async createUser(userData) {
      try {
        // 调用 Service 层的创建用户方法
        const result = await userManagementService.createUser(userData);

        if (result.success) {
          // 创建成功，重新获取用户列表
          await this.fetchUserList();
          return true;
        } else {
          // 创建失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('创建用户失败:', error.message);
        this.error = error.message || '创建用户失败，请稍后重试';
        return false;
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
        const result = await userManagementService.updateUserStatus(userId, status);

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
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 调用 Service 层的删除用户方法
        const result = await userManagementService.deleteUser(userId);

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
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 批量删除用户
     * @param {Array} userIds - 用户ID数组
     * @returns {Promise<boolean>} - 删除结果
     */
    async batchDeleteUsers(userIds) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 清除之前的错误信息
        this.error = null;
        
        // 记录成功删除的数量
        let successCount = 0;
        
        // 逐个删除用户，失败时继续处理其他用户
        for (const userId of userIds) {
          const result = await userManagementService.deleteUser(userId);
          if (result.success) {
            // 删除成功，更新本地用户列表
            this.userList = this.userList.filter(user => user.id !== userId);
            successCount++;
          }
        }
        
        // 更新总用户数
        this.totalUsers -= successCount;
        
        // 返回删除结果
        return successCount > 0;
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('批量删除用户失败:', error.message);
        this.error = error.message || '批量删除用户失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
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
      this.isLoading = false;
      this.error = null;
    },

    /**
     * 清除错误信息
     */
    clearError() {
      this.error = null;
    }
  }
});
