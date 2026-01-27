<template>
  <div class="permission-management">
    <h2>权限管理</h2>
    
    <!-- 权限管理表格 -->
    <div class="permission-table-container">
      <!-- 添加权限按钮 -->
      <div class="table-header-actions">
        <el-button
          type="primary"
          size="small"
          icon="Plus"
          @click="handleAddPermission"
          class="add-permission-button"
        >
          新增权限
        </el-button>
      </div>
      
      <el-table
        :data="permissionList"
        style="width: 100%"
        border
        header-row-class-name="table-header"
        :loading="isLoading"
        class="permission-table"
      >
        <!-- 资源列 -->
        <el-table-column prop="resource" label="资源" width="200">
          <template #default="scope">
            <div 
              class="cell-content"
              @dblclick="handleCellDblClick(scope.$index, 'resource', scope.row)"
            >
              <div v-if="editingCell === `${scope.$index}-resource`" class="editing-cell">
                <el-input
                  v-model="editForm.resource"
                  placeholder="请输入资源"
                  size="small"
                  @change="handleSaveEdit"
                  @blur="handleSaveEdit"
                />
              </div>
              <div v-else>
                {{ scope.row.resource || '未知资源' }}
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 动作列 -->
        <el-table-column prop="action" label="动作" width="200">
          <template #default="scope">
            <div 
              class="cell-content"
              @dblclick="handleCellDblClick(scope.$index, 'action', scope.row)"
            >
              <div v-if="editingCell === `${scope.$index}-action`" class="editing-cell">
                <el-input
                  v-model="editForm.action"
                  placeholder="请输入动作"
                  size="small"
                  @change="handleSaveEdit"
                  @blur="handleSaveEdit"
                />
              </div>
              <div v-else>
                {{ scope.row.action || '未知动作' }}
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 范围列 -->
        <el-table-column prop="scope" label="范围" width="150">
          <template #default="scope">
            <div 
              class="cell-content"
              @dblclick="handleCellDblClick(scope.$index, 'scope', scope.row)"
            >
              <div v-if="editingCell === `${scope.$index}-scope`" class="editing-cell">
                <el-input
                  v-model="editForm.scope"
                  placeholder="请输入范围"
                  size="small"
                  @change="handleSaveEdit"
                  @blur="handleSaveEdit"
                />
              </div>
              <div v-else>
                {{ scope.row.scope || '无' }}
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 描述列 -->
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="scope">
            <div 
              class="cell-content"
              @dblclick="handleCellDblClick(scope.$index, 'description', scope.row)"
            >
              <div v-if="editingCell === `${scope.$index}-description`" class="editing-cell">
                <el-input
                  v-model="editForm.description"
                  placeholder="请输入描述"
                  size="small"
                  @change="handleSaveEdit"
                  @blur="handleSaveEdit"
                  type="textarea"
                  :rows="2"
                />
              </div>
              <div v-else>
                {{ scope.row.description || '无描述' }}
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <!-- 禁用/启用按钮 -->
              <el-button
                type="success"
                size="small"
                @click="handleToggleStatus(scope.row)"
                :icon="scope.row.is_active ? 'SwitchButton' : 'Check'"
                :disabled="scope.row.is_editing"
              >
                {{ scope.row.is_active ? '禁用' : '启用' }}
              </el-button>
              
              <!-- 保存按钮 -->
              <el-button
                type="primary"
                size="small"
                icon="Check"
                @click="handleSavePermission(scope.row)"
                :disabled="scope.row.is_editing"
                class="save-button"
              >
                保存
              </el-button>
              
              <!-- 删除按钮 -->
              <el-button
                type="danger"
                size="small"
                icon="Delete"
                @click="handleDeletePermission(scope.row)"
                :disabled="scope.row.is_editing"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 新增权限对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新增权限"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="permissionForm" label-width="80px" size="small">
        <el-form-item label="资源" required>
          <el-input v-model="permissionForm.resource" placeholder="请输入资源" />
        </el-form-item>
        <el-form-item label="动作" required>
          <el-input v-model="permissionForm.action" placeholder="请输入动作" />
        </el-form-item>
        <el-form-item label="范围">
          <el-input v-model="permissionForm.scope" placeholder="请输入范围，默认为'all'" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="permissionForm.description" 
            placeholder="请输入描述" 
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreatePermission">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// 权限管理相关逻辑
import { ref, computed, onMounted } from 'vue';
import { useSettingStore } from '../stores/setting';
import { usePermissionStore } from '../stores/permission';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Check, Delete, SwitchButton } from '@element-plus/icons-vue';

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取权限状态存储
const permissionStore = usePermissionStore();

// 计算属性
const permissionList = computed(() => permissionStore.permissionList);
const isLoading = computed(() => permissionStore.isLoading);

// 对话框可见性
const dialogVisible = ref(false);

// 表单数据
const permissionForm = ref({ 
  resource: '', 
  action: '', 
  scope: 'all', 
  description: '' 
});
const editForm = ref({});

// 编辑状态
const editingCell = ref('');
const originalValue = ref({});

