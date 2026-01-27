<template>
  <el-button 
    v-bind="filteredAttrs" 
    ref="buttonRef"
    :loading="loading" 
    @click="handleClick"
  >
    <slot></slot>
  </el-button>
</template>

<script setup name="MeButton">
import { ref, computed } from 'vue';

// 定义组件属性
const props = defineProps({
  // 继承 Element Plus 按钮的所有属性
});

// 定义组件事件
const emit = defineEmits(['click', 'update:loading']);

// 按钮引用
const buttonRef = ref(null);

// loading 状态
const loading = ref(false);

// 获取组件属性
const attrs = useAttrs();

// 过滤属性，移除 onClick 和 loading
const filteredAttrs = computed(() => {
  const result = { ...attrs };
  delete result.onClick;
  delete result.loading;
  return result;
});

// 处理点击事件
const handleClick = async (event) => {
  // 更新 loading 状态
  loading.value = true;
  emit('update:loading', true);
  
  try {
    // 执行点击事件回调
    if (attrs.onClick) {
      await attrs.onClick(event);
    }
    // 触发 click 事件
    emit('click', event);
  } finally {
    // 恢复 loading 状态
    loading.value = false;
    emit('update:loading', false);
  }
};

// 暴露组件方法
defineExpose({
  // 暴露 Element Plus 按钮的所有方法
  getButtonRef: () => buttonRef.value
});
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>