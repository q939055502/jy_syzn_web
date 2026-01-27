<template>
  <div class="user-form-container">
    <!-- 表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="新增用户"
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
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>

        <el-form-item label="真实姓名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入真实姓名"
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
import { useUserManagementStore } from '../../stores/userManagement';

// 定义组件的 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义组件的 emits
const emit = defineEmits(['update:visible', 'success']);

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取用户管理状态
const userManagementStore = useUserManagementStore();

// 表单引用
const formRef = ref();

// 对话框可见性
const dialogVisible = ref(props.visible);

// 表单数据
const form = reactive({
  username: '',
  password: '',
  name: ''
});

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    {
      validator: async (rule, value, callback) => {
        if (value) {
          const result = await userManagementStore.checkUsernameExists(value);
          if (result.success) {
            if (result.data.exists) {
              callback(new Error('用户名已存在'));
            } else {
              callback();
            }
          } else {
            callback(new Error(result.message || '检查用户名失败，请稍后重试'));
          }
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
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
    Object.assign(form, {
      username: '',
      password: '',
      name: ''
    });
    if (formRef.value) {
      formRef.value.resetFields();
    }
  }
});

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    // 调用 store 的创建用户方法
    const success = await userManagementStore.createUser(form);
    
    if (success) {
      ElMessage.success('用户创建成功');
      emit('success', form);
      dialogVisible.value = false;
    } else {
      ElMessage.error(userManagementStore.error || '创建用户失败');
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