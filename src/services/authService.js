// src/services/authService.js
// 用户认证相关业务逻辑

import * as userApi from '../api/user';

// 用户认证服务
export const authService = {
  /**
   * 登录
   * @param {Object} loginForm - 登录表单数据
   * @returns {Promise<Object>} - 登录结果
   */
  async login(loginForm) {
    try {
      // 调用 API 层的登录方法
      const response = await userApi.login(loginForm);
      if (response.code === 200) {
        // 登录成功，返回标准化结果
        return {
          success: true,
          data: {
            token: response.data.access_token,
            tokenType: response.data.token_type,
            refreshToken: response.data.refresh_token,
            user: response.data.user
          },
          message: response.message
        };
      } else {
        // 登录失败，返回错误信息
        console.error('登录失败:', response);
        return {
          success: false,
          message: response.message || '登录失败，请稍后重试'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      
      console.error('登录请求失败:', error);
      console.log('错误详情:', error);
      
      // 从错误对象中提取详细的错误信息
      let errorMessage = '登录失败，请稍后重试';
      
      // 检查是否是响应拦截器抛出的错误
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.error) {
          errorMessage = responseData.error;
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
    }
  },

  /**
   * 刷新令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<Object>} - 刷新结果
   */
  async refreshToken(refreshToken) {
    try {
      // 调用 API 层的刷新令牌方法
      const response = await userApi.refreshToken(refreshToken);
      
      if (response.code === 200) {
        // 刷新成功，返回标准化结果，包含新的refreshToken（令牌轮转）
        return {
          success: true,
          data: {
            token: response.data.access_token,
            tokenType: response.data.token_type,
            refreshToken: response.data.refresh_token
          },
          message: response.message
        };
      } else {
        // 刷新失败，返回错误信息
        console.error('刷新令牌失败:', response);
        return {
          success: false,
          message: response.message || '刷新令牌失败，请重新登录'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('刷新令牌请求失败:', error);
      return {
        success: false,
        message: error.message || '刷新令牌失败，请重新登录'
      };
    }
  },

  /**
   * 获取用户信息
   * @returns {Promise<Object>} - 用户信息
   */
  async getUserInfo() {
    try {
      // 调用 API 层的获取用户信息方法
      const response = await userApi.getUserInfo();
      
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
            message: response.message || '获取用户信息失败'
          };
        }
      } else {
        // 非统一格式响应
        console.error('获取用户信息失败: 响应格式错误', response);
        return {
          success: false,
          message: '获取用户信息失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('获取用户信息失败:', error);
      return {
        success: false,
        message: error.message || '获取用户信息失败，请稍后重试'
      };
    }
  },

  /**
   * 登出
   * @returns {Promise<Object>} - 登出结果
   */
  async logout() {
    try {
      // 调用 API 层的登出方法
      const response = await userApi.logout();
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        return {
          success: response.code === 200,
          message: response.message || (response.code === 200 ? '登出成功' : '登出失败')
        };
      } else {
        // 非统一格式响应
        console.error('登出失败: 响应格式错误', response);
        return {
          success: false,
          message: '登出失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('登出失败:', error);
      return {
        success: false,
        message: error.message || '登出失败，请稍后重试'
      };
    }
  },

  /**
   * 检查登录状态
   * @returns {Promise<boolean>} - 登录状态
   */
  async checkLoginStatus() {
    try {
      // 调用 API 层的检查登录状态方法
      const isLoggedIn = await userApi.checkLoginStatus();
      
      // 返回登录状态
      return isLoggedIn;
    } catch (error) {
      // 处理错误，返回 false
      console.error('检查登录状态失败:', error);
      return false;
    }
  }
};
