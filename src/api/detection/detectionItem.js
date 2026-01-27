// src/api/detectionItem.js
// 检测项目相关 API

// 导入配置好的 axios 实例
import apiClient from '../apiClient';

// 获取检测项目列表 API
export const getDetectionItemList = (params = {}) => {
  // 构建查询参数
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...otherParams
  });
  
  return apiClient.get(`/detection/items?${queryParams.toString()}`);
};

// 获取单个检测项目 API
export const getDetectionItem = (itemId) => {
  return apiClient.get(`/detection/items/${itemId}`);
};

// 创建检测项目 API
export const createDetectionItem = (itemData) => {
  return apiClient.post(`/detection/items`, itemData);
};

// 更新检测项目 API
export const updateDetectionItem = (itemId, itemData) => {
  return apiClient.put(`/detection/items/${itemId}`, itemData);
};

// 删除检测项目 API
export const deleteDetectionItem = (itemId) => {
  return apiClient.delete(`/detection/items/${itemId}`);
};