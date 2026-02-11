import { ref, computed } from 'vue';
import { UAParser } from 'ua-parser-js';

/**
 * 设备类型检测组合式函数
 * 用于检测当前设备类型（手机、平板、PC）
 */
export function useDeviceType() {
  // 响应式设备类型
  const deviceType = ref('pc');

  /**
   * 获取当前设备类型
   * @returns {string} 设备类型：phone, tablet, pc
   */
  const getDeviceType = () => {
    // 使用ua-parser-js进行更准确的设备检测
    const parser = new UAParser();
    const { device } = parser.getResult();
    
    // 获取屏幕宽度作为辅助判断
    const screenWidth = window.innerWidth;
    
    // 基于device.type判断设备类型
    if (device.type === 'mobile') {
      return 'phone';
    } else if (device.type === 'tablet') {
      return 'tablet';
    } else {
      // 兜底判断：如果ua-parser-js无法识别，使用屏幕宽度和方向作为参考
      const isPortrait = window.innerHeight > window.innerWidth;
      if (isPortrait && screenWidth < 768) {
        return 'phone';
      } else if (isPortrait && screenWidth < 1024) {
        return 'tablet';
      } else {
        return 'pc';
      }
    }
  };

  /**
   * 初始化设备类型
   */
  const initDeviceType = () => {
    deviceType.value = getDeviceType();
  };

  /**
   * 监听窗口大小变化，更新设备类型
   */
  const setupResizeListener = () => {
    const handleResize = () => {
      deviceType.value = getDeviceType();
    };

    window.addEventListener('resize', handleResize);

    // 返回清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  // 计算属性：当前设备类型
  const currentDeviceType = computed(() => deviceType.value);

  // 计算属性：是否为移动设备
  const isMobile = computed(() => {
    return deviceType.value === 'phone' || deviceType.value === 'tablet';
  });

  // 计算属性：是否为手机
  const isPhone = computed(() => {
    return deviceType.value === 'phone';
  });

  // 计算属性：是否为平板
  const isTablet = computed(() => {
    return deviceType.value === 'tablet';
  });

  // 计算属性：是否为PC
  const isPc = computed(() => {
    return deviceType.value === 'pc';
  });

  // 计算属性：是否为桌面设备（PC）
  const isDesktop = computed(() => {
    return deviceType.value === 'pc';
  });

  return {
    deviceType,
    currentDeviceType,
    isMobile,
    isPhone,
    isTablet,
    isPc,
    isDesktop,
    getDeviceType,
    initDeviceType,
    setupResizeListener
  };
}
