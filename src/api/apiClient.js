// src/api/apiClient.js
// 配置 axios 实例和拦截器

import axios from 'axios';
// 导入请求拦截器
import { requestInterceptor, requestInterceptorError } from './interceptors/request';
// 导入响应拦截器
import { responseInterceptor, responseInterceptorError } from './interceptors/response';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api', // 基础 URL，通过 Vite 代理转发到后端
  timeout: 10000, // 请求超时时间
  // 移除默认 Content-Type，让 axios 自动根据请求数据类型设置
});

// 配置请求拦截器
apiClient.interceptors.request.use(
  requestInterceptor,
  requestInterceptorError
);

// 配置响应拦截器
apiClient.interceptors.response.use(
  responseInterceptor,
  responseInterceptorError
);

// 导出 axios 实例
export default apiClient;
