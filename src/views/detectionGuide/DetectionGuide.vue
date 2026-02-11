<template>
  <div class="detection-guide">
    <!-- 搜索框区域 - 放到标题上面一层，居右显示 -->
    <div class="search-area">
      <div class="search-container">
        <input 
          type="text" 
          class="search-input"
          placeholder="检测对象/参数/规范名称/代码"
          :value="search.searchKeyword.value"
          @input="updateSearchKeyword"
          @keyup.enter="search.handleSearch"
        />
        <button class="search-btn" @click="search.handleSearch">搜索</button>
      </div>
    </div>
    
    <!-- 标题区域 -->
    <div class="title-area">
      <h2>检测指南</h2>
    </div>
    
    <!-- 悬浮的侧边栏控制按钮 -->
    <div 
      class="sidebar-toggle-container"
      :class="{ 'sidebar-hidden': !isSidebarVisible }"
    >
      <button 
        class="sidebar-toggle-btn"
        @click="toggleSidebar"
        :title="isSidebarVisible ? '隐藏侧边栏' : '显示侧边栏'"
      >
        <!-- 展开状态图标 -->
        <img v-if="isSidebarVisible" class="toggle-icon" src="/src/assets/收起.svg" alt="隐藏侧边栏" />
        <!-- 收起状态图标 -->
        <img v-else class="toggle-icon" src="/src/assets/展开.svg" alt="显示侧边栏" />
      </button>
      
      <!-- 提示气泡 -->
      <div v-if="showBubble" class="sidebar-bubble">
        <img src="/src/assets/气泡.svg" alt="提示" class="bubble-image" />
      </div>
    </div>
    
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
      
      <!-- 右侧内容区域 -->
      <div class="content">
        <!-- 搜索结果显示 -->
        <div v-if="search.isSearchMode.value" class="search-results">
          <div class="search-results-header">
            <h3>搜索结果 ({{ search.searchResults.value.length }})</h3>
            <button class="back-btn" @click="search.exitSearchMode">返回</button>
          </div>
          <div class="search-results-grid">
            <div
              v-for="item in search.searchResults.value"
              :key="item.item_id"
              class="item-card"
              @click="handleSearchResultClick(item)"
            >
              <div class="card-header">
                <h4>{{ item.item_name }}</h4>
              </div>
              <div class="card-image">
                <img 
                  :src="getItemPreviewImage(item)" 
                  :alt="item.item_name" 
                  class="preview-img"
                  @load="imageLoader.handlePreviewImageLoad"
                  @error="imageLoader.handlePreviewImageError"
                />
              </div>
            </div>
          </div>
          <div v-if="search.searchResults.value.length === 0 && !search.isSearching.value" class="empty-state">
            <el-icon class="empty-icon"><Search /></el-icon>
            <p>未找到匹配的检测项目</p>
          </div>
          <div v-if="search.isSearching.value" class="loading-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p>搜索中...</p>
          </div>
        </div>
        
        <!-- 正常检测项目显示 -->
        <template v-else>
          <div class="item-grid" v-if="selectedObjectId">
            <div
              v-for="item in filteredItems"
              :key="item.item_id"
              class="item-card"
              @click="handleItemClick(item)"
            >
              <div class="card-header">
                <h4>{{ item.item_name }}</h4>
              </div>
              <div class="card-image">
                <img 
                  :src="getItemPreviewImage(item)" 
                  :alt="item.item_name" 
                  class="preview-img"
                  @load="imageLoader.handlePreviewImageLoad"
                  @error="imageLoader.handlePreviewImageError"
                />
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <img src="/src/assets/guide_01.png" alt="送检流程" class="guide-image" />
          </div>
        </template>
      </div>
    </div>
    
    <!-- 图片放大查看弹窗 -->
    <ImageViewer
      :visible="imageDialogVisible"
      :imageUrl="imageLoader.currentImageUrl.value"
      :title="currentImageTitle"
      :templates="currentTemplates"
      @update:visible="imageDialogVisible = $event"
      @download-template="handleTemplateDownload"
      @close="handleImageViewerClose"
    />
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Document, Loading, Menu, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useDetectionGuideStore } from './store/detectionGuideStore';

// 导入样式文件
import './styles/detectionGuide.css';

// 导入组合式函数
import { useDeviceType } from './composables/useDeviceType';
import { useImageLoader } from './composables/useImageLoader';
import { useSearch } from './composables/useSearch';

// 导入组件
import Sidebar from './Sidebar.vue';
import ImageViewer from './ImageViewer.vue';

// 导入API服务
import { getImageUrl } from './api/detectionGuideApi';

// 获取检测指南状态
const detectionGuideStore = useDetectionGuideStore();

// 初始化组合式函数
const deviceType = useDeviceType();
const imageLoader = useImageLoader();
const search = useSearch();

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

// 气泡显示状态
const showBubble = ref(false);

// 气泡显示定时器
let bubbleTimer = null;

// 切换侧边栏显隐
const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};

// 更新搜索关键词，确保只接受字符串类型
const updateSearchKeyword = (event) => {
  if (event && typeof event.target.value === 'string') {
    search.searchKeyword.value = event.target.value;
  } else {
    search.searchKeyword.value = '';
  }
};

