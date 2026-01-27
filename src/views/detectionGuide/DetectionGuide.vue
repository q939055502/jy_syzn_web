<template>
  <div class="detection-guide">
    <div class="detection-guide-header">
      <div class="header-title">
        <h2>检测指南</h2>
      </div>
      <div class="header-search">
        <div class="search-container">
          <input 
            type="text" 
            class="search-input"
            placeholder="检测对象/参数/规范名称/代码"
          />
          <button class="search-btn">搜索</button>
        </div>
      </div>
    </div>
    
    <!-- 悬浮的侧边栏控制按钮 -->
    <button 
      class="sidebar-toggle-btn"
      :class="{ 'sidebar-toggle-hidden': !isSidebarVisible }"
      @click="toggleSidebar"
      :title="isSidebarVisible ? '隐藏侧边栏' : '显示侧边栏'"
    >
      <el-icon class="toggle-icon"><Menu /></el-icon>
    </button>
    
    <!-- 侧边栏遮罩层 -->
    <div 
      v-if="isSidebarVisible"
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>
    
    <div class="guide-container">
      <!-- 左侧检测对象列表容器 -->
      <div class="sidebar-wrapper" v-if="isSidebarVisible">
        <!-- 使用Sidebar组件 -->
        <Sidebar
          :categories="categories"
          :expanded-categories="expandedCategories"
          :selected-category-id="selectedCategoryId"
          :selected-object-id="selectedObjectId"
          :is-visible="isSidebarVisible"
          @update:selected-category-id="selectedCategoryId = $event"
          @update:selected-object-id="handleObjectIdChange($event)"
          @update:expanded-categories="expandedCategories = $event"
          @update:categories="categories = $event"
        />
      </div>
      
      <!-- 右侧检测项目卡片 -->
      <div class="content">
        <!-- 移除content-header，不再显示"请选择检测对象" -->
        
        <div class="item-grid" v-if="selectedObjectId">
          <div
            v-for="item in filteredItems"
            :key="item.item_id"
            class="item-card"
          >
            <div class="card-header" @click="handleItemClick(item)">
              <h4>{{ item.item_name }}</h4>
            </div>
            <div class="card-image" @click="handleItemClick(item)">
              <img 
                :src="getItemPreviewImage(item)" 
                :alt="item.item_name" 
                class="preview-img"
                @load="handlePreviewImageLoad"
                @error="handlePreviewImageError"
              />
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <el-icon class="empty-icon"><Document /></el-icon>
          <p>请从左侧选择检测对象查看检测项目</p>
        </div>
      </div>
    </div>
    
    <!-- 图片放大查看弹窗 -->
    <ImageViewer
      :visible="imageDialogVisible"
      :imageUrl="currentImageUrl"
      :title="currentImageTitle"
      :templates="currentTemplates"
      @update:visible="imageDialogVisible = $event"
      @download-template="handleTemplateDownload"
      @close="handleImageViewerClose"
    />
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Document, Loading, ArrowDown, Menu } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useDetectionGuideStore } from './store/detectionGuideStore';

// 导入组件
import Sidebar from './Sidebar.vue';
import ImageViewer from './ImageViewer.vue';

// 导入API服务
import { getImageUrl } from './api/detectionGuideApi';

// 获取检测指南状态
const detectionGuideStore = useDetectionGuideStore();

// 分类数据
const categories = computed(() => detectionGuideStore.getCategories);
// 展开的分类ID列表
const expandedCategories = ref([]);
// 当前选中的分类ID
const selectedCategoryId = ref(null);
// 当前选中的检测对象ID
const selectedObjectId = ref(null);
// 选中的检测对象名称
const selectedObjectName = ref('');
// 侧边栏可见状态
const isSidebarVisible = ref(false);

// 切换侧边栏显隐
const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

// 过滤后的检测项目
const filteredItems = computed(() => {
  return detectionGuideStore.getDetectionItems;
});

// 图片弹窗状态
const imageDialogVisible = ref(false);
// 当前查看的图片URL
const currentImageUrl = ref('');
// 当前查看的图片标题
const currentImageTitle = ref('');
// 图片加载状态
const isImageLoading = ref(false);
// 当前检测项目ID
const currentItemId = ref('');
// 当前委托单模板列表
const currentTemplates = ref([]);

// 组件挂载时获取分类及其检测对象和检测项目列表
onMounted(async () => {
  // 加载分类及其检测对象
  try {
    await detectionGuideStore.fetchCategoriesWithObjects();
    console.log('分类及其检测对象列表:', detectionGuideStore.getCategories);
  } catch (error) {
    console.error('数据加载失败:', error);
    ElMessage.error('数据加载失败');
  }
});

