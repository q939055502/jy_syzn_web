<template>
  <div class="detection-param">
    <h2>检测参数管理</h2>
    
    <!-- 搜索和新增区域 -->
    <div class="user-management-header">
      <div class="button-group">
        <el-button type="primary" @click="handleAddParam">
          <el-icon><Plus /></el-icon>
          <span>新增检测参数</span>
        </el-button>
        <el-button type="primary" plain @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          <span>刷新数据</span>
        </el-button>
        <!-- 批量删除按钮，后续有需要再启用 -->
        <el-button 
          type="danger" 
          @click="handleBatchDelete" 
          :disabled="selectedParamIds.length === 0"
          :loading="isDeleting"
          v-if="false"
        >
          <el-icon><Delete /></el-icon>
          <span>批量删除</span>
        </el-button>
      </div>
      <div class="search-box">
        <el-select
          v-model="selectedItem"
          placeholder="请选择检测项目"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <el-option
            v-for="item in itemOptions"
            :key="item.item_id"
            :label="item.item_name"
            :value="item.item_id"
          />
        </el-select>
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
          placeholder="请输入检测参数名称、规范信息等进行搜索"
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 错误信息显示 -->
    <div v-if="paramError || itemError" class="error-message">
      <el-alert
        :title="paramError || itemError"
        type="error"
        :closable="true"
        @close="handleCloseError"
      />
    </div>

    <!-- 检测参数表格 -->
    <div class="table-container">
      <el-table
        :data="filteredParams"
        style="width: 100%"
        border
        header-row-class-name="table-header"
        @selection-change="handleSelectionChange"
        :loading="isLoading || isItemLoading"
      >
        <!-- 多选框列，后续有需要再启用 -->
        <el-table-column type="selection" width="55" v-if="false" />
        
        <!-- 序号列 -->
        <el-table-column type="index" label="ID" width="50" fixed="left" />
        
        <!-- 检测对象 -->
        <el-table-column prop="object_name" label="检测对象" min-width="12%" />
        
        <!-- 项目名称 -->
        <el-table-column prop="item_name" label="项目名称" min-width="12%" />
        
        <!-- 参数名称 -->
        <el-table-column prop="param_name" label="参数名称" min-width="15%" />
        
        <!-- 价格 -->
        <el-table-column prop="price" label="价格" min-width="8%" />
        
        <!-- 样品加工费 -->
        <el-table-column prop="sample_processing_fee" label="样品加工费" min-width="8%" />
        
        <!-- 组批规则 -->
        <el-table-column prop="sampling_batch" label="组批规则" min-width="12%" />
        
        <!-- 取样频率 -->
        <el-table-column prop="sampling_frequency" label="取样频率" min-width="8%" />
        
        <!-- 取样要求 -->
        <el-table-column prop="sampling_require" label="取样要求" min-width="18%" />
        
        <!-- 送检要求 -->
        <el-table-column prop="inspection_require" label="送检要求" min-width="18%" />
        
        <!-- 所需信息 -->
        <el-table-column prop="required_info" label="所需信息" min-width="15%" />
        
        <!-- 报告时间 -->
        <el-table-column prop="report_time" label="报告时间" min-width="8%" />
        

        
        <!-- 规范信息 -->
        <el-table-column label="规范信息" min-width="12%">
          <template #default="scope">
            <div class="standard-info">{{ formatStandardInfo(scope.row.standards) }}</div>
          </template>
        </el-table-column>
        

        
        <!-- 常规参数 -->
        <el-table-column prop="is_regular_param" label="常规参数" min-width="8%">
          <template #default="scope">
            <el-switch
              :model-value="scope.row.is_regular_param"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="(newStatus) => handleRegularParamChange(scope.row, newStatus)"
            />
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" min-width="8%">
          <template #default="scope">
            <el-switch
              :model-value="scope.row.status === 1"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="(newStatus) => handleStatusChange(scope.row, newStatus)"
            />
          </template>
        </el-table-column>
        
        <!-- 排序号 -->
        <el-table-column prop="sort_order" label="排序号" min-width="10%">
          <template #default="scope">
            <div class="sort-edit">
              <el-input
                v-if="editingId === scope.row.param_id"
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
        
        <!-- 更新日期 -->
        <el-table-column prop="update_time" label="更新日期" min-width="9%">
          <template #default="scope">
            <span>{{ scope.row.update_time ? formatDate(scope.row.update_time) : '无' }}</span>
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                type="primary"
                size="small"
                @click="handleEditParam(scope.row)"
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
                :disabled="!scope.row.template || !scope.row.template.download_url"
              >
                下载
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteParam(scope.row)"
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
        v-model:current-page="paramStore.pagination.currentPage"
        v-model:page-size="paramStore.pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalParams"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 新增/编辑检测参数表单 -->
    <detection-param-form
      v-model:visible="formVisible"
      :item="currentParam"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, Plus, Delete, Refresh } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSettingStore } from '../../stores/setting';
