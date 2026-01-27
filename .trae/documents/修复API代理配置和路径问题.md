## 问题分析

1. **代理配置与API路径不匹配**
   - 目前 `vite.config.js` 中的代理配置为 `/api` 代理到 `http://localhost:1314`
   - 但在 `src/api/user.js` 中，只有用户管理相关API包含 `/api` 前缀，其他API（登录、刷新令牌等）没有包含 `/api` 前缀
   - 这导致非用户管理API请求不会被代理转发到后端

2. **API请求路径不一致**
   - 登录API：`/auth/token`（缺少 `/api` 前缀）
   - 刷新令牌API：`/auth/refresh`（缺少 `/api` 前缀）
   - 获取用户信息API：`/auth/me`（缺少 `/api` 前缀）
   - 登出API：`/auth/logout`（缺少 `/api` 前缀）
   - 用户管理相关API：包含 `/api` 前缀，如 `/api/admin/users`

3. **代理配置可能导致重复前缀**
   - 当请求 `/api/admin/users` 时，会被代理到 `http://localhost:1314/api/admin/users`
   - 但根据API文档，后端实际路径应该是 `http://localhost:1314/api/admin/users`，这是正确的

## 解决方案

1. **修改 `src/api/apiClient.js` 中的 `baseURL`**
   - 将 `baseURL` 从 `''` 改为 `/api`
   - 这样所有API请求都会自动添加 `/api` 前缀，确保与代理配置匹配

2. **修改 `src/api/user.js` 中的API路径**
   - 移除用户管理相关API中的 `/api` 前缀，因为 `baseURL` 已经包含了 `/api` 前缀
   - 例如：`/api/admin/users` → `/admin/users`

3. **保持 `vite.config.js` 中的代理配置不变**
   - 代理配置 `/api` 到 `http://localhost:1314` 是正确的，不需要修改

## 修改步骤

1. 修改 `src/api/apiClient.js` 中的 `baseURL`
2. 修改 `src/api/user.js` 中的所有API路径，确保它们不包含重复的 `/api` 前缀
3. 验证修改后的API请求是否能正确转发到后端

## 预期效果

- 所有API请求都会自动添加 `/api` 前缀
- 所有API请求都会被代理转发到后端
- 后端收到的请求路径正确，没有重复的 `/api` 前缀
- 前端能正确获取后端数据