// 处理检测对象ID变化
const handleObjectIdChange = async (objectId) => {
  console.log('选中的检测对象ID:', objectId);
  selectedObjectId.value = objectId;
  detectionGuideStore.setSelectedObjectId(objectId);
  
  // 查找检测对象名称
  let objectName = '';
  for (const category of categories.value) {
    const foundObject = category.objects.find(obj => obj.id === objectId);
    if (foundObject) {
      objectName = foundObject.name;
      break;
    }
  }
  selectedObjectName.value = objectName;
  console.log('选中的检测对象名称:', objectName);
  
  // 根据检测对象ID获取检测项目列表
  if (objectId) {
    try {
      await detectionGuideStore.fetchDetectionItems(objectId);
      console.log('检测项目列表:', detectionGuideStore.getDetectionItems);
    } catch (error) {
      console.error('获取检测项目失败:', error);
      ElMessage.error('获取检测项目失败');
    }
  } else {
    // 清空检测项目列表
    detectionGuideStore.$patch({ detectionItems: [] });
  }
  console.log('过滤后的检测项目:', filteredItems.value);
};

// 处理检测项目卡片点击
const handleItemClick = async (item) => {
  // 设置当前检测项目ID
  currentItemId.value = item.item_id;
  // 设置图片标题
  currentImageTitle.value = item.item_name;
  // 显示图片加载状态
  isImageLoading.value = true;
  // 打开图片弹窗
  imageDialogVisible.value = true;
  
  try {
    // 获取当前设备类型
    const deviceType = getDeviceType();
    // 构建图片URL，使用当前设备类型和SVG格式
    const dataUniqueId = `detection:${item.item_id}`;
    const imageUrl = `/api/image/${dataUniqueId}?device_type=${deviceType}&image_type=svg`;
    
    // 使用fetch获取图片数据，接受SVG格式
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/svg+xml'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // 将图片数据转换为Blob
    const blob = await response.blob();
    // 创建Blob URL
    const blobUrl = URL.createObjectURL(blob);
    
    // 设置图片URL
    currentImageUrl.value = blobUrl;
    
    // 获取委托单模板列表
    await fetchTemplates(item.item_id);
  } catch (error) {
    console.error('获取图片失败:', error);
    ElMessage.error('图片加载失败，请稍后重试');
  } finally {
    // 隐藏加载状态
    isImageLoading.value = false;
  }
};

// 获取委托单模板列表
const fetchTemplates = async (itemId) => {
  try {
    // 使用Store获取委托单模板
    await detectionGuideStore.fetchTemplates(itemId);
    currentTemplates.value = detectionGuideStore.getTemplates || [];
  } catch (error) {
    console.error('获取委托单模板失败:', error);
    currentTemplates.value = [];
  }
};

// 处理委托单模板下载
const handleTemplateDownload = (template) => {
  if (!template || !template.download_url) {
    ElMessage.error('模板下载链接无效');
    return;
  }
  
  try {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = template.download_url;
    link.download = ''; // 文件名由服务器在响应头中指定
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('下载模板失败:', error);
    ElMessage.error('模板下载失败，请稍后重试');
  }
};

// 处理图片查看器关闭
const handleImageViewerClose = () => {
  // 清理Blob URL
  if (currentImageUrl.value && currentImageUrl.value.startsWith('blob:')) {
    // 保存当前Blob URL以便释放
    const blobUrl = currentImageUrl.value;
    // 先清空图片URL，防止浏览器尝试加载无效URL
    currentImageUrl.value = '';
    // 延迟释放Blob URL，确保图片元素已处理完URL变更
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  }
  // 清空委托单模板列表
  currentTemplates.value = [];
  // 隐藏加载状态
  isImageLoading.value = false;
};

// 检测设备类型的函数
const getDeviceType = () => {
  // 获取屏幕宽度
  const screenWidth = window.innerWidth;
  // 获取userAgent
  const userAgent = window.navigator.userAgent;
  
  // 检查是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  if (isMobile) {
    // 移动设备
    if (screenWidth < 768) {
      // 手机
      return 'phone';
    } else {
      // 平板
      return 'tablet';
    }
  } else {
    // PC设备
    return 'pc';
  }
};

// 获取检测项目预览图片
const getItemPreviewImage = (item) => {
  // 使用API服务生成图片URL，使用当前设备类型和SVG格式
  const deviceType = getDeviceType();
  return getImageUrl(item.item_id, deviceType, 'svg');
};

// 图片加载完成处理
const handleImageLoad = () => {
  // 隐藏加载状态
  isImageLoading.value = false;
};

// 预览图片加载处理
const handlePreviewImageLoad = () => {
  // 可以添加预览图加载完成的处理
};

// 预览图片加载错误处理
const handlePreviewImageError = (event) => {
  // 可以添加预览图加载错误的处理，例如显示默认图片
  event.target.style.display = 'none';
};


</script>

<style scoped>
.detection-guide {
  padding: 16px;
  box-sizing: border-box;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  margin: 0;
}

/* 检测指南头部样式 */
.detection-guide-header {
  position: relative;
  display: grid;
  grid-template-columns: 84% 16%;
  margin-bottom: 20px;
  padding: 0;
  border-bottom: 1px solid var(--border-color);
  min-height: 50px;
}

