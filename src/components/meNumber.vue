<template>
  <span>
    <span class="prefix">{{ numberInfo.prefix }}</span>
    <span class="output">{{ output }}</span>
    <span class="suffix">{{ numberInfo.suffix }}</span>
  </span>
</template>

<script setup name="MeNumber">
import { ref, watch, onMounted } from 'vue';

// 定义组件属性
const props = defineProps({
  start: {
    type: Number,
    default: 0
  },
  end: {
    type: [Number, Array],
    default: 0
  },
  delay: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 1000
  },
  transition: {
    type: [Function, String],
    default: 'easeOutExpo'
  }
});

// 定义组件事件
const emit = defineEmits(['finished', 'started']);

// 数字信息
const numberInfo = ref({
  prefix: '',
  number: props.start,
  suffix: '',
  decimals: 0
});

// 输出值
const output = ref(props.start);

// 格式化数字
const formatNumber = (num, decimals = 0) => {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 获取格式化信息
const getFormatInfo = (value) => {
  if (typeof value === 'number') {
    return {
      prefix: '',
      number: value,
      suffix: '',
      decimals: (value + '').split('.')[1]?.length || 0
    };
  }
  return {
    prefix: value[1] || '',
    number: value[0],
    suffix: value[2] || '',
    decimals: (value[0] + '').split('.')[1]?.length || 0
  };
};

// 缓动函数
const easingFunctions = {
  easeOutExpo: (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }
};

// 动画函数
const animateNumber = (start, end, duration, decimals, easing) => {
  const startTime = performance.now();
  const delta = end - start;
  
  const animate = (currentTime) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    const easedProgress = typeof easing === 'function' ? easing(progress) : easingFunctions[easing](progress);
    
    const currentValue = start + delta * easedProgress;
    output.value = formatNumber(currentValue, decimals);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      output.value = formatNumber(end, decimals);
      emit('finished');
    }
  };
  
  requestAnimationFrame(animate);
};

// 更新数字信息
const updateNumberInfo = () => {
  // 更新数字信息
  const info = getFormatInfo(props.end ?? props.start);
  Object.assign(numberInfo.value, info);
  
  // 禁用动画时直接显示最终值
  if (props.disabled) {
    output.value = formatNumber(info.number, info.decimals);
    return;
  }
  
  // 延迟执行动画
  setTimeout(() => {
    emit('started');
    animateNumber(props.start, info.number, props.duration, info.decimals, props.transition);
  }, props.delay);
};

// 监听 end 属性变化
watch(
  () => props.end,
  () => {
    updateNumberInfo();
  },
  { immediate: true, deep: true }
);

// 组件挂载时执行
onMounted(() => {
  updateNumberInfo();
});
</script>

<style scoped>
.prefix,
.suffix {
  font-size: inherit;
  color: var(--el-text-color-secondary);
}

.output {
  font-size: inherit;
  font-weight: bold;
  color: var(--el-color-primary);
}
</style>