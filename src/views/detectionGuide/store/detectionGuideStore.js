// 检测指南状态管理
import { defineStore } from 'pinia';
import * as detectionGuideApi from '../api/detectionGuideApi';

// 定义检测指南状态存储
export const useDetectionGuideStore = defineStore('detectionGuide', {
  // 状态
  state: () => ({
    // 分类及其检测对象数据
    categories: [],
    // 检测项目列表
    detectionItems: [],
    // 委托单模板列表
    templates: [],
    // 当前选中的分类ID
    selectedCategoryId: null,
    // 当前选中的检测对象ID
    selectedObjectId: null,
    // 展开的分类ID列表
    expandedCategories: [],
    // 加载状态
    isLoading: false,
    // 错误信息
    error: null
  }),
  
  // 计算属性（getters）
  getters: {
    /**
     * 获取分类及其检测对象数据
     * @returns {Array} - 分类及其检测对象列表
     */
    getCategories: (state) => state.categories,
    
    /**
     * 获取检测项目列表
     * @returns {Array} - 检测项目列表
     */
    getDetectionItems: (state) => state.detectionItems,
    
    /**
     * 获取委托单模板列表
     * @returns {Array} - 委托单模板列表
     */
    getTemplates: (state) => state.templates,
    
    /**
     * 获取当前选中的分类ID
     * @returns {number|null} - 当前选中的分类ID
     */
    getSelectedCategoryId: (state) => state.selectedCategoryId,
    
    /**
     * 获取当前选中的检测对象ID
     * @returns {number|null} - 当前选中的检测对象ID
     */
    getSelectedObjectId: (state) => state.selectedObjectId,
    
    /**
     * 获取展开的分类ID列表
     * @returns {Array} - 展开的分类ID列表
     */
    getExpandedCategories: (state) => state.expandedCategories,
    
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
     * 获取所有分类及其检测对象
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchCategoriesWithObjects() {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 API 层的获取分类及其检测对象方法
        const result = await detectionGuideApi.getCategoriesWithObjects();

        if (result.code === 200) {
          // 获取成功，更新状态
          this.categories = result.data || [];
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message || '获取分类数据失败';
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取分类数据失败:', error);
        this.error = error.message || '获取分类数据失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 根据检测对象ID获取检测项目
     * @param {number} objectId - 检测对象ID
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchDetectionItems(objectId) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 API 层的获取检测项目方法
        const result = await detectionGuideApi.getDetectionItems(objectId);

        if (result.code === 200) {
          // 获取成功，更新状态
          this.detectionItems = result.data || [];
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message || '获取检测项目失败';
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取检测项目失败:', error);
        this.error = error.message || '获取检测项目失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 根据检测项目ID获取委托单模板
     * @param {number} itemId - 检测项目ID
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchTemplates(itemId) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 API 层的获取委托单模板方法
        const result = await detectionGuideApi.getTemplates(itemId);

        if (result.code === 200) {
          // 获取成功，更新状态
          this.templates = result.data || [];
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message || '获取委托单模板失败';
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取委托单模板失败:', error);
        this.error = error.message || '获取委托单模板失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 搜索检测项目
     * @param {string} keyword - 搜索关键词
     * @returns {Promise<boolean>} - 搜索结果
     */
    async searchDetectionItems(keyword) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 API 层的搜索检测项目方法
        const result = await detectionGuideApi.searchDetectionItems(keyword);

        if (result.code === 200) {
          // 搜索成功，更新状态
          this.detectionItems = result.data || [];
          return true;
        } else {
          // 搜索失败，更新错误信息
          this.error = result.message || '搜索检测项目失败';
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('搜索检测项目失败:', error);
        this.error = error.message || '搜索检测项目失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 设置当前选中的分类ID
     * @param {number|null} categoryId - 分类ID
     */
    setSelectedCategoryId(categoryId) {
      this.selectedCategoryId = categoryId;
    },

    /**
     * 设置当前选中的检测对象ID
     * @param {number|null} objectId - 检测对象ID
     */
    setSelectedObjectId(objectId) {
      this.selectedObjectId = objectId;
    },

    /**
     * 设置展开的分类ID列表
     * @param {Array} categoryIds - 展开的分类ID列表
     */
    setExpandedCategories(categoryIds) {
      this.expandedCategories = categoryIds;
    },

    /**
     * 重置状态
     */
    resetState() {
      this.categories = [];
      this.detectionItems = [];
      this.templates = [];
      this.selectedCategoryId = null;
      this.selectedObjectId = null;
      this.expandedCategories = [];
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