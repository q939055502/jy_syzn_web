<template>
  <div class="sidebar-container">
    <div class="logo" style="border-bottom: 1px solid #333;">
      <i class="el-icon el-icon-menu"></i>
      分类导航
    </div>
    <div class="sidebar-content" ref="sidebarContentRef">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span class="loading-text">加载中...</span>
        </div>
      </div>
      <!-- 正常菜单内容 -->
      <el-menu
        v-else
        ref="menuRef"
        class="sidebar-menu"
        @select="handleMenuSelect"
        :default-openeds="expandedCategories"
        @open="handleMenuOpen"
        @close="handleMenuClose"
        background-color="#1a1a1a"
        text-color="#ffffff"
        active-text-color="#ffffff"
        :collapse-transition="false"
        :active-index="activeMenuId"
      >
        <!-- 分类列表 -->
        <el-sub-menu
          v-for="category in categories"
          :key="`category-${category.id}`"
          :index="`${category.id}`"
          class="category-item"
          :data-category-id="category.id"
        >
          <template #title>
            <div class="category-title">
              <!-- 使用Element Plus的Plus和Minus图标替代默认箭头 -->
              <el-icon :class="{ 'is-expanded': expandedCategories.includes(category.id) }">
                <Minus v-if="expandedCategories.includes(category.id)" />
                <Plus v-else />
              </el-icon>
              <span>{{ category.name }}</span>
            </div>
          </template>
          
          <!-- 检测对象列表 -->
          <el-menu-item
            v-for="object in category.objects"
            :key="`object-${object.id}`"
            :index="`object-${object.id}`"
          >
            <div class="object-title">
              <span>{{ object.name }}</span>
            </div>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch } from 'vue';
import { Menu, Document, Plus, Minus, Close, Loading } from '@element-plus/icons-vue';



// 导入API服务
import { getDetectionObjects } from '../../api/detectionApi';

