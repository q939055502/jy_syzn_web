<template>
  <div class="delegation-form-template-form-container">
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
        <el-form-item label="模板文件" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :file-list="fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :before-upload="beforeUpload"
            accept=".doc,.docx,.xls,.xlsx"
            :show-file-list="false"
            drag
          >
            <!-- 自定义上传区域 -->
            <template #default>
              <div v-if="fileList.length === 0" class="custom-upload-area">
                <el-icon class="upload-icon"><UploadFilled /></el-icon>
                <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="upload-tip">仅支持.doc、.docx、.xls、.xlsx格式文件</div>
              </div>
              <div v-else class="custom-file-display">
                <div class="file-info">
                  <el-icon class="file-icon" :class="getFileIconClass(fileList[0].name)">
                    <component :is="getFileIcon(fileList[0].name)" />
                  </el-icon>
                  <div class="file-name">{{ fileList[0].name }}</div>
                </div>
                <el-button type="danger" size="small" @click.stop="handleFileRemove">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="模板名称" prop="template_name">
          <el-input
            v-model="form.template_name"
            placeholder="请输入模板名称"
          />
        </el-form-item>

        <el-form-item label="模板编号" prop="template_code">
          <el-input
            v-model="form.template_code"
            placeholder="请输入模板编号"
          />
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
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Delete, Document, DocumentCopy, Picture, Document as FileDoc } from '@element-plus/icons-vue';
import { useSettingStore } from '../../stores/setting';
import { useDelegationFormTemplateStore } from '../../stores/detection/delegationFormTemplate';
import { useDetectionItemStore } from '../../stores/detection/detectionItem';

// 定义组件的 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  template: {
    type: Object,
    default: null
  }
});

// 定义组件的 emits
const emit = defineEmits(['update:visible', 'success']);

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取委托单模板状态
const templateStore = useDelegationFormTemplateStore();

// 获取检测项目状态
const detectionItemStore = useDetectionItemStore();

// 表单引用
const formRef = ref();

// 文件上传引用
const uploadRef = ref();

// 文件列表
const fileList = ref([]);

// 对话框可见性
const dialogVisible = ref(props.visible);

// 对话框标题
const dialogTitle = computed(() => {
  return props.template ? '编辑委托单模板' : '新增委托单模板';
});

// 检测项目列表
const detectionItems = computed(() => detectionItemStore.getItemList);

// 文件变化处理
const handleFileChange = (file) => {
  // 清除之前的文件
  fileList.value = [file];
  form.file = file.raw;
  
  // 自动设置文件类型
  const fileName = file.name;
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  if (fileExtension === '.doc' || fileExtension === '.docx') {
    form.file_type = 'docx';
  } else if (fileExtension === '.xls' || fileExtension === '.xlsx') {
    form.file_type = 'xlsx';
  } else if (fileExtension === '.pdf') {
    form.file_type = 'pdf';
  } else if (fileExtension === '.pptx') {
    form.file_type = 'pptx';
  }
};

// 文件移除处理
const handleFileRemove = () => {
  fileList.value = [];
  form.file = null;
  form.file_type = '';
};

// 文件上传前验证
const beforeUpload = (file) => {
  const allowedExtensions = ['.doc', '.docx', '.xls', '.xlsx'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    ElMessage.error('仅支持.doc、.docx、.xls、.xlsx格式文件');
    return false;
  }
  
  return true;
};

// 根据文件名获取文件图标
const getFileIcon = (fileName) => {
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  switch (fileExtension) {
    case '.doc':
    case '.docx':
      return Document;
    case '.xls':
    case '.xlsx':
      return DocumentCopy;
    case '.pdf':
      return Picture;
    case '.pptx':
      return FileDoc;
    default:
      return FileDoc;
  }
};

// 根据文件名获取文件图标样式类
const getFileIconClass = (fileName) => {
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  switch (fileExtension) {
    case '.doc':
    case '.docx':
      return 'icon-doc';
    case '.xls':
    case '.xlsx':
      return 'icon-excel';
    case '.pdf':
      return 'icon-pdf';
    case '.pptx':
      return 'icon-pptx';
    default:
      return 'icon-default';
  }
};

// 表单数据
const form = reactive({
  template_id: 0,
  template_name: '',
  template_code: '',
  file_type: '',
  remark: '',
  file: null
});

// 表单验证规则 - 动态调整文件必填性
const rules = computed(() => ({
  template_name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  template_code: [
    { required: true, message: '请输入模板编号', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  file: [
    { required: !props.template, message: '请选择模板文件', trigger: 'change' }
  ]
}));

// 监听对话框可见性变化
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue;
});

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    template_id: 0,
    template_name: '',
    template_code: '',
    file_type: '',
    remark: '',
    file: null
  });
  // 重置文件列表
  fileList.value = [];
};

