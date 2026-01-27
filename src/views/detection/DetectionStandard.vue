<template>
  <div class="detection-standard">
    <h2>检评规范管理</h2>
    
    <!-- 搜索和新增区域 -->
    <div class="user-management-header">
      <div class="button-group">
        <el-button type="primary" @click="handleAddStandard">
          <el-icon><Plus /></el-icon>
          <span>新增检评规范</span>
        </el-button>
        <el-button type="primary" plain @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          <span>刷新数据</span>
        </el-button>
        <!-- 批量删除按钮，后续有需要再启用 -->
        <el-button 
          type="danger" 
          @click="handleBatchDelete" 
          :disabled="selectedStandardIds.length === 0"
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
          placeholder="请输入检评规范名称或代码进行搜索"
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 检评规范表格 -->
    <div class="table-container">
      <el-table
        :data="filteredStandards"
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
        
        <!-- 检评规范代码 -->
        <el-table-column prop="standard_code" label="规范代码" min-width="13%" />
        
        <!-- 检评规范名称 -->
        <el-table-column prop="standard_name" label="规范名称" min-width="22%" />
        
        <!-- 检评规范类型 -->
        <el-table-column prop="standard_type" label="规范类型" min-width="8%" />
        
        <!-- 生效日期 -->
        <el-table-column prop="effective_time" label="生效日期" min-width="10%">
          <template #default="scope">
            <span>{{ formatDate(scope.row.effective_time) }}</span>
          </template>
        </el-table-column>
        
        <!-- 失效日期 -->
        <el-table-column prop="invalid_time" label="失效日期" min-width="10%">
          <template #default="scope">
            <span :class="{ 'expired-date': isDateExpired(scope.row.invalid_time) }">
              {{ formatDate(scope.row.invalid_time) }}
            </span>
          </template>
        </el-table-column>
        
        <!-- 备注 -->
        <el-table-column prop="remark" label="备注" min-width="15%">
          <template #default="scope">
            <span>{{ scope.row.remark || '无' }}</span>
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="140">
          <template #default="scope">
            <div class="status-switch">
              <el-switch
                :model-value="scope.row.status === 1"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="(newStatus) => handleStatusChange(scope.row, newStatus)"
              />
            </div>
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" min-width="13.33%" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                type="primary"
                size="small"
                @click="handleEditStandard(scope.row)"
                plain
                class="operation-btn"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteStandard(scope.row)"
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
        v-model:current-page="standardStore.pagination.currentPage"
        v-model:page-size="standardStore.pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalStandards"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 新增/编辑检评规范表单 -->
    <detection-standard-form
      v-model:visible="formVisible"
      :standard="currentStandard"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, Plus, Delete, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSettingStore } from '../../stores/setting';
import { useDetectionStandardStore } from '../../stores/detection/detectionStandard';
import DetectionStandardForm from '../form/DetectionStandardForm.vue';
import { formatDate, isDateExpired } from '../../utils/dateUtils';

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取检评规范状态存储
const standardStore = useDetectionStandardStore();



// 搜索文本
const searchText = ref('');
// 状态筛选
const selectedStatus = ref('');

// 选中的检评规范ID
const selectedStandardIds = ref([]);

// 表单可见性状态
const formVisible = ref(false);

// 当前编辑的检评规范
const currentStandard = ref(null);

// 从store获取检评规范列表数据
const standards = computed(() => standardStore.getStandardList);
const totalStandards = computed(() => standardStore.getTotalStandards);
const currentPage = computed(() => standardStore.pagination.currentPage);
const pageSize = computed(() => standardStore.pagination.pageSize);
const isLoading = computed(() => standardStore.getIsLoading);
const isDeleting = computed(() => standardStore.getIsDeleting);

// 过滤后的检评规范列表（全量展示）
const filteredStandards = computed(() => {
  let result = [...standards.value];
  
  // 状态过滤
  if (selectedStatus.value !== '' && selectedStatus.value !== null && selectedStatus.value !== undefined) {
    result = result.filter(standard => 
      standard.status === selectedStatus.value
    );
  }
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    result = result.filter(standard => 
      standard.standard_name?.toLowerCase().includes(search) || 
      standard.standard_code?.toLowerCase().includes(search)
    );
  }
  
  // 全量展示，不进行分页
  return result;
});

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedStandardIds.value = selection.map(standard => standard.standard_id);
};

// 处理新增检评规范
const handleAddStandard = () => {
  currentStandard.value = null;
  formVisible.value = true;
};

// 处理编辑检评规范
const handleEditStandard = (standard) => {
  currentStandard.value = standard;
  formVisible.value = true;
};

// 处理表单提交成功
const handleFormSuccess = () => {
  ElMessage.success('检评规范操作成功');
  // 刷新检评规范列表
  standardStore.fetchStandardList();
};

