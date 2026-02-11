// src/services/authService.js
// 用户认证相关业务逻辑

import * as userApi from '../api/user';

// 用户认证服务
export const authService = {
  /**
   * 处理 API 响应
   * @param {Object} response - API 响应
   * @param {string} successMessage - 成功消息
   * @param {string} errorMessage - 错误消息
   * @returns {Object} - 标准化的响应结果
   */
  handleResponse(response, successMessage = '操作成功', errorMessage = '操作失败') {
    
    // 统一格式响应：包含 code 字段
    if (response && typeof response === 'object' && 'code' in response) {
      if (response.code === 200) {
        // 检查是否是登录响应，包含 access_token
        if (response.data && response.data.access_token) {
          return {
            success: true,
            data: {
              token: response.data.access_token,
              tokenType: response.data.token_type,
              refreshToken: response.data.refresh_token,
              user: response.data.user
            },
            message: response.message || successMessage
          };
        }
        return {
          success: true,
          data: response.data || response,
          message: response.message || successMessage
        };
      } else {
        return {
          success: false,
          message: response.message || errorMessage
        };
      }
    }
    
    // 直接返回 access_token 的响应格式（旧格式，用于兼容）
    if (response && typeof response === 'object' && response.access_token) {
      return {
        success: true,
        data: {
          token: response.access_token,
          tokenType: response.token_type,
          refreshToken: response.refresh_token,
          user: response.user
        },
        message: response.message || successMessage
      };
    }
    
    // 其他成功响应
    if (response && typeof response === 'object') {
      return {
        success: true,
        data: response,
        message: successMessage
      };
    }
    
    // 响应格式错误
    return {
      success: false,
      message: '响应格式错误'
    };
  },

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   * @param {string} defaultMessage - 默认错误消息
   * @returns {Object} - 标准化的错误结果
   */
  handleError(error, defaultMessage = '操作失败，请稍后重试') {
    
    // 从错误对象中提取详细的错误信息
    let errorMessage = defaultMessage;
    
    // 检查是否是响应拦截器抛出的错误
    if (error.response && error.response.data) {
      const responseData = error.response.data;
      if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.detail) {
        errorMessage = responseData.detail;
      } else if (responseData.error) {
        errorMessage = responseData.error;
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      }
    }
    // 检查是否是包含 data 属性的错误
    else if (error.data) {
      const errorData = error.data;
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    }
    // 使用错误对象的 message 属性
    else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  },

  /**
   * 登录
   * @param {Object} loginForm - 登录表单数据
   * @returns {Promise<Object>} - 登录结果
   */
  async login(loginForm) {
    try {
      const response = await userApi.login(loginForm);
      const result = this.handleResponse(response, '登录成功', '登录失败，请稍后重试');
      return result;
    } catch (error) {
      return this.handleError(error, '登录失败，请稍后重试');
    }
  },

  /**
   * 刷新令牌
   * @returns {Promise<Object>} - 刷新结果
   */
  async refreshToken() {
    try {
      const response = await userApi.refreshToken();
      return this.handleResponse(response, '令牌刷新成功', '刷新令牌失败，请重新登录');
    } catch (error) {
      return this.handleError(error, '刷新令牌失败，请重新登录');
    }
  },

  /**
   * 获取用户信息
   * @returns {Promise<Object>} - 用户信息
   */
  async getUserInfo() {
    try {
      const response = await userApi.getUserInfo();
      return this.handleResponse(response, '获取用户信息成功', '获取用户信息失败');
    } catch (error) {
      return this.handleError(error, '获取用户信息失败，请稍后重试');
    }
  },

  /**
   * 登出
   * @returns {Promise<Object>} - 登出结果
   */
  async logout() {
    try {
      const response = await userApi.logout();
      return this.handleResponse(response, '登出成功', '登出失败');
    } catch (error) {
      return this.handleError(error, '登出失败，请稍后重试');
    }
  }
};
