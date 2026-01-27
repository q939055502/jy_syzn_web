// src/api/userManagement.js
// 管理员用户管理相关 API

// 导入配置好的 axios 实例
import apiClient from './apiClient';

// 获取用户列表 API
export const getUserList = (params = {}) => {
  // 构建查询参数
  const { page = 1, limit = 10, ...otherParams } = params;
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...otherParams
  });
  
  return apiClient.get(`/admin/users?${queryParams.toString()}`);
};

// 检查用户名是否存在 API
export const checkUsernameExists = (username) => {
  return apiClient.get(`/admin/users/check-username`, {
    params: {
      username
    }
  });
};

// 创建用户 API
export const createUser = (userData) => {
  return apiClient.post(`/admin/users`, userData);
};

// 更新用户状态 API
export const updateUserStatus = (userId, status) => {
  return apiClient.patch(`/admin/users/${userId}/toggle-active`, null, {
    params: {
      is_active: status
    }
  });
};

// 删除用户 API
export const deleteUser = (userId) => {
  return apiClient.delete(`/admin/users/${userId}`);
};