// 处理删除检评规范
const handleDeleteStandard = async (standard) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除检评规范 "${standard.standard_name}" (${standard.standard_code}) 吗？<br>删除后将无法恢复，请谨慎操作。`, 
      '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });
    
    const result = await standardStore.deleteStandard(standard.standard_id);
    if (result) {
      ElMessage.success(`检评规范 ${standard.standard_name} 删除成功`);
    } else {
      ElMessage.error(standardStore.error || '检评规范删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(standardStore.error || `删除检评规范 "${standard.standard_name}" 失败，请稍后重试`);
    }
  }
};

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedStandardIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的检评规范');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedStandardIds.value.length} 个检评规范吗？<br>删除后将无法恢复，请谨慎操作。`, 
      '批量删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });
    
    const result = await standardStore.batchDeleteStandards(selectedStandardIds.value);
    if (result) {
      ElMessage.success(`成功删除 ${selectedStandardIds.value.length} 个检评规范`);
      selectedStandardIds.value = [];
    } else {
      ElMessage.error(standardStore.error || '检评规范批量删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(standardStore.error || `批量删除 ${selectedStandardIds.value.length} 个检评规范失败，请稍后重试`);
    }
  }
};

// 处理页大小变化
const handleSizeChange = (size) => {
  standardStore.updatePagination({
    pageSize: size,
    currentPage: 1
  });
};

// 处理当前页变化
const handleCurrentChange = (current) => {
  standardStore.updatePagination({
    currentPage: current
  });
};

// 刷新数据
const handleRefresh = async () => {
  try {
    await standardStore.fetchStandardList();
    ElMessage.success('数据已刷新');
  } catch (error) {
    ElMessage.error('数据刷新失败，请稍后重试');
  }
};

// 组件挂载时获取检评规范列表
onMounted(() => {
  standardStore.fetchStandardList();
});

// 处理状态变化
const handleStatusChange = async (standard, newStatus) => {
  const result = await standardStore.updateStandardStatus(standard.standard_id, newStatus);
  if (result) {
    ElMessage.success(`检评规范 ${standard.standard_name} 状态已更新为: ${newStatus ? '启用' : '禁用'}`);
  } else {
    ElMessage.error('检评规范状态更新失败');
    // 更新失败，恢复原来的状态
    standard.status = newStatus ? 0 : 1;
  }
};
</script>

<style scoped>
.detection-standard {
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
  font-size: 14px !important;
  line-height: 1.4 !important;
  height: auto !important;
  min-height: auto !important;
}

/* 调整表头样式 */
:deep(.el-table__header th) {
  font-size: 14px !important;
  line-height: 1.6 !important;
  padding: 8px 2px !important;
  height: auto !important;
}

/* 状态开关样式 */
.status-switch {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 过期日期样式 */
.expired-date {
  color: #ff4949 !important;
  font-weight: bold !important;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 2px;
}

.operation-btn {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  padding: 4px 6px;
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
  --el-button-plain-color: var(--text-primary) !important;
  --el-button-plain-border-color: var(--border-color) !important;
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-button--plain:hover) {
  --el-button-plain-bg-color: var(--bg-secondary) !important;
  --el-button-plain-color: var(--color-primary) !important;
  --el-button-plain-border-color: var(--color-primary) !important;
  background-color: var(--bg-secondary) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

:deep(.el-button--primary) {
  --el-button-primary-bg-color: var(--bg-primary) !important;
  --el-button-primary-color: var(--color-primary) !important;
  --el-button-primary-border-color: var(--color-primary) !important;
  background-color: var(--bg-primary) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

:deep(.el-button--primary:hover) {
  --el-button-primary-bg-color: var(--color-primary) !important;
  --el-button-primary-color: white !important;
  --el-button-primary-border-color: var(--color-primary) !important;
  background-color: var(--color-primary) !important;
  color: white !important;
  border-color: var(--color-primary) !important;
}

:deep(.el-button--danger) {
  --el-button-danger-bg-color: var(--bg-primary) !important;
  --el-button-danger-color: var(--color-danger) !important;
  --el-button-danger-border-color: var(--color-danger) !important;
  background-color: var(--bg-primary) !important;
  color: var(--color-danger) !important;
  border-color: var(--color-danger) !important;
}

:deep(.el-button--danger:hover) {
  --el-button-danger-bg-color: var(--color-danger) !important;
  --el-button-danger-color: white !important;
  --el-button-danger-border-color: var(--color-danger) !important;
  background-color: var(--color-danger) !important;
  color: white !important;
  border-color: var(--color-danger) !important;
}

:deep(.el-button--warning) {
  --el-button-warning-bg-color: var(--bg-primary) !important;
  --el-button-warning-color: var(--color-warning) !important;
  --el-button-warning-border-color: var(--color-warning) !important;
  background-color: var(--bg-primary) !important;
  color: var(--color-warning) !important;
  border-color: var(--color-warning) !important;
}

:deep(.el-button--warning:hover) {
  --el-button-warning-bg-color: var(--color-warning) !important;
  --el-button-warning-color: white !important;
  --el-button-warning-border-color: var(--color-warning) !important;
  background-color: var(--color-warning) !important;
  color: white !important;
  border-color: var(--color-warning) !important;
}

/* 滚动条样式 */
:deep(.el-scrollbar__wrap) {
  background-color: var(--table-row-bg);
}

:deep(.el-scrollbar__view) {
  background-color: var(--table-row-bg);
}
</style>