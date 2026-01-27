<template>
  <div class="system-settings">
    <h2>系统设置</h2>
    <p>这里是系统设置页面的内容。</p>
  </div>
</template>

<script setup>
// 系统设置页面逻辑
import { useSettingStore } from '../stores/setting';
import { computed } from 'vue';

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);
</script>

<style scoped>
.system-settings {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: var(--text-primary);
}

p {
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>