// src/stores/detectionItem.js
// 检测项目状态管理

import { defineStore } from 'pinia';
import { detectionItemService } from '../../services/detection/detectionItemService';

// 定义检测项目状态存储
export const useDetectionItemStore = defineStore('detectionItem', {
  // 状态
  state: () => ({
    // 检测项目列表
    itemList: [],
    // 总检测项目数
    totalItems: 0,
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
     * 获取检测项目列表
     * @returns {Array} - 检测项目列表
     */
    getItemList: (state) => state.itemList,
    
    /**
     * 获取总检测项目数
     * @returns {number} - 总检测项目数
     */
    getTotalItems: (state) => state.totalItems,
    
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
     * 获取检测项目列表
     * @param {Object} params - 查询参数
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchItemList(params = {}) {
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

        // 调用 Service 层的获取检测项目列表方法
        const result = await detectionItemService.getDetectionItemList(queryParams);

        if (result.success) {
          // 获取成功，更新状态
          this.itemList = result.data || [];
          this.totalItems = result.total || 0;
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取检测项目列表失败:', error.message);
        this.error = error.message || '获取检测项目列表失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 获取单个检测项目
     * @param {number} itemId - 检测项目ID
     * @returns {Promise<Object|null>} - 检测项目信息
     */
    async fetchItemById(itemId) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的获取单个检测项目方法
        const result = await detectionItemService.getDetectionItem(itemId);

        if (result.success) {
          // 获取成功，返回检测项目信息
          return result.data;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return null;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取检测项目失败:', error.message);
        this.error = error.message || '获取检测项目失败，请稍后重试';
        return null;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 创建检测项目
     * @param {Object} itemData - 检测项目数据
     * @returns {Promise<boolean>} - 创建结果
     */
    async createItem(itemData) {
      try {
        // 调用 Service 层的创建检测项目方法
        const result = await detectionItemService.createDetectionItem(itemData);

        if (result.success) {
          // 创建成功，重新获取检测项目列表
          await this.fetchItemList();
          return true;
        } else {
          // 创建失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('创建检测项目失败:', error.message);
        this.error = error.message || '创建检测项目失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新检测项目
     * @param {number} itemId - 检测项目ID
     * @param {Object} itemData - 检测项目数据
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateItem(itemId, itemData) {
      try {
        // 调用 Service 层的更新检测项目方法
        const result = await detectionItemService.updateDetectionItem(itemId, itemData);

        if (result.success) {
          // 更新成功，重新获取检测项目列表
          await this.fetchItemList();
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新检测项目失败:', error.message);
        this.error = error.message || '更新检测项目失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新分页信息
     * @param {Object} pagination - 分页信息
     */
    updatePagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination };
      // 重新获取检测项目列表
      this.fetchItemList();
    },

    /**
     * 删除检测项目
     * @param {number} itemId - 检测项目ID
     * @returns {Promise<boolean>} - 删除结果
     */
    async deleteItem(itemId) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 调用 Service 层的删除检测项目方法
        const result = await detectionItemService.deleteDetectionItem(itemId);

        if (result.success) {
          // 删除成功，更新本地检测项目列表
          this.itemList = this.itemList.filter(item => item.item_id !== itemId);
          this.totalItems--;
          return true;
        } else {
          // 删除失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('删除检测项目失败:', error.message);
        this.error = error.message || '删除检测项目失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 批量删除检测项目
     * @param {Array} itemIds - 检测项目ID数组
     * @returns {Promise<boolean>} - 删除结果
     */
    async batchDeleteItems(itemIds) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 清除之前的错误信息
        this.error = null;
        
        // 记录成功删除的数量
        let successCount = 0;
        
        // 逐个删除检测项目，失败时继续处理其他检测项目
        for (const itemId of itemIds) {
          const result = await detectionItemService.deleteDetectionItem(itemId);
          if (result.success) {
            // 删除成功，更新本地检测项目列表
            this.itemList = this.itemList.filter(item => item.item_id !== itemId);
            successCount++;
          }
        }
        
        // 更新总检测项目数
        this.totalItems -= successCount;
        
        // 返回删除结果
        return successCount > 0;
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('批量删除检测项目失败:', error.message);
        this.error = error.message || '批量删除检测项目失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 重置检测项目列表状态
     */
    resetItemListState() {
      this.itemList = [];
      this.totalItems = 0;
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