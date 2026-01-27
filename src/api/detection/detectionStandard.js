// src/api/detectionStandard.js
// 检测规范相关 API

// 导入配置好的 axios 实例
import apiClient from '../apiClient';

// 获取检测规范列表 API
export const getDetectionStandardList = (params = {}) => {
  // 构建查询参数
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...otherParams
  });
  
  return apiClient.get(`/detection/standards?${queryParams.toString()}`);
};

// 获取单个检测规范 API
export const getDetectionStandard = (standardId) => {
  return apiClient.get(`/detection/standards/${standardId}`);
};

// 创建检测规范 API
export const createDetectionStandard = (standardData) => {
  return apiClient.post(`/detection/standards`, standardData);
};

// 更新检测规范 API
export const updateDetectionStandard = (standardId, standardData) => {
  return apiClient.put(`/detection/standards/${standardId}`, standardData);
};

// 删除检测规范 API
export const deleteDetectionStandard = (standardId) => {
  return apiClient.delete(`/detection/standards/${standardId}`);
};

// 启用检测规范 API
export const enableDetectionStandard = (standardId) => {
  return apiClient.patch(`/detection/standards/${standardId}/enable`);
};

// 禁用检测规范 API
export const disableDetectionStandard = (standardId) => {
  return apiClient.patch(`/detection/standards/${standardId}/disable`);
};
