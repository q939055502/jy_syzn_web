// src/api/delegationFormTemplate.js
// 委托单模板相关 API

// 导入配置好的 axios 实例
import apiClient from '../apiClient';

// 获取委托单模板列表 API
export const getDelegationFormTemplateList = (params = {}) => {
  // 构建查询参数
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...otherParams
  });
  
  return apiClient.get(`/detection/templates?${queryParams.toString()}`);
};

// 获取单个委托单模板 API
export const getDelegationFormTemplate = (templateId) => {
  return apiClient.get(`/detection/templates/${templateId}`);
};

// 创建委托单模板 API
export const createDelegationFormTemplate = (templateData) => {
  // 根据 templateData 类型设置正确的 Content-Type
  const config = templateData instanceof FormData ? {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  } : {};
  return apiClient.post(`/detection/templates`, templateData, config);
};

// 更新委托单模板 API
export const updateDelegationFormTemplate = (templateId, templateData) => {
  // 根据 templateData 类型设置正确的 Content-Type
  const config = templateData instanceof FormData ? {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  } : {};
  return apiClient.put(`/detection/templates/${templateId}`, templateData, config);
};

// 删除委托单模板 API
export const deleteDelegationFormTemplate = (templateId) => {
  return apiClient.delete(`/detection/templates/${templateId}`);
};

// 启用委托单模板 API
export const enableDelegationFormTemplate = (templateId) => {
  return apiClient.patch(`/detection/templates/${templateId}/enable`);
};

// 禁用委托单模板 API
export const disableDelegationFormTemplate = (templateId) => {
  return apiClient.patch(`/detection/templates/${templateId}/disable`);
};

// 获取委托单模板使用情况 API
export const getTemplateUsage = (templateId) => {
  return apiClient.get(`/detection/templates/${templateId}/usage`);
};