// src/services/delegationFormTemplateService.js
// 委托单模板相关业务逻辑

import * as delegationFormTemplateApi from '../../api/detection/delegationFormTemplate';

// 委托单模板服务
export const delegationFormTemplateService = {
  /**
   * 获取委托单模板列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} - 委托单模板列表
   */
  async getDelegationFormTemplateList(params = {}) {
    try {
      // 调用 API 层的获取委托单模板列表方法
      const response = await delegationFormTemplateApi.getDelegationFormTemplateList(params);
      console.log('获取委托单模板列表响应:', response); 
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
          let errorMessage = response.message || '获取委托单模板列表失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法获取委托单模板列表';
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
        console.error('获取委托单模板列表失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '获取委托单模板列表失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('获取委托单模板列表失败:', error);
      let errorMessage = error.message || '获取委托单模板列表失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 获取单个委托单模板
   * @param {number} templateId - 委托单模板ID
   * @returns {Promise<Object>} - 委托单模板信息
   */
  async getDelegationFormTemplate(templateId) {
    try {
      // 调用 API 层的获取单个委托单模板方法
      const response = await delegationFormTemplateApi.getDelegationFormTemplate(templateId);
      
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
          let errorMessage = response.message || '获取委托单模板失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法获取委托单模板';
              break;
            case 404:
              errorMessage = '委托单模板不存在';
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
        console.error('获取委托单模板失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '获取委托单模板失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('获取委托单模板失败:', error);
      let errorMessage = error.message || '获取委托单模板失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 创建委托单模板
   * @param {FormData} templateData - 委托单模板数据（FormData格式）
   * @returns {Promise<Object>} - 创建结果
   */
  async createDelegationFormTemplate(templateData) {
    try {
      // 调用 API 层的创建委托单模板方法
      const response = await delegationFormTemplateApi.createDelegationFormTemplate(templateData);
      
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
          let errorMessage = response.message || '创建委托单模板失败';
          switch (response.code) {
            case 400:
              errorMessage = response.message || '参数错误，请检查输入';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法创建委托单模板';
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
        console.error('创建委托单模板失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '创建委托单模板失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('创建委托单模板失败:', error);
      let errorMessage = error.message || '创建委托单模板失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 更新委托单模板
   * @param {number} templateId - 委托单模板ID
   * @param {FormData} templateData - 委托单模板数据（FormData格式）
   * @returns {Promise<Object>} - 更新结果
   */
  async updateDelegationFormTemplate(templateId, templateData) {
    try {
      // 调用 API 层的更新委托单模板方法
      const response = await delegationFormTemplateApi.updateDelegationFormTemplate(templateId, templateData);
      
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
          let errorMessage = response.message || '更新委托单模板失败';
          switch (response.code) {
            case 400:
              errorMessage = response.message || '参数错误，请检查输入';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法更新委托单模板';
              break;
            case 404:
              errorMessage = '委托单模板不存在';
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
        console.error('更新委托单模板失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '更新委托单模板失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('更新委托单模板失败:', error);
      let errorMessage = error.message || '更新委托单模板失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 删除委托单模板
   * @param {number} templateId - 委托单模板ID
   * @returns {Promise<Object>} - 删除结果
   */
  async deleteDelegationFormTemplate(templateId) {
    try {
      // 调用 API 层的删除委托单模板方法
      const response = await delegationFormTemplateApi.deleteDelegationFormTemplate(templateId);
      

      // 检查是否是统一格式响应
      if (response && typeof response === 'object' && 'code' in response) {
        // 统一格式响应
        if (response.code === 200) {
          return {
            success: true,
            message: response.message || '删除委托单模板成功'
          };
        } else {
          // 根据错误码返回更具体的错误信息
          let errorMessage = response.message || '删除委托单模板失败';
          switch (response.code) {
            case 400:
              errorMessage = `删除失败: ${response.message || '该委托单模板可能正在被使用，无法删除'}`;
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法删除委托单模板';
              break;
            case 404:
              errorMessage = '委托单模板不存在';
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
        console.error('删除委托单模板失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '删除委托单模板失败，服务器返回格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('删除委托单模板失败:', error);
      let errorMessage = '删除委托单模板失败，请稍后重试';
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
              errorMessage = '该委托单模板已被使用，无法删除';
              break;
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法删除委托单模板';
              break;
            case 404:
              errorMessage = '委托单模板不存在';
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
        errorMessage = error.message || '删除委托单模板失败，请稍后重试';
      }
      
      return {
        success: false,
        code: errorCode,
        message: errorMessage
      };
    }
  },

  /**
   * 启用委托单模板
   * @param {number} templateId - 委托单模板ID
   * @returns {Promise<Object>} - 启用结果
   */
  async enableDelegationFormTemplate(templateId) {
    try {
      // 调用 API 层的启用委托单模板方法
      const response = await delegationFormTemplateApi.enableDelegationFormTemplate(templateId);
      
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
          let errorMessage = response.message || '启用委托单模板失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法启用委托单模板';
              break;
            case 404:
              errorMessage = '委托单模板不存在';
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
        console.error('启用委托单模板失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '启用委托单模板失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('启用委托单模板失败:', error);
      let errorMessage = error.message || '启用委托单模板失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },

  /**
   * 禁用委托单模板
   * @param {number} templateId - 委托单模板ID
   * @returns {Promise<Object>} - 禁用结果
   */
  async disableDelegationFormTemplate(templateId) {
    try {
      // 调用 API 层的禁用委托单模板方法
      const response = await delegationFormTemplateApi.disableDelegationFormTemplate(templateId);
      
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
          let errorMessage = response.message || '禁用委托单模板失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法禁用委托单模板';
              break;
            case 404:
              errorMessage = '委托单模板不存在';
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
        console.error('禁用委托单模板失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '禁用委托单模板失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('禁用委托单模板失败:', error);
      let errorMessage = error.message || '禁用委托单模板失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  },
  
  /**
   * 获取委托单模板使用情况
   * @param {number} templateId - 委托单模板ID
   * @returns {Promise<Object>} - 使用情况结果
   */
  async getTemplateUsage(templateId) {
    try {
      // 调用 API 层的获取委托单模板使用情况方法
      const response = await delegationFormTemplateApi.getTemplateUsage(templateId);
      
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
          let errorMessage = response.message || '获取委托单模板使用情况失败';
          switch (response.code) {
            case 401:
              errorMessage = '未授权，请重新登录';
              break;
            case 403:
              errorMessage = '权限不足，无法获取委托单模板使用情况';
              break;
            case 404:
              errorMessage = '委托单模板不存在';
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
        console.error('获取委托单模板使用情况失败: 响应格式错误', response);
        return {
          success: false,
          code: 500,
          message: '获取委托单模板使用情况失败，响应格式错误'
        };
      }
    } catch (error) {
      // 处理错误，返回错误信息
      console.error('获取委托单模板使用情况失败:', error);
      let errorMessage = error.message || '获取委托单模板使用情况失败，请稍后重试';
      return {
        success: false,
        code: 500,
        message: errorMessage
      };
    }
  }
};