import { useDetectionParamStore } from '../../stores/detection/detectionParam';
import { useDetectionItemStore } from '../../stores/detection/detectionItem';
import DetectionParamForm from '../form/DetectionParamForm.vue';
import { formatDate } from '../../utils/dateUtils';

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取检测参数状态存储
const paramStore = useDetectionParamStore();
// 获取检测项目状态存储
const itemStore = useDetectionItemStore();
const itemOptions = computed(() => itemStore.getItemList);

// 搜索文本
const searchText = ref('');
// 检测项目筛选
const selectedItem = ref('');
// 状态筛选
const selectedStatus = ref('');

// 格式化规范信息
const formatStandardInfo = (standards) => {
  if (!standards || standards.length === 0) return '无';
  
  return standards.map(standard => {
    // 添加中文书名号
    let name = standard.standard_name;
    if (!/^《.*》$/.test(name)) {
      name = `《${name}》`;
    }
    // 组合名称和代码，换行分隔
    return `${name}\n${standard.standard_code}`;
  }).join(', ');
};



// 选中的检测参数ID
const selectedParamIds = ref([]);

// 表单可见性状态
const formVisible = ref(false);

// 当前编辑的检测参数
const currentParam = ref(null);

// 排序号编辑状态管理
const editingId = ref(null);
const editingSort = ref(0);
const sortInputRef = ref(null);
const isUpdatingSort = ref(false);

// 从store获取检测参数列表数据
const params = computed(() => paramStore.getParamList);
const totalParams = computed(() => paramStore.getTotalParams);
const currentPage = computed(() => paramStore.pagination.currentPage);
const pageSize = computed(() => paramStore.pagination.pageSize);
const isLoading = computed(() => paramStore.getIsLoading);
const isDeleting = computed(() => paramStore.getIsDeleting);
const paramError = computed(() => paramStore.getError);
// 检测项目列表加载状态
const isItemLoading = computed(() => itemStore.getIsLoading);
const itemError = computed(() => itemStore.getError);

// 过滤后的检测参数列表（全量展示）
const filteredParams = computed(() => {
  let result = [...params.value];
  
  // 为每个检测参数添加item_name和standard_info字段，确保即使itemOptions为空也能正常显示
  result = result.map(param => {
    // 查找对应的检测项目，使用可选链避免空数组错误
    const item = itemOptions.value?.find(item => item.item_id === param.item_id);
    
    // 生成规范信息文本，用于搜索
    const standardInfo = param.standards?.map(standard => {
      return `${standard.standard_name || ''} ${standard.standard_code || ''}`;
    }).join(' ') || '';
    
    return {
      ...param,
      item_name: item?.item_name || '未分类',
      standard_info: standardInfo
    };
  });
  
  // 检测项目过滤 - 修复类型不匹配问题
  if (selectedItem.value) {
    const selectedItemId = parseInt(selectedItem.value);
    result = result.filter(param => 
      param.item_id === selectedItemId
    );
  }
  
  // 状态过滤 - 修复类型匹配问题，确保能正确匹配禁用状态
  if (selectedStatus.value !== '' && selectedStatus.value !== null && selectedStatus.value !== undefined) {
    const statusValue = parseInt(selectedStatus.value);
    result = result.filter(param => {
      // 直接比较，处理不同类型的status值
      return Number(param.status) === statusValue;
    });
  }
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    result = result.filter(param => 
      param.param_name?.toLowerCase().includes(search) ||
      param.object_name?.toLowerCase().includes(search) ||
      param.item_name?.toLowerCase().includes(search) ||
      param.standard_info?.toLowerCase().includes(search)
    );
  }
  
  // 全量展示，不进行分页
  return result;
});

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedParamIds.value = selection.map(param => param.param_id);
};

// 处理新增检测参数
const handleAddParam = () => {
  currentParam.value = null;
  formVisible.value = true;
};

// 处理编辑检测参数
const handleEditParam = (param) => {
  currentParam.value = param;
  formVisible.value = true;
};

// 处理表单提交成功
const handleFormSuccess = () => {
  ElMessage.success('检测参数操作成功');
  // 刷新检测参数列表
  paramStore.fetchParamList();
};

