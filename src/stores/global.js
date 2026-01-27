// src/stores/global.js
// 全局状态管理

import { defineStore } from 'pinia';

// 定义全局状态存储
export const useGlobalStore = defineStore('global', {
  // 状态
  state: () => ({
    // 布局加载完成
    layoutLoaded: false,
    // 是否为移动设备
    isMobile: false,
    // 窗口宽度
    windowWidth: 0,
    // 语言
    locale: 'zh-cn'
  }),

  // 计算属性（getters）
  getters: {
    /**
     * 获取布局加载状态
     * @returns {boolean} - 布局加载状态
     */
    getLayoutLoaded: (state) => state.layoutLoaded,

    /**
     * 获取是否为移动设备
     * @returns {boolean} - 是否为移动设备
     */
    getIsMobile: (state) => state.isMobile,

    /**
     * 获取窗口宽度
     * @returns {number} - 窗口宽度
     */
    getWindowWidth: (state) => state.windowWidth,

    /**
     * 获取语言
     * @returns {string} - 语言
     */
    getLocale: (state) => state.locale
  },

  // 动作（actions）
  actions: {
    /**
     * 更新布局加载状态
     * @param {boolean} loaded - 布局加载状态
     */
    updateLayoutLoaded(loaded) {
      this.layoutLoaded = loaded;
    },

    /**
     * 更新是否为移动设备
     * @param {boolean} isMobile - 是否为移动设备
     */
    updateIsMobile(isMobile) {
      this.isMobile = isMobile;
    },

    /**
     * 更新窗口宽度
     * @param {number} width - 窗口宽度
     */
    updateWindowWidth(width) {
      this.windowWidth = width;
      // 根据窗口宽度自动判断是否为移动设备
      this.isMobile = width < 768;
    },

    /**
     * 更新语言
     * @param {string} locale - 语言
     */
    updateLocale(locale) {
      this.locale = locale;
    }
  }
});
