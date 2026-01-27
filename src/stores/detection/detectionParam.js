// src/stores/detectionParam.js
// 检测参数状态管理

import { defineStore } from 'pinia';
import { detectionParamService } from '../../services/detection/detectionParamService';

// 定义检测参数状态存储
export const useDetectionParamStore = defineStore('detectionParam', {
  // 状态
  state: () => ({
    // 检测参数列表
    paramList: [],
    // 总检测参数数
    totalParams: 0,
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
     * 获取检测参数列表
     * @returns {Array} - 检测参数列表
     */
    getParamList: (state) => state.paramList,
    
    /**
     * 获取总检测参数数
     * @returns {number} - 总检测参数数
     */
    getTotalParams: (state) => state.totalParams,
    
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
     * 获取检测参数列表
     * @param {Object} params - 查询参数
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchParamList(params = {}) {
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

        // 调用 Service 层的获取检测参数列表方法
        const result = await detectionParamService.getDetectionParamList(queryParams);

        if (result.success) {
          // 获取成功，更新状态，并将数字类型转换为布尔类型
        this.paramList = (result.data || []).map(param => ({
          ...param,
          is_regular_param: param.is_regular_param === 1 || param.is_regular_param === true
        }));
          this.totalParams = result.total || 0;
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取检测参数列表失败:', error.message);
        this.error = error.message || '获取检测参数列表失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 获取单个检测参数
     * @param {number} paramId - 检测参数ID
     * @returns {Promise<Object|null>} - 检测参数信息
     */
    async fetchParamById(paramId) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的获取单个检测参数方法
        const result = await detectionParamService.getDetectionParam(paramId);

        if (result.success) {
          // 获取成功，返回检测参数信息
          return result.data;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return null;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取检测参数失败:', error.message);
        this.error = error.message || '获取检测参数失败，请稍后重试';
        return null;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 创建检测参数
     * @param {Object} paramData - 检测参数数据
     * @returns {Promise<boolean>} - 创建结果
     */
    async createParam(paramData) {
      try {
        // 调用 Service 层的创建检测参数方法
        const result = await detectionParamService.createDetectionParam(paramData);

        if (result.success) {
          // 创建成功，重新获取检测参数列表
          await this.fetchParamList();
          return true;
        } else {
          // 创建失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('创建检测参数失败:', error.message);
        this.error = error.message || '创建检测参数失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新检测参数
     * @param {number} paramId - 检测参数ID
     * @param {Object} paramData - 检测参数数据
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateParam(paramId, paramData) {
      try {
        // 调用 Service 层的更新检测参数方法
        const result = await detectionParamService.updateDetectionParam(paramId, paramData);

        if (result.success) {
          // 更新成功，重新获取检测参数列表
          await this.fetchParamList();
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新检测参数失败:', error.message);
        this.error = error.message || '更新检测参数失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新分页信息
     * @param {Object} pagination - 分页信息
     */
    updatePagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination };
      // 重新获取检测参数列表
      this.fetchParamList();
    },

    /**
     * 删除检测参数
     * @param {number} paramId - 检测参数ID
     * @returns {Promise<boolean>} - 删除结果
     */
    async deleteParam(paramId) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 调用 Service 层的删除检测参数方法
        const result = await detectionParamService.deleteDetectionParam(paramId);

        if (result.success) {
          // 删除成功，更新本地检测参数列表
          this.paramList = this.paramList.filter(param => param.param_id !== paramId);
          this.totalParams--;
          return true;
        } else {
          // 删除失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('删除检测参数失败:', error.message);
        this.error = error.message || '删除检测参数失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 批量删除检测参数
     * @param {Array} paramIds - 检测参数ID数组
     * @returns {Promise<boolean>} - 删除结果
     */
    async batchDeleteParams(paramIds) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 清除之前的错误信息
        this.error = null;
        
        // 记录成功删除的数量
        let successCount = 0;
        
        // 逐个删除检测参数，失败时继续处理其他检测参数
        for (const paramId of paramIds) {
          const result = await detectionParamService.deleteDetectionParam(paramId);
          if (result.success) {
            // 删除成功，更新本地检测参数列表
            this.paramList = this.paramList.filter(param => param.param_id !== paramId);
            successCount++;
          }
        }
        
        // 更新总检测参数数
        this.totalParams -= successCount;
        
        // 返回删除结果
        return successCount > 0;
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('批量删除检测参数失败:', error.message);
        this.error = error.message || '批量删除检测参数失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 重置检测参数列表状态
     */
    resetParamListState() {
      this.paramList = [];
      this.totalParams = 0;
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