// 处理删除检测参数
const handleDeleteParam = async (param) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除检测参数 "${param.param_name}" 吗？<br>删除后将无法恢复，请谨慎操作。`, 
      '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });
    
    const result = await paramStore.deleteParam(param.param_id);
    if (result) {
      ElMessage.success(`检测参数 ${param.param_name} 删除成功`);
    } else {
      ElMessage.error(paramStore.error || '检测参数删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(paramStore.error || `删除检测参数 "${param.param_name}" 失败，请稍后重试`);
    }
  }
};

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedParamIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的检测参数');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedParamIds.value.length} 个检测参数吗？<br>删除后将无法恢复，请谨慎操作。`, 
      '批量删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });
    
    const result = await paramStore.batchDeleteParams(selectedParamIds.value);
    if (result) {
      ElMessage.success(`成功删除 ${selectedParamIds.value.length} 个检测参数`);
      selectedParamIds.value = [];
    } else {
      ElMessage.error(paramStore.error || '检测参数批量删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(paramStore.error || `批量删除 ${selectedParamIds.value.length} 个检测参数失败，请稍后重试`);
    }
  }
};

// 处理页大小变化
const handleSizeChange = (size) => {
  paramStore.updatePagination({
    pageSize: size,
    currentPage: 1
  });
};

// 处理当前页变化
const handleCurrentChange = (current) => {
  paramStore.updatePagination({
    currentPage: current
  });
};

// 刷新数据
const handleRefresh = async () => {
  try {
    await Promise.all([
      itemStore.fetchItemList(),
      paramStore.fetchParamList()
    ]);
    ElMessage.success('数据已刷新');
  } catch (error) {
    ElMessage.error('数据刷新失败，请稍后重试');
  }
};

// 组件挂载时获取检测参数列表和检测项目列表
onMounted(async () => {
  // 并行加载检测项目列表和检测参数列表
  await Promise.all([
    itemStore.fetchItemList(),
    paramStore.fetchParamList()
  ]);
});

