// src/api/permission.js
// 权限相关 API

// 导入配置好的 axios 实例
import apiClient from './apiClient';

// 获取权限列表 API
export const getPermissionList = (params = {}) => {
  // 构建查询参数
  const queryParams = new URLSearchParams(params);
  return apiClient.get(`/api/admin/permissions?${queryParams.toString()}`);
};

// 获取权限详情 API
export const getPermissionDetail = (permissionId) => {
  return apiClient.get(`/api/admin/permissions/${permissionId}`);
};

// 新增权限 API
export const createPermission = (data) => {
  return apiClient.post('/api/admin/permissions', data);
};

// 更新权限 API
export const updatePermission = (permissionId, data) => {
  return apiClient.put(`/api/admin/permissions/${permissionId}`, data);
};

// 删除权限 API
export const deletePermission = (permissionId) => {
  return apiClient.delete(`/api/admin/permissions/${permissionId}`);
};

// 切换权限状态 API
export const togglePermissionStatus = (permissionId, status) => {
  return apiClient.patch(`/api/admin/permissions/${permissionId}/toggle-active?is_active=${status}`);
};