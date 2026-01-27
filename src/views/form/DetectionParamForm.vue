<template>
  <div class="detection-param-form-container">
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
        :model="formData"
        :rules="rules"
        label-width="120px"
        label-position="right"
        style="max-height: 60vh; overflow-y: auto;"
      >
        <!-- 检测对象选择 -->
        <el-form-item label="检测对象" prop="object_id">
          <el-select
            v-model="formData.object_id"
            placeholder="请选择检测对象"
            style="width: 100%"
            @change="() => { formData.item_id = null; }"
          >
            <el-option
            v-for="object in objectOptions"
            :key="object.object_id"
            :label="object.object_name"
            :value="object.object_id"
          />
          </el-select>
        </el-form-item>

        <!-- 检测项目选择 -->
        <el-form-item label="检测项目" prop="item_id">
          <el-select
            v-model="formData.item_id"
            placeholder="请选择检测项目"
            style="width: 100%"
            :disabled="!formData.object_id"
          >
            <el-option
            v-for="item in filteredItemOptions"
            :key="item.item_id"
            :label="item.item_name"
            :value="item.item_id"
          />
          </el-select>
        </el-form-item>

        <!-- 检测参数名称 -->
        <el-form-item label="检测参数名称" prop="param_name">
          <el-input
            v-model="formData.param_name"
            placeholder="请输入检测参数名称"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 价格 -->
        <el-form-item label="价格" prop="price">
          <el-input
            v-model="formData.price"
            placeholder="请输入价格"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 样品加工费 -->
        <el-form-item label="样品加工费" prop="sample_processing_fee">
          <el-input
            v-model="formData.sample_processing_fee"
            placeholder="请输入样品加工费"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 组批规则 -->
        <el-form-item label="组批规则" prop="sampling_batch">
          <el-input
            v-model="formData.sampling_batch"
            placeholder="请输入组批规则"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 取样频率 -->
        <el-form-item label="取样频率" prop="sampling_frequency">
          <el-input
            v-model="formData.sampling_frequency"
            placeholder="请输入取样频率"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 取样要求 -->
        <el-form-item label="取样要求" prop="sampling_require">
          <el-input
            v-model="formData.sampling_require"
            placeholder="请输入取样要求"
            style="width: 100%"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <!-- 送检要求 -->
        <el-form-item label="送检要求" prop="inspection_require">
          <el-input
            v-model="formData.inspection_require"
            placeholder="请输入送检要求"
            style="width: 100%"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <!-- 所需信息 -->
        <el-form-item label="所需信息" prop="required_info">
          <el-input
            v-model="formData.required_info"
            placeholder="请输入所需信息"
            style="width: 100%"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <!-- 报告时间 -->
        <el-form-item label="报告时间" prop="report_time">
          <el-input
            v-model="formData.report_time"
            placeholder="请输入报告时间"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 委托单模板 -->
        <el-form-item label="委托单模板" prop="template_id">
          <el-select
            v-model="formData.template_id"
            placeholder="请选择委托单模板"
            style="width: 100%"
            clearable
          >
            <el-option
            v-for="template in templateOptions"
            :key="template.template_id"
            :label="template.template_name"
            :value="template.template_id"
          />
          </el-select>
        </el-form-item>

        <!-- 检评规范 -->
        <el-form-item label="检评规范" prop="standard_ids">
          <el-select
            v-model="formData.standard_ids"
            placeholder="请选择检评规范"
            style="width: 100%"
            multiple
            clearable
          >
            <el-option
            v-for="standard in standardOptions"
            :key="standard.standard_id"
            :label="standard.standard_name"
            :value="standard.standard_id"
          />
          </el-select>
        </el-form-item>

      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useDetectionParamStore } from '../../stores/detection/detectionParam';
import { useDetectionItemStore } from '../../stores/detection/detectionItem';
import { useDetectionObjectStore } from '../../stores/detection/detectionObject';
import { useDetectionStandardStore } from '../../stores/detection/detectionStandard';
import { useDelegationFormTemplateStore } from '../../stores/detection/delegationFormTemplate';
import { useSettingStore } from '../../stores/setting';

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

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

// 表单引用
const formRef = ref(null);

// 对话框可见性
const dialogVisible = ref(props.visible);

// 对话框标题
const dialogTitle = computed(() => {
  return props.item ? '编辑检测参数' : '新增检测参数';
});

// 表单数据
const formData = reactive({
  object_id: null,
  item_id: null,
  param_name: '',
  price: '',
  sample_processing_fee: '',
  sampling_batch: '',
  sampling_frequency: '',
  sampling_require: '',
  inspection_require: '',
  required_info: '',
  report_time: '',
  template_id: null,
  standard_ids: []
});

