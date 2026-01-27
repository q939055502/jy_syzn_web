<template>
  <div class="role-management">
    <h2>角色管理</h2>
    <p>这里是角色管理页面的内容。</p>
  </div>
</template>

<script setup>
// 角色管理相关逻辑
import { useSettingStore } from '../stores/setting';
import { computed } from 'vue';

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);
</script>

<style scoped>
.role-management {
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