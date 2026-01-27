<template>
  <div class="detection-item-form-container">
    <!-- 表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <!-- 所属对象选择 -->
        <el-form-item label="所属对象" prop="object_id">
          <el-select
            v-model="form.object_id"
            placeholder="请选择所属对象"
            style="width: 100%"
          >
            <el-option
              v-for="object in objects"
              :key="object.object_id"
              :label="object.object_name"
              :value="object.object_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="项目名称" prop="item_name">
          <el-input
            v-model="form.item_name"
            placeholder="请输入项目名称"
          />
        </el-form-item>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            placeholder="请输入项目描述"
            type="textarea"
            :rows="3"
            maxlength="255"
          />
        </el-form-item>


      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useSettingStore } from '../../stores/setting';
import { useDetectionItemStore } from '../../stores/detection/detectionItem';
import { useDetectionObjectStore } from '../../stores/detection/detectionObject';

// 定义组件的 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  }
});

// 定义组件的 emits
const emit = defineEmits(['update:visible', 'success']);

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取检测项目状态
const itemStore = useDetectionItemStore();

// 获取检测对象状态
const detectionObjectStore = useDetectionObjectStore();
const objects = computed(() => detectionObjectStore.getDetectionObjectList.filter(obj => obj.status === 1));

// 表单引用
const formRef = ref();

// 对话框可见性
const dialogVisible = ref(props.visible);

// 对话框标题
const dialogTitle = computed(() => {
  return props.item ? '编辑检测项目' : '新增检测项目';
});

// 表单数据
const form = reactive({
  item_id: 0,
  item_name: '',
  description: '',
  object_id: null
});

// 表单验证规则
const rules = reactive({
  item_name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 255, message: '长度不能超过 255 个字符', trigger: 'blur' }
  ],
  object_id: [
    { required: true, message: '请选择所属对象', trigger: 'change' }
  ]
});



// 监听对话框可见性变化
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    item_id: 0,
    item_name: '',
    description: '',
    object_id: null
  });
};

// 监听对话框关闭事件
watch(dialogVisible, (newValue) => {
  emit('update:visible', newValue);
  if (!newValue) {
    // 重置表单数据
    resetForm();
  }
});

// 监听item变化，用于编辑模式
watch(() => props.item, (newValue) => {
  if (newValue) {
    // 填充表单数据，排除sort_order和status字段
    const { sort_order, status, ...otherFields } = newValue;
    Object.assign(form, {
      ...otherFields,
      object_id: newValue.object_id,
      description: newValue.description || ''
    });
  } else {
    // 重置表单数据
    resetForm();
  }
}, { immediate: true });

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    // 准备提交数据，不包含status字段
    const submitData = {
      ...form
    };
    
    let success = false;
    
    if (props.item) {
      // 编辑模式
      success = await itemStore.updateItem(submitData.item_id, submitData);
    } else {
      // 新增模式
      success = await itemStore.createItem(submitData);
    }
    
    if (success) {
      ElMessage.success(props.item ? '检测项目编辑成功' : '检测项目新增成功');
      emit('success', submitData);
      dialogVisible.value = false;
    } else {
      ElMessage.error(itemStore.error || (props.item ? '编辑检测项目失败' : '新增检测项目失败'));
    }
  } catch (error) {
    // 表单验证失败
    ElMessage.error('表单验证失败，请检查输入');
  }
};

// 组件挂载时获取检测对象列表
onMounted(() => {
  detectionObjectStore.fetchDetectionObjectList();
});

// 导出组件的方法，让父组件可以调用
defineExpose({
  open: () => {
    dialogVisible.value = true;
    // 确保检测对象列表已加载
    if (objects.value.length === 0) {
      detectionObjectStore.fetchDetectionObjectList();
    }
  },
  close: () => {
    dialogVisible.value = false;
  }
});
</script>

<style scoped>
.detection-item-form-container {
  width: 100%;
  height: 100%;
}

.sort-control {
  display: flex;
  align-items: center;
}

.radio-group {
  display: flex;
  gap: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.status-text {
  margin-left: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.status-switch {
  display: flex;
  align-items: center;
}

/* 对话框样式 */
:deep(.el-dialog) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-dialog__title) {
  color: var(--text-primary) !important;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border-color) !important;
}

:deep(.el-dialog__body) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid var(--border-color) !important;
  background-color: var(--bg-primary) !important;
}

/* 表单样式 */
:deep(.el-form) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
}

/* 输入框样式 */
:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
  border-color: var(--input-border) !important;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: var(--input-text) !important;
  background-color: var(--input-bg) !important;
}

:deep(.el-input__placeholder),
:deep(.el-textarea__placeholder) {
  color: var(--text-tertiary) !important;
}

/* 输入框数字样式 */
:deep(.el-input-number) {
  --el-input-bg-color: var(--input-bg) !important;
  --el-input-text-color: var(--input-text) !important;
  --el-input-border-color: var(--input-border) !important;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
  border-color: var(--input-border) !important;
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  background-color: var(--bg-secondary) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

/* 开关样式 */
:deep(.el-switch) {
  --el-switch-on-color: #13ce66 !important;
  --el-switch-off-color: #ff4949 !important;
}

/* 按钮样式 */
:deep(.el-button) {
  --el-button-bg-color: var(--bg-primary) !important;
  --el-button-text-color: var(--text-primary) !important;
  --el-button-border-color: var(--border-color) !important;
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-button:hover) {
  --el-button-bg-color: var(--bg-secondary) !important;
  --el-button-text-color: var(--color-primary) !important;
  --el-button-border-color: var(--color-primary) !important;
  background-color: var(--bg-secondary) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

:deep(.el-button--primary) {
  --el-button-primary-bg-color: var(--bg-primary) !important;
  --el-button-primary-text-color: var(--color-primary) !important;
  --el-button-primary-border-color: var(--color-primary) !important;
  background-color: var(--bg-primary) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

:deep(.el-button--primary:hover) {
  --el-button-primary-bg-color: var(--color-primary) !important;
  --el-button-primary-text-color: white !important;
  --el-button-primary-border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: white !important;
  border-color: var(--color-primary) !important;
}
</style>