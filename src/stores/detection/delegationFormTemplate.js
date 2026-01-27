// src/stores/delegationFormTemplate.js
// 委托单模板状态管理

import { defineStore } from 'pinia';
import { delegationFormTemplateService } from '../../services/detection/delegationFormTemplateService';

// 定义委托单模板状态存储
export const useDelegationFormTemplateStore = defineStore('delegationFormTemplate', {
  // 状态
  state: () => ({
    // 委托单模板列表
    templateList: [],
    // 总委托单模板数
    totalTemplates: 0,
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
     * 获取委托单模板列表
     * @returns {Array} - 委托单模板列表
     */
    getTemplateList: (state) => state.templateList,
    
    /**
     * 获取总委托单模板数
     * @returns {number} - 总委托单模板数
     */
    getTotalTemplates: (state) => state.totalTemplates,
    
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
     * 获取委托单模板列表
     * @param {Object} params - 查询参数
     * @returns {Promise<boolean>} - 获取结果
     */
    async fetchTemplateList(params = {}) {
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

        // 调用 Service 层的获取委托单模板列表方法
        const result = await delegationFormTemplateService.getDelegationFormTemplateList(queryParams);

        if (result.success) {
          // 获取成功，更新状态
          this.templateList = result.data || [];
          this.totalTemplates = result.total || 0;
          return true;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取委托单模板列表失败:', error.message);
        this.error = error.message || '获取委托单模板列表失败，请稍后重试';
        return false;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 获取单个委托单模板
     * @param {number} templateId - 委托单模板ID
     * @returns {Promise<Object|null>} - 委托单模板信息
     */
    async fetchTemplateById(templateId) {
      // 设置加载状态
      this.isLoading = true;
      // 清除错误信息
      this.error = null;

      try {
        // 调用 Service 层的获取单个委托单模板方法
        const result = await delegationFormTemplateService.getDelegationFormTemplate(templateId);

        if (result.success) {
          // 获取成功，返回委托单模板信息
          return result.data;
        } else {
          // 获取失败，更新错误信息
          this.error = result.message;
          return null;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取委托单模板失败:', error.message);
        this.error = error.message || '获取委托单模板失败，请稍后重试';
        return null;
      } finally {
        // 重置加载状态
        this.isLoading = false;
      }
    },

    /**
     * 创建委托单模板
     * @param {Object} templateData - 委托单模板数据
     * @returns {Promise<boolean>} - 创建结果
     */
    async createTemplate(templateData) {
      try {
        // 调用 Service 层的创建委托单模板方法
        const result = await delegationFormTemplateService.createDelegationFormTemplate(templateData);

        if (result.success) {
          // 创建成功，重新获取委托单模板列表
          await this.fetchTemplateList();
          return true;
        } else {
          // 创建失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('创建委托单模板失败:', error.message);
        this.error = error.message || '创建委托单模板失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新委托单模板
     * @param {number} templateId - 委托单模板ID
     * @param {Object} templateData - 委托单模板数据
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateTemplate(templateId, templateData) {
      try {
        // 调用 Service 层的更新委托单模板方法
        const result = await delegationFormTemplateService.updateDelegationFormTemplate(templateId, templateData);

        if (result.success) {
          // 更新成功，重新获取委托单模板列表
          await this.fetchTemplateList();
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新委托单模板失败:', error.message);
        this.error = error.message || '更新委托单模板失败，请稍后重试';
        return false;
      }
    },

    /**
     * 更新分页信息
     * @param {Object} pagination - 分页信息
     */
    updatePagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination };
      // 重新获取委托单模板列表
      this.fetchTemplateList();
    },

    /**
     * 删除委托单模板
     * @param {number} templateId - 委托单模板ID
     * @returns {Promise<boolean>} - 删除结果
     */
    async deleteTemplate(templateId) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 调用 Service 层的删除委托单模板方法
        const result = await delegationFormTemplateService.deleteDelegationFormTemplate(templateId);

        if (result.success) {
          // 删除成功，更新本地委托单模板列表
          this.templateList = this.templateList.filter(template => template.template_id !== templateId);
          this.totalTemplates--;
          return true;
        } else {
          // 删除失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('删除委托单模板失败:', error.message);
        this.error = error.message || '删除委托单模板失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 批量删除委托单模板
     * @param {Array} templateIds - 委托单模板ID数组
     * @returns {Promise<boolean>} - 删除结果
     */
    async batchDeleteTemplates(templateIds) {
      try {
        // 设置删除加载状态
        this.isDeleting = true;
        
        // 清除之前的错误信息
        this.error = null;
        
        // 记录成功删除的数量
        let successCount = 0;
        
        // 逐个删除委托单模板，失败时继续处理其他委托单模板
        for (const templateId of templateIds) {
          const result = await delegationFormTemplateService.deleteDelegationFormTemplate(templateId);
          if (result.success) {
            // 删除成功，更新本地委托单模板列表
            this.templateList = this.templateList.filter(template => template.template_id !== templateId);
            successCount++;
          }
        }
        
        // 更新总委托单模板数
        this.totalTemplates -= successCount;
        
        // 返回删除结果
        return successCount > 0;
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('批量删除委托单模板失败:', error.message);
        this.error = error.message || '批量删除委托单模板失败，请稍后重试';
        return false;
      } finally {
        // 重置删除加载状态
        this.isDeleting = false;
      }
    },

    /**
     * 重置委托单模板列表状态
     */
    resetTemplateListState() {
      this.templateList = [];
      this.totalTemplates = 0;
      this.pagination = {
        currentPage: 1,
        pageSize: 10
      };
      this.isLoading = false;
      this.error = null;
    },
    
    /**
     * 获取委托单模板使用情况
     * @param {number} templateId - 委托单模板ID
     * @returns {Promise<Object>} - 使用情况结果
     */
    async getTemplateUsage(templateId) {
      try {
        // 设置加载状态
        this.isLoading = true;
        // 清除错误信息
        this.error = null;
        
        // 调用 Service 层的获取委托单模板使用情况方法
        const result = await delegationFormTemplateService.getTemplateUsage(templateId);
        
        return result;
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('获取委托单模板使用情况失败:', error.message);
        this.error = error.message || '获取委托单模板使用情况失败，请稍后重试';
        return {
          success: false,
          message: this.error
        };
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
     * 更新委托单模板状态
     * @param {number} templateId - 委托单模板ID
     * @param {boolean} isEnabled - 是否启用
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateTemplateStatus(templateId, isEnabled) {
      try {
        // 清除错误信息
        this.error = null;

        // 准备更新数据
        const updateData = {
          status: isEnabled ? 1 : 0
        };

        // 调用更新委托单模板方法
        const result = await delegationFormTemplateService.updateDelegationFormTemplate(templateId, updateData);

        if (result.success) {
          // 更新成功，更新本地委托单模板列表中的状态
          const templateIndex = this.templateList.findIndex(template => template.template_id === templateId);
          if (templateIndex !== -1) {
            this.templateList[templateIndex].status = isEnabled ? 1 : 0;
          }
          return true;
        } else {
          // 更新失败，更新错误信息
          this.error = result.message;
          return false;
        }
      } catch (error) {
        // 处理异常，更新错误信息
        console.error('更新委托单模板状态失败:', error.message);
        this.error = error.message || '更新委托单模板状态失败，请稍后重试';
        return false;
      }
    }
  }
});