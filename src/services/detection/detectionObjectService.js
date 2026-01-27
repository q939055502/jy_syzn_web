// src/services/detectionObjectService.js
// 检测对象相关业务逻辑

import * as detectionObjectApi from '../../api/detection/detectionObject';

// 检测对象服务
export const detectionObjectService = {
  /**
   * 获取检测对象列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} - 检测对象列表
   */
  async getDetectionObjectList(params = {}) {
    try {
      // 调用 API 层的获取检测对象列表方法
      const response = await detectionObjectApi.getDetectionObjectList(params);
      console.log('获取检测对象列表响应:', response); 
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
          let errorMessage = response.message || '获取检测对象列表失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法获取检测对象列表';
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
        console.error('获取检测对象列表失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '获取检测对象列表失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('获取检测对象列表失败:', error);
      let errorMessage = error.message || '获取检测对象列表失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 获取单个检测对象
   * @param {number} objectId - 检测对象ID
   * @returns {Promise<Object>} - 检测对象信息
   */
  async getDetectionObject(objectId) {
    try {
      // 调用 API 层的获取单个检测对象方法
      const response = await detectionObjectApi.getDetectionObject(objectId);
      
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
          let errorMessage = response.message || '获取检测对象失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法获取检测对象';
              break;
            case 404:
              errorMessage = '检测对象不存在';
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
        console.error('获取检测对象失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '获取检测对象失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('获取检测对象失败:', error);
      let errorMessage = error.message || '获取检测对象失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 创建检测对象
   * @param {Object} objectData - 检测对象数据
   * @returns {Promise<Object>} - 创建结果
   */
  async createDetectionObject(objectData) {
    try {
      // 调用 API 层的创建检测对象方法
      const response = await detectionObjectApi.createDetectionObject(objectData);
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 201) {
          return {
            success: true,
            data: response.data,
            message: response.message
          };
        } else {
          // 根据错误码返回更具体的错误信息
          let errorMessage = response.message || '创建检测对象失败';
          switch (response.code) {
            case 400:
              errorMessage = response.message || '参数错误，请检查输入';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法创建检测对象';
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
        console.error('创建检测对象失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '创建检测对象失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('创建检测对象失败:', error);
      let errorMessage = error.message || '创建检测对象失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 更新检测对象
   * @param {number} objectId - 检测对象ID
   * @param {Object} objectData - 检测对象数据
   * @returns {Promise<Object>} - 更新结果
   */
  async updateDetectionObject(objectId, objectData) {
    try {
      // 调用 API 层的更新检测对象方法
      const response = await detectionObjectApi.updateDetectionObject(objectId, objectData);
      
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
          let errorMessage = response.message || '更新检测对象失败';
          switch (response.code) {
            case 400:
              errorMessage = response.message || '参数错误，请检查输入';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法更新检测对象';
              break;
            case 404:
              errorMessage = '检测对象不存在';
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
        console.error('更新检测对象失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '更新检测对象失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('更新检测对象失败:', error);
      let errorMessage = '更新检测对象失败，请稍后重试';
      let errorCode = 500;
      
      // 从axios错误对象中提取后端返回的错误信息
      if (error.response) {
        // 服务器返回了错误响应
        errorCode = error.response.status;
        
        if (error.response.data) {
          // 后端返回了具体的错误信息
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else {
            // 尝试从错误响应中提取具体错误信息
            errorMessage = `更新失败: ${JSON.stringify(error.response.data)}`;
          }
        } else {
          // 根据状态码返回友好提示
          switch (error.response.status) {
            case 400:
              errorMessage = '参数错误，请检查输入';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法更新检测对象';
              break;
            case 404:
              errorMessage = '检测对象不存在';
              break;
            case 500:
              errorMessage = '服务器内部错误，请稍后重试';
              break;
          }
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        errorMessage = '网络错误，无法连接到服务器，请稍后重试';
      } else {
        // 请求配置出错或响应拦截器处理后的错误
        errorMessage = error.message || errorMessage;
      }
      
      return {
        success: false,
        code: errorCode,
        message: errorMessage
      };
    }
  },

  /**
   * 删除检测对象
   * @param {number} objectId - 检测对象ID
   * @returns {Promise<Object>} - 删除结果
   */
  async deleteDetectionObject(objectId) {
    try {
      // 调用 API 层的删除检测对象方法
      const response = await detectionObjectApi.deleteDetectionObject(objectId);
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            message: response.message || '删除检测对象成功'
          };
        } else {
          // 根据错误码返回更具体的错误信息
          let errorMessage = response.message || '删除检测对象失败';
          switch (response.code) {
            case 400:
              errorMessage = `删除失败: ${response.message || '该检测对象可能正在被使用，无法删除'}`;
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法删除检测对象';
              break;
            case 404:
              errorMessage = '检测对象不存在';
              break;
            case 500:
              errorMessage = '服务器内部错误，请稍后重试';
              break;
            default:
              errorMessage = `删除失败: ${response.message || '未知错误'}`;
          }
          return {
            success: false,
            code: response.code,
            message: errorMessage
          };
        }
      } else {
        // 非统一格式响应
        console.error('删除检测对象失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '删除检测对象失败，服务器返回格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('删除检测对象失败:', error);
      let errorMessage = '删除检测对象失败，请稍后重试';
      let errorCode = 500;
      
      // 从axios错误对象中提取后端返回的错误信息
      if (error.response) {
        // 服务器返回了错误响应
        errorCode = error.response.status;
        
        if (error.response.data) {
          // 后端返回了具体的错误信息
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else {
            // 尝试从错误响应中提取具体错误信息
            errorMessage = `删除失败: ${JSON.stringify(error.response.data)}`;
          }
        } else {
          // 根据状态码返回友好提示
          switch (error.response.status) {
            case 400:
              errorMessage = '该检测对象已被使用，无法删除';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法删除检测对象';
              break;
            case 404:
              errorMessage = '检测对象不存在';
              break;
            case 500:
              errorMessage = '服务器内部错误，请稍后重试';
              break;
          }
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        errorMessage = '网络错误，无法连接到服务器，请稍后重试';
      } else {
        // 请求配置出错
        errorMessage = error.message || '删除检测对象失败，请稍后重试';
      }
      
      return {
        success: false,
        code: errorCode,
        message: errorMessage
      };
    }
  }
};