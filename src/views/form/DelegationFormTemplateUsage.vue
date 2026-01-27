<template>
  <div class="template-usage-container">
    <el-dialog
      v-model="visible"
      :title="`委托单模板使用情况 - ${templateId}`"
      width="600px"
      top="10vh"
      destroy-on-close
    >
      <div class="template-usage-content">
        <!-- 加载状态 -->
        <el-skeleton :rows="5" animated v-if="isLoading" />
        
        <!-- 空状态 -->
        <el-empty description="该模板暂未被使用" v-else-if="usageData.length === 0" />
        
        <!-- 表格布局 -->
        <el-table
          v-else
          :data="processedUsageData"
          style="width: 100%"
          border
          :header-cell-style="{ 'text-align': 'center' }"
          :cell-style="{ 'text-align': 'center' }"
          size="small"
        >
          <!-- 检测对象列 -->
          <el-table-column prop="objectName" label="检测对象" min-width="180">
            <template #default="scope">
              <span :class="{ 'disabled-text': !scope.row.objectStatus }">
                {{ scope.row.objectName }}
              </span>
            </template>
          </el-table-column>
          
          <!-- 检测项目列 -->
          <el-table-column prop="itemName" label="检测项目" min-width="180">
            <template #default="scope">
              <span :class="{ 'disabled-text': !scope.row.itemStatus }">
                {{ scope.row.itemName }}
              </span>
            </template>
          </el-table-column>
          
          <!-- 检测参数列 -->
          <el-table-column prop="paramName" label="检测参数" min-width="180">
            <template #default="scope">
              <span :class="{ 'disabled-text': !scope.row.paramStatus }">
                {{ scope.row.paramName }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose" type="primary" plain>关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useDelegationFormTemplateStore } from '../../stores/detection/delegationFormTemplate';
import { useSettingStore } from '../../stores/setting';
import { ElMessage } from 'element-plus';

// 接收模板ID作为props
const props = defineProps({
  templateId: {
    type: Number,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义事件
const emit = defineEmits(['close']);

// 获取主题设置状态
const settingStore = useSettingStore();

// 获取委托单模板状态存储
const templateStore = useDelegationFormTemplateStore();

// 可见性状态
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('close', value)
});

// 加载状态
const isLoading = ref(false);
// 使用情况数据
const usageData = ref([]);

// 处理后的使用情况数据，转换为表格所需格式
const processedUsageData = computed(() => {
  return usageData.value.map(item => parseUsageItem(item));
});

// 解析使用情况项
const parseUsageItem = (item) => {
  const parts = item.split('--');
  if (parts.length !== 3) {
    return {
      objectName: '未知',
      objectStatus: false,
      itemName: '未知',
      itemStatus: false,
      paramName: '未知',
      paramStatus: false
    };
  }
  
  // 解析检测对象
  const objectMatch = parts[0].match(/^(.*?)\s*[（(](启用|禁用)[）)]$/);
  const objectName = objectMatch ? objectMatch[1] : parts[0];
  const objectStatus = objectMatch ? objectMatch[2] === '启用' : false;
  
  // 解析检测项目
  const itemMatch = parts[1].match(/^(.*?)\s*[（(](启用|禁用)[）)]$/);
  const itemName = itemMatch ? itemMatch[1] : parts[1];
  const itemStatus = itemMatch ? itemMatch[2] === '启用' : false;
  
  // 解析检测参数
  const paramMatch = parts[2].match(/^(.*?)\s*[（(](启用|禁用)[）)]$/);
  const paramName = paramMatch ? paramMatch[1] : parts[2];
  const paramStatus = paramMatch ? paramMatch[2] === '启用' : false;
  
  return {
    objectName,
    objectStatus,
    itemName,
    itemStatus,
    paramName,
    paramStatus
  };
};

// 获取使用情况数据
const fetchUsageData = async () => {
  if (!props.templateId) {
    return;
  }
  
  isLoading.value = true;
  try {
    const result = await templateStore.getTemplateUsage(props.templateId);
    if (result.success) {
      usageData.value = result.data || [];
    } else {
      ElMessage.error(result.message || '获取使用情况失败');
      usageData.value = [];
    }
  } catch (error) {
    console.error('获取模板使用情况失败:', error);
    ElMessage.error('获取使用情况失败，请稍后重试');
    usageData.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 关闭对话框
const handleClose = () => {
  emit('close', false);
};

// 监听模板ID变化，重新获取数据
watch(() => props.templateId, (newId) => {
  if (newId && props.visible) {
    fetchUsageData();
  }
});

// 监听可见性变化，获取数据
watch(() => props.visible, (newVisible) => {
  if (newVisible && props.templateId) {
    fetchUsageData();
  }
});

// 组件挂载时获取数据
onMounted(() => {
  if (props.visible && props.templateId) {
    fetchUsageData();
  }
});
</script>

<style scoped>
/* 容器样式 */
.template-usage-container {
  width: 100%;
  height: 100%;
}

/* 内容区域 */
.template-usage-content {
  max-height: 60vh;
  overflow-y: auto;
}

/* 禁用状态样式 */
.disabled-text {
  color: #ff4949 !important;
}

/* 深色模式样式 */
:deep(.el-dialog) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-dialog__title) {
  color: var(--text-primary) !important;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border-color) !important;
  background-color: var(--bg-primary) !important;
}

:deep(.el-dialog__body) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid var(--border-color) !important;
  background-color: var(--bg-primary) !important;
}

/* 表格样式 */
:deep(.el-table) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-table__header th) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-table__row) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table__row:hover) {
  background-color: var(--bg-secondary) !important;
}

:deep(.el-table__cell) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

/* 按钮样式 */
:deep(.el-button) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-button:hover) {
  background-color: var(--bg-secondary) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

:deep(.el-button--primary) {
  background-color: var(--bg-primary) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

:deep(.el-button--primary:hover) {
  background-color: var(--color-primary) !important;
  color: white !important;
  border-color: var(--color-primary) !important;
}

/* 空状态样式 */
:deep(.el-empty) {
  color: var(--text-secondary) !important;
}

:deep(.el-empty__description) {
  color: var(--text-secondary) !important;
}

/* 骨架屏样式 */
:deep(.el-skeleton) {
  background-color: var(--bg-primary) !important;
}

:deep(.el-skeleton__item) {
  background-color: var(--bg-secondary) !important;
}
</style>