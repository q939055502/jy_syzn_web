<template>
  <el-form
    ref="elFormRef"
    class="me-search-form"
    :class="formClass"
    :label-width="labelWidth"
    :label-position="labelPosition"
  >
    <slot></slot>
    <el-form-item class="button-item">
      <slot name="button"></slot>
      <el-button 
        v-if="showSearchButton" 
        type="primary" 
        :loading="loading" 
        @click="search()"
      >
        {{ searchText || '查询' }}
      </el-button>
      <el-button 
        v-if="showResetButton" 
        @click="handleReset"
      >
        {{ resetText || '重置' }}
      </el-button>
      <el-button 
        v-if="forever > 0" 
        text 
        bg 
        @click="toggleShowAll"
      >
        {{ showAll ? '收起' : '展开' }}
        <el-icon class="more-icon" :class="{ reversal: showAll }">
          <ArrowDown />
        </el-icon>
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup name="MeSearchForm">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';

// 定义组件属性
const props = defineProps({
  forever: {
    // 收起后展示的筛选项数量，0为不收起
    type: Number,
    default: 1
  },
  defaultAll: {
    type: Boolean,
    default: false
  },
  searchText: {
    type: String,
    default: ''
  },
  resetText: {
    type: String,
    default: ''
  },
  labelWidth: {
    type: [String, Number],
    default: '80px'
  },
  labelPosition: {
    type: String,
    default: 'right'
  },
  onSearch: {
    type: Function,
    default: null
  },
  onReset: {
    type: Function,
    default: null
  }
});

// 定义组件事件
const emit = defineEmits(['search', 'reset', 'update:loading']);

// 表单引用
const elFormRef = ref(null);

// 显示所有筛选项
const showAll = ref(props.defaultAll);

// 表单类名
const formClass = ref('');

// loading 状态
const loading = ref(false);

// 是否显示查询按钮
const showSearchButton = computed(() => props.searchText !== undefined);

// 是否显示重置按钮
const showResetButton = computed(() => props.resetText !== undefined);

// ResizeObserver 实例
let resizeObserver = null;

// 切换显示所有筛选项
const toggleShowAll = () => {
  showAll.value = !showAll.value;
  updateFormItemsDisplay();
};

// 更新表单项目显示
const updateFormItemsDisplay = () => {
  if (!elFormRef.value) return;
  
  // 获取表单的所有直接子元素
  const formElement = elFormRef.value.$el || elFormRef.value;
  const children = Array.from(formElement.children);
  
  // 遍历所有子元素，除了最后一个（按钮项）
  children.forEach((child, index) => {
    if (index >= props.forever && index !== children.length - 1) {
      if (showAll.value) {
        // 展开：恢复原始 display 属性
        const originalDisplay = child.dataset.display || 'block';
        child.style.display = originalDisplay;
      } else {
        // 收起：保存原始 display 属性并隐藏
        child.dataset.display = getComputedStyle(child).display;
        child.style.display = 'none';
      }
    }
  });
};

// 处理表单大小变化
const handleResize = (entries) => {
  if (!entries || entries.length === 0) return;
  
  const { width } = entries[0].contentRect;
  
  // 根据宽度设置表单类名
  if (width < 768) {
    formClass.value = '';
  } else if (width < 1150) {
    formClass.value = 'lg';
  } else if (width < 1600) {
    formClass.value = 'xl';
  } else {
    formClass.value = 'xl-2';
  }
};

// 搜索方法
const search = async () => {
  loading.value = true;
  emit('update:loading', true);
  
  try {
    // 执行搜索回调
    if (props.onSearch) {
      await props.onSearch();
    }
    // 触发 search 事件
    emit('search');
  } finally {
    loading.value = false;
    emit('update:loading', false);
  }
};

// 重置方法
const handleReset = () => {
  if (props.onReset) {
    // 执行自定义重置回调
    props.onReset();
  } else if (elFormRef.value) {
    // 使用 Element Plus 表单的重置方法
    elFormRef.value.resetFields();
  }
  // 触发 reset 事件
  emit('reset');
};

// 组件挂载时执行
onMounted(() => {
  // 初始化 ResizeObserver
  if (elFormRef.value) {
    const formElement = elFormRef.value.$el || elFormRef.value;
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(formElement);
  }
  
  // 初始化表单项目显示
  updateFormItemsDisplay();
});

// 组件卸载前执行
onBeforeUnmount(() => {
  // 断开 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

// 监听 showAll 变化
watch(showAll, () => {
  updateFormItemsDisplay();
});

// 暴露组件方法
defineExpose({
  elFormRef,
  search,
  reset: handleReset
});
</script>

<style scoped>
.me-search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  :deep(> *) {
    width: 100%;
    padding-right: 0;
  }

  .button-item {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    margin-bottom: 0;
  }

  .more-icon {
    transition: transform 0.35s;
    margin-left: 5px;
  }

  .reversal {
    transform: rotateZ(180deg);
  }

  :deep(.el-form-item__content) {
    flex-grow: 1;
    flex-shrink: 1;

    > div {
      flex: 1;
    }

    .search-buttons {
      display: flex;
      align-items: center;
    }
  }
}

.lg {
  :deep(> *) {
    width: 50%;
    padding-right: 20px;
  }
}

.xl {
  :deep(> *) {
    width: 33.3%;
    padding-right: 20px;
  }
}

.xl-2 {
  :deep(> *) {
    width: 25%;
    padding-right: 20px;
  }
}
</style>