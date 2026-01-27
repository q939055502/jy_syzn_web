<template>
  <div class="delegation-form-template">
    <h2>委托单模板管理</h2>
    
    <!-- 搜索和新增区域 -->
    <div class="user-management-header">
      <div class="button-group">
        <el-button type="primary" @click="handleAddTemplate">
          <el-icon><Plus /></el-icon>
          <span>新增委托单模板</span>
        </el-button>
        <el-button type="primary" plain @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          <span>刷新数据</span>
        </el-button>
        <!-- 批量删除按钮，后续有需要再启用 -->
        <el-button 
          type="danger" 
          @click="handleBatchDelete" 
          :disabled="selectedTemplateIds.length === 0"
          :loading="isDeleting"
          v-if="false"
        >
          <el-icon><Delete /></el-icon>
          <span>批量删除</span>
        </el-button>
      </div>
      <div class="search-box">

        <el-select
          v-model="selectedStatus"
          placeholder="请选择状态"
          style="width: 120px; margin-right: 10px"
          clearable
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-input
          v-model="searchText"
          placeholder="请输入委托单模板名称进行搜索"
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 委托单模板表格 -->
    <div class="table-container">
      <el-table
        :data="filteredTemplates"
        style="width: 100%"
        border
        header-row-class-name="table-header"
        @selection-change="handleSelectionChange"
        :loading="isLoading"
      >
        <!-- 多选框列，后续有需要再启用 -->
        <el-table-column type="selection" width="55" v-if="false" />
        
        <!-- 序号列 -->
        <el-table-column type="index" label="ID" width="80" fixed="left" />
        
        <!-- 模板名称 -->
        <el-table-column prop="template_name" label="模板名称" min-width="15%" />
        
        <!-- 版本编号 -->
        <el-table-column prop="template_code" label="版本编号" min-width="10%" />
        
        <!-- 文件类型 -->
        <el-table-column prop="file_type" label="文件类型" min-width="10%" />
        
        <!-- 备注 -->
        <el-table-column prop="remark" label="备注" min-width="15%" />
        
        <!-- 上传账号 -->
        <el-table-column prop="upload_user" label="上传账号" min-width="10%" />
        
        <!-- 上传日期 -->
        <el-table-column prop="upload_time" label="上传日期" min-width="10%">
          <template #default="scope">
            <span>{{ scope.row.upload_time ? formatDate(scope.row.upload_time) : '无' }}</span>
          </template>
        </el-table-column>
        

        
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-switch
              :model-value="scope.row.status === 1"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="(newStatus) => handleStatusChange(scope.row, newStatus)"
            />
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" min-width="25%" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                type="warning"
                size="small"
                @click="handleViewUsage(scope.row)"
                plain
                class="operation-btn"
              >
                查看被使用情况
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="handleEditTemplate(scope.row)"
                plain
                class="operation-btn"
              >
                编辑
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="handleDownloadTemplate(scope.row)"
                plain
                class="operation-btn"
              >
                下载
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteTemplate(scope.row)"
                plain
                class="operation-btn"
                :loading="isDeleting"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 隐藏的分页组件，保留状态管理但不显示 -->
    <div class="pagination-container" style="display: none;">
      <el-pagination
        v-model:current-page="templateStore.pagination.currentPage"
        v-model:page-size="templateStore.pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalTemplates"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 新增/编辑委托单模板表单 -->
    <delegation-form-template-form
      v-model:visible="formVisible"
      :template="currentTemplate"
      @success="handleFormSuccess"
    />
    
    <!-- 模板使用情况对话框 -->
    <delegation-form-template-usage
      v-model:visible="usageDialogVisible"
      :template-id="currentUsageTemplateId"
      @close="handleUsageDialogClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, Plus, Delete, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSettingStore } from '../../stores/setting';
import { useDelegationFormTemplateStore } from '../../stores/detection/delegationFormTemplate';
import DelegationFormTemplateForm from '../form/DelegationFormTemplateForm.vue';
import DelegationFormTemplateUsage from '../form/DelegationFormTemplateUsage.vue';
import { formatDate } from '../../utils/dateUtils';

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取委托单模板状态存储
const templateStore = useDelegationFormTemplateStore();



// 搜索文本
const searchText = ref('');
// 状态筛选
const selectedStatus = ref('');



