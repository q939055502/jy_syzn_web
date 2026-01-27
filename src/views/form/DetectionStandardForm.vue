<template>
  <div class="detection-standard-form-container">
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
        <el-form-item label="规范代码" prop="standard_code">
          <el-input
            v-model="form.standard_code"
            placeholder="请输入规范代码"
          />
        </el-form-item>

        <el-form-item label="规范名称" prop="standard_name">
          <el-input
            v-model="form.standard_name"
            placeholder="请输入规范名称"
          />
        </el-form-item>

        <el-form-item label="规范类型" prop="standard_type">
          <el-input
            v-model="form.standard_type"
            placeholder="请输入规范类型"
          />
        </el-form-item>

        <el-form-item label="生效时间" prop="effective_time">
          <el-date-picker
            v-model="form.effective_time"
            type="date"
            placeholder="选择生效时间"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="失效时间" prop="invalid_time">
          <el-date-picker
            v-model="form.invalid_time"
            type="date"
            placeholder="选择失效时间"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
          <span class="status-text">{{ form.status ? '启用' : '禁用' }}</span>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
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
import { useDetectionStandardStore } from '../../stores/detection/detectionStandard';

// 定义组件的 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  standard: {
    type: Object,
    default: null
  }
});

// 定义组件的 emits
const emit = defineEmits(['update:visible', 'success']);

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取检评规范状态
const standardStore = useDetectionStandardStore();

// 表单引用
const formRef = ref();

// 对话框可见性
const dialogVisible = ref(props.visible);

// 对话框标题
const dialogTitle = computed(() => {
  return props.standard ? '编辑检评规范' : '新增检评规范';
});

// 表单数据
const form = reactive({
  standard_id: 0,
  standard_code: '',
  standard_name: '',
  standard_type: '',
  effective_time: null,
  invalid_time: null,
  status: true,
  remark: ''
});