// 表单规则
const rules = {
  object_id: [
    { required: true, message: '请选择检测对象', trigger: 'change' }
  ],
  item_id: [
    { required: true, message: '请选择检测项目', trigger: 'change' }
  ],
  param_name: [
    { required: true, message: '请输入检测参数名称', trigger: 'blur' },
    { min: 1, max: 100, message: '检测参数名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  sample_processing_fee: [
    { required: false, message: '请输入样品加工费', trigger: 'blur' }
  ]
};

// 状态变量
const isSubmitting = ref(false);
const paramStore = useDetectionParamStore();
const itemStore = useDetectionItemStore();
const objectStore = useDetectionObjectStore();
const standardStore = useDetectionStandardStore();
const templateStore = useDelegationFormTemplateStore();

// 计算属性 - 检测对象选项（只显示启用状态的对象）
const objectOptions = computed(() => {
  // 只显示启用状态的对象
  return objectStore.getDetectionObjectList.filter(obj => obj.status === 1);
});

// 计算属性 - 根据选中的检测对象过滤检测项目选项（只显示启用状态的项目）
const filteredItemOptions = computed(() => {
  if (!formData.object_id) return [];
  
  // 只显示启用状态的项目
  return itemStore.getItemList.filter(item => item.object_id === formData.object_id && item.status === 1);
});

// 计算属性 - 检测规范选项（只显示启用状态的规范）
const standardOptions = computed(() => {
  // 只显示启用状态的规范
  return standardStore.getStandardList.filter(standard => standard.status === 1);
});

// 计算属性 - 委托单模板选项（只显示启用状态的模板）
const templateOptions = computed(() => {
  // 只显示启用状态的模板
  return templateStore.getTemplateList.filter(template => template.status === 1);
});

// 监听对话框可见性变化
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    object_id: null,
    item_id: null,
    param_name: '',
    price: '',
    sample_processing_fee: '',
    sampling_batch: '',
    sampling_frequency: '',
    sampling_require: '',
    inspection_require: '',
    required_info: '',
    report_time: '',
    template_id: null,
    standard_ids: []
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
    // 填充表单数据
    Object.assign(formData, {
      object_id: newValue.object_id,
      item_id: newValue.item_id,
      param_name: newValue.param_name,
      price: newValue.price || '',
      sample_processing_fee: newValue.sample_processing_fee || '',
      sampling_batch: newValue.sampling_batch || '',
      sampling_frequency: newValue.sampling_frequency || '',
      sampling_require: newValue.sampling_require || '',
      inspection_require: newValue.inspection_require || '',
      required_info: newValue.required_info || '',
      report_time: newValue.report_time || '',
      template_id: newValue.template_id || null,
      standard_ids: newValue.standard_ids || []
    });
  } else {
    // 只有当newValue为null或undefined时才重置表单数据
    resetForm();
  }
}, { immediate: true });

// 处理表单提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    isSubmitting.value = true;
    
    // 准备提交数据，转换数据类型
    const submitData = {
      object_id: formData.object_id,
      item_id: formData.item_id,
      param_name: formData.param_name,
      price: formData.price,
      sample_processing_fee: formData.sample_processing_fee,
      sampling_batch: formData.sampling_batch,
      sampling_frequency: formData.sampling_frequency,
      sampling_require: formData.sampling_require,
      inspection_require: formData.inspection_require,
      required_info: formData.required_info,
      report_time: formData.report_time,
      template_id: formData.template_id,
      standard_ids: formData.standard_ids
    };
    
    let success = false;
    
    if (props.item) {
      // 编辑模式
      success = await paramStore.updateParam(props.item.param_id, submitData);
    } else {
      // 新增模式
      success = await paramStore.createParam(submitData);
    }
    
    if (success) {
      ElMessage.success(props.item ? '检测参数更新成功' : '检测参数创建成功');
      emit('success');
      dialogVisible.value = false;
    } else {
      ElMessage.error(paramStore.error || (props.item ? '检测参数更新失败' : '检测参数创建失败'));
    }
  } catch (error) {
    console.error('表单提交失败:', error);
    ElMessage.error('表单提交失败，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};

// 组件挂载时获取检测项目列表和检测对象列表
onMounted(async () => {
  // 并行加载检测项目列表、检测对象列表、检测规范列表和委托单模板列表
  await Promise.all([
    itemStore.fetchItemList(),
    objectStore.fetchDetectionObjectList(),
    standardStore.fetchStandardList(),
    templateStore.fetchTemplateList()
  ]);
});
</script>

<style scoped>
.detection-param-form-container {
  width: 100%;
  height: 100%;
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

/* 选择框样式 */
:deep(.el-select__wrapper) {
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
  border-color: var(--input-border) !important;
}

:deep(.el-select__input) {
  color: var(--input-text) !important;
}

:deep(.el-select__placeholder) {
  color: var(--text-tertiary) !important;
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
  color: var(--color-primary) !important;
  font-weight: bold !important;
}

/* 单选框样式 */
:deep(.el-radio__label) {
  color: var(--text-primary) !important;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
}

:deep(.el-radio__input.is-checked+.el-radio__label) {
  color: var(--color-primary) !important;
}
</style>
