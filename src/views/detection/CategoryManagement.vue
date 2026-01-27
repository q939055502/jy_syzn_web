<template>
  <div class="category-management">
    <h2>分类管理</h2>
    
    <!-- 搜索和新增区域 -->
    <div class="user-management-header">
      <div class="button-group">
        <el-button type="primary" @click="handleAddCategory">
          <el-icon><Plus /></el-icon>
          <span>新增分类</span>
        </el-button>
        <el-button type="primary" plain @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          <span>刷新数据</span>
        </el-button>
        <!-- 批量删除按钮，后续有需要再启用 -->
        <el-button 
          type="danger" 
          @click="handleBatchDelete" 
          :disabled="selectedCategoryIds.length === 0"
          :loading="isDeleting"
          v-if="false"
        >
          <el-icon><Delete /></el-icon>
          <span>批量删除</span>
        </el-button>
      </div>
      <div class="search-box">
        <el-input
          v-model="searchText"
          placeholder="请输入分类名称进行搜索"
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 分类表格 -->
    <div class="table-container">
      <el-table
        :data="filteredCategories"
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
        
        <!-- 分类名称 -->
        <el-table-column prop="category_name" label="分类名称" min-width="20%" />
        
        <!-- 创建日期 -->
        <el-table-column prop="create_time" label="创建日期" min-width="15%">
          <template #default="scope">
            <span>{{ formatDate(scope.row.create_time) }}</span>
          </template>
        </el-table-column>
        
        <!-- 更新日期 -->
        <el-table-column prop="update_time" label="更新日期" min-width="15%">
          <template #default="scope">
            <span>{{ formatDate(scope.row.update_time) }}</span>
          </template>
        </el-table-column>
        
        <!-- 排序号 -->
        <el-table-column prop="sort_order" label="排序号" min-width="8%">
          <template #default="scope">
            <div class="sort-edit">
              <el-input
                v-if="editingId === scope.row.category_id"
                v-model="editingSort"
                size="small"
                @blur="handleSortBlur(scope.row)"
                @keyup.enter="handleSortEnter(scope.row)"
                @input="handleSortInput"
                class="sort-input"
                :ref="el => sortInputRef = el"
                type="number"
                :min="1"
                placeholder="请输入数字"
              />
              <span 
                v-else 
                class="sort-text" 
                @click="handleSortEdit(scope.row)"
              >
                {{ scope.row.sort_order }}
              </span>
            </div>
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" min-width="12%">
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
        <el-table-column label="操作" min-width="20%" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                type="primary"
                size="small"
                @click="handleEditCategory(scope.row)"
                plain
                class="operation-btn"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteCategory(scope.row)"
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
        v-model:current-page="categoryStore.pagination.currentPage"
        v-model:page-size="categoryStore.pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCategories"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 新增/编辑分类表单 -->
    <category-form
      v-model:visible="formVisible"
      :category="currentCategory"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, Plus, Delete, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSettingStore } from '../../stores/setting';
import { useCategoryStore } from '../../stores/detection/category';
import { useDetectionObjectStore } from '../../stores/detection/detectionObject';
import CategoryForm from '../form/CategoryForm.vue';
import { formatDate } from '../../utils/dateUtils';



// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取分类状态存储
const categoryStore = useCategoryStore();

// 搜索文本
const searchText = ref('');

// 选中的分类ID
const selectedCategoryIds = ref([]);

// 表单可见性状态
const formVisible = ref(false);

// 当前编辑的分类
const currentCategory = ref(null);

// 排序号编辑状态管理
const editingId = ref(null);
const editingSort = ref(0);
const sortInputRef = ref(null);
const isUpdatingSort = ref(false);

// 从store获取分类列表数据
const categories = computed(() => categoryStore.getCategoryList);
const totalCategories = computed(() => categoryStore.getTotalCategories);
const currentPage = computed(() => categoryStore.pagination.currentPage);
const pageSize = computed(() => categoryStore.pagination.pageSize);
const isLoading = computed(() => categoryStore.getIsLoading);
const isDeleting = computed(() => categoryStore.getIsDeleting);

// 过滤后的分类列表（全量展示）
const filteredCategories = computed(() => {
  let result = [...categories.value];
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    result = result.filter(category => 
      category.category_name?.toLowerCase().includes(search)
    );
  }
  
  // 全量展示，不进行分页
  return result;
});

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedCategoryIds.value = selection.map(category => category.category_id);
};

// 处理新增分类
const handleAddCategory = () => {
  currentCategory.value = null;
  formVisible.value = true;
};

// 处理编辑分类
const handleEditCategory = (category) => {
  currentCategory.value = category;
  formVisible.value = true;
};

// 处理表单提交成功
const handleFormSuccess = () => {
  ElMessage.success('分类操作成功');
  // 刷新分类列表
  categoryStore.fetchCategoryList();
};

// 处理删除分类
const handleDeleteCategory = async (category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类 "${category.category_name}" 吗？<br>删除后将无法恢复，请谨慎操作。`, 
      '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });
    
    const result = await categoryStore.deleteCategory(category.category_id);
    if (result) {
      ElMessage.success(`分类 ${category.category_name} 删除成功`);
    } else {
      ElMessage.error(categoryStore.error || '分类删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(categoryStore.error || `删除分类 "${category.category_name}" 失败，请稍后重试`);
    }
  }
};

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedCategoryIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的分类');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCategoryIds.value.length} 个分类吗？<br>删除后将无法恢复，请谨慎操作。`, 
      '批量删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });
    
    const result = await categoryStore.batchDeleteCategories(selectedCategoryIds.value);
    if (result) {
      ElMessage.success(`成功删除 ${selectedCategoryIds.value.length} 个分类`);
      selectedCategoryIds.value = [];
    } else {
      ElMessage.error(categoryStore.error || '分类批量删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(categoryStore.error || `批量删除 ${selectedCategoryIds.value.length} 个分类失败，请稍后重试`);
    }
  }
};

