<template>
  <div class="user-management">
    <h2>用户管理</h2>
    
    <!-- 搜索和新增区域 -->
    <div class="user-management-header">
      <div class="button-group">
        <el-button type="primary" @click="handleAddUser">
          <el-icon><Plus /></el-icon>
          <span>新增用户</span>
        </el-button>
        <!-- 批量删除按钮，后续有需要再启用 -->
        <el-button 
          type="danger" 
          @click="handleBatchDelete" 
          :disabled="selectedUserIds.length === 0"
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
          placeholder="请输入姓名或用户名进行搜索"
          clearable
          style="width: 300px"
          @input="watchSearchText"
          @clear="watchSearchText"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>
    
    <!-- 用户表格 -->
    <div class="table-container">
      <el-table
        :data="filteredUsers"
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
        
        <!-- 用户名 -->
        <el-table-column prop="username" label="用户名" min-width="10%" />
        
        <!-- 姓名 -->
        <el-table-column prop="name" label="姓名" min-width="10%" />
        
        <!-- 拥有角色 -->
        <el-table-column prop="roles" label="拥有角色" min-width="14%">
          <template #default="scope">
            {{ scope.row.roles?.join('、') || '无' }}
          </template>
        </el-table-column>
        
        <!-- 在线状态 -->
        <el-table-column prop="is_online" label="在线状态" width="100">
          <template #default="scope">
            {{ scope.row.is_online ? '在线' : '离线' }}
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column prop="is_active" label="状态" width="140">
          <template #default="scope">
            <div class="status-switch">
              <el-switch
                v-model="scope.row.is_active"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="(newStatus) => handleStatusChange(scope.row, newStatus)"
              />
              <span class="status-text">{{ scope.row.is_active ? '启用' : '禁用' }}</span>
            </div>
          </template>
        </el-table-column>
        
        <!-- 最后登录时间 -->
        <el-table-column prop="last_login_at" label="最后登录时间" min-width="8%">
          <template #default="scope">
            <span>{{ scope.row.last_login_at ? new Date(scope.row.last_login_at).toLocaleString() : '从未登录' }}</span>
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" min-width="20%" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-dropdown
                trigger="hover"
                placement="top"
              >
                <el-button
                  type="warning"
                  size="small"
                  plain
                  class="operation-btn"
                >
                  分配
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openRolesForm(scope.row)">　角色　</el-dropdown-item>
                    <el-dropdown-item @click="openPermissionsForm(scope.row)">额外权限</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button
                type="primary"
                size="small"
                @click="handleEditUser(scope.row)"
                plain
                class="operation-btn"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteUser(scope.row)"
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
        v-model:current-page="userStore.pagination.currentPage"
        v-model:page-size="userStore.pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalUsers"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增用户表单 -->
    <user-form
      v-model:visible="formVisible"
      @success="handleFormSuccess"
    />
    
    <!-- 角色分配表单 -->
    <user-roles-form
      v-model:visible="rolesFormVisible"
      :user-id="currentUserId"
      @success="handleRolesFormSuccess"
    />
    
    <!-- 权限分配表单 -->
    <user-permissions-form
      v-model:visible="permissionsFormVisible"
      :user-id="currentUserId"
      @success="handlePermissionsFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, Plus, Delete, ArrowDown } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSettingStore } from '../stores/setting';
import { useUserManagementStore } from '../stores/userManagement';
import UserForm from './form/UserForm.vue';
import UserRolesForm from './form/UserRolesForm.vue';
import UserPermissionsForm from './form/UserPermissionsForm.vue';

// 获取主题设置状态
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.isDark);

// 获取用户管理状态存储
const userStore = useUserManagementStore();

// 搜索文本
const searchText = ref('');

// 选中的用户ID
const selectedUserIds = ref([]);

// 表单可见性状态
const formVisible = ref(false);
const rolesFormVisible = ref(false);
const permissionsFormVisible = ref(false);

// 当前操作的用户ID
const currentUserId = ref(0);