// 选中的委托单模板ID
const selectedTemplateIds = ref([]);

// 表单可见性状态
const formVisible = ref(false);

// 当前编辑的委托单模板
const currentTemplate = ref(null);

// 模板使用情况对话框状态
const usageDialogVisible = ref(false);
// 当前查看使用情况的模板ID
const currentUsageTemplateId = ref(null);

// 从store获取委托单模板列表数据
const templates = computed(() => templateStore.getTemplateList);
const totalTemplates = computed(() => templateStore.getTotalTemplates);
const currentPage = computed(() => templateStore.pagination.currentPage);
const pageSize = computed(() => templateStore.pagination.pageSize);
const isLoading = computed(() => templateStore.getIsLoading);
const isDeleting = computed(() => templateStore.getIsDeleting);

// 过滤后的委托单模板列表（全量展示）
const filteredTemplates = computed(() => {
  let result = [...templates.value];
  
  // 状态过滤
  if (selectedStatus.value !== '' && selectedStatus.value !== null && selectedStatus.value !== undefined) {
    result = result.filter(template => 
      template.status === selectedStatus.value
    );
  }
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    result = result.filter(template => 
      template.template_name?.toLowerCase().includes(search)
    );
  }
  
  // 全量展示，不进行分页
  return result;
});

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedTemplateIds.value = selection.map(template => template.template_id);
};

// 处理新增委托单模板
const handleAddTemplate = () => {
  currentTemplate.value = null;
  formVisible.value = true;
};

// 处理编辑委托单模板
const handleEditTemplate = (template) => {
  currentTemplate.value = template;
  formVisible.value = true;
};

// 处理表单提交成功
const handleFormSuccess = () => {
  ElMessage.success('委托单模板操作成功');
  // 刷新委托单模板列表
  templateStore.fetchTemplateList();
};

// 处理删除委托单模板
const handleDeleteTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除委托单模板 "${template.template_name}" (${template.template_version}) 吗？<br>删除后将无法恢复，请谨慎操作。`, 
      '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });
    
    const result = await templateStore.deleteTemplate(template.template_id);
    if (result) {
      ElMessage.success(`委托单模板 ${template.template_name} 删除成功`);
    } else {
      ElMessage.error(templateStore.error || '委托单模板删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(templateStore.error || `删除委托单模板 "${template.template_name}" 失败，请稍后重试`);
    }
  }
};

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedTemplateIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的委托单模板');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedTemplateIds.value.length} 个委托单模板吗？<br>删除后将无法恢复，请谨慎操作。`, 
      '批量删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });
    
    const result = await templateStore.batchDeleteTemplates(selectedTemplateIds.value);
    if (result) {
      ElMessage.success(`成功删除 ${selectedTemplateIds.value.length} 个委托单模板`);
      selectedTemplateIds.value = [];
    } else {
      ElMessage.error(templateStore.error || '委托单模板批量删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(templateStore.error || `批量删除 ${selectedTemplateIds.value.length} 个委托单模板失败，请稍后重试`);
    }
  }
};

// 处理页大小变化
const handleSizeChange = (size) => {
  templateStore.updatePagination({
    pageSize: size,
    currentPage: 1
  });
};

// 处理当前页变化
const handleCurrentChange = (current) => {
  templateStore.updatePagination({
    currentPage: current
  });
};

// 刷新数据
const handleRefresh = async () => {
  try {
    await templateStore.fetchTemplateList();
    ElMessage.success('数据已刷新');
  } catch (error) {
    ElMessage.error('数据刷新失败，请稍后重试');
  }
};

// 组件挂载时获取委托单模板列表
onMounted(() => {
  templateStore.fetchTemplateList();
});

// 处理状态变化
const handleStatusChange = async (template, newStatus) => {
  const result = await templateStore.updateTemplateStatus(template.template_id, newStatus);
  if (result) {
    ElMessage.success(`委托单模板 ${template.template_name} 状态已更新为: ${newStatus ? '启用' : '禁用'}`);
  } else {
    ElMessage.error('委托单模板状态更新失败');
    // 更新失败，恢复原来的状态
    template.status = newStatus ? 0 : 1;
  }
};



// 处理查看使用情况
const handleViewUsage = (template) => {
  currentUsageTemplateId.value = template.template_id;
  usageDialogVisible.value = true;
};

