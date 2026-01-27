// src/utils/dateUtils.js
// 日期时间格式化工具

/**
 * 格式化ISO 8601日期时间为中国标准格式 (yyyy-MM-dd HH:mm:ss)
 * @param {string|Date} dateStr - ISO 8601格式的日期字符串或Date对象
 * @param {boolean} showTime - 是否显示时间，默认为true
 * @returns {string} - 格式化后的日期时间字符串
 */
export const formatDate = (dateStr, showTime = true) => {
  if (!dateStr) return '无';
  
  const date = new Date(dateStr);
  date.setHours(date.getHours() + 8); 
  if (!showTime) {
    // 只显示日期
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  // 显示完整日期时间
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

};

/**
 * 格式化ISO 8601日期时间为中国标准日期格式 (yyyy-MM-dd)
 * @param {string|Date} dateStr - ISO 8601格式的日期字符串或Date对象
 * @returns {string} - 格式化后的日期字符串
 */
export const formatOnlyDate = (dateStr) => {
  return formatDate(dateStr, false);
};

/**
 * 检查日期是否过期
 * @param {string|Date} dateStr - ISO 8601格式的日期字符串或Date对象
 * @returns {boolean} - 是否过期
 */
export const isDateExpired = (dateStr) => {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  const now = new Date();
  
  // 将时间部分设置为0，只比较日期
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date < now;
};