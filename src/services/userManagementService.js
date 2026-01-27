// src/services/userManagementService.js
// 用户管理相关业务逻辑

import * as userApi from '../api/userManagement';

// 用户管理服务
export const userManagementService = {
  /**
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} - 用户列表
   */
  async getUserList(params = {}) {
    try {
      // 调用 API 层的获取用户列表方法
      const response = await userApi.getUserList(params);
      console.log('获取用户列表原始响应:', response);
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            data: response.data,
            total: response.total,
            message: response.message
          };
        } else {
          // 根据错误码返回更具体的错误信息
          let errorMessage = response.message || '获取用户列表失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法获取用户列表';
              break;
            case 404:
              errorMessage = '请求的资源不存在';
              break;
            case 500:
              errorMessage = '服务器内部错误，请稍后重试';
              break;
          }
          return {
            success: false,
            code: response.code,
            message: errorMessage
          };
        }
      } else {
        // 非统一格式响应，直接返回数据
        console.error('获取用户列表失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '获取用户列表失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('获取用户列表失败:', error);
      let errorMessage = error.message || '获取用户列表失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 检查用户名是否存在
   * @param {string} username - 用户名
   * @returns {Promise<Object>} - 检查结果
   */
  async checkUsernameExists(username) {
    try {
      // 调用 API 层的检查用户名是否存在方法
      const response = await userApi.checkUsernameExists(username);
      
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
          // 根据错误码返回更具体的错误信息
          let errorMessage = response.message || '检查用户名失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法检查用户名';
              break;
            case 500:
              errorMessage = '服务器内部错误，请稍后重试';
              break;
          }
          return {
            success: false,
            code: response.code,
            message: errorMessage
          };
        }
      } else {
        // 非统一格式响应
        console.error('检查用户名失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '检查用户名失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('检查用户名失败:', error);
      let errorMessage = error.message || '检查用户名失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} - 创建结果
   */
  async createUser(userData) {
    try {
      // 调用 API 层的创建用户方法
      const response = await userApi.createUser(userData);
      
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
          // 根据错误码返回更具体的错误信息
          let errorMessage = response.message || '创建用户失败';
          switch (response.code) {
            case 400:
              errorMessage = response.message || '参数错误，请检查输入';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法创建用户';
              break;
            case 500:
              errorMessage = '服务器内部错误，请稍后重试';
              break;
          }
          return {
            success: false,
            code: response.code,
            message: errorMessage
          };
        }
      } else {
        // 非统一格式响应
        console.error('创建用户失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '创建用户失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('创建用户失败:', error);
      let errorMessage = error.message || '创建用户失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 更新用户状态
   * @param {number} userId - 用户ID
   * @param {boolean} status - 用户状态
   * @returns {Promise<Object>} - 更新结果
   */
  async updateUserStatus(userId, status) {
    try {
      // 调用 API 层的更新用户状态方法
      const response = await userApi.updateUserStatus(userId, status);
      
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
          // 根据错误码返回更具体的错误信息
          let errorMessage = response.message || '更新用户状态失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法更新用户状态';
              break;
            case 404:
              errorMessage = '用户不存在';
              break;
            case 500:
              errorMessage = '服务器内部错误，请稍后重试';
              break;
          }
          return {
            success: false,
            code: response.code,
            message: errorMessage
          };
        }
      } else {
        // 非统一格式响应
        console.error('更新用户状态失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '更新用户状态失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('更新用户状态失败:', error);
      let errorMessage = error.message || '更新用户状态失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 删除用户
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} - 删除结果
   */
  async deleteUser(userId) {
    try {
      // 调用 API 层的删除用户方法
      const response = await userApi.deleteUser(userId);
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            message: response.message
          };
        } else {
          // 根据错误码返回更具体的错误信息
          let errorMessage = response.message || '删除用户失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法删除用户';
              break;
            case 404:
              errorMessage = '用户不存在';
              break;
            case 500:
              errorMessage = '服务器内部错误，请稍后重试';
              break;
          }
          return {
            success: false,
            code: response.code,
            message: errorMessage
          };
        }
      } else {
        // 非统一格式响应
        console.error('删除用户失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '删除用户失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('删除用户失败:', error);
      let errorMessage = error.message || '删除用户失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  }
};
