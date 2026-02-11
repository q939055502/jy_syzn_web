// src/utils/jwt.js
// JWT 解析工具函数

/**
 * 解析 JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} - 解析后的 token 数据，如果解析失败返回 null
 */
export const parseJWT = (token) => {
  try {
    if (!token) {
      return null;
    }
    
    // 分割 token，获取 payload 部分
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // 解码 payload
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    // 解析为 JSON 对象
    return JSON.parse(decodedPayload);
  } catch (error) {
    // 解码失败，返回 null
    return null;
    }
};

/**
 * 计算 token 剩余过期时间（秒）
 * @param {string} token - JWT token
 * @returns {number|null} - 剩余过期时间（秒），如果解析失败返回 null
 */
export const getTokenRemainingTime = (token) => {
  try {
    const payload = parseJWT(token);
    if (!payload || !payload.exp) {
      return null;
    }
    
    // 计算剩余时间（秒）
    const now = Math.floor(Date.now() / 1000);
    const remainingTime = payload.exp - now;
    
    return remainingTime;
  } catch (error) {
    return null;
    }
};

/**
 * 检查 token 是否即将过期
 * @param {string} token - JWT token
 * @param {number} threshold - 提前刷新阈值（秒），默认 180 秒
 * @returns {boolean} - 如果 token 即将过期返回 true，否则返回 false
 */
export const isTokenExpiring = (token, threshold = 180) => {
  const remainingTime = getTokenRemainingTime(token);
  if (remainingTime === null) {
    return true; // 解析失败，按过期处理
  }
  
  return remainingTime <= threshold;
};

/**
 * 检查 token 是否已过期
 * @param {string} token - JWT token
 * @returns {boolean} - 如果 token 已过期返回 true，否则返回 false
 */
export const isTokenExpired = (token) => {
  const remainingTime = getTokenRemainingTime(token);
  if (remainingTime === null) {
    return true; // 解析失败，按过期处理
  }
  
  return remainingTime <= 0;
};