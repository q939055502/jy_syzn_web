## 优化Guide页面

1. **删除多余的Guide页面**
   - 删除 `SampleGuide.vue`（未被路由引用，没有被使用）
   - 删除 `FieldGuide.vue`（用户确认是临时页面）
   - 保留 `SamplingGuide.vue`（已配置在路由中，是正式的"送样指南"页面）

2. **更新相关引用**
   - 检查并更新路由配置，确保没有引用被删除的页面
   - 检查并更新Layout组件中的侧边栏菜单，确保没有引用被删除的页面

## 修复DetectionGroup数据显示问题

1. **检查控制台错误**
   - 定位并修复"request is not defined"错误

2. **检查API数据结构**
   - 验证后端返回的数据结构是否与前端预期相符
   - 检查检测项目组API返回的数据是否包含预期的字段

3. **检查Store数据处理**
   - 检查 `detectionGroupStore` 中 `fetchGroupList` 方法的数据处理逻辑
   - 确保API返回的数据被正确存储到 `groupList` 中

4. **检查组件数据绑定**
   - 检查 `filteredGroups` 计算属性的逻辑
   - 确保 `el-table` 的 `:data` 属性正确绑定到 `filteredGroups`
   - 检查表格列的 `prop` 属性是否与数据字段匹配

5. **添加调试信息**
   - 在组件中添加调试代码，输出 `groups.value` 和 `filteredGroups.value`，查看数据是否正确

## 实施步骤

1. 先删除多余的Guide页面
2. 更新相关引用
3. 定位并修复控制台错误
4. 检查并修复数据处理逻辑
5. 验证修复效果

## 预期结果

1. 页面结构清晰，只保留必要的Guide页面
2. DetectionGroup页面能够正确显示检测项目组数据
3. 控制台没有错误信息

这个计划将解决用户提到的两个问题：优化Guide页面结构和修复DetectionGroup数据显示问题。