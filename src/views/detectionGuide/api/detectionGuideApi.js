// 检测指南API服务
import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api/public/detection',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 获取所有分类及其检测对象
export const getCategoriesWithObjects = async () => {
  try {
    const response = await apiClient.get('/categories/objects');
    console.log('获取分类及其检测对象成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取分类及其检测对象失败:', error);
    return { code: 500, message: '获取分类及其检测对象失败', data: [] };
  }
};

// 根据检测对象ID获取检测项目
export const getDetectionItems = async (objectId) => {
  try {
    const response = await apiClient.get(`/objects/${objectId}/items`);
    return response.data;
  } catch (error) {
    console.error('获取检测项目失败:', error);
    return { code: 500, message: '获取检测项目失败', data: [] };
  }
};

// 根据检测项目ID获取委托单模板
export const getTemplates = async (itemId) => {
  try {
    const response = await apiClient.get(`/items/${itemId}/templates`);
    return response.data;
  } catch (error) {
    console.error('获取委托单模板失败:', error);
    return { code: 500, message: '获取委托单模板失败', data: [] };
  }
};

// 获取图片URL
export const getImageUrl = (itemId, deviceType = 'pc', imageType = 'svg') => {
  const dataUniqueId = `detection:${itemId}`;
  return `/api/image/${dataUniqueId}?device_type=${deviceType}&image_type=${imageType}`;
};

// 搜索检测项目
export const searchDetectionItems = async (keyword) => {
  try {
    const response = await apiClient.get(`/items/search${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('搜索检测项目失败:', error);
    return { code: 500, message: '搜索检测项目失败', data: [] };
  }
};