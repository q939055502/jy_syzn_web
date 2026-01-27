// src/stores/detectionObject.js
// 检测对象状态管理

import { defineStore } from 'pinia';
import { detectionObjectService } from '../../services/detection/detectionObjectService';

// 定义检测对象状态存储
export const useDetectionObjectStore = defineStore('detectionObject', {
  // 状态
  state: () => ({
    // 检测对象列表
    objectList: [],
    // 总检测对象数
    totalObjects: 0,
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
     * 获取检测对象列表
     * @returns {Array} - 检测对象列表
     */
    getDetectionObjectList: (state) => state.objectList,
    
    /**
     * 获取总检测对象数
     * @returns {number} - 总检测对象数
     */
    getTotalDetectionObjects: (state) => state.totalObjects,
    
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
     * 获取检测对象列表
     * @param {Object} params - 查询参数
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchDetectionObjectList(params = {}) {
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

        // 调用 Service 层的获取检测对象列表方法
        const result = await detectionObjectService.getDetectionObjectList(queryParams);

        if (result.success) {
          // 获取成功，更新状态
          this.objectList = result.data || [];
          this.totalObjects = result.total || 0;
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取检测对象列表失败:', error.message);
        this.error = error.message || '获取检测对象列表失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 获取单个检测对象
     * @param {number} objectId - 检测对象ID
     * @returns {Promise<Object|null>} - 检测对象信息
     */
    async fetchObjectById(objectId) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的获取单个检测对象方法
        const result = await detectionObjectService.getDetectionObject(objectId);

        if (result.success) {
          // 获取成功，返回检测对象信息
          return result.data;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return null;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取检测对象失败:', error.message);
        this.error = error.message || '获取检测对象失败，请稍后重试';
        return null;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 创建检测对象
     * @param {Object} objectData - 检测对象数据
     * @returns {Promise<boolean>} - 创建结果
     */
    async createDetectionObject(objectData) {
      try {
        // 调用 Service 层的创建检测对象方法
        const result = await detectionObjectService.createDetectionObject(objectData);

        if (result.success) {
          // 创建成功，重新获取检测对象列表
        await this.fetchDetectionObjectList();
          return true;
        } else {
          // 创建失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('创建检测对象失败:', error.message);
        this.error = error.message || '创建检测对象失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新检测对象
     * @param {number} objectId - 检测对象ID
     * @param {Object} objectData - 检测对象数据
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateDetectionObject(objectId, objectData) {
      try {
        // 调用 Service 层的更新检测对象方法
        const result = await detectionObjectService.updateDetectionObject(objectId, objectData);

        if (result.success) {
          // 更新成功，重新获取检测对象列表
        await this.fetchDetectionObjectList();
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新检测对象失败:', error.message);
        this.error = error.message || '更新检测对象失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新分页信息
     * @param {Object} pagination - 分页信息
     */
    updatePagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination };
      // 重新获取检测对象列表
      this.fetchDetectionObjectList();
    },

    /**
     * 删除检测对象
     * @param {number} objectId - 检测对象ID
     * @returns {Promise<boolean>} - 删除结果
     */
    async deleteDetectionObject(objectId) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 调用 Service 层的删除检测对象方法
        const result = await detectionObjectService.deleteDetectionObject(objectId);

        if (result.success) {
          // 删除成功，更新本地检测对象列表
        this.objectList = this.objectList.filter(object => object.object_id !== objectId);
          this.totalObjects--;
          return true;
        } else {
          // 删除失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('删除检测对象失败:', error.message);
        this.error = error.message || '删除检测对象失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 批量删除检测对象
     * @param {Array} objectIds - 检测对象ID数组
     * @returns {Promise<boolean>} - 删除结果
     */
    async batchDeleteDetectionObjects(objectIds) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 清除之前的错误信息
        this.error = null;
        
        // 记录成功删除的数量
        let successCount = 0;
        
        // 逐个删除检测对象，失败时继续处理其他检测对象
        for (const objectId of objectIds) {
          const result = await detectionObjectService.deleteDetectionObject(objectId);
          if (result.success) {
            // 删除成功，更新本地检测对象列表
            this.objectList = this.objectList.filter(object => object.object_id !== objectId);
            successCount++;
          }
        }
        
        // 更新总检测对象数
        this.totalObjects -= successCount;
        
        // 返回删除结果
        return successCount > 0;
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('批量删除检测对象失败:', error.message);
        this.error = error.message || '批量删除检测对象失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 重置检测对象列表状态
     */
    resetObjectListState() {
      this.objectList = [];
      this.totalObjects = 0;
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
     * 更新检测对象状态
     * @param {number} objectId - 检测对象ID
     * @param {boolean} isEnabled - 是否启用
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateObjectStatus(objectId, isEnabled) {
      try {
        // 清除错误信息
        this.error = null;

        // 准备更新数据，直接更新status字段
        const updateData = {
          status: isEnabled ? 1 : 0
        };

        // 调用更新检测对象方法
        const result = await detectionObjectService.updateDetectionObject(objectId, updateData);

        if (result.success) {
          // 更新成功，更新本地检测对象列表中的状态
          const objectIndex = this.objectList.findIndex(object => object.object_id === objectId);
          if (objectIndex !== -1) {
            this.objectList[objectIndex].status = isEnabled ? 1 : 0;
          }
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新检测对象状态失败:', error.message);
        this.error = error.message || '更新检测对象状态失败，请稍后重试';
        return false;
      }
    }
  }
});