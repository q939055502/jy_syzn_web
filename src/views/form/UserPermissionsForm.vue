<template>
  <div class="user-form-container">
    <!-- 表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="分配权限"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        status-icon
      >
        <el-form-item label="选择权限" prop="permissions">
          <el-select
            v-model="form.permissions"
            placeholder="请选择权限"
            multiple
            filterable
            clearable
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="permission in permissionOptions"
              :key="permission.value"
              :label="permission.label"
              :value="permission.value"
            />
          </el-select>
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

// 定义组件的 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: Number,
    default: 0
  }
});

// 定义组件的 emits
const emit = defineEmits(['update:visible', 'success']);

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 表单引用
const formRef = ref();

// 对话框可见性
const dialogVisible = ref(props.visible);

// 权限选项数据（示例数据，实际应从API获取）
const permissionOptions = ref([
  { label: '读取用户信息', value: 'read_users' },
  { label: '创建用户', value: 'create_users' },
  { label: '更新用户', value: 'update_users' },
  { label: '删除用户', value: 'delete_users' },
  { label: '读取检测标准', value: 'read_standards' },
  { label: '创建检测标准', value: 'create_standards' },
  { label: '更新检测标准', value: 'update_standards' },
  { label: '删除检测标准', value: 'delete_standards' },
  { label: '读取检测项目', value: 'read_items' },
  { label: '创建检测项目', value: 'create_items' },
  { label: '更新检测项目', value: 'update_items' },
  { label: '删除检测项目', value: 'delete_items' }
]);

// 表单数据
const form = reactive({
  permissions: []
});

// 表单验证规则
const rules = reactive({
  permissions: [
    { required: true, message: '请选择权限', trigger: 'change' }
  ]
});

// 监听对话框可见性变化
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

// 监听对话框关闭事件
watch(dialogVisible, (newValue) => {
  emit('update:visible', newValue);
  if (!newValue) {
    // 重置表单数据
    form.permissions = [];
    if (formRef.value) {
      formRef.value.resetFields();
    }
  }
});

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    // 提交权限分配数据
    emit('success', {
      userId: props.userId,
      permissions: form.permissions
    });
    ElMessage.success('权限分配成功');
    dialogVisible.value = false;
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
.user-form-container {
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

/* 单选按钮样式 */
:deep(.el-radio) {
  color: var(--text-primary) !important;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: var(--color-primary) !important;
}

/* 数字输入框样式 */
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: var(--bg-secondary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  background-color: var(--bg-secondary) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

/* 开关样式 */
:deep(.el-switch__label) {
  color: var(--text-primary) !important;
}

:deep(.el-switch__label.is-active) {
  color: var(--color-primary) !important;
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