// 组件属性
const props = defineProps({
  // 分类数据
  categories: {
    type: Array,
    default: () => []
  },
  // 当前选中的检测对象ID
  selectedObjectId: {
    type: [Number, null],
    default: null
  },
  // 侧边栏是否可见
  isVisible: {
    type: Boolean,
    default: true
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
});

// 组件内部状态
// 当前选中的分类ID
const selectedCategoryId = ref(null);
// 展开的分类列表
const expandedCategories = ref([]);

// 组件事件
const emit = defineEmits([
  // 更新选中的检测对象ID
  'update:selectedObjectId'
]);


// 菜单组件引用
const menuRef = ref(null);

// 监听选中项变化，自动展开对应的分类
// watch(() => props.selectedObjectId, (newObjectId) => {
//   if (newObjectId) {
//     // 如果选中了检测对象，查找并展开对应的分类
//     for (const category of props.categories) {
//       const found = category.objects.some(obj => obj.id == newObjectId);
//       if (found) {
//         // 更新组件内部状态
//         selectedCategoryId.value = category.id;
//         expandedCategories.value = [category.id];
//         // 使用ref手动展开对应的子菜单
//         nextTick(() => {
//           if (menuRef.value) {
//             menuRef.value.open(category.id.toString());
//           }
//         });
//         break;
//       }
//     }
//   }
// }, { immediate: true });



// 计算当前激活的菜单ID
const activeMenuId = computed(() => {
  console.log('Computing activeMenuId with:', {
    selectedObjectId: props.selectedObjectId,
    selectedCategoryId: props.selectedCategoryId
  });
  if (props.selectedObjectId !== null && props.selectedObjectId !== undefined) {
    const menuId = `object-${props.selectedObjectId}`;
    console.log('Returning object menu ID:', menuId);
    return menuId;
  }
  if (props.selectedCategoryId !== null && props.selectedCategoryId !== undefined) {
    const menuId = `${props.selectedCategoryId}`;
    console.log('Returning category menu ID:', menuId);
    return menuId;
  }
  console.log('Returning empty menu ID');
  return '';
});

// 处理菜单选择事件
const handleMenuSelect = (index) => {
  // 判断是否选中的是检测对象
  if (index.startsWith('object-')) {
    // 选中的是检测对象
    // 从索引中提取检测对象ID
    const objectId = parseInt(index.replace('object-', ''));
    
    // 通知父组件更新选中的检测对象ID
    // 父组件会通过 handleObjectIdChange 函数处理所有相关逻辑
    emit('update:selectedObjectId', objectId);
    
    // 查找对应的分类ID
    let categoryId = null;
    for (const category of props.categories) {
      const found = category.objects.some(obj => obj.id == objectId);
      if (found) {
        categoryId = category.id;
        break;
      }
    }
    
    // 更新组件内部状态
    // 更新选中的分类ID
    selectedCategoryId.value = categoryId;
    // 更新展开的分类列表
    if (categoryId) {
      expandedCategories.value = [categoryId];
    }
  } else {
    // 选中的是分类
    const categoryId = parseInt(index);
    
    // 更新组件内部状态
    // 更新选中的分类ID
    selectedCategoryId.value = categoryId;
    // 清空选中的对象ID，因为现在只选中了分类
    emit('update:selectedObjectId', null);
    // 更新展开的分类列表
    expandedCategories.value = [categoryId];
  }
};



// 处理菜单展开事件
const handleMenuOpen = (index, indexPath) => {
  const categoryId = parseInt(index);
  // 清空之前的展开列表，只保留当前展开的分类
  expandedCategories.value = [categoryId];
  
  // 分类展开后执行置顶操作，确保位置准确
  nextTick(() => {
    if (!sidebarContentRef.value) return;
    
    // 用属性查找分类元素
    const categoryElement = document.querySelector(`.category-item[data-category-id="${categoryId}"]`);
    if (!categoryElement) return;

    // 计算滚动位置
    const sidebarContent = sidebarContentRef.value;
    // 获取分类元素的高度
    const categoryHeight = categoryElement.offsetHeight;
    // 获取可视区域的高度
    const viewportHeight = sidebarContent.clientHeight;
    // 计算滚动位置，确保整个分类及其检测对象都能在可视区域内
    const targetTop = categoryElement.offsetTop - 10; // 顶部留10px边距
    
    // 直接置顶
    sidebarContent.scrollTop = Math.max(0, targetTop);
  });
};

// 处理菜单关闭事件
const handleMenuClose = (index) => {
  // 清空展开列表
  expandedCategories.value = [];
};
</script>

<style scoped>
/**
 * 侧边栏组件样式
 */

/* 深色背景样式 - 与图1一致 */
.sidebar-container {
  background-color: #1a1a1a;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0 !important;
  padding: 0 !important;
  position: relative;
  height: 100vh;
  width: 100%;
  scroll-behavior: smooth;
}

.logo {
  height: 40px;
  top: 0;
  color: #ffffff !important;
  background-color: #1a1a1a;
  line-height: 40px;
  text-align: center;
  font-size: 18px;
  border-bottom: 1px solid #333;
  margin: 0 !important;
  padding: 0 !important;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  background-color: #1a1a1a;
  margin: 0 !important;
  padding: 0 !important;
  scroll-behavior: smooth;
  transition: all 0.3s ease;
  /* 确保滚动条始终显示，即使内容没有超出 */
  scrollbar-width: thin;
  scrollbar-color: #666 #333;
}

/* 侧边栏菜单样式 */
.sidebar-menu {
  border-right: none;
  background-color: #1a1a1a;
  color: #ffffff !important;
}

/* 确保菜单基本文字是白色 */
.sidebar-menu {
  color: #ffffff;
}

/* 激活状态菜单项样式 - 增强优先级 */
.sidebar-menu:deep(.el-menu-item.is-active) {
  background-color: #67C23A !important;
  color: #ffffff !important;
  border-left: 4px solid #4CAF50;
  padding-left: 44px !important;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
  /* 确保优先级最高 */
  position: relative !important;
  z-index: 1000 !important;
}

/* 激活状态分类标题样式 */
.sidebar-menu:deep(.el-sub-menu__title.is-active) {
  background-color: #3a3a3a !important;
  color: #ffffff !important;
  border-left: 4px solid #409EFF;
  border-bottom: 2px solid #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

/* 隐藏默认的下拉箭头 */
.sidebar-menu:deep(.el-sub-menu__icon-arrow) {
  display: none !important;
}

/* Element Plus图标样式 */
.sidebar-menu:deep(.el-icon) {
  color: #ffffff !important;
  margin-right: 8px;
  font-size: 16px;
}

/* 分类标题样式 */
.sidebar-menu:deep(.el-sub-menu__title) {
  padding: 16px 16px;
  margin: 0;
  border-radius: 0;
  transition: all 0.2s ease;
  background-color: #2a2a2a;
  color: #ffffff !important;
  height: auto;
  line-height: 24px;
  border-bottom: 2px solid #409EFF;
  font-size: 16px;
  font-weight: 700;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.sidebar-menu:deep(.el-sub-menu__title:hover) {
  background-color: #333333;
  color: #ffffff !important;
  border-left: 4px solid #409EFF;
}

.sidebar-menu:deep(.el-sub-menu__title.is-active) {
  background-color: #2d2d2d;
  color: #ffffff !important;
  border-left: 4px solid #409EFF;
}

/* 分类标题文字样式 */
.sidebar-menu:deep(.el-sub-menu__title) span {
  color: #ffffff !important;
  font-weight: 700;
  font-size: 16px;
}

/* 检测对象菜单项样式 */
.sidebar-menu:deep(.el-menu-item) {
  padding: 12px 0 12px 48px;
  margin: 0;
  border-radius: 0;
  transition: all 0.2s ease;
  background-color: #121212;
  height: auto;
  line-height: 20px;
  color: #b0b0b0 !important;
  font-size: 14px;
  border-bottom: 1px solid #202020;
  border-left: 4px solid transparent;
}

.sidebar-menu:deep(.el-menu-item:hover) {
  background-color: #1e1e1e !important;
  color: #ffffff !important;
  padding-left: 52px;
  border-left: 4px solid #66B1FF;
}

/* 检测对象文字样式 */
.sidebar-menu:deep(.el-menu-item) span {
  color: #b0b0b0 !important;
  font-size: 14px;
}

/* 激活状态菜单项文字样式 */
.sidebar-menu:deep(.el-menu-item.is-active) span {
  color: #ffffff !important;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 激活状态分类标题文字样式 */
.sidebar-menu:deep(.el-sub-menu__title.is-active) span {
  color: #ffffff !important;
  font-weight: 700;
}

/* 分类标题和检测对象标题容器 */
.category-title,
.object-title {
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-title span {
  color: #ffffff !important;
  font-weight: 700;
  font-size: 16px;
}

.object-title span {
  color: #b0b0b0 !important;
  font-size: 14px;
}

/* 滚动条样式 - 优化深色背景下的可见性 */
/* WebKit浏览器滚动条样式 */
.sidebar-content::-webkit-scrollbar {
  width: 8px;
  /* 始终显示滚动条轨道 */
  display: block;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #333;
  /* 添加轨道边框 */
  border-left: 1px solid #444;
  border-radius: 4px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 4px;
  /* 添加滚动条阴影 */
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #888;
  /* 鼠标悬停时加深颜色 */
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.7);
  transform: scaleX(1.1);
}

/* 平滑滚动效果 */
.sidebar-content {
  scroll-behavior: smooth;
}

/* 确保菜单展开/折叠时没有动画 */
.el-menu--collapse-transition {
  transition: none !important;
}

/* 当菜单项被激活时，自动滚动到可视区域 */
.sidebar-menu:deep(.el-menu-item.is-active),
.sidebar-menu:deep(.el-sub-menu__title.is-active) {
  scroll-margin-top: 10px;
  scroll-margin-bottom: 10px;
}

/* 加载中状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: #1a1a1a;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-icon {
  font-size: 32px;
  color: #67C23A;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #ffffff;
  font-size: 14px;
  opacity: 0.8;
}

/* 旋转动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>