<template>
  <div class="detection-item">
    <h2>检测项目管理</h2>
    
    <!-- 搜索和新增区域 -->
    <div class="user-management-header">
      <div class="button-group">
        <el-button type="primary" @click="handleAddItem">
          <el-icon><Plus /></el-icon>
          <span>新增项目</span>
        </el-button>
        <el-button type="primary" plain @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          <span>刷新数据</span>
        </el-button>
        <!-- 批量删除按钮，后续有需要再启用 -->
        <el-button 
          type="danger" 
          @click="handleBatchDelete" 
          :disabled="selectedItemIds.length === 0"
          :loading="isDeleting"
          v-if="false"
        >
          <el-icon><Delete /></el-icon>
          <span>批量删除</span>
        </el-button>
      </div>
      <div class="search-box">

        <el-select
          v-model="selectedObject"
          placeholder="请选择所属检测对象"
          style="width: 200px; margin-right: 10px"
          clearable
        >
          <el-option
            v-for="object in objects"
            :key="object.object_id"
            :label="object.object_name"
            :value="object.object_id"
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
          placeholder="请输入项目名称进行搜索"
          clearable
          style="width: 250px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 检测项目表格 -->
    <div class="table-container">
      <el-table
        :data="filteredItems"
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
        
        <!-- 项目名称 -->
        <el-table-column prop="item_name" label="项目名称" min-width="20%" />
        
        <!-- 所属检测对象 -->
        <el-table-column label="所属检测对象" min-width="12%">
          <template #default="scope">
            <!-- 直接使用object_name字段，确保能显示检测对象名称 -->
            <span>{{ scope.row.object_name || '未分配检测对象' }}</span>
          </template>
        </el-table-column>
        
        <!-- 描述 -->
        <el-table-column prop="description" label="描述" min-width="40%" show-overflow-tooltip />
        
        <!-- 更新日期 -->
        <el-table-column prop="update_time" label="更新日期" min-width="10%">
          <template #default="scope">
            <span>{{ formatDate(scope.row.update_time) }}</span>
          </template>
        </el-table-column>
        
        <!-- 排序号 -->
        <el-table-column prop="sort_order" label="排序号" min-width="8%">
          <template #default="scope">
            <div class="sort-edit">
              <el-input
                v-if="editingId === scope.row.item_id"
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
        <el-table-column label="操作" min-width="25%" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                type="primary"
                size="small"
                @click="handleEditItem(scope.row)"
                plain
                class="operation-btn"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteItem(scope.row)"
                plain
                class="operation-btn"
                :loading="isDeleting"
              >
                删除
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="handleGenerateImage(scope.row)"
                plain
                class="operation-btn"
              >
                生成
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="handleViewImage(scope.row)"
                plain
                class="operation-btn"
              >
                查看
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 隐藏的分页组件，保留状态管理但不显示 -->
    <div class="pagination-container" style="display: none;">
      <el-pagination
        v-model:current-page="itemStore.pagination.currentPage"
        v-model:page-size="itemStore.pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 新增/编辑检测项目表单 -->
    <detection-item-form
      v-model:visible="formVisible"
      :item="currentItem"
      @success="handleFormSuccess"
    />
    
    <!-- 检测参数图片查看弹窗 -->
    <el-dialog
      v-model="imageDialogVisible"
      :title="currentImageTitle"
      width="90%"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      :show-close="true"
      class="image-dialog"
    >
      <div class="image-container">
        <img 
          :src="currentImageUrl" 
          :alt="currentImageTitle" 
          class="preview-image"
          @load="handleImageLoad"
        />
        <div v-if="isImageLoading" class="image-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>图片加载中...</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Search, Plus, Delete, Refresh, Loading } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSettingStore } from '../../stores/setting';
import { useDetectionItemStore } from '../../stores/detection/detectionItem';
import { useDetectionParamStore } from '../../stores/detection/detectionParam';
import { useDetectionObjectStore } from '../../stores/detection/detectionObject';
import DetectionItemForm from '../form/DetectionItemForm.vue';
import { formatDate } from '../../utils/dateUtils';



// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取检测项目状态存储
const itemStore = useDetectionItemStore();
// 获取检测对象状态
const objectStore = useDetectionObjectStore();
const objects = computed(() => objectStore.getDetectionObjectList);

// 搜索文本
const searchText = ref('');
// 检测对象筛选
const selectedObject = ref('');
// 状态筛选
const selectedStatus = ref('');

// 选中的检测项目ID
const selectedItemIds = ref([]);

// 表单可见性状态
const formVisible = ref(false);

// 当前编辑的检测项目
const currentItem = ref(null);

// 图片弹窗状态
const imageDialogVisible = ref(false);
// 当前查看的图片URL
const currentImageUrl = ref('');
// 当前查看的图片标题
const currentImageTitle = ref('');
// 图片加载状态
const isImageLoading = ref(false);

// 排序号编辑状态管理
const editingId = ref(null);
const editingSort = ref(0);
const sortInputRef = ref(null);
const isUpdatingSort = ref(false);

// 从store获取检测项目列表数据
const items = computed(() => itemStore.getItemList);
const totalItems = computed(() => itemStore.getTotalItems);
const currentPage = computed(() => itemStore.pagination.currentPage);
const pageSize = computed(() => itemStore.pagination.pageSize);
const isLoading = computed(() => itemStore.getIsLoading);
const isDeleting = computed(() => itemStore.getIsDeleting);

// 过滤后的检测项目列表（全量展示）
const filteredItems = computed(() => {
  let result = [...items.value];
  
  // 检测对象过滤
  if (selectedObject.value) {
    result = result.filter(item => 
      item.object_id === selectedObject.value
    );
  }
  
  // 状态过滤
  if (selectedStatus.value !== '' && selectedStatus.value !== null && selectedStatus.value !== undefined) {
    result = result.filter(item => 
      item.status === selectedStatus.value
    );
  }
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    result = result.filter(item => 
      item.item_name?.toLowerCase().includes(search)
    );
  }
  
  // 为每个检测项目添加object_name字段
  result = result.map(item => {
    // 查找对应的检测对象
    const detectionObject = objects.value.find(obj => obj.object_id === item.object_id);
    return {
      ...item,
      object_name: detectionObject?.object_name || '未分配检测对象'
    };
  });
  
  // 全量展示，不进行分页
  return result;
});

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedItemIds.value = selection.map(item => item.item_id);
};

// 处理新增检测项目
const handleAddItem = () => {
  currentItem.value = null;
  formVisible.value = true;
};

// 处理编辑检测项目
const handleEditItem = (item) => {
  currentItem.value = item;
  formVisible.value = true;
};

// 处理表单提交成功
const handleFormSuccess = () => {
  ElMessage.success('检测项目操作成功');
  // 刷新检测项目列表
  itemStore.fetchItemList();
};

// 处理删除检测项目
const handleDeleteItem = async (item) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除检测项目 "${item.item_name}" 吗？<br>删除后将无法恢复，请谨慎操作。`, 
      '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });
    
    const result = await itemStore.deleteItem(item.item_id);
    if (result) {
      ElMessage.success(`检测项目 ${item.item_name} 删除成功`);
    } else {
      ElMessage.error(itemStore.error || '检测项目删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(itemStore.error || `删除检测项目 "${item.item_name}" 失败，请稍后重试`);
    }
  }
};

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedItemIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的检测项目');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedItemIds.value.length} 个检测项目吗？<br>删除后将无法恢复，请谨慎操作。`, 
      '批量删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    });
    
    const result = await itemStore.batchDeleteItems(selectedItemIds.value);
    if (result) {
      ElMessage.success(`成功删除 ${selectedItemIds.value.length} 个检测项目`);
      selectedItemIds.value = [];
    } else {
      ElMessage.error(itemStore.error || '检测项目批量删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(itemStore.error || `批量删除 ${selectedItemIds.value.length} 个检测项目失败，请稍后重试`);
    }
  }
};

