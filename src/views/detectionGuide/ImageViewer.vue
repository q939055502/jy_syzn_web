<template>
  <div v-if="visible" class="image-viewer-overlay" @click="handleOverlayClick">
    <!-- 图片查看器容器 -->
    <div class="image-viewer-container" @click.stop>
      <!-- 头部工具栏 -->
      <div class="viewer-header">
        <!-- 第一列：标题区域 -->
        <div class="header-left">
          <div class="project-name">
            {{ title }}
          </div>
        </div>
        
        <!-- 第二列：按钮区域 -->
        <div class="header-right">
          <!-- 委托单下载按钮 -->
          <div class="delegation-download-container">
            <el-button
              type="primary"
              size="small"
              :disabled="!templates.length"
              @click="showTemplateList = !showTemplateList"
              class="delegation-download-button"
            >
              委托单下载
            </el-button>
            
            <!-- 委托单模板列表 -->
            <div v-if="showTemplateList && templates.length" class="delegation-template-list">
              <div
                v-for="template in templates"
                :key="template.id"
                class="template-item"
                @click="handleDownloadTemplate(template)"
              >
                {{ template.code }}
              </div>
            </div>
          </div>
          
          <!-- 关闭按钮 -->
          <el-button
            type="danger"
            size="small"
            circle
            @click="handleClose"
            class="close-button"
          >
            <el-icon>
              <Close />
            </el-icon>
          </el-button>
        </div>
      </div>
      
      <!-- 第二行：图片内容区域 -->
      <div class="viewer-content">
        <!-- 图片容器 -->
        <div class="full-image-container">
          <!-- 使用原生img标签显示SVG图片 -->
          <img
            :src="imageUrl"
            :alt="title"
            class="full-image"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          
          <!-- 加载中状态 -->
          <div v-if="isLoading" class="image-loading-overlay">
            <div class="full-image-loading">
              <el-icon size="48">
                <Loading />
              </el-icon>
              <span>图片加载中...</span>
            </div>
          </div>
          
          <!-- 加载失败状态 -->
          <div v-if="loadError" class="image-loading-overlay">
            <div class="full-image-error">
              <el-icon size="48">
                <Picture />
              </el-icon>
              <span>图片加载失败</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Close, Loading, Picture } from '@element-plus/icons-vue';

// 组件属性
const props = defineProps({
  // 查看器是否可见
  visible: {
    type: Boolean,
    default: false
  },
  // 图片URL
  imageUrl: {
    type: String,
    default: ''
  },
  // 图片标题
  title: {
    type: String,
    default: ''
  },
  // 委托单模板列表
  templates: {
    type: Array,
    default: () => []
  }
});

// 组件事件
const emit = defineEmits(['update:visible', 'download-template', 'close']);

// 图片加载状态
const isLoading = ref(true);
const loadError = ref(false);
// 委托单模板列表显示状态
const showTemplateList = ref(false);

// 监听图片URL变化，重置加载状态
watch(
  () => props.imageUrl,
  (newUrl) => {
    if (newUrl) {
      isLoading.value = true;
      loadError.value = false;
    }
  }
);

// 监听visible变化，重置加载状态
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible && props.imageUrl) {
      isLoading.value = true;
      loadError.value = false;
    }
  }
);

// 处理图片加载完成
const handleImageLoad = () => {
  isLoading.value = false;
  loadError.value = false;
  console.log('图片加载完成:', props.imageUrl);
};

// 处理图片加载错误
const handleImageError = () => {
  isLoading.value = false;
  loadError.value = true;
  console.error('图片加载失败:', props.imageUrl);
};

// 关闭查看器
const handleClose = () => {
  showTemplateList.value = false;
  emit('update:visible', false);
  emit('close');
};

// 点击遮罩层关闭查看器
const handleOverlayClick = () => {
  showTemplateList.value = false;
  emit('update:visible', false);
  emit('close');
};

// 点击模板列表外部关闭列表
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.download-dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    showTemplateList.value = false;
  }
};

// 监听点击事件
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 下载委托单模板
const handleDownloadTemplate = (template) => {
  showTemplateList.value = false;
  emit('download-template', template);
};
</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: auto;
  animation: fadeIn 0.3s ease;
}

.image-viewer-container {
  background-color: #ffffff;
  border-radius: 12px;
  width: 90%;
  max-width: 90vw;
  height: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
  box-sizing: border-box;
}

/* 头部工具栏 */
.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

/* 第一列：标题区域 */
.header-left {
  flex: 1;
  display: flex;
  align-items: center;
}

/* 项目名称 */
.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16px;
}

/* 第二列：按钮区域 */
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.close-button {
  padding: 8px;
}

/* 图片内容区域 */
.viewer-content {
  flex: 1;
  padding: 10px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.full-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 0;
  box-sizing: border-box;
  position: relative;
  flex: 1;
}

.full-image {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: none;
}

/* 图片加载覆盖层 */
.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  z-index: 10;
}

.full-image-loading,
.full-image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #909399;
  gap: 16px;
}

.full-image-loading span,
.full-image-error span {
  font-size: 16px;
}



/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 右侧按钮组 */
.header-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 委托单下载按钮和模板列表 */
.delegation-download-container {
  position: relative;
  display: inline-block;
  z-index: 10;
}

.delegation-download-button {
  background-color: #409EFF;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delegation-download-button:hover {
  background-color: #66B1FF;
}

.delegation-download-button:disabled {
  background-color: #C6E2FF;
  cursor: not-allowed;
}

/* 委托单模板列表 */
.delegation-template-list {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 120px;
  background-color: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  z-index: 1000;
}

/* 委托单模板项 */
.template-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  text-align: center;
}

.template-item:hover {
  background-color: #f5f7fa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-viewer-container {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .viewer-header {
    padding: 8px 12px;
  }
  
  .project-name {
    font-size: 14px;
  }
  
  .viewer-content {
    padding: 8px;
  }
  
  .full-image-container {
    padding: 0;
  }
  
  /* 响应式下拉菜单 */
  .template-list-dropdown {
    min-width: 200px;
    max-height: 250px;
  }
  
  .template-item {
    padding: 10px 12px;
  }
  
  .template-name {
    font-size: 13px;
  }
  
  .template-code {
    font-size: 11px;
  }
}
</style>