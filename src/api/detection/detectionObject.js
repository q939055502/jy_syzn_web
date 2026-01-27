// src/api/detectionObject.js
// 检测对象相关 API

// 导入配置好的 axios 实例
import apiClient from '../apiClient';

// 获取检测对象列表 API
export const getDetectionObjectList = (params = {}) => {
  // 构建查询参数
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...otherParams
  });
  
  return apiClient.get(`/detection/objects?${queryParams.toString()}`);
};

// 获取单个检测对象 API
export const getDetectionObject = (objectId) => {
  return apiClient.get(`/detection/objects/${objectId}`);
};

// 创建检测对象 API
export const createDetectionObject = (objectData) => {
  return apiClient.post(`/detection/objects`, objectData);
};

// 更新检测对象 API
export const updateDetectionObject = (objectId, objectData) => {
  return apiClient.put(`/detection/objects/${objectId}`, objectData);
};

// 删除检测对象 API
export const deleteDetectionObject = (objectId) => {
  return apiClient.delete(`/detection/objects/${objectId}`);
};