// 处理状态变化
const handleStatusChange = async (param, newStatus) => {
  try {
    // 只有禁用时才需要提示
    if (!newStatus) {
      // 禁用检测参数
      const confirmMessage = `禁用检测参数，是否继续？`;
      
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
    
    // 更新检测参数状态
    const result = await paramStore.updateParam(param.param_id, { status: newStatus ? 1 : 0 });
    if (result) {
      ElMessage.success(`检测参数 ${param.param_name} 状态已更新为: ${newStatus ? '启用' : '禁用'}`);
    } else {
      ElMessage.error('检测参数状态更新失败');
      // 更新失败，恢复原来的状态
      param.status = newStatus ? 0 : 1;
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('检测参数状态更新失败');
      // 用户取消操作或发生错误，恢复原来的状态
      param.status = newStatus ? 0 : 1;
    } else {
      // 用户取消操作，恢复原来的状态
      param.status = newStatus ? 0 : 1;
    }
  }
};



// 处理常规参数标识变化
const handleRegularParamChange = async (param, newStatus) => {
  // 准备更新数据
  const updateData = {
    is_regular_param: newStatus ? 1 : 0
  };
  
  const result = await paramStore.updateParam(param.param_id, updateData);
  if (result) {
    ElMessage.success(`检测参数 ${param.param_name} 常规参数标识已更新为: ${newStatus ? '是' : '否'}`);
  } else {
    ElMessage.error('检测参数常规参数标识更新失败');
    // 更新失败，恢复原来的状态
    param.is_regular_param = newStatus ? false : true;
  }
};

// 处理排序号编辑
const handleSortEdit = (param) => {
  editingId.value = param.param_id;
  editingSort.value = param.sort_order;
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

// 失去焦点保存排序号
const handleSortBlur = (param) => {
  saveSort(param);
};

// 回车保存排序号
const handleSortEnter = (param) => {
  saveSort(param);
};

// 保存排序号
const saveSort = async (param) => {
  if (editingId.value !== param.param_id) return;
  
  // 检查是否有变化
  if (editingSort.value === param.sort_order) {
    editingId.value = null;
    return;
  }
  
  try {
    isUpdatingSort.value = true;
    // 准备更新数据
    const updateData = {
      sort_order: editingSort.value
    };
    
    const result = await paramStore.updateParam(param.param_id, updateData);
    if (result) {
      ElMessage.success(`检测参数 ${param.param_name} 排序号已更新`);
      // 刷新检测参数列表
      paramStore.fetchParamList();
    } else {
      ElMessage.error('排序号更新失败');
      // 更新失败，恢复原来的值
      editingSort.value = param.sort_order;
    }
  } catch (error) {
    ElMessage.error('排序号更新失败，请稍后重试');
    editingSort.value = param.sort_order;
  } finally {
    isUpdatingSort.value = false;
    editingId.value = null;
  }
};

// 处理下载委托单模板
const handleDownloadTemplate = (param) => {
  if (!param.template || !param.template.download_url) {
    ElMessage.warning('该检测参数未关联委托单模板，无法下载');
    return;
  }
  
  // 直接使用服务器返回的完整下载链接，文件名由服务器在响应头中指定
  const link = document.createElement('a');
  link.href = param.template.download_url;
  link.download = ''; // 文件名由服务器在响应头中指定
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  ElMessage.success('开始下载委托单模板');
};

// 处理错误信息关闭
const handleCloseError = () => {
  // 清除检测参数和检测项目的错误信息
  paramStore.clearError();
  itemStore.clearError();
};
</script>

<style scoped>
.detection-param {
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
  font-size: 11px !important;
}

/* 表头样式，确保内容居中 */
:deep(.el-table__header th) {
  text-align: center !important;
  vertical-align: middle !important;
  font-size: 11px !important;
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
  font-size: 11px !important;
  line-height: 1.4 !important;
  height: auto !important;
  min-height: auto !important;
}

/* 调整表头样式 */
:deep(.el-table__header th) {
  font-size: 11px !important;
  line-height: 1.6 !important;
  padding: 16px 2px !important;
  height: auto !important;
}

/* 排序号编辑样式 */
.sort-edit {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 2px;
}

.sort-text {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  width: 100%;
  text-align: center;
}

.sort-text:hover {
  background-color: var(--bg-secondary);
}

/* 使用百分比宽度，实现自适应 */
.sort-input {
  width: 100% !important;
  min-width: 60px;
}

/* 隐藏number输入框的上下箭头 */
:deep(.sort-input input::-webkit-inner-spin-button),
:deep(.sort-input input::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

:deep(.sort-input input[type=number]) {
  -moz-appearance: textfield;
  text-align: center !important;
}

/* 确保输入框文字居中 */
:deep(.sort-input .el-input__inner) {
  text-align: center !important;
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

/* 表格中开关按钮样式 */
:deep(.el-table .el-switch) {
  width: 80%;
  max-width: 40px;
  min-width: 30px;
  height: auto;
  aspect-ratio: 2;
  display: flex;
  align-items: center;
  margin: 0 auto;
}

:deep(.el-table .el-switch__core) {
  width: 100%;
  height: auto;
  aspect-ratio: 2;
}

:deep(.el-table .el-switch__action) {
  width: calc(50% - 2px);
  height: calc(100% - 2px);
  margin: 1px;
}

/* 确保开关按钮容器填充整个单元格 */
:deep(.el-table__cell .cell) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 40px;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.operation-btn {
  width: 60px;
  min-width: 60px !important;
  font-size: 12px;
  padding: 4px 8px;
  margin: 0 auto;
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
  background-color: var(--input-bg) !important;
  color: var(--input-text) !important;
  border-color: var(--input-border) !important;
}

:deep(.el-input__inner),
:deep(.el-select__input) {
  color: var(--input-text) !important;
}

:deep(.el-input__placeholder),
:deep(.el-select__placeholder) {
  color: var(--text-tertiary) !important;
}

/* 确保输入框编辑状态下的字体颜色正确 */
:deep(.el-input-number__input) {
  color: var(--input-text) !important;
  background-color: var(--input-bg) !important;
}

:deep(.el-input-number__increase),
:deep(.el-input-number__decrease) {
  color: var(--input-text) !important;
  background-color: var(--input-bg) !important;
  border-color: var(--border-color) !important;
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

/* 成功按钮样式，用于下载按钮 */
:deep(.el-button--success) {
  --el-button-success-bg-color: var(--bg-primary) !important;
  --el-button-success-color: var(--color-success) !important;
  --el-button-success-border-color: var(--color-success) !important;
  background-color: var(--bg-primary) !important;
  color: var(--color-success) !important;
  border-color: var(--color-success) !important;
}

:deep(.el-button--success:hover) {
  --el-button-success-bg-color: var(--color-success) !important;
  --el-button-success-color: white !important;
  --el-button-success-border-color: var(--color-success) !important;
  background-color: var(--color-success) !important;
  color: white !important;
  border-color: var(--color-success) !important;
}

/* 滚动条样式 */
:deep(.el-scrollbar__wrap) {
  background-color: var(--table-row-bg);
}

:deep(.el-scrollbar__view) {
  background-color: var(--table-row-bg);
}

/* 省略号文本样式 */
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 120px;
}

/* 规范信息样式 */
.standard-info {
  white-space: pre-line;
  text-align: center;
}

.guide-item {
  display: inline;
}


</style>
