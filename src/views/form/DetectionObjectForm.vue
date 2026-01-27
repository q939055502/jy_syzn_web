<template>
  <div class="detection-object-form-container">
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
        <el-form-item label="对象名称" prop="object_name">
          <el-input
            v-model="form.object_name"
            placeholder="请输入检测对象名称"
          />
        </el-form-item>

        <el-form-item label="对象代码" prop="object_code">
          <el-input
            v-model="form.object_code"
            placeholder="请输入检测对象代码"
          />
        </el-form-item>

        <el-form-item label="所属分类" prop="category_id">
          <el-select
            v-model="form.category_id"
            placeholder="请选择所属分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.category_id"
              :label="category.category_name"
              :value="category.category_id"
            />
          </el-select>
        </el-form-item>



        <el-form-item label="对象描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入对象描述信息"
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
import { useDetectionObjectStore } from '../../stores/detection/detectionObject';
import { useCategoryStore } from '../../stores/detection/category';

// 定义组件的 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  detectionObject: {
    type: Object,
    default: null
  }
});

// 定义组件的 emits
const emit = defineEmits(['update:visible', 'success']);

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取检测对象状态
const detectionObjectStore = useDetectionObjectStore();

// 获取分类状态
const categoryStore = useCategoryStore();

// 表单引用
const formRef = ref();

// 对话框可见性
const dialogVisible = ref(props.visible);

// 对话框标题
const dialogTitle = computed(() => {
  return props.detectionObject ? '编辑检测对象' : '新增检测对象';
});

// 从store获取分类列表，过滤掉禁用的分类
const categories = computed(() => categoryStore.getCategoryList.filter(category => category.status === 1));


// 表单数据
const form = reactive({
  object_id: 0,
  object_code: '',
  object_name: '',
  category_id: '',
  description: ''
});

// 表单验证规则
const rules = reactive({
  object_code: [
    { required: false, message: '请输入检测对象代码', trigger: 'blur' },
    { max: 50, message: '长度不超过 50 个字符', trigger: 'blur' }
  ],
  object_name: [
    { required: true, message: '请输入检测对象名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择所属分类', trigger: 'change' }
  ],
  description: [
    { required: false, message: '请输入对象描述', trigger: 'blur' },
    { max: 200, message: '长度不超过 200 个字符', trigger: 'blur' }
  ]
});

// 监听对话框可见性变化
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    object_id: 0,
    object_code: '',
    object_name: '',
    category_id: '',
    description: ''
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

// 监听detectionObject变化，用于编辑模式
watch(() => props.detectionObject, (newValue) => {
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
    
    if (props.detectionObject) {
      // 编辑模式
      success = await detectionObjectStore.updateDetectionObject(submitData.object_id, submitData);
    } else {
      // 新增模式
      success = await detectionObjectStore.createDetectionObject(submitData);
    }
    
    if (success) {
      ElMessage.success(props.detectionObject ? '检测对象编辑成功' : '检测对象新增成功');
      emit('success', submitData);
      dialogVisible.value = false;
    } else {
      ElMessage.error(detectionObjectStore.error || (props.detectionObject ? '编辑检测对象失败' : '新增检测对象失败'));
    }
  } catch (error) {
    // 表单验证失败
    ElMessage.error('表单验证失败，请检查输入');
  }
};

// 组件挂载时获取分类列表
onMounted(() => {
  categoryStore.fetchCategoryList();
});

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
.detection-object-form-container {
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