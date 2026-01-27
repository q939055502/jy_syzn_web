## Fix 422 Unprocessable Entity Error for Login Request

### 问题分析
后端返回 422 Unprocessable Entity 错误，通常表示请求格式或数据不符合后端期望。从代码分析来看，可能的原因是：

1. **请求格式不匹配**：当前代码使用 `application/x-www-form-urlencoded` 格式发送登录请求，而后端可能期望 `application/json` 格式
2. **默认 Content-Type 冲突**：axios 实例配置了默认的 `Content-Type: 'application/json'`，但实际发送的是 formData
3. **缺少完整的错误信息**：当前响应拦截器没有完整记录 422 错误的详细信息，难以定位具体问题

### 解决方案

1. **更新响应拦截器**：
   - 增强错误处理，记录 422 错误的完整响应数据
   - 便于调试和定位具体问题

2. **修改登录请求格式**：
   - 将登录请求从 `formData` 格式改为 `JSON` 格式
   - 与 axios 实例默认配置保持一致
   - 符合后端 API 期望的请求格式

3. **优化错误日志**：
   - 确保错误日志包含足够的信息，便于调试
   - 记录请求 URL、方法、状态码和响应数据

### 预期结果
- 登录请求能正确发送到后端
- 后端不再返回 422 错误
- 便于调试和定位类似问题

### 代码修改点
1. **更新 `src/api/request.js`**：增强响应拦截器的错误处理
2. **修改 `src/api/user.js`**：将登录请求从 formData 改为 JSON 格式

### 验证步骤
1. 运行开发服务器
2. 尝试登录
3. 检查后端日志，确认不再出现 422 错误
4. 验证登录功能正常工作