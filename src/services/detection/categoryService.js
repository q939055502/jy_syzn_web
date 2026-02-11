// src/services/categoryService.js
// 分类相关业务逻辑

import * as categoryApi from '../../api/detection/category';

// 分类服务
export const categoryService = {
  /**
   * 获取分类列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} - 分类列表
   */
  async getCategoryList(params = {}) {
    try {
      // 调用 API 层的获取分类列表方法
      const response = await categoryApi.getCategoryList(params);
      
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
          let errorMessage = response.message || '获取分类列表失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法获取分类列表';
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
        return {
          success: false,
          code: 500,
          message: '获取分类列表失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      let errorMessage = error.message || '获取分类列表失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 获取单个分类
   * @param {number} categoryId - 分类ID
   * @returns {Promise<Object>} - 分类信息
   */
  async getCategory(categoryId) {
    try {
      // 调用 API 层的获取单个分类方法
      const response = await categoryApi.getCategory(categoryId);
      
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
          let errorMessage = response.message || '获取分类失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法获取分类';
              break;
            case 404:
              errorMessage = '分类不存在';
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
        return {
          success: false,
          code: 500,
          message: '获取分类失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理异常，返回错误信息
      return {
        success: false,
        code: 500,
        message: error.message || '获取分类失败，请稍后重试'
      };
    }
  },

  /**
   * 创建分类
   * @param {Object} categoryData - 分类数据
   * @returns {Promise<Object>} - 创建结果
   */
  async createCategory(categoryData) {
    try {
      // 调用 API 层的创建分类方法
      const response = await categoryApi.createCategory(categoryData);
      
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
          let errorMessage = response.message || '创建分类失败';
          switch (response.code) {
            case 400:
              errorMessage = response.message || '参数错误，请检查输入';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法创建分类';
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
        return {
          success: false,
          code: 500,
          message: '创建分类失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      let errorMessage = error.message || '创建分类失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 更新分类
   * @param {number} categoryId - 分类ID
   * @param {Object} categoryData - 分类数据
   * @returns {Promise<Object>} - 更新结果
   */
  async updateCategory(categoryId, categoryData) {
    try {
      // 调用 API 层的更新分类方法
      const response = await categoryApi.updateCategory(categoryId, categoryData);
      
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
          let errorMessage = response.message || '更新分类失败';
          switch (response.code) {
            case 400:
              errorMessage = response.message || '参数错误，请检查输入';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法更新分类';
              break;
            case 404:
              errorMessage = '分类不存在';
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
        return {
          success: false,
          code: 500,
          message: '更新分类失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      let errorMessage = error.message || '更新分类失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 删除分类
   * @param {number} categoryId - 分类ID
   * @returns {Promise<Object>} - 删除结果
   */
  async deleteCategory(categoryId) {
    try {
      // 调用 API 层的删除分类方法
      const response = await categoryApi.deleteCategory(categoryId);
      
      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            message: response.message || '删除分类成功'
          };
        } else {
          // 根据错误码返回更具体的错误信息
          let errorMessage = response.message || '删除分类失败';
          switch (response.code) {
            case 400:
              errorMessage = `删除失败: ${response.message || '该分类可能正在被使用，无法删除'}`;
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法删除分类';
              break;
            case 404:
              errorMessage = '分类不存在';
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
        return {
          success: false,
          code: 500,
          message: '删除分类失败，服务器返回格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      let errorMessage = '删除分类失败，请稍后重试';
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
              errorMessage = '该分类已被使用，无法删除';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法删除分类';
              break;
            case 404:
              errorMessage = '分类不存在';
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
        errorMessage = error.message || '删除分类失败，请稍后重试';
      }
      
      return {
        success: false,
        code: errorCode,
        message: errorMessage
      };
    }
  },

  /**
   * 启用分类
   * @param {number} categoryId - 分类ID
   * @returns {Promise<Object>} - 启用结果
   */
  async enableCategory(categoryId) {
    try {
      // 调用 API 层的启用分类方法
      const response = await categoryApi.enableCategory(categoryId);
      
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
          let errorMessage = response.message || '启用分类失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法启用分类';
              break;
            case 404:
              errorMessage = '分类不存在';
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
        return {
          success: false,
          code: 500,
          message: '启用分类失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      let errorMessage = error.message || '启用分类失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 禁用分类
   * @param {number} categoryId - 分类ID
   * @returns {Promise<Object>} - 禁用结果
   */
  async disableCategory(categoryId) {
    try {
      // 调用 API 层的禁用分类方法
      const response = await categoryApi.disableCategory(categoryId);
      
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
          let errorMessage = response.message || '禁用分类失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法禁用分类';
              break;
            case 404:
              errorMessage = '分类不存在';
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
        return {
          success: false,
          code: 500,
          message: '禁用分类失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      let errorMessage = error.message || '禁用分类失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  }
};