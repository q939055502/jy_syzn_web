# 创建检测指南专属的API/Store/Service层

## 问题分析

当前`DetectionGuide.vue`中使用了两种方式获取数据：
1. 使用`getCategoriesWithObjects()`函数从`../../api/detectionApi`获取分类及其检测对象（无需登录的公开API）
2. 使用`itemStore.fetchItemList()`从`../../stores/detection/detectionItem`获取检测项目列表（可能需要登录的API）

根据后端接口文档，检测指南页面应该使用无需登录的公开API接口，位于`/api/public/detection/`路径下。

## 解决方案

创建`d:\Projects\jy_syzn_web\src\views\detectionGuide`专属的API/Store/Service层，使用公开的API接口获取数据。

## 实现步骤

### 1. 创建API层
- 创建`src/views/detectionGuide/api`目录
- 实现`detectionGuideApi.js`文件，封装公开API调用
  - `/api/public/detection/categories/objects` - 获取所有分类及其检测对象
  - `/api/public/detection/objects/{object_id}/items` - 获取检测对象下的检测项目
  - `/api/public/detection/items/{item_id}/templates` - 获取检测项目下的委托单模板
  - `/api/image/{data_unique_id}` - 获取图片

### 2. 创建Store层
- 创建`src/views/detectionGuide/store`目录
- 实现`detectionGuideStore.js`文件，使用Pinia管理状态
  - 管理分类及其检测对象数据
  - 管理检测项目数据
  - 管理委托单模板数据

### 3. 修改DetectionGuide.vue
- 移除对`useDetectionItemStore`的引用
- 引入新创建的`useDetectionGuideStore`
- 修改数据获取逻辑，使用公开API获取检测项目列表
- 保持现有的分类数据获取逻辑不变

### 4. 测试验证
- 确保检测指南页面可以正常加载数据
- 确保不需要登录即可访问所有功能
- 确保侧边栏、检测项目卡片和图片查看器等功能正常工作

## 技术要点

- 使用公开API接口，避免使用需要登录的API
- 保持代码结构清晰，遵循分层架构
- 使用Pinia进行状态管理，提高代码可维护性
- 确保所有API调用都有适当的错误处理
- 保持与现有代码风格一致

## 预期结果

检测指南页面可以无需登录即可正常访问，所有数据通过公开API接口获取，功能完整且稳定。