// 处理页大小变化
const handleSizeChange = (size) => {
  categoryStore.updatePagination({
    pageSize: size,
    currentPage: 1
  });
};

// 处理当前页变化
const handleCurrentChange = (current) => {
  categoryStore.updatePagination({
    currentPage: current
  });
};

// 刷新数据
const handleRefresh = async () => {
  try {
    await categoryStore.fetchCategoryList({
      page: 1,
      limit: 10000 // 获取所有数据
    });
    ElMessage.success('数据已刷新');
  } catch (error) {
    ElMessage.error('数据刷新失败，请稍后重试');
  }
};

// 组件挂载时获取分类列表
onMounted(async () => {
  await categoryStore.fetchCategoryList({
    page: 1,
    limit: 10000 // 获取所有数据
  });
});

// 处理排序号编辑
const handleSortEdit = (category) => {
  editingId.value = category.category_id;
  editingSort.value = category.sort_order;
  // 延迟聚焦输入框
  setTimeout(() => {
    if (sortInputRef.value) {
      sortInputRef.value.focus();
    }
  }, 100);
};

// 排序号输入处理，确保只能输入数字
const handleSortInput = (value) => {
  // 移除所有非数字字符
  const numValue = value.replace(/[^0-9]/g, '');
  // 转换为数字
  editingSort.value = numValue ? parseInt(numValue) : '';
};

// 排序号变化处理
const handleSortChange = () => {
  // 可以添加验证逻辑
};

// 失去焦点保存排序号
const handleSortBlur = (category) => {
  saveSort(category);
};

// 回车保存排序号
const handleSortEnter = (category) => {
  saveSort(category);
};

// 保存排序号
const saveSort = async (category) => {
  if (editingId.value !== category.category_id) return;
  
  // 检查是否有变化
  if (editingSort.value === category.sort_order) {
    editingId.value = null;
    return;
  }
  
  try {
    isUpdatingSort.value = true;
    // 准备更新数据
    const updateData = {
      sort_order: editingSort.value
    };
    
    const result = await categoryStore.updateCategory(category.category_id, updateData);
    if (result) {
      ElMessage.success(`分类 ${category.category_name} 排序号已更新`);
      // 刷新分类列表
      categoryStore.fetchCategoryList();
    } else {
      ElMessage.error('排序号更新失败');
      // 更新失败，恢复原来的值
      editingSort.value = category.sort_order;
    }
  } catch (error) {
    ElMessage.error('排序号更新失败，请稍后重试');
    editingSort.value = category.sort_order;
  } finally {
    isUpdatingSort.value = false;
    editingId.value = null;
  }
};

// 处理状态变化
const handleStatusChange = async (category, newStatus) => {
  try {
    // 只有禁用时才需要提示
    if (!newStatus) {
      // 禁用分类
      const confirmMessage = `禁用分类后，该分类下的所有检测对象、检测项目和检测参数也将被自动禁用，是否继续？`;
      
      await ElMessageBox.confirm(
        confirmMessage,
        '状态更新确认',
        {
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
    }
    
    // 准备更新数据
    const updateData = {
      status: newStatus ? 1 : 0
    };
    
    const result = await categoryStore.updateCategory(category.category_id, updateData);
    if (result) {
      ElMessage.success(`分类 ${category.category_name} 状态已更新为: ${newStatus ? '启用' : '禁用'}`);
    } else {
      ElMessage.error('分类状态更新失败');
      // 更新失败，恢复原来的状态
      category.status = newStatus ? 0 : 1;
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('分类状态更新失败');
      // 用户取消操作或发生错误，恢复原来的状态
      category.status = newStatus ? 0 : 1;
    } else {
      // 用户取消操作，恢复原来的状态
      category.status = newStatus ? 0 : 1;
    }
  }
};
</script>

<style scoped>
.category-management {
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

/* 调整表头行高和字体大小 */
:deep(.el-table__header th) {
  font-size: 16px !important;
  line-height: 2 !important;
  padding: 12px 2px !important;
  height: 48px !important;
}

/* 排序号编辑样式 */
.sort-edit {
  display: flex;
  justify-content: center;
  align-items: center;
}

.sort-text {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.sort-text:hover {
  background-color: var(--bg-secondary);
}

.sort-input {
  width: 80px;
}

/* 状态开关样式 */
.status-switch {
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 输入框样式 */
:deep(.el-input__wrapper) {
  background-color: var(--input-bg);
  color: var(--input-text);
  border-color: var(--input-border);
}

:deep(.el-input__inner) {
  color: var(--input-text);
}

:deep(.el-input__placeholder) {
  color: var(--text-tertiary);
}

/* 隐藏数字输入框的上下箭头 */
:deep(.sort-input input[type=number]) {
  -moz-appearance: textfield;
  text-align: center !important;
}

:deep(.sort-input input::-webkit-outer-spin-button),
:deep(.sort-input input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

/* 确保输入框文字居中 */
:deep(.sort-input .el-input__inner) {
  text-align: center !important;
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