// 从store获取用户列表数据
const users = computed(() => userStore.getUserList);
const totalUsers = computed(() => userStore.getTotalUsers);
const currentPage = computed(() => userStore.pagination.currentPage);
const pageSize = computed(() => userStore.pagination.pageSize);
const isLoading = computed(() => userStore.getIsLoading);
const isDeleting = computed(() => userStore.getIsDeleting);

// 过滤后的用户列表（全量展示）
const filteredUsers = computed(() => {
  let result = [...users.value];
  
  // 搜索过滤
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    result = result.filter(user => 
      user.username.toLowerCase().includes(search) || 
      user.name.toLowerCase().includes(search)
    );
  }
  
  // 全量展示，不进行分页
  return result;
});

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedUserIds.value = selection.map(user => user.id);
};

// 处理新增用户
const handleAddUser = () => {
  formVisible.value = true;
};

// 处理表单提交成功
const handleFormSuccess = (formData) => {
  // 这里可以处理表单提交成功后的逻辑，比如刷新用户列表
  ElMessage.success('用户新增成功');
  // 刷新用户列表
  userStore.fetchUserList();
};

// 打开角色分配表单
const openRolesForm = (user) => {
  currentUserId.value = user.id;
  rolesFormVisible.value = true;
};

// 打开权限分配表单
const openPermissionsForm = (user) => {
  currentUserId.value = user.id;
  permissionsFormVisible.value = true;
};

// 处理角色分配成功
const handleRolesFormSuccess = () => {
  ElMessage.success('角色分配成功');
  // 刷新用户列表
  userStore.fetchUserList();
};

// 处理权限分配成功
const handlePermissionsFormSuccess = () => {
  ElMessage.success('权限分配成功');
  // 刷新用户列表
  userStore.fetchUserList();
};

// 处理编辑用户
const handleEditUser = (user) => {
  ElMessage.info(`编辑用户: ${user.username}`);
};

// 处理删除用户
const handleDeleteUser = async (user) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    const result = await userStore.deleteUser(user.id);
    if (result) {
      ElMessage.success(`用户 ${user.username} 删除成功`);
    } else {
      ElMessage.error(userStore.error || '用户删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(userStore.error || '用户删除失败');
    }
  }
};

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedUserIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户');
    return;
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedUserIds.value.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    const result = await userStore.batchDeleteUsers(selectedUserIds.value);
    if (result) {
      ElMessage.success(`成功删除 ${selectedUserIds.value.length} 个用户`);
      selectedUserIds.value = [];
    } else {
      ElMessage.error(userStore.error || '用户批量删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(userStore.error || '用户批量删除失败');
    }
  }
};

// 处理状态变化
const handleStatusChange = async (user, newStatus) => {
  const result = await userStore.updateUserStatus(user.id, newStatus);
  if (result) {
    ElMessage.success(`用户 ${user.username} 状态已更新为: ${newStatus ? '启用' : '禁用'}`);
  } else {
    ElMessage.error('用户状态更新失败');
    // 更新失败，恢复原来的状态
    user.is_active = !newStatus;
  }
};

// 处理页大小变化
const handleSizeChange = (size) => {
  userStore.updatePagination({
    pageSize: size,
    currentPage: 1
  });
};

// 处理当前页变化
const handleCurrentChange = (current) => {
  userStore.updatePagination({
    currentPage: current
  });
};

// 处理搜索
const handleSearch = () => {
  // 重置到第一页
  userStore.updatePagination({
    currentPage: 1
  });
  // 重新获取用户列表
  userStore.fetchUserList({
    search: searchText.value
  });
};

// 监听搜索文本变化，实现防抖搜索
let searchTimeout = null;
const debounceSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 300);
};

// 监听搜索文本变化
const watchSearchText = () => {
  debounceSearch();
};

// 组件挂载时获取用户列表
onMounted(() => {
  userStore.fetchUserList();
});

// 监听搜索文本变化
watchSearchText();
</script>

<style scoped>
.user-management {
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
  padding: 8px 12px !important;
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