// 处理关闭使用情况对话框
const handleUsageDialogClose = () => {
  usageDialogVisible.value = false;
  currentUsageTemplateId.value = null;
};

// 处理下载模板
const handleDownloadTemplate = async (template) => {
  try {
    // 使用后端提供的 download_url
    if (!template.download_url) {
      ElMessage.error('下载链接不存在');
      return;
    }
    
    const downloadUrl = template.download_url;
    
    // 创建一个隐藏的 a 标签，用于触发下载
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = ''; // 文件名由服务器在响应头中指定
    link.style.display = 'none';
    
    // 将 a 标签添加到文档中并触发点击事件
    document.body.appendChild(link);
    link.click();
    
    // 移除 a 标签
    document.body.removeChild(link);
    
    ElMessage.success(`委托单模板 ${template.template_name} 下载已开始`);
  } catch (error) {
    console.error('下载委托单模板失败:', error);
    ElMessage.error('下载委托单模板失败，请稍后重试');
  }
};
</script>

<style scoped>
.delegation-form-template {
  padding: 0 20px 20px 20px;
  margin-top: -20px;
}

/* 标题样式 */
h2 {
  margin: 10px 0 10px 0;
  padding: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
  color: var(--text-primary);
}

/* 搜索和新增区域样式 */
.user-management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  gap: 10px;
}

/* 搜索框样式 */
.search-box {
  display: flex;
  align-items: center;
}

/* 表格容器样式，添加适当边距 */
.table-container {
  margin: 0 5px;
  overflow-x: auto;
}

/* 表格样式 */
.table-header {
  background-color: var(--table-header-bg) !important;
  font-weight: bold !important;
  color: var(--text-primary) !important;
}

/* 表格容器样式，使用粗外框 */
:deep(.el-table) {
  margin-top: 0;
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border: 2px solid var(--text-primary) !important;
  border-collapse: collapse !important;
}

:deep(.el-table__body-wrapper) {
  background-color: var(--bg-primary) !important;
}

:deep(.el-table__row) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

/* 移除鼠标悬浮变色功能 */
:deep(.el-table__row:hover),
:deep(.el-table__row.hover-row) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

/* 移除条纹行背景色 */
:deep(.el-table__row--striped),
:deep(.el-table__row.striped-row) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table__header-wrapper) {
  background-color: var(--bg-primary) !important;
}

:deep(.el-table__header) {
  background-color: var(--bg-primary) !important;
}

/* 表头样式，确保边框完整 */
:deep(.el-table__header th) {
  background-color: var(--table-header-bg) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--text-primary) !important;
  border-right: 1px solid var(--text-primary) !important;
  border-top: 1px solid var(--text-primary) !important;
  border-left: 1px solid var(--text-primary) !important;
}

/* 表格单元格样式，确保边框完整且内容居中 */
:deep(.el-table__cell) {
  border-bottom: 1px solid var(--text-primary) !important;
  border-right: 1px solid var(--text-primary) !important;
  border-top: 1px solid var(--text-primary) !important;
  border-left: 1px solid var(--text-primary) !important;
  color: var(--text-primary) !important;
  background-color: var(--bg-primary) !important;
  text-align: center !important;
  vertical-align: middle !important;
}

/* 表头样式，确保内容居中 */
:deep(.el-table__header th) {
  text-align: center !important;
  vertical-align: middle !important;
}

/* 移除最后一列右边框 */
:deep(.el-table__header th:last-child),
:deep(.el-table__cell:last-child) {
  border-right: 1px solid var(--text-primary) !important;
}

/* 移除最后一行下边框，由表格容器的下边框代替 */
:deep(.el-table__body tr:last-child .el-table__cell) {
  border-bottom: 1px solid var(--text-primary) !important;
}

/* 调整表格整体边框样式 */
:deep(.el-table--border) {
  border: 2px solid var(--text-primary) !important;
  border-collapse: collapse !important;
}

/* 移除内部伪元素边框，由CSS边框代替 */
:deep(.el-table--border::after),
:deep(.el-table--group::after),
:deep(.el-table::before) {
  background-color: transparent !important;
}

/* 确保表格容器的内边距为0，避免边框间隙 */
:deep(.el-table__inner-wrapper) {
  padding: 0 !important;
}

/* 确保表格容器的溢出处理正确 */
:deep(.el-table__body-wrapper) {
  overflow: hidden !important;
}

