// src/stores/category.js
// 分类状态管理

import { defineStore } from 'pinia';
import { categoryService } from '../../services/detection/categoryService';

// 定义分类状态存储
export const useCategoryStore = defineStore('category', {
  // 状态
  state: () => ({
    // 分类列表
    categoryList: [],
    // 总分类数
    totalCategories: 0,
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
     * 获取分类列表
     * @returns {Array} - 分类列表
     */
    getCategoryList: (state) => state.categoryList,
    
    /**
     * 获取总分类数
     * @returns {number} - 总分类数
     */
    getTotalCategories: (state) => state.totalCategories,
    
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
     * 获取分类列表
     * @param {Object} params - 查询参数
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchCategoryList(params = {}) {
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

        // 调用 Service 层的获取分类列表方法
        const result = await categoryService.getCategoryList(queryParams);

        if (result.success) {
          // 获取成功，更新状态
          this.categoryList = result.data || [];
          this.totalCategories = result.total || 0;
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取分类列表失败:', error.message);
        this.error = error.message || '获取分类列表失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 获取单个分类
     * @param {number} categoryId - 分类ID
     * @returns {Promise<Object|null>} - 分类信息
     */
    async fetchCategoryById(categoryId) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的获取单个分类方法
        const result = await categoryService.getCategory(categoryId);

        if (result.success) {
          // 获取成功，返回分类信息
          return result.data;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return null;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取分类失败:', error.message);
        this.error = error.message || '获取分类失败，请稍后重试';
        return null;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 创建分类
     * @param {Object} categoryData - 分类数据
     * @returns {Promise<boolean>} - 创建结果
     */
    async createCategory(categoryData) {
      try {
        // 调用 Service 层的创建分类方法
        const result = await categoryService.createCategory(categoryData);

        if (result.success) {
          // 创建成功，重新获取分类列表
          await this.fetchCategoryList();
          return true;
        } else {
          // 创建失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('创建分类失败:', error.message);
        this.error = error.message || '创建分类失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新分类
     * @param {number} categoryId - 分类ID
     * @param {Object} categoryData - 分类数据
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateCategory(categoryId, categoryData) {
      try {
        // 调用 Service 层的更新分类方法
        const result = await categoryService.updateCategory(categoryId, categoryData);

        if (result.success) {
          // 更新成功，重新获取分类列表
          await this.fetchCategoryList();
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新分类失败:', error.message);
        this.error = error.message || '更新分类失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新分页信息
     * @param {Object} pagination - 分页信息
     */
    updatePagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination };
      // 重新获取分类列表
      this.fetchCategoryList();
    },

    /**
     * 删除分类
     * @param {number} categoryId - 分类ID
     * @returns {Promise<boolean>} - 删除结果
     */
    async deleteCategory(categoryId) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 调用 Service 层的删除分类方法
        const result = await categoryService.deleteCategory(categoryId);

        if (result.success) {
          // 删除成功，更新本地分类列表
          this.categoryList = this.categoryList.filter(category => category.category_id !== categoryId);
          this.totalCategories--;
          return true;
        } else {
          // 删除失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('删除分类失败:', error.message);
        this.error = error.message || '删除分类失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 批量删除分类
     * @param {Array} categoryIds - 分类ID数组
     * @returns {Promise<boolean>} - 删除结果
     */
    async batchDeleteCategories(categoryIds) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 清除之前的错误信息
        this.error = null;
        
        // 记录成功删除的数量
        let successCount = 0;
        
        // 逐个删除分类，失败时继续处理其他分类
        for (const categoryId of categoryIds) {
          const result = await categoryService.deleteCategory(categoryId);
          if (result.success) {
            // 删除成功，更新本地分类列表
            this.categoryList = this.categoryList.filter(category => category.category_id !== categoryId);
            successCount++;
          }
        }
        
        // 更新总分类数
        this.totalCategories -= successCount;
        
        // 返回删除结果
        return successCount > 0;
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('批量删除分类失败:', error.message);
        this.error = error.message || '批量删除分类失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 重置分类列表状态
     */
    resetCategoryListState() {
      this.categoryList = [];
      this.totalCategories = 0;
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
     * 更新分类状态
     * @param {number} categoryId - 分类ID
     * @param {boolean} isEnabled - 是否启用
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateCategoryStatus(categoryId, isEnabled) {
      try {
        // 清除错误信息
        this.error = null;

        // 根据状态决定调用哪个服务方法
        const result = isEnabled 
          ? await categoryService.enableCategory(categoryId)
          : await categoryService.disableCategory(categoryId);

        if (result.success) {
          // 更新成功，更新本地分类列表中的状态
          const categoryIndex = this.categoryList.findIndex(category => category.category_id === categoryId);
          if (categoryIndex !== -1) {
            this.categoryList[categoryIndex].status = isEnabled ? 1 : 0;
          }
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新分类状态失败:', error.message);
        this.error = error.message || '更新分类状态失败，请稍后重试';
        return false;
      }
    }
  }
});