.header-title {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.header-search {
  position: relative;
  grid-column: 2;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0;
  margin: 0;
  z-index: 2;
}

.search-container {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 200px;
  max-width: 300px;
}

/* 响应式适配 */
/* 平板设备 */
@media (max-width: 1024px) and (min-width: 769px) {
  .detection-guide-header {
    grid-template-columns: 75% 25%;
  }
  
  .search-container {
    min-width: 180px;
    max-width: 250px;
  }
}

/* 移动设备 */
@media (max-width: 768px) {
  .detection-guide-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-height: auto;
  }
  
  .header-title {
    position: relative;
    width: 100%;
    justify-content: flex-start;
    margin-bottom: 10px;
    min-height: 40px;
  }
  
  .header-search {
    position: relative;
    width: 100%;
    grid-column: unset;
    justify-content: flex-start;
    margin-bottom: 10px;
  }
  
  .search-container {
    max-width: 100%;
    min-width: unset;
  }
}

.search-input {
  flex: 1;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #caced7ff;
  border-right: none;
  border-radius: 4px 0 0 4px;
  font-size: 12px;
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

.search-input::placeholder {
  font-size: 11px;
  color: var(--text-tertiary);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.search-btn {
  height: 28px;
  padding: 0 16px;
  border: 1px solid #409eff;
  border-left: none;
  border-radius: 0 4px 4px 0;
  background-color: #409eff;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.search-btn:active {
  background-color: #3a8ee6;
  border-color: #3a8ee6;
  transform: scale(0.98);
}

.detection-guide-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 侧边栏切换按钮样式 */
.sidebar-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-primary);
  font-size: 18px;
}

.sidebar-toggle-btn:hover {
  background-color: var(--bg-tertiary);
  transform: rotate(180deg);
}

.sidebar-toggle-btn:active {
  transform: rotate(180deg) scale(0.95);
}

.toggle-icon {
  font-size: 20px;
  color: var(--text-primary);
}

/* 悬浮的侧边栏控制按钮样式 */
.sidebar-toggle-btn {
  position: fixed;
  top: 10px;
  left: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-primary);
  font-size: 18px;
  z-index: 9998;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

/* 当侧边栏隐藏时的按钮样式 */
.sidebar-toggle-btn.sidebar-toggle-hidden {
  left: 0;
  border-radius: 0 4px 4px 0;
}

.sidebar-toggle-btn:hover {
  background-color: var(--bg-tertiary);
  transform: rotate(180deg);
}

.sidebar-toggle-btn:active {
  transform: rotate(180deg) scale(0.95);
}

.toggle-icon {
  font-size: 20px;
  color: var(--text-primary);
}

/* 侧边栏遮罩层样式 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 250px;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: 9997;
  transition: all 0.3s ease;
  width: calc(100vw - 250px);
  max-width: calc(100vw - 250px);
  box-sizing: border-box;
}

/* 平板设备侧边栏遮罩层适配 */
@media (max-width: 1024px) and (min-width: 769px) {
  .sidebar-overlay {
    left: 200px;
    width: calc(100vw - 200px);
    max-width: calc(100vw - 200px);
  }
}

/* 移动设备侧边栏遮罩层适配 */
@media (max-width: 768px) {
  .sidebar-overlay {
    left: 180px;
    width: calc(100vw - 180px);
    max-width: calc(100vw - 180px);
  }
}

/* 容器布局 */
.guide-container {
  display: flex;
  gap: 20px;
  min-height: calc(100vh - 100px);
  overflow: visible;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}

/* 左侧检测对象列表容器 */
.sidebar-wrapper {
  width: 250px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  box-sizing: border-box;
}

/* 平板设备侧边栏适配 */
@media (max-width: 1024px) and (min-width: 769px) {
  .sidebar-wrapper {
    width: 200px;
  }
}

/* 移动设备侧边栏适配 */
@media (max-width: 768px) {
  .sidebar-wrapper {
    width: 180px;
  }
}

/* 右侧内容区域 */
.content {
  flex: 1;
  background-color: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  min-height: 400px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.content-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.content-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 检测项目卡片网格 */
.item-grid {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

/* 平板设备适配 */
@media (max-width: 1024px) and (min-width: 769px) {
  .item-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 12px;
  }
}

/* 移动设备适配 */
@media (max-width: 768px) {
  .item-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }
}

/* 检测项目卡片 */
.item-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #dcdfe6;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  max-height: 250px;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  flex-shrink: 0;
}

.card-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-image {
  flex: 1;
  min-height: 150px;
  max-height: 200px;
  overflow: hidden;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 平板设备卡片调整 */
@media (max-width: 1024px) and (min-width: 769px) {
  .card-header {
    padding: 8px;
  }
  
  .card-header h4 {
    font-size: 13px;
  }
  
  .card-image {
    min-height: 120px;
    max-height: 160px;
  }
}

/* 移动设备卡片调整 */
@media (max-width: 768px) {
  .card-header {
    padding: 10px;
  }
  
  .card-header h4 {
    font-size: 14px;
  }
  
  .card-image {
    min-height: 180px;
    max-height: 220px;
  }
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.3s ease;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: var(--text-tertiary);
}


</style>