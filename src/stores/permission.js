// src/stores/permission.js
// 权限状态管理

import { defineStore } from 'pinia';
import { permissionService } from '../services/permissionService';

// 定义权限状态存储
export const usePermissionStore = defineStore('permission', {
  // 状态
  state: () => ({
    // 权限列表
    permissionList: [],
    // 总权限数
    totalPermissions: 0,
    // 加载状态
    isLoading: false,
    // 错误信息
    error: null
  }),
  
  // 计算属性（getters）
  getters: {
    /**
     * 获取权限列表
     * @returns {Array} - 权限列表
     */
    getPermissionList: (state) => state.permissionList,
    
    /**
     * 获取总权限数
     * @returns {number} - 总权限数
     */
    getTotalPermissions: (state) => state.totalPermissions,
    
    /**
     * 获取加载状态
     * @returns {boolean} - 加载状态
     */
    getIsLoading: (state) => state.isLoading,
    
    /**
     * 获取错误信息
     * @returns {string|null} - 错误信息
     */
    getError: (state) => state.error
  },

  // 动作（actions）
  actions: {
    /**
     * 获取权限列表
     * @param {Object} params - 查询参数
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchPermissionList(params = {}) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的获取权限列表方法
        const result = await permissionService.getPermissionList(params);

        if (result.success) {
          // 获取成功，更新状态
          this.permissionList = result.data || [];
          this.totalPermissions = result.total || 0;
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取权限列表失败:', error);
        this.error = error.message || '获取权限列表失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 新增权限
     * @param {Object} data - 权限数据
     * @returns {Promise<boolean>} - 新增结果
     */
    async createPermission(data) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的新增权限方法
        const result = await permissionService.createPermission(data);

        if (result.success) {
          // 新增成功，更新权限列表
          this.permissionList.push(result.data);
          this.totalPermissions++;
          return true;
        } else {
          // 新增失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('新增权限失败:', error);
        this.error = error.message || '新增权限失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 更新权限
     * @param {number} permissionId - 权限ID
     * @param {Object} data - 权限数据
     * @returns {Promise<boolean>} - 更新结果
     */
    async updatePermission(permissionId, data) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的更新权限方法
        const result = await permissionService.updatePermission(permissionId, data);

        if (result.success) {
          // 更新成功，更新本地权限列表
          const index = this.permissionList.findIndex(permission => permission.id === permissionId);
          if (index > -1) {
            this.permissionList[index] = { ...this.permissionList[index], ...data };
          }
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新权限失败:', error);
        this.error = error.message || '更新权限失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 删除权限
     * @param {number} permissionId - 权限ID
     * @returns {Promise<boolean>} - 删除结果
     */
    async deletePermission(permissionId) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的删除权限方法
        const result = await permissionService.deletePermission(permissionId);

        if (result.success) {
          // 删除成功，更新本地权限列表
          this.permissionList = this.permissionList.filter(permission => permission.id !== permissionId);
          this.totalPermissions--;
          return true;
        } else {
          // 删除失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('删除权限失败:', error);
        this.error = error.message || '删除权限失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 启用/禁用权限
     * @param {number} permissionId - 权限ID
     * @param {boolean} status - 状态
     * @returns {Promise<boolean>} - 操作结果
     */
    async togglePermissionStatus(permissionId, status) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的启用/禁用权限方法
        const result = await permissionService.togglePermissionStatus(permissionId, status);

        if (result.success) {
          // 操作成功，更新本地权限列表
          const index = this.permissionList.findIndex(permission => permission.id === permissionId);
          if (index > -1) {
            this.permissionList[index].is_active = status;
          }
          return true;
        } else {
          // 操作失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('操作权限状态失败:', error);
        this.error = error.message || '操作权限状态失败，请稍后重试';
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
     * 重置状态
     */
    resetState() {
      this.permissionList = [];
      this.totalPermissions = 0;
      this.isLoading = false;
      this.error = null;
    }
  }
});