// 表单验证规则
const rules = reactive({
  standard_code: [
    { required: true, message: '请输入规范代码', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  standard_name: [
    { required: true, message: '请输入规范名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  standard_type: [
    { required: true, message: '请输入规范类型', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ]
});

// 监听对话框可见性变化
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    standard_id: 0,
    standard_code: '',
    standard_name: '',
    standard_type: '',
    effective_time: null,
    invalid_time: null,
    status: true,
    remark: ''
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

// 监听standard变化，用于编辑模式
watch(() => props.standard, (newValue) => {
  if (newValue) {
    // 填充表单数据
    Object.assign(form, {
      ...newValue,
      status: newValue.status === 1
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
    
    // 准备提交数据，格式化日期字段为ISO 8601格式
    const submitData = {
      ...form,
      status: form.status ? 1 : 0,
      effective_time: form.effective_time ? new Date(form.effective_time).toISOString().split('T')[0] : null,
      invalid_time: form.invalid_time ? new Date(form.invalid_time).toISOString().split('T')[0] : null
    };
    
    let success = false;
    
    if (props.standard) {
      // 编辑模式
      success = await standardStore.updateStandard(submitData.standard_id, submitData);
    } else {
      // 新增模式
      success = await standardStore.createStandard(submitData);
    }
    
    if (success) {
      ElMessage.success(props.standard ? '检评规范编辑成功' : '检评规范新增成功');
      emit('success', submitData);
      dialogVisible.value = false;
    } else {
      ElMessage.error(standardStore.error || (props.standard ? '编辑检评规范失败' : '新增检评规范失败'));
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
.detection-standard-form-container {
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
  background-color: var(--input-bg) !important;
}

:deep(.el-input__placeholder) {
  color: var(--text-tertiary) !important;
}

/* 专门针对textarea的样式 */
:deep(.el-textarea) {
  --el-textarea-bg-color: var(--input-bg) !important;
  --el-textarea-text-color: var(--input-text) !important;
  --el-textarea-border-color: var(--input-border) !important;
  --el-textarea-placeholder-color: var(--text-tertiary) !important;
}

:deep(.el-textarea__wrapper) {
  --el-textarea-bg-color: var(--input-bg) !important;
  --el-textarea-text-color: var(--input-text) !important;
  --el-textarea-border-color: var(--input-border) !important;
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
  border-color: var(--input-border) !important;
}

:deep(.el-textarea__inner) {
  --el-textarea-text-color: var(--input-text) !important;
  --el-textarea-placeholder-color: var(--text-tertiary) !important;
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
}

:deep(.el-textarea__placeholder) {
  color: var(--text-tertiary) !important;
}

/* 确保placeholder颜色正确 */
:deep(.el-input__inner::placeholder),
:deep(.el-textarea__inner::placeholder) {
  color: var(--text-tertiary) !important;
}

/* 选择器样式 */
:deep(.el-select__wrapper) {
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
  border-color: var(--input-border) !important;
}

:deep(.el-select__placeholder) {
  color: var(--text-tertiary) !important;
}

:deep(.el-select__input) {
  color: var(--input-text) !important;
}

:deep(.el-select-dropdown) {
  background-color: var(--bg-primary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-select-dropdown__item) {
  color: var(--text-primary) !important;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: var(--bg-secondary) !important;
  color: var(--color-primary) !important;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: var(--bg-secondary) !important;
  color: var(--color-primary) !important;
}

/* 日期选择器样式 */
:deep(.el-date-editor__wrapper) {
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
  border-color: var(--input-border) !important;
}

:deep(.el-date-editor__input) {
  color: var(--input-text) !important;
}

:deep(.el-date-editor__input::placeholder) {
  color: var(--text-tertiary) !important;
}

:deep(.el-picker-panel) {
  background-color: var(--bg-primary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-picker-panel__icon-btn) {
  color: var(--text-primary) !important;
}

:deep(.el-picker-panel__body) {
  background-color: var(--bg-primary) !important;
}

:deep(.el-month-table__month) {
  color: var(--text-primary) !important;
}

:deep(.el-month-table__month:hover) {
  color: var(--color-primary) !important;
  background-color: var(--bg-secondary) !important;
}

:deep(.el-month-table__month.current) {
  color: var(--color-primary) !important;
}

:deep(.el-year-table__year) {
  color: var(--text-primary) !important;
}

:deep(.el-year-table__year:hover) {
  color: var(--color-primary) !important;
  background-color: var(--bg-secondary) !important;
}

:deep(.el-year-table__year.current) {
  color: var(--color-primary) !important;
}

:deep(.el-day-table__cell) {
  color: var(--text-primary) !important;
}

:deep(.el-day-table__cell:hover) {
  background-color: var(--bg-secondary) !important;
}

:deep(.el-day-table__cell.is-today) {
  color: var(--color-primary) !important;
}

:deep(.el-day-table__cell.is-selected) {
  background-color: var(--color-primary) !important;
  color: white !important;
}

/* 开关样式 */
:deep(.el-switch) {
  --el-switch-on-color: #13ce66 !important;
  --el-switch-off-color: #ff4949 !important;
}

/* 专门针对textarea的样式 */
:deep(.el-textarea) {
  --el-textarea-bg-color: var(--input-bg) !important;
  --el-textarea-text-color: var(--input-text) !important;
  --el-textarea-border-color: var(--input-border) !important;
  --el-textarea-placeholder-color: var(--text-tertiary) !important;
}

:deep(.el-textarea__wrapper) {
  --el-textarea-bg-color: var(--input-bg) !important;
  --el-textarea-text-color: var(--input-text) !important;
  --el-textarea-border-color: var(--input-border) !important;
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
  border-color: var(--input-border) !important;
}

:deep(.el-textarea__inner) {
  --el-textarea-text-color: var(--input-text) !important;
  --el-textarea-placeholder-color: var(--text-tertiary) !important;
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
}

:deep(.el-textarea__placeholder) {
  color: var(--text-tertiary) !important;
}

/* 确保placeholder颜色正确 */
:deep(.el-input__inner::placeholder),
:deep(.el-textarea__inner::placeholder) {
  color: var(--text-tertiary) !important;
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