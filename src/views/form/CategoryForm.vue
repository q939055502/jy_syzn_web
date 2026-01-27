<template>
  <div class="category-form-container">
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
        <el-form-item label="分类名称" prop="category_name">
          <el-input
            v-model="form.category_name"
            placeholder="请输入分类名称"
          />
        </el-form-item>

        <el-form-item label="排序号" prop="sort_order">
          <el-input-number
            v-model="form.sort_order"
            :min="0"
            :max="1000"
            placeholder="请输入排序号"
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
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useSettingStore } from '../../stores/setting';
import { useCategoryStore } from '../../stores/detection/category';

// 定义组件的 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  category: {
    type: Object,
    default: null
  }
});

// 定义组件的 emits
const emit = defineEmits(['update:visible', 'success']);

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取分类状态
const categoryStore = useCategoryStore();

// 表单引用
const formRef = ref();

// 对话框可见性
const dialogVisible = ref(props.visible);

// 对话框标题
const dialogTitle = computed(() => {
  return props.category ? '编辑分类' : '新增分类';
});

// 表单数据
const form = reactive({
  category_id: 0,
  category_name: '',
  sort_order: 0
});

// 表单验证规则
const rules = reactive({
  category_name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  sort_order: [
    { required: true, message: '请输入排序号', trigger: 'blur' },
    { type: 'number', message: '排序号必须为数字', trigger: 'blur' }
  ]
});

// 监听对话框可见性变化
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    category_id: 0,
    category_name: '',
    sort_order: 0
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

// 监听category变化，用于编辑模式
watch(() => props.category, (newValue) => {
  if (newValue) {
    // 填充表单数据，排除status字段
    const { status, ...otherFields } = newValue;
    Object.assign(form, otherFields);
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
    
    if (props.category) {
      // 编辑模式
      success = await categoryStore.updateCategory(submitData.category_id, submitData);
    } else {
      // 新增模式
      success = await categoryStore.createCategory(submitData);
    }
    
    if (success) {
      ElMessage.success(props.category ? '分类编辑成功' : '分类新增成功');
      emit('success', submitData);
      dialogVisible.value = false;
    } else {
      ElMessage.error(categoryStore.error || (props.category ? '编辑分类失败' : '新增分类失败'));
    }
  } catch (error) {
    // 表单验证失败
    ElMessage.error('表单验证失败，请检查输入');
  }
};

// 导出组件的方法，让父组件可以调用
defineExpose({
  open: () => {
    dialogVisible.value = true;
  },
  close: () => {
    dialogVisible.value = false;
  }
});
</script>

<style scoped>
.category-form-container {
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
:deep(.el-input__wrapper) {
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
  border-color: var(--input-border) !important;
}

:deep(.el-input__inner) {
  color: var(--input-text) !important;
}

:deep(.el-input__placeholder) {
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