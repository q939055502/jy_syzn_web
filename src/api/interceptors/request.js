// src/api/interceptors/request.js
// 请求拦截器配置

/**
 * 请求拦截器
 * @param {Object} config - axios 请求配置对象
 * @returns {Object} - 处理后的请求配置
 */
export const requestInterceptor = (config) => {
  // 从本地存储获取 token
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // 打印请求信息，仅在开发环境下
  if (import.meta.env.DEV) {
    console.log('=== 请求拦截器 ===');
    console.log('请求URL:', config.url);
    console.log('请求方法:', config.method);
    
    // 打印访问令牌
    if (token) {
      console.log('访问令牌:', token.substring(0, 10) + '...'); // 只打印前10个字符，保护隐私
    } else {
      console.log('访问令牌: 无');
    }
    
    // 对于刷新令牌请求，打印刷新令牌
    if (config.url.includes('/auth/refresh')) {
      let refreshTokenValue = '';
      if (config.data) {
        if (typeof config.data === 'string') {
          // 现在刷新令牌直接作为字符串发送
          refreshTokenValue = config.data;
        } else if (typeof config.data === 'object') {
          // 兼容旧格式
          refreshTokenValue = config.data.refresh_token;
        }
        
        if (refreshTokenValue) {
          console.log('刷新令牌:', refreshTokenValue.substring(0, 10) + '...'); // 只打印前10个字符，保护隐私
        }
      }
    } else if (refreshToken) {
      // 其他请求，打印本地存储的刷新令牌
      console.log('本地刷新令牌:', refreshToken.substring(0, 10) + '...'); // 只打印前10个字符，保护隐私
    }
    
    console.log('================');
  }
  
  // 不为刷新令牌请求添加 Authorization 头
  if (token && !config.url.includes('/auth/refresh')) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};

/**
 * 请求拦截器错误处理
 * @param {Object} error - 请求错误对象
 * @returns {Promise} - 被拒绝的 Promise
 */
export const requestInterceptorError = (error) => {
  return Promise.reject(error);
};
