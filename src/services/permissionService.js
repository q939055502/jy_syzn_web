// src/services/permissionService.js
// 权限相关业务逻辑

import * as permissionApi from '../api/permission';

// 权限服务
export const permissionService = {
  /**
   * 获取权限列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} - 权限列表结果
   */
  async getPermissionList(params = {}) {
    try {
      // 调用 API 层的获取权限列表方法
      const response = await permissionApi.getPermissionList(params);
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            data: response.data,
            message: response.message
          };
        } else {
          return {
            success: false,
            message: response.message || '获取权限列表失败'
          };
        }
      } else {
        // 非统一格式响应
        console.error('获取权限列表失败: 响应格式错误', response);
        return {
          success: false,
          message: '获取权限列表失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('获取权限列表失败:', error);
      return {
        success: false,
        message: error.message || '获取权限列表失败，请稍后重试'
      };
    }
  },

  /**
   * 获取权限详情
   * @param {number} permissionId - 权限ID
   * @returns {Promise<Object>} - 权限详情结果
   */
  async getPermissionDetail(permissionId) {
    try {
      // 调用 API 层的获取权限详情方法
      const response = await permissionApi.getPermissionDetail(permissionId);
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            data: response.data,
            message: response.message
          };
        } else {
          return {
            success: false,
            message: response.message || '获取权限详情失败'
          };
        }
      } else {
        // 非统一格式响应
        console.error('获取权限详情失败: 响应格式错误', response);
        return {
          success: false,
          message: '获取权限详情失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('获取权限详情失败:', error);
      return {
        success: false,
        message: error.message || '获取权限详情失败，请稍后重试'
      };
    }
  },

  /**
   * 新增权限
   * @param {Object} data - 权限数据
   * @returns {Promise<Object>} - 新增结果
   */
  async createPermission(data) {
    try {
      // 调用 API 层的新增权限方法
      const response = await permissionApi.createPermission(data);
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            data: response.data,
            message: response.message
          };
        } else {
          return {
            success: false,
            message: response.message || '新增权限失败'
          };
        }
      } else {
        // 非统一格式响应
        console.error('新增权限失败: 响应格式错误', response);
        return {
          success: false,
          message: '新增权限失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('新增权限失败:', error);
      return {
        success: false,
        message: error.message || '新增权限失败，请稍后重试'
      };
    }
  },

  /**
   * 更新权限
   * @param {number} permissionId - 权限ID
   * @param {Object} data - 权限数据
   * @returns {Promise<Object>} - 更新结果
   */
  async updatePermission(permissionId, data) {
    try {
      // 调用 API 层的更新权限方法
      const response = await permissionApi.updatePermission(permissionId, data);
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            data: response.data,
            message: response.message
          };
        } else {
          return {
            success: false,
            message: response.message || '更新权限失败'
          };
        }
      } else {
        // 非统一格式响应
        console.error('更新权限失败: 响应格式错误', response);
        return {
          success: false,
          message: '更新权限失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('更新权限失败:', error);
      return {
        success: false,
        message: error.message || '更新权限失败，请稍后重试'
      };
    }
  },

  /**
   * 删除权限
   * @param {number} permissionId - 权限ID
   * @returns {Promise<Object>} - 删除结果
   */
  async deletePermission(permissionId) {
    try {
      // 调用 API 层的删除权限方法
      const response = await permissionApi.deletePermission(permissionId);
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            message: response.message
          };
        } else {
          return {
            success: false,
            message: response.message || '删除权限失败'
          };
        }
      } else {
        // 非统一格式响应
        console.error('删除权限失败: 响应格式错误', response);
        return {
          success: false,
          message: '删除权限失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('删除权限失败:', error);
      return {
        success: false,
        message: error.message || '删除权限失败，请稍后重试'
      };
    }
  },

  /**
   * 切换权限状态
   * @param {number} permissionId - 权限ID
   * @param {boolean} status - 状态
   * @returns {Promise<Object>} - 操作结果
   */
  async togglePermissionStatus(permissionId, status) {
    try {
      // 调用 API 层的切换权限状态方法
      const response = await permissionApi.togglePermissionStatus(permissionId, status);
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            data: response.data,
            message: response.message
          };
        } else {
          return {
            success: false,
            message: response.message || '操作权限状态失败'
          };
        }
      } else {
        // 非统一格式响应
        console.error('操作权限状态失败: 响应格式错误', response);
        return {
          success: false,
          message: '操作权限状态失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('操作权限状态失败:', error);
      return {
        success: false,
        message: error.message || '操作权限状态失败，请稍后重试'
      };
    }
  }
};