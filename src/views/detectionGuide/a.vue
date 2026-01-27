<template>
  <div class="sidebar-container">
    <div class="logo" style="border-bottom: 1px solid #333;">
      <i class="el-icon el-icon-menu"></i>
      分类导航
    </div>
    <div class="sidebar-content">
      <el-menu
        :default-active="activeMenuId"
        class="sidebar-menu"
        :unique-opened="true"
        @select="handleMenuSelect"
        :default-openeds="expandedCategories"
        @open="handleMenuOpen"
        @close="handleMenuClose"
        background-color="#1a1a1a"
        text-color="#ffffff"
        active-text-color="#ffffff"
        :collapse-transition="false"
      >
        <!-- 分类列表 -->
        <el-sub-menu
          v-for="category in categories"
          :key="`category-${category.id}`"
          :index="`${category.id}`"
        >
          <template #title>
            <div class="category-title" @click="handleCategoryClick(category)">
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
            :class="{ 'active-item': selectedObjectId === object.id }"
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
import { computed, ref } from 'vue';
import { Menu, Document, Plus, Minus, Close } from '@element-plus/icons-vue';

// 导入API服务
import { getDetectionObjects } from '../../api/detectionApi';

// 组件属性
const props = defineProps({
  // 分类数据
  categories: {
    type: Array,
    default: () => []
  },
  // 展开的分类ID列表
  expandedCategories: {
    type: Array,
    default: () => []
  },
  // 当前选中的分类ID
  selectedCategoryId: {
    type: [Number, null],
    default: null
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
  }
});

// 组件事件
const emit = defineEmits([
  'update:selectedCategoryId',
  'update:selectedObjectId',
  'update:expandedCategories'
]);

// 计算当前激活的菜单ID
const activeMenuId = computed(() => {
  if (props.selectedObjectId) {
    return `object-${props.selectedObjectId}`;
  }
  if (props.selectedCategoryId) {
    return `${props.selectedCategoryId}`;
  }
  return '';
});

// 处理菜单选择事件
const handleMenuSelect = (index) => {
  if (index.startsWith('object-')) {
    // 选中的是检测对象
    const objectId = parseInt(index.replace('object-', ''));
    emit('update:selectedObjectId', objectId);
    
    // 查找并设置对应的分类ID
    let categoryId = null;
    for (const category of props.categories) {
      const found = category.objects.some(obj => obj.id === objectId);
      if (found) {
        categoryId = category.id;
        break;
      }
    }
    emit('update:selectedCategoryId', categoryId);
  }
};

// 处理分类项点击事件，实现点击置顶功能
const handleCategoryClick = (category) => {
  console.log('点击分类:', category);
  
  // 通过滚动到元素的方式来实现点击置顶功能，不改变分类的排序顺序
  // 1. 找到侧边栏内容容器
  const sidebarContent = document.querySelector('.sidebar-content');
  if (sidebarContent) {
    // 2. 找到当前分类对应的DOM元素
    const categoryElement = document.querySelector(`[index="${category.id}"]`);
    if (categoryElement) {
      // 3. 将分类元素滚动到侧边栏顶部
      categoryElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      console.log('分类项已滚动到顶部:', category.name);
    }
  }
};

// 处理菜单展开事件
const handleMenuOpen = (index, indexPath) => {
  console.log('处理菜单展开事件:', { index, indexPath });
  
  const categoryId = parseInt(index);
  // 清空之前的展开列表，只保留当前展开的分类
  emit('update:expandedCategories', [categoryId]);
};

// 处理菜单关闭事件
const handleMenuClose = (index) => {
  // 清空展开列表
  emit('update:expandedCategories', []);
};
</script>

<style scoped>
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

/* 确保所有文字都是白色 */
.sidebar-menu * {
  color: #ffffff !important;
}

/* 隐藏默认的下拉箭头 */
.sidebar-menu :deep(.el-sub-menu__icon-arrow) {
  display: none !important;
}

/* Element Plus图标样式 */
.sidebar-menu :deep(.el-icon) {
  color: #ffffff !important;
  margin-right: 8px;
  font-size: 16px;
}

/* 分类标题样式 */
.sidebar-menu :deep(.el-sub-menu__title) {
  padding: 12px 16px;
  margin: 0;
  border-radius: 0;
  transition: all 0.2s ease;
  background-color: #1a1a1a;
  color: #ffffff !important;
  height: auto;
  line-height: 24px;
  border-bottom: 1px solid #333;
  font-size: 16px;
  font-weight: 600;
  position: relative;
}

.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: #2a2a2a;
  color: #ffffff !important;
}

.sidebar-menu :deep(.el-sub-menu__title.is-active) {
  background-color: #1a1a1a;
  color: #ffffff !important;
}

/* 分类标题文字样式 */
.sidebar-menu :deep(.el-sub-menu__title) span {
  color: #ffffff !important;
}

/* 检测对象菜单项样式 */
.sidebar-menu :deep(.el-menu-item) {
  padding: 10px 0 10px 40px;
  margin: 0;
  border-radius: 0;
  transition: all 0.2s ease;
  background-color: #1a1a1a;
  height: 40px;
  line-height: 40px;
  color: #ffffff !important;
  font-size: 14px;
  border-bottom: 1px solid #333;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #2a2a2a !important;
  color: #ffffff !important;
  padding-left: 45px;
}

.sidebar-menu :deep(.el-menu-item.is-active),
.active-item {
  background-color: #2a2a2a !important;
  color: #ffffff !important;
  padding-left: 45px;
}

/* 检测对象文字样式 */
.sidebar-menu :deep(.el-menu-item) span {
  color: #ffffff !important;
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
  color: #ffffff !important;
}

.category-title span,
.object-title span {
  color: #ffffff !important;
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
.sidebar-menu :deep(.el-menu-item.is-active),
.sidebar-menu :deep(.el-sub-menu__title.is-active) {
  scroll-margin-top: 10px;
  scroll-margin-bottom: 10px;
}

</style>