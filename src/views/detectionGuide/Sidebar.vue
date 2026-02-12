<template>
  <div class="sidebar-container">
    <div class="logo" style="border-bottom: 1px solid #333;">
      <i class="el-icon el-icon-menu"></i>
      分类导航
    </div>
    <div class="sidebar-content" ref="sidebarContentRef">
      <el-menu
        ref="menuRef"
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
            <div class="category-title" @click="handleCategoryClick(category.id)">
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
import { Menu, Document, Plus, Minus, Close } from '@element-plus/icons-vue';

// 导入样式文件
import './styles/sidebar.css';

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

// 仅新增：用于滚动的ref
const sidebarContentRef = ref(null);

// 菜单组件引用
const menuRef = ref(null);

// 删除冗余的手动DOM加类逻辑，由el-menu的:active-index自动管理激活态

// 计算当前激活的菜单ID
const activeMenuId = computed(() => {
  console.log('Computing activeMenuId with selectedObjectId:', props.selectedObjectId);
  if (props.selectedObjectId !== null && props.selectedObjectId !== undefined) {
    return `object-${props.selectedObjectId}`;
  }
  if (props.selectedCategoryId !== null && props.selectedCategoryId !== undefined) {
    return `${props.selectedCategoryId}`;
  }
  return '';
});

// 处理菜单选择事件
const handleMenuSelect = (index) => {
  console.log('handleMenuSelect called with index:', index);
  console.log("----------")
  if (index.startsWith('object-')) {
    // 选中的是检测对象
     console.log(index);
    const objectId = parseInt(index.replace('object-', ''));
    console.log('Emitting update:selectedObjectId with--:', objectId);
    emit('update:selectedObjectId', objectId);
    
    // 查找并设置对应的分类ID
    let categoryId = null;
    for (const category of props.categories) {
      const found = category.objects.some(obj => obj.id == objectId);
      if (found) {
        categoryId = category.id;
        break;
      }
    }
    console.log('Emitting update:selectedCategoryId with:', categoryId);
    emit('update:selectedCategoryId', categoryId);
  }
};

// 处理分类项点击事件
const handleCategoryClick = (categoryId) => {
  // 分类标题点击时不执行置顶操作，留给handleMenuOpen处理
};

// 处理菜单展开事件
const handleMenuOpen = (index, indexPath) => {
  const categoryId = parseInt(index);
  // 清空之前的展开列表，只保留当前展开的分类
  emit('update:expandedCategories', [categoryId]);
  
  // 分类展开后执行置顶操作，确保位置准确
  nextTick(() => {
    if (!sidebarContentRef.value) return;
    
    // 用属性查找分类元素
    const categoryElement = document.querySelector(`.category-item[data-category-id="${categoryId}"]`);
    if (!categoryElement) return;

    // 计算滚动位置
    const sidebarContent = sidebarContentRef.value;
    const targetTop = categoryElement.offsetTop - 10; // 顶部留10px边距
    
    // 平滑滚动置顶
    sidebarContent.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth'
    });
  });
};

// 处理菜单关闭事件
const handleMenuClose = (index) => {
  // 清空展开列表
  emit('update:expandedCategories', []);
};
</script>