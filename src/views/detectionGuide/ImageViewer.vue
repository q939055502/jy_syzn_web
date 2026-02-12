<template>
  <div v-if="visible" class="image-viewer-overlay" @click="handleOverlayClick">
    <!-- 图片查看器容器 -->
    <div 
      class="image-viewer-container" 
      :class="{ 'landscape-container': needLandscapeDisplay }"
      @click.stop
    >
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
              下载
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
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { Close, Loading, Picture } from '@element-plus/icons-vue';
import { useDeviceType } from './composables/useDeviceType';

// 导入样式文件
import './styles/imageViewer.css';

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

// 初始化设备类型检测
const deviceType = useDeviceType();

// 图片加载状态
const isLoading = ref(true);
const loadError = ref(false);
// 委托单模板列表显示状态
const showTemplateList = ref(false);

// 计算属性：是否需要横屏显示
const needLandscapeDisplay = computed(() => {
  // 初始化设备类型
  deviceType.initDeviceType();
  // 非电脑设备需要横屏显示
  return !deviceType.isPc.value;
});

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
      // 重新检测设备类型
      deviceType.initDeviceType();
    }
  }
);

// 处理图片加载完成
const handleImageLoad = () => {
  isLoading.value = false;
  loadError.value = false;
};

// 处理图片加载错误
const handleImageError = () => {
  isLoading.value = false;
  loadError.value = true;
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
  // 初始化设备类型
  deviceType.initDeviceType();
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