// 页面加载时初始化数据
onMounted(() => {
  initData();
});

// 初始化数据
const initData = async () => {
  await permissionStore.fetchPermissionList();
};

// 处理单元格双击事件
const handleCellDblClick = (rowIndex, cellType, row) => {
  editingCell.value = `${rowIndex}-${cellType}`;
  editForm.value = { ...row };
  originalValue.value = { [cellType]: row[cellType] };
};

// 处理保存编辑
const handleSaveEdit = async () => {
  try {
    const [rowIndex, cellType] = editingCell.value.split('-');
    const row = permissionList.value[rowIndex];
    
    if (!row) return;
    
    await permissionStore.updatePermission(row.id, editForm.value);
    ElMessage.success('保存成功');
    editingCell.value = '';
    editForm.value = {};
    originalValue.value = {};
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message);
  }
};

// 处理新增权限
const handleAddPermission = () => {
  permissionForm.value = { 
    resource: '', 
    action: '', 
    scope: 'all', 
    description: '' 
  };
  dialogVisible.value = true;
};

// 处理创建权限
const handleCreatePermission = async () => {
  try {
    if (!permissionForm.value.resource) {
      ElMessage.warning('请输入资源');
      return;
    }
    
    if (!permissionForm.value.action) {
      ElMessage.warning('请输入动作');
      return;
    }
    
    await permissionStore.createPermission(permissionForm.value);
    ElMessage.success('权限创建成功');
    dialogVisible.value = false;
    permissionForm.value = { 
      resource: '', 
      action: '', 
      scope: 'all', 
      description: '' 
    };
  } catch (error) {
    ElMessage.error('权限创建失败: ' + error.message);
  }
};

// 处理切换权限状态
const handleToggleStatus = async (row) => {
  try {
    const newStatus = !row.is_active;
    await permissionStore.togglePermissionStatus(row.id, newStatus);
    ElMessage.success(`权限已${newStatus ? '启用' : '禁用'}`);
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message);
  }
};

// 处理保存权限
const handleSavePermission = async (row) => {
  try {
    await permissionStore.updatePermission(row.id, row);
    ElMessage.success('权限保存成功');
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message);
  }
};

// 处理删除权限
const handleDeletePermission = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该权限吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await permissionStore.deletePermission(row.id);
    ElMessage.success('权限删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message);
    }
  }
};
</script>

<style scoped>
.permission-management {
  padding: 0 20px 20px 20px;
  margin-top: -20px;
}

.permission-table-container {
  margin-top: 20px;
  overflow-x: auto;
}

/* 表格顶部操作区域 */
.table-header-actions {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
}

/* 新增按钮样式 */
.add-permission-button {
  padding: 4px 12px;
}

/* 表格样式 */
.permission-table {
  margin-top: 0;
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border: 2px solid var(--text-primary) !important;
  border-collapse: collapse !important;
}

/* 表头样式 */
.table-header {
  background-color: var(--table-header-bg) !important;
  font-weight: bold !important;
  color: var(--text-primary) !important;
}

/* 单元格内容样式 */
.cell-content {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  user-select: none;
}

.cell-content:hover {
  background-color: var(--bg-secondary) !important;
}

/* 编辑单元格样式 */
.editing-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.save-button {
  margin-right: 8px;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 深色主题适配 */
:deep(.el-table) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table__header-wrapper) {
  background-color: var(--bg-primary) !important;
}

:deep(.el-table__header) {
  background-color: var(--bg-primary) !important;
}

:deep(.el-table__header th) {
  background-color: var(--table-header-bg) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--text-primary) !important;
  border-right: 1px solid var(--text-primary) !important;
}

:deep(.el-table__body-wrapper) {
  background-color: var(--bg-primary) !important;
}

:deep(.el-table__row) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table__row:hover),
:deep(.el-table__row.hover-row) {
  background-color: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table__cell) {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--text-primary) !important;
  border-right: 1px solid var(--text-primary) !important;
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

/* 选择框样式 */
:deep(.el-select__wrapper) {
  background-color: var(--input-bg);
  color: var(--input-text);
  border-color: var(--input-border);
}

:deep(.el-select__placeholder) {
  color: var(--text-tertiary);
}

/* 按钮样式 */
:deep(.el-button) {
  --el-button-bg-color: var(--bg-primary) !important;
  --el-button-color: var(--text-primary) !important;
  --el-button-border-color: var(--border-color) !important;
}

:deep(.el-button--primary) {
  --el-button-primary-bg-color: var(--color-primary) !important;
  --el-button-primary-color: white !important;
  --el-button-primary-border-color: var(--color-primary) !important;
}

:deep(.el-button--success) {
  --el-button-success-bg-color: var(--color-success) !important;
  --el-button-success-color: white !important;
  --el-button-success-border-color: var(--color-success) !important;
}

:deep(.el-button--danger) {
  --el-button-danger-bg-color: var(--color-danger) !important;
  --el-button-danger-color: white !important;
  --el-button-danger-border-color: var(--color-danger) !important;
}
</style>