// 监听对话框关闭事件
watch(dialogVisible, (newValue) => {
  emit('update:visible', newValue);
  if (!newValue) {
    // 重置表单数据
    resetForm();
  }
});

// 监听template变化，用于编辑模式
watch(() => props.template, (newValue) => {
  if (newValue) {
    // 填充表单数据，排除 is_default 和 status 字段
    const { is_default, status, ...otherFields } = newValue;
    Object.assign(form, {
      ...otherFields,
      file: null
    });
    // 重置文件列表
    fileList.value = [];
  } else {
    // 重置表单数据
    resetForm();
  }
}, { immediate: true });

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    // 准备FormData
    const formData = new FormData();
    
    // 普通字段
    formData.append('template_name', form.template_name);
    formData.append('template_code', form.template_code);
    formData.append('file_type', form.file_type);
    formData.append('remark', form.remark || '');
    
    // 文件字段
    if (form.file) {
      formData.append('file', form.file);
    }
    
    let success = false;
    
    if (props.template) {
      // 编辑模式
      success = await templateStore.updateTemplate(form.template_id, formData);
    } else {
      // 新增模式
      success = await templateStore.createTemplate(formData);
    }
    
    if (success) {
      ElMessage.success(props.template ? '委托单模板编辑成功' : '委托单模板新增成功');
      emit('success', form);
      dialogVisible.value = false;
    } else {
      ElMessage.error(templateStore.error || (props.template ? '编辑委托单模板失败' : '新增委托单模板失败'));
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
    // 重置文件列表
    fileList.value = [];
    form.file = null;
  },
  close: () => {
    dialogVisible.value = false;
  }
});
</script>

<style scoped>
.delegation-form-template-form-container {
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

/* 是否默认的红色样式 */
.status-text.default-yes {
  color: #ff4949 !important;
  font-weight: bold;
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
  --el-input-bg-color: var(--input-bg) !important;
  --el-input-text-color: var(--input-text) !important;
  --el-input-border-color: var(--input-border) !important;
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
  border-color: var(--input-border) !important;
}

:deep(.el-input__inner) {
  --el-input-text-color: var(--input-text) !important;
  color: var(--input-text) !important;
  background-color: var(--input-bg) !important;
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

/* 开关样式 */
:deep(.el-switch) {
  --el-switch-on-color: #13ce66 !important;
  --el-switch-off-color: #ff4949 !important;
}

/* 自定义上传区域样式 */
.custom-upload-area {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-upload-area:hover {
  border-color: var(--color-primary);
  background-color: var(--bg-secondary);
}

.upload-icon {
  font-size: 32px;
  color: var(--color-primary);
  margin-bottom: 10px;
}

.upload-text {
  font-size: 14px;
  margin-bottom: 8px;
}

.upload-text em {
  color: var(--color-primary);
}

.upload-tip {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* 已选择文件显示样式 */
.custom-file-display {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  font-size: 24px;
}

.file-icon.icon-doc {
  color: #2385f6;
}

.file-icon.icon-excel {
  color: #34a853;
}

.file-icon.icon-pdf {
  color: #ea4335;
}

.file-icon.icon-pptx {
  color: #fbbc05;
}

.file-icon.icon-default {
  color: var(--text-secondary);
}

.file-name {
  font-size: 14px;
  color: var(--text-primary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* 上传组件基础样式调整 */
:deep(.el-upload) {
  display: flex;
  justify-content: center;
}

/* 完全覆盖drag模式下的默认上传区域样式 */
:deep(.el-upload-dragger) {
  width: 100% !important;
  max-width: 300px !important;
  margin: 0 auto !important;
  padding: 20px !important;
  background-color: var(--bg-primary) !important;
  border: 2px dashed var(--border-color) !important;
  border-radius: 8px !important;
  color: var(--text-primary) !important;
  text-align: center !important;
  transition: all 0.3s ease !important;
}

:deep(.el-upload-dragger:hover) {
  border-color: var(--color-primary) !important;
  background-color: var(--bg-secondary) !important;
}

/* 隐藏默认的上传文本，使用自定义内容 */
:deep(.el-upload-dragger .el-upload__text) {
  display: none !important;
}

/* 隐藏默认的上传图标，使用自定义内容 */
:deep(.el-upload-dragger .el-icon--upload) {
  display: none !important;
}

/* 确保自定义内容显示在最上层 */
.custom-upload-area,
.custom-file-display {
  position: relative;
  z-index: 1;
}

:deep(.el-upload__input) {
  width: 100% !important;
  height: 100% !important;
}
</style>