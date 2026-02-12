<template>
  <div class="detection-card" @click="handleCardClick">
    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 检测项目名称 -->
      <h3 class="project-name">{{ project.name }}</h3>
      
      <!-- 浓缩图容器 -->
      <div class="condensed-image-container">
        <!-- 浓缩图 -->
        <div class="condensed-image-wrapper">
          <el-image
            :src="project.condensedImage"
            :alt="project.name"
            fit="cover"
            class="condensed-image"
            :preview-teleported="false"
            @click.stop="handleImageClick"
          >
            <!-- 加载中状态 -->
            <template #loading>
              <div class="image-loading">
                <el-icon size="32">
                  <Loading />
                </el-icon>
              </div>
            </template>
            
            <!-- 加载失败状态 -->
            <template #error>
              <div class="image-error">
                <el-icon size="32">
                  <Picture />
                </el-icon>
                <span>图片加载失败</span>
              </div>
            </template>
          </el-image>
          
          <!-- 查看详情提示 -->
          <div class="view-detail-overlay">
            <el-icon size="24">
              <ZoomIn />
            </el-icon>
            <span>查看详情</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Loading, Picture, ZoomIn } from '@element-plus/icons-vue';

// 组件属性
const props = defineProps({
  // 检测项目数据
  project: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      condensedImage: '',
      fullImage: '',
      delegationForm: ''
    })
  }
});

// 组件事件
const emit = defineEmits(['click', 'imageClick']);

// 处理卡片点击事件
const handleCardClick = () => {
  emit('click', props.project);
};

// 处理图片点击事件
const handleImageClick = () => {
  emit('imageClick', props.project);
};
</script>

<style scoped>
.detection-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detection-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.project-name {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.condensed-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  height: 100px;
}

.condensed-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
}

.condensed-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.condensed-image-wrapper:hover .condensed-image {
  transform: scale(1.05);
}

.condensed-image-wrapper:hover .view-detail-overlay {
  opacity: 1;
  visibility: visible;
}

.view-detail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 8px;
  gap: 8px;
}

.view-detail-overlay span {
  font-size: 14px;
  font-weight: 500;
}

.image-loading,
.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  gap: 12px;
}

.image-error span {
  font-size: 14px;
}
</style>