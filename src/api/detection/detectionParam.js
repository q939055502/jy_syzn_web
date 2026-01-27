// src/api/detectionParam.js
// 检测参数相关API请求

// 导入配置好的 axios 实例
import apiClient from '../apiClient';

// 检测参数API
/**
 * 获取检测参数列表
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} - 检测参数列表响应
 */
export const getDetectionParamList = (params = {}) => {
  // 构建查询参数
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...otherParams
  });
  
  return apiClient.get(`/detection/params?${queryParams.toString()}`);
};

/**
 * 获取单个检测参数
 * @param {number} paramId - 检测参数ID
 * @returns {Promise<Object>} - 检测参数响应
 */
export const getDetectionParam = (paramId) => {
  return apiClient.get(`/detection/params/${paramId}`);
};

/**
 * 创建检测参数
 * @param {Object} data - 检测参数数据
 * @returns {Promise<Object>} - 创建检测参数响应
 */
export const createDetectionParam = (data) => {
  return apiClient.post('/detection/params', data);
};

/**
 * 更新检测参数
 * @param {number} paramId - 检测参数ID
 * @param {Object} data - 检测参数数据
 * @returns {Promise<Object>} - 更新检测参数响应
 */
export const updateDetectionParam = (paramId, data) => {
  return apiClient.put(`/detection/params/${paramId}`, data);
};

/**
 * 删除检测参数
 * @param {number} paramId - 检测参数ID
 * @returns {Promise<Object>} - 删除检测参数响应
 */
export const deleteDetectionParam = (paramId) => {
  return apiClient.delete(`/detection/params/${paramId}`);
};