/* 确保表头和表体对齐 */
:deep(.el-table__header),
:deep(.el-table__body) {
  width: 100% !important;
  table-layout: fixed !important;
}

/* 确保表格单元格的内边距正确 */
:deep(.el-table__cell) {
  padding: 2px !important;
}

/* 调整单元格内部容器样式 */
:deep(.el-table__cell .cell) {
  padding: 0 !important;
  margin: 0 !important;
  line-height: 1.4 !important;
  height: auto !important;
  min-height: auto !important;
}

/* 调整表格单元格样式 */
:deep(.el-table__cell) {
  font-size: 12px !important;
  line-height: 1.4 !important;
  height: auto !important;
  min-height: auto !important;
}

/* 调整表头样式 */
:deep(.el-table__header th) {
  font-size: 12px !important;
  line-height: 1.6 !important;
  padding: 8px 2px !important;
  height: auto !important;
}

/* 状态开关样式 */
.status-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-text {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 2px;
}

.operation-btn {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  padding: 4px 6px;
  background-color: var(--bg-primary) !important;
}

.operation-btn:hover {
  background-color: var(--bg-secondary) !important;
}

/* 分页样式（保留但隐藏） */
.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

/* 输入框和选择框样式 */
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  background-color: var(--input-bg);
  color: var(--input-text);
  border-color: var(--input-border);
}

:deep(.el-input__inner),
:deep(.el-select__input) {
  color: var(--input-text);
}

:deep(.el-input__placeholder),
:deep(.el-select__placeholder) {
  color: var(--text-tertiary);
}

/* 选择框下拉菜单样式 */
:deep(.el-select-dropdown) {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
}

:deep(.el-select-dropdown__item) {
  color: var(--text-primary);
}

:deep(.el-select-dropdown__item:hover) {
  background-color: var(--bg-secondary);
  color: var(--color-primary);
}

:deep(.el-select-dropdown__item.selected) {
  color: var(--color-primary);
  font-weight: bold;
}

/* 按钮样式 */
:deep(.el-button--plain) {
  --el-button-plain-bg-color: var(--bg-primary) !important;
  background-color: var(--bg-primary) !important;
}

:deep(.el-button--plain:hover) {
  --el-button-plain-bg-color: var(--bg-secondary) !important;
  background-color: var(--bg-secondary) !important;
}

/* 主要按钮样式 */
:deep(.el-button--primary) {
  --el-button-primary-bg-color: var(--bg-primary) !important;
  background-color: var(--bg-primary) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

:deep(.el-button--primary:hover) {
  --el-button-primary-bg-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: white !important;
}

/* 成功按钮样式 */
:deep(.el-button--success) {
  --el-button-success-bg-color: var(--bg-primary) !important;
  background-color: var(--bg-primary) !important;
  color: var(--color-success, #13ce66) !important;
  border-color: var(--color-success, #13ce66) !important;
}

:deep(.el-button--success:hover) {
  --el-button-success-bg-color: var(--color-success, #13ce66) !important;
  background-color: var(--color-success, #13ce66) !important;
  color: white !important;
}

/* 危险按钮样式 */
:deep(.el-button--danger) {
  --el-button-danger-bg-color: var(--bg-primary) !important;
  background-color: var(--bg-primary) !important;
  color: var(--color-danger) !important;
  border-color: var(--color-danger) !important;
}

:deep(.el-button--danger:hover) {
  --el-button-danger-bg-color: var(--color-danger) !important;
  background-color: var(--color-danger) !important;
  color: white !important;
}

/* 警告按钮样式 */
:deep(.el-button--warning) {
  --el-button-warning-bg-color: var(--bg-primary) !important;
  background-color: var(--bg-primary) !important;
  color: var(--color-warning) !important;
  border-color: var(--color-warning) !important;
}

:deep(.el-button--warning:hover) {
  --el-button-warning-bg-color: var(--color-warning) !important;
  background-color: var(--color-warning) !important;
  color: white !important;
}

/* 滚动条样式 */
:deep(.el-scrollbar__wrap) {
  background-color: var(--table-row-bg);
}

:deep(.el-scrollbar__view) {
  background-color: var(--table-row-bg);
}

/* 是否默认的红色样式 */
.default-yes {
  color: #ff4949 !important;
  font-weight: bold;
}
</style>