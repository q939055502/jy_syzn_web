// src/stores/setting.js
// 设置状态管理

import { defineStore } from 'pinia';

// 从本地存储获取主题设置
const getLocalThemeSetting = () => {
  try {
    const stored = localStorage.getItem('themeSetting');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('读取主题设置失败:', error);
  }
  return null;
};

// 保存主题设置到本地存储
const saveThemeSetting = (setting) => {
  try {
    localStorage.setItem('themeSetting', JSON.stringify(setting));
  } catch (error) {
    console.error('保存主题设置失败:', error);
  }
};

// 定义设置状态存储
export const useSettingStore = defineStore('setting', {
  // 状态
  state: () => {
    // 从本地存储获取主题设置
    const localSetting = getLocalThemeSetting();
    
    // 默认主题配置
    const defaultThemeConfig = {
      // 固定头部
      fixedHeader: false,
      // 标签栏
      tagBar: true,
      // 面包屑
      breadcrumb: true,
      // 菜单折叠
      menuCollapse: false,
      // 菜单宽度
      menuWidth: 230,
      // 显示设置
      showSetting: true,
      // 顶部栏
      topBar: false,
      // 主题颜色
      themeColor: '#409eff',
      // 背景颜色
      backgroundColor: '#ffffff',
      // 深色模式
      isDark: false,
      // 菜单搜索
      showSearchMenu: true,
      // 侧边栏背景色
      menuBg: '#ffffff'
    };
    
    // 合并本地设置和默认设置
    const themeConfig = localSetting?.themeConfig || defaultThemeConfig;
    const isDark = localSetting?.isDark ?? themeConfig.isDark;
    
    // 确保 themeConfig.isDark 和 isDark 保持同步
    themeConfig.isDark = isDark;
    
    return {
      // 主题配置
      themeConfig,
      // 菜单类型
      menuType: localSetting?.menuType || 'left',
      // 显示设置菜单
      showSettingMenu: localSetting?.showSettingMenu || false,
      // 深色模式
      isDark
    };
  },

  // 计算属性（getters）
  getters: {
    /**
     * 获取主题配置
     * @returns {Object} - 主题配置
     */
    getThemeConfig: (state) => state.themeConfig,

    /**
     * 获取菜单类型
     * @returns {string} - 菜单类型
     */
    getMenuType: (state) => state.menuType,

    /**
     * 获取显示设置菜单状态
     * @returns {boolean} - 显示设置菜单状态
     */
    getShowSettingMenu: (state) => state.showSettingMenu,

    /**
     * 获取深色模式状态
     * @returns {boolean} - 深色模式状态
     */
    getIsDark: (state) => state.isDark
  },

  // 动作（actions）
  actions: {
    /**
     * 更新主题配置
     * @param {Object} config - 主题配置
     */
    updateThemeConfig(config) {
      this.themeConfig = { ...this.themeConfig, ...config };
      // 更新深色模式
      this.isDark = this.themeConfig.isDark;
      this.updateDarkMode(this.themeConfig.isDark);
    },

    /**
     * 更新菜单类型
     * @param {string} type - 菜单类型
     */
    updateMenuType(type) {
      this.menuType = type;
      // 保存到本地存储
      saveThemeSetting({
        themeConfig: this.themeConfig,
        menuType: this.menuType,
        showSettingMenu: this.showSettingMenu,
        isDark: this.isDark
      });
    },

    /**
     * 更新显示设置菜单状态
     * @param {boolean} show - 显示设置菜单状态
     */
    updateShowSettingMenu(show) {
      this.showSettingMenu = show;
      // 保存到本地存储
      saveThemeSetting({
        themeConfig: this.themeConfig,
        menuType: this.menuType,
        showSettingMenu: this.showSettingMenu,
        isDark: this.isDark
      });
    },

    /**
     * 更新深色模式
     * @param {boolean} isDark - 深色模式状态
     */
    updateDarkMode(isDark) {
      this.isDark = isDark;
      this.themeConfig.isDark = isDark;
      
      // 更新 html 标签的类名，实现深色模式切换
      const html = document.documentElement;
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      
      // 保存到本地存储
      saveThemeSetting({
        themeConfig: this.themeConfig,
        menuType: this.menuType,
        showSettingMenu: this.showSettingMenu,
        isDark: this.isDark
      });
    }
  }
});
