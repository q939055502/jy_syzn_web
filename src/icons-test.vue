<template>
  <div style="padding: 20px;">
    <h1>Element Plus 箭头图标测试</h1>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
      <div v-for="iconName in arrowIcons" :key="iconName" style="text-align: center; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
        <el-icon :size="32" style="margin-bottom: 10px;">
          <component :is="iconName" />
        </el-icon>
        <p>{{ iconName }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 获取所有箭头相关的图标
const arrowIcons = Object.keys(ElementPlusIconsVue).filter(name => 
  name.includes('Arrow') || name.includes('arrow')
);
</script>