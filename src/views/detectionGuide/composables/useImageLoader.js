import { ref } from 'vue';
import { ElMessage } from 'element-plus';

/**
 * 图片加载和管理组合式函数
 * 用于处理图片加载、Blob URL 生成和清理等操作
 */
export function useImageLoader() {
  // 图片加载状态
  const isImageLoading = ref(false);
  // 图片加载错误状态
  const loadError = ref(false);
  // 当前图片 URL
  const currentImageUrl = ref('');

  /**
   * 加载图片并转换为 Blob URL
   * @param {string} imageUrl - 图片 URL
   * @param {string} acceptType - 接受的图片类型，默认为 'image/svg+xml'
   * @returns {Promise<string>} Blob URL
   */
  const loadImageAsBlob = async (imageUrl, acceptType = 'image/svg+xml') => {
    isImageLoading.value = true;
    loadError.value = false;

    try {
      // 使用 fetch 获取图片数据
      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Accept': acceptType
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 将图片数据转换为 Blob
      const blob = await response.blob();
      // 创建 Blob URL
      const blobUrl = URL.createObjectURL(blob);

      currentImageUrl.value = blobUrl;
      loadError.value = false;
      return blobUrl;
    } catch (error) {
      ElMessage.error('图片加载失败，请稍后重试');
      loadError.value = true;
      currentImageUrl.value = '';
      throw error;
    } finally {
      isImageLoading.value = false;
    }
  };

  /**
   * 清理 Blob URL
   * @param {string} blobUrl - 要清理的 Blob URL
   */
  const cleanupBlobUrl = (blobUrl) => {
    if (blobUrl && blobUrl.startsWith('blob:')) {
      // 延迟释放 Blob URL，确保图片元素已处理完 URL 变更
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
    }
  };

  /**
   * 清理当前图片资源
   */
  const cleanupCurrentImage = () => {
    if (currentImageUrl.value && currentImageUrl.value.startsWith('blob:')) {
      const blobUrl = currentImageUrl.value;
      // 先清空图片 URL
      currentImageUrl.value = '';
      // 清理 Blob URL
      cleanupBlobUrl(blobUrl);
    }
    // 重置加载状态
    isImageLoading.value = false;
    loadError.value = false;
  };

  /**
   * 构建检测项目图片 URL
   * @param {string} itemId - 检测项目 ID
   * @param {string} deviceType - 设备类型
   * @param {string} imageType - 图片类型，默认为 'svg'
   * @returns {string} 完整的图片 URL
   */
  const buildImageUrl = (itemId, deviceType, imageType = 'svg') => {
    const dataUniqueId = `detection:${itemId}`;
    return `/api/image/${dataUniqueId}?device_type=${deviceType}&image_type=${imageType}`;
  };

  /**
   * 处理图片加载完成事件
   */
  const handleImageLoad = () => {
    isImageLoading.value = false;
    loadError.value = false;
  };

  /**
   * 处理图片加载错误事件
   * @param {Event} event - 错误事件
   */
  const handleImageError = (event) => {
    isImageLoading.value = false;
    loadError.value = true;
    
    // 可以添加错误处理，例如显示默认图片
    if (event.target) {
      event.target.style.display = 'none';
    }
  };

  /**
   * 处理预览图片加载完成事件
   */
  const handlePreviewImageLoad = () => {
    // 预览图片加载完成的处理
  };

  /**
   * 处理预览图片加载错误事件
   * @param {Event} event - 错误事件
   */
  const handlePreviewImageError = (event) => {
    // 预览图片加载错误的处理
    if (event.target) {
      event.target.style.display = 'none';
    }
  };

  return {
    isImageLoading,
    loadError,
    currentImageUrl,
    loadImageAsBlob,
    cleanupBlobUrl,
    cleanupCurrentImage,
    buildImageUrl,
    handleImageLoad,
    handleImageError,
    handlePreviewImageLoad,
    handlePreviewImageError
  };
}
