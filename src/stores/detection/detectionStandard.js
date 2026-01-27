// src/stores/detectionStandard.js
// 检评规范状态管理

import { defineStore } from 'pinia';
import { detectionStandardService } from '../../services/detection/detectionStandardService';

// 定义检评规范状态存储
export const useDetectionStandardStore = defineStore('detectionStandard', {
  // 状态
  state: () => ({
    // 检评规范列表
    standardList: [],
    // 总检评规范数
    totalStandards: 0,
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
     * 获取检评规范列表
     * @returns {Array} - 检评规范列表
     */
    getStandardList: (state) => state.standardList,
    
    /**
     * 获取总检评规范数
     * @returns {number} - 总检评规范数
     */
    getTotalStandards: (state) => state.totalStandards,
    
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
     * 获取检评规范列表
     * @param {Object} params - 查询参数
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchStandardList(params = {}) {
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

        // 调用 Service 层的获取检评规范列表方法
        const result = await detectionStandardService.getDetectionStandardList(queryParams);

        if (result.success) {
          // 获取成功，更新状态
          this.standardList = result.data || [];
          this.totalStandards = result.total || 0;
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取检评规范列表失败:', error.message);
        this.error = error.message || '获取检评规范列表失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 获取单个检评规范
     * @param {number} standardId - 检评规范ID
     * @returns {Promise<Object|null>} - 检评规范信息
     */
    async fetchStandardById(standardId) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的获取单个检评规范方法
        const result = await detectionStandardService.getDetectionStandard(standardId);

        if (result.success) {
          // 获取成功，返回检评规范信息
          return result.data;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return null;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取检评规范失败:', error.message);
        this.error = error.message || '获取检评规范失败，请稍后重试';
        return null;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 创建检评规范
     * @param {Object} standardData - 检评规范数据
     * @returns {Promise<boolean>} - 创建结果
     */
    async createStandard(standardData) {
      try {
        // 调用 Service 层的创建检评规范方法
        const result = await detectionStandardService.createDetectionStandard(standardData);

        if (result.success) {
          // 创建成功，重新获取检评规范列表
          await this.fetchStandardList();
          return true;
        } else {
          // 创建失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('创建检评规范失败:', error.message);
        this.error = error.message || '创建检评规范失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新检评规范
     * @param {number} standardId - 检评规范ID
     * @param {Object} standardData - 检评规范数据
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateStandard(standardId, standardData) {
      try {
        // 调用 Service 层的更新检评规范方法
        const result = await detectionStandardService.updateDetectionStandard(standardId, standardData);

        if (result.success) {
          // 更新成功，重新获取检评规范列表
          await this.fetchStandardList();
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新检评规范失败:', error.message);
        this.error = error.message || '更新检评规范失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新分页信息
     * @param {Object} pagination - 分页信息
     */
    updatePagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination };
      // 重新获取检评规范列表
      this.fetchStandardList();
    },

    /**
     * 删除检评规范
     * @param {number} standardId - 检评规范ID
     * @returns {Promise<boolean>} - 删除结果
     */
    async deleteStandard(standardId) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 调用 Service 层的删除检评规范方法
        const result = await detectionStandardService.deleteDetectionStandard(standardId);

        if (result.success) {
          // 删除成功，更新本地检评规范列表
          this.standardList = this.standardList.filter(standard => standard.standard_id !== standardId);
          this.totalStandards--;
          return true;
        } else {
          // 删除失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('删除检评规范失败:', error.message);
        this.error = error.message || '删除检评规范失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 批量删除检评规范
     * @param {Array} standardIds - 检评规范ID数组
     * @returns {Promise<boolean>} - 删除结果
     */
    async batchDeleteStandards(standardIds) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 清除之前的错误信息
        this.error = null;
        
        // 记录成功删除的数量
        let successCount = 0;
        
        // 逐个删除检评规范，失败时继续处理其他检评规范
        for (const standardId of standardIds) {
          const result = await detectionStandardService.deleteDetectionStandard(standardId);
          if (result.success) {
            // 删除成功，更新本地检评规范列表
            this.standardList = this.standardList.filter(standard => standard.standard_id !== standardId);
            successCount++;
          }
        }
        
        // 更新总检评规范数
        this.totalStandards -= successCount;
        
        // 返回删除结果
        return successCount > 0;
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('批量删除检评规范失败:', error.message);
        this.error = error.message || '批量删除检评规范失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 重置检评规范列表状态
     */
    resetStandardListState() {
      this.standardList = [];
      this.totalStandards = 0;
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
    },

    /**
     * 更新检评规范状态
     * @param {number} standardId - 检评规范ID
     * @param {boolean} isEnabled - 是否启用
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateStandardStatus(standardId, isEnabled) {
      try {
        // 清除错误信息
        this.error = null;

        // 根据状态决定调用哪个服务方法
        const result = isEnabled 
          ? await detectionStandardService.enableDetectionStandard(standardId)
          : await detectionStandardService.disableDetectionStandard(standardId);

        if (result.success) {
          // 更新成功，更新本地检评规范列表中的状态
          const standardIndex = this.standardList.findIndex(standard => standard.standard_id === standardId);
          if (standardIndex !== -1) {
            this.standardList[standardIndex].status = isEnabled ? 1 : 0;
          }
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新检评规范状态失败:', error.message);
        this.error = error.message || '更新检评规范状态失败，请稍后重试';
        return false;
      }
    }
  }
});
