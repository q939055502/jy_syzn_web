// src/api/category.js
// 分类相关 API

// 导入配置好的 axios 实例
import apiClient from '../apiClient';

// 获取分类列表 API
export const getCategoryList = (params = {}) => {
  // 构建查询参数
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...otherParams
  });
  
  return apiClient.get(`/detection/categories?${queryParams.toString()}`);
};

// 获取单个分类 API
export const getCategory = (categoryId) => {
  return apiClient.get(`/detection/categories/${categoryId}`);
};

// 创建分类 API
export const createCategory = (categoryData) => {
  return apiClient.post(`/detection/categories`, categoryData);
};

// 更新分类 API
export const updateCategory = (categoryId, categoryData) => {
  return apiClient.put(`/detection/categories/${categoryId}`, categoryData);
};

// 删除分类 API
export const deleteCategory = (categoryId) => {
  return apiClient.delete(`/detection/categories/${categoryId}`);
};

// 启用分类 API
export const enableCategory = (categoryId) => {
  return apiClient.patch(`/detection/categories/${categoryId}/enable`);
};

// 禁用分类 API
export const disableCategory = (categoryId) => {
  return apiClient.patch(`/detection/categories/${categoryId}/disable`);
};