// 处理页大小变化
const handleSizeChange = (size) => {
  itemStore.updatePagination({
    pageSize: size,
    currentPage: 1
  });
};

// 处理当前页变化
const handleCurrentChange = (current) => {
  itemStore.updatePagination({
    currentPage: current
  });
};

// 刷新数据
const handleRefresh = async () => {
  try {
    await Promise.all([
      objectStore.fetchDetectionObjectList(),
      itemStore.fetchItemList()
    ]);
    ElMessage.success('数据已刷新');
  } catch (error) {
    ElMessage.error('数据刷新失败，请稍后重试');
  }
};

// 组件挂载时获取检测项目列表和检测对象列表
onMounted(async () => {
  // 并行加载检测对象列表和检测项目列表
  await Promise.all([
    objectStore.fetchDetectionObjectList(),
    itemStore.fetchItemList()
  ]);
});

// 组件卸载时清理资源
onUnmounted(() => {
  // 释放Blob URL，避免内存泄漏
  if (currentImageUrl.value && currentImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(currentImageUrl.value);
  }
});

// 监听弹窗关闭事件，清理Blob URL
watch(() => imageDialogVisible.value, (newVal) => {
  if (!newVal && currentImageUrl.value && currentImageUrl.value.startsWith('blob:')) {
    // 保存当前Blob URL以便释放
    const blobUrl = currentImageUrl.value;
    // 先清空图片URL，防止浏览器尝试加载无效URL
    currentImageUrl.value = '';
    // 延迟释放Blob URL，确保图片元素已处理完URL变更
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  }
});

