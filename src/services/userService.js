// src/services/userService.js
// 用户相关业务逻辑

import * as userApi from '../api/user';

// 用户服务
export const userService = {
  /**
   * 获取用户信息
   * @returns {Promise<Object>} - 用户信息
   */
  async getUserInfo() {
    try {
      // 调用 API 层的获取用户信息方法
      const response = await userApi.getUserInfo();
      console.log(1111);
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
  }
};