// 过滤后的检测项目
const filteredItems = computed(() => {
  return detectionGuideStore.getDetectionItems;
});

// 加载状态
const isLoading = computed(() => detectionGuideStore.getIsLoading);

// 图片弹窗状态
const imageDialogVisible = ref(false);
// 当前查看的图片标题
const currentImageTitle = ref('');
// 当前检测项目ID
const currentItemId = ref('');
// 当前委托单模板列表
const currentTemplates = ref([]);

// 设备类型监听器清理函数
let cleanupResizeListener = null;

// 组件挂载时获取分类及其检测对象和检测项目列表
onMounted(async () => {
  // 初始化设备类型
  deviceType.initDeviceType();
  // 设置设备类型监听器
  cleanupResizeListener = deviceType.setupResizeListener();
  
  // 加载分类及其检测对象
  try {
    await detectionGuideStore.fetchCategoriesWithObjects();
  } catch (error) {
    ElMessage.error('数据加载失败');
  }
  
  // 显示气泡并在5秒后隐藏
  showBubble.value = true;
  bubbleTimer = setTimeout(() => {
    showBubble.value = false;
  }, 2000);
});

// 组件卸载时清理监听器
onUnmounted(() => {
  if (cleanupResizeListener) {
    cleanupResizeListener();
  }
  
  // 清理气泡定时器
  if (bubbleTimer) {
    clearTimeout(bubbleTimer);
  }
});

// 处理检测对象ID变化
const handleObjectIdChange = async (objectId) => {
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
  
  // 根据检测对象ID获取检测项目列表
  if (objectId) {
    try {
      await detectionGuideStore.fetchDetectionItems(objectId);
    } catch (error) {
      ElMessage.error('获取检测项目失败');
    }
  } else {
    // 清空检测项目列表
    detectionGuideStore.$patch({ detectionItems: [] });
  }
};

// 处理检测项目卡片点击
const handleItemClick = async (item) => {
  // 确保item存在且有item_id属性
  if (!item || !item.item_id) {
    return;
  }
  // 设置当前检测项目ID
  currentItemId.value = item.item_id;
  // 设置图片标题
  currentImageTitle.value = item.item_name;
  // 打开图片弹窗
  imageDialogVisible.value = true;
  
  try {
    // 确保设备类型是字符串
    const deviceTypeStr = typeof deviceType.currentDeviceType === 'string' ? deviceType.currentDeviceType : 'pc';
    // 构建图片URL，使用当前设备类型和SVG格式
    const imageUrl = imageLoader.buildImageUrl(item.item_id, deviceTypeStr);
    
    // 加载图片并转换为Blob URL
    await imageLoader.loadImageAsBlob(imageUrl);
    
    // 获取委托单模板列表
    await fetchTemplates(item.item_id);
  } catch (error) {
    ElMessage.error('图片加载失败，请稍后重试');
  }
};

// 获取委托单模板列表
const fetchTemplates = async (itemId) => {
  try {
    // 使用Store获取委托单模板
    await detectionGuideStore.fetchTemplates(itemId);
    currentTemplates.value = detectionGuideStore.getTemplates || [];
  } catch (error) {
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
    // 尝试从URL中提取文件名
    const urlParts = template.download_url.split('?')[0].split('/');
    const fileName = urlParts[urlParts.length - 1];
    link.download = fileName || '';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    ElMessage.error('模板下载失败，请稍后重试');
  }
};

// 处理图片查看器关闭
const handleImageViewerClose = () => {
  // 清理图片资源
  imageLoader.cleanupCurrentImage();
  // 清空委托单模板列表
  currentTemplates.value = [];
};

// 获取检测项目预览图片
const getItemPreviewImage = (item) => {
  // 确保item存在且有item_id属性
  if (!item || !item.item_id) {
    return '';
  }
  // 确保设备类型是字符串
  const deviceTypeStr = typeof deviceType.currentDeviceType === 'string' ? deviceType.currentDeviceType : 'pc';
  // 使用API服务生成图片URL，使用当前设备类型和SVG格式
  return getImageUrl(item.item_id, deviceTypeStr, 'svg');
};

// 处理搜索结果项点击
const handleSearchResultClick = async (item) => {
  // 确保item存在且有item_id属性
  if (!item || !item.item_id) {
    return;
  }
  // 设置当前检测项目ID
  currentItemId.value = item.item_id;
  // 设置图片标题
  currentImageTitle.value = item.item_name;
  // 打开图片弹窗
  imageDialogVisible.value = true;
  
  try {
    // 确保设备类型是字符串
    const deviceTypeStr = typeof deviceType.currentDeviceType === 'string' ? deviceType.currentDeviceType : 'pc';
    // 构建图片URL，使用当前设备类型和SVG格式
    const imageUrl = imageLoader.buildImageUrl(item.item_id, deviceTypeStr);
    
    // 加载图片并转换为Blob URL
    await imageLoader.loadImageAsBlob(imageUrl);
    
    // 获取委托单模板列表
    await fetchTemplates(item.item_id);
  } catch (error) {
    ElMessage.error('图片加载失败，请稍后重试');
  }
};

</script>