// 处理排序号编辑
const handleSortEdit = (item) => {
  editingId.value = item.item_id;
  editingSort.value = item.sort_order;
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
const handleSortBlur = (item) => {
  saveSort(item);
};

// 回车保存排序号
const handleSortEnter = (item) => {
  saveSort(item);
};

// 保存排序号
const saveSort = async (item) => {
  if (editingId.value !== item.item_id) return;
  
  // 检查是否有变化
  if (editingSort.value === item.sort_order) {
    editingId.value = null;
    return;
  }
  
  try {
    isUpdatingSort.value = true;
    // 准备更新数据
    const updateData = {
      sort_order: editingSort.value
    };
    
    const result = await itemStore.updateItem(item.item_id, updateData);
    if (result) {
      ElMessage.success(`检测项目 ${item.item_name} 排序号已更新`);
      // 刷新检测项目列表
      itemStore.fetchItemList();
    } else {
      ElMessage.error('排序号更新失败');
      // 更新失败，恢复原来的值
      editingSort.value = item.sort_order;
    }
  } catch (error) {
    ElMessage.error('排序号更新失败，请稍后重试');
    editingSort.value = item.sort_order;
  } finally {
    isUpdatingSort.value = false;
    editingId.value = null;
  }
};

// 处理生成检测参数图片
const handleGenerateImage = async (item) => {
  try {
    // 获取当前设备类型
    const deviceType = getDeviceType();
    // 准备请求数据
    const requestData = {
      item_id: item.item_id,
      item_name: item.item_name,
      device_type: deviceType
    };
    
    // 调试信息，查看设备类型
    console.log('Generate Image Device Type:', deviceType);
    
    // 调用API生成图片
    const response = await fetch('/api/image/detection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    const result = await response.json();
    if (result.code === 200) {
      ElMessage.success('检测参数图片生成成功');
    } else {
      ElMessage.error(`检测参数图片生成失败: ${result.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('生成检测参数图片失败:', error);
    ElMessage.error('检测参数图片生成失败，请稍后重试');
  }
};

// 检测设备类型的函数
const getDeviceType = () => {
  // 获取屏幕宽度
  const screenWidth = window.innerWidth;
  // 获取userAgent
  const userAgent = window.navigator.userAgent;
  
  // 检查是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  if (isMobile) {
    // 移动设备
    if (screenWidth < 768) {
      // 手机
      return 'phone';
    } else {
      // 平板
      return 'tablet';
    }
  } else {
    // PC设备
    return 'pc';
  }
};

// 处理查看检测参数图片
const handleViewImage = async (item) => {
  // 获取当前设备类型
  const deviceType = getDeviceType();
  // 构建图片URL，使用当前设备类型和SVG格式
  const dataUniqueId = `detection:${item.item_id}`;
  const imageUrl = `/api/image/${dataUniqueId}?device_type=${deviceType}&image_type=svg`;
  
  // 调试信息，查看实际URL和设备类型
  console.log('Device Type:', deviceType);
  console.log('Image URL:', imageUrl);
  
  // 设置图片标题
  currentImageTitle.value = `${item.item_name} - 检测参数指南`;
  // 显示图片加载状态
  isImageLoading.value = true;
  // 打开图片弹窗
  imageDialogVisible.value = true;
  
  try {
    // 使用fetch获取图片数据，接受SVG格式
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/svg+xml'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // 将图片数据转换为Blob
    const blob = await response.blob();
    // 创建Blob URL
    const blobUrl = URL.createObjectURL(blob);
    
    // 设置图片URL
    currentImageUrl.value = blobUrl;
    // 图片加载完成，隐藏加载状态
    isImageLoading.value = false;
  } catch (error) {
    console.error('获取图片失败:', error);
    // 隐藏加载状态
    isImageLoading.value = false;
    // 显示错误信息
    ElMessage.error('图片加载失败，请稍后重试或重新生成图片');
  }
};

// 图片加载完成处理
const handleImageLoad = () => {
  // 隐藏加载状态
  isImageLoading.value = false;
};



// 处理状态变化
const handleStatusChange = async (item, newStatus) => {
  try {
    // 只有禁用时才需要提示
    if (!newStatus) {
      // 禁用检测项目
      const confirmMessage = `禁用检测项目后，该检测项目下的所有检测参数也将被自动禁用，是否继续？`;
      
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
    
    // 更新检测项目状态
    const result = await itemStore.updateItem(item.item_id, { status: newStatus ? 1 : 0 });
    if (result) {
      ElMessage.success(`检测项目 ${item.item_name} 状态已更新为: ${newStatus ? '启用' : '禁用'}`);
    } else {
      ElMessage.error('检测项目状态更新失败');
      // 更新失败，恢复原来的状态
      item.status = newStatus ? 0 : 1;
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('检测项目状态更新失败');
      // 用户取消操作或发生错误，恢复原来的状态
      item.status = newStatus ? 0 : 1;
    } else {
      // 用户取消操作，恢复原来的状态
      item.status = newStatus ? 0 : 1;
    }
  }
};
</script>

<style scoped>
.detection-item {
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
  font-size: 16px !important;
  line-height: 1.6 !important;
  padding: 10px 2px !important;
  height: auto !important;
}

/* 调整描述列单元格字体 */
:deep(.el-table__cell[data-column-property="description"]) {
  font-size: 10px !important;
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
  justify-content: center;
  align-items: center;
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

/* 图片弹窗样式 */
.image-dialog {
  /* 添加弹窗样式 */
}

/* 图片容器样式 */
.image-container {
  position: relative;
  width: 100%;
  max-height: calc(100vh - 200px);
  overflow: auto;
  padding: 10px;
  margin: 0;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 预览图片样式 */
.preview-image {
  width: 100%;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  transition: all 0.3s ease;
  display: block;
  background-color: white;
}

/* 图片加载状态样式 */
.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 20px;
  border-radius: 8px;
  gap: 10px;
}

/* 加载图标样式 */
.image-loading .is-loading {
  font-size: 40px;
  animation: rotate 2s linear infinite;
}

/* 加载动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>