# Token管理系统使用指南

## 概述

本系统提供了完整的token过期检测和自动处理功能，确保用户在token过期时能够自动跳转到登录页面，提升用户体验。

## 功能特性

### 1. 自动token过期检测
- 在每次API请求前检查token是否过期
- 提前5分钟判断token过期，避免边界情况
- 支持多种过期状态检测（本地时间检查 + 服务器响应检查）

### 2. 智能跳转处理
- 检测到token过期时自动跳转到登录页面
- 防止重复跳转的保护机制
- 用户友好的过期提示信息

### 3. 响应拦截处理
- 自动处理服务器返回的401未授权状态
- 支持多种错误响应格式检测
- 统一的错误处理流程

## 核心文件说明

### 1. `services/_utils/request.js`
主要的请求工具文件，包含：
- `isTokenExpired()` - 检查token是否过期
- `redirectToLogin()` - 清除token并跳转登录
- `handleTokenExpiry()` - 处理响应中的token过期错误
- `checkTokenStatus()` - 获取token详细状态信息

### 2. `utils/tokenManager.js`
应用级token管理工具，包含：
- `checkTokenOnAppLaunch()` - 应用启动时检查token
- `checkTokenOnPageShow()` - 页面显示时检查token
- `isTokenExpiringsSoon()` - 检查token是否即将过期
- `startTokenCheck()` - 定期检查token状态

## 使用方法

### 1. 基本使用
所有通过 `request.js` 中导出的方法（`get`, `post`, `put`, `del`）发起的请求都会自动进行token检测：

```javascript
const { get, post } = require('../services/_utils/request');

// 自动检测token，过期时自动跳转登录
get('/api/user/info')
  .then(data => {
    console.log('用户信息:', data);
  })
  .catch(error => {
    console.error('请求失败:', error);
  });
```

### 2. 手动检查token状态
```javascript
const { checkTokenStatus } = require('../services/_utils/request');

const status = checkTokenStatus();
console.log('Token状态:', status);
// 返回格式：
// {
//   isValid: boolean,     // token是否有效
//   needRefresh: boolean, // 是否需要刷新
//   data: Object         // token数据
// }
```

### 3. 手动登出
```javascript
const { logout } = require('../services/_utils/request');

// 手动登出：清除token并跳转到登录页
// 注意：只有手动调用logout()时才会清除token数据
// token自动过期时不会清除数据，仅跳转登录页
logout();
```

### 4. 页面级token检查
在需要登录的页面的 `onShow` 生命周期中使用：

```javascript
const { checkTokenOnPageShow } = require('../utils/tokenManager');

Page({
  onShow() {
    // 检查当前页面是否需要登录
    const isValid = checkTokenOnPageShow(getCurrentPages().pop().route);
    if (!isValid) {
      // token无效，已自动跳转到登录页
      return;
    }
    
    // 继续页面逻辑
    this.loadPageData();
  }
});
```

### 5. 应用启动时检查（可选）
在 `app.js` 中添加：

```javascript
const { checkTokenOnAppLaunch, startTokenCheck } = require('./utils/tokenManager');

App({
  onLaunch() {
    // 检查token状态
    checkTokenOnAppLaunch();
    
    // 启动定期token检查（可选）
    startTokenCheck();
  }
});
```

## 配置说明

### 1. Token过期时间缓冲
默认提前5分钟判断token过期，可在 `request.js` 中修改：

```javascript
const bufferTime = 5 * 60; // 5分钟缓冲，可根据需要调整
```

### 2. 公开页面配置
在 `tokenManager.js` 中的 `publicPages` 数组中配置无需登录的页面：

```javascript
const publicPages = [
  '/pages/login/login',
  '/pages/register/register',
  '/pages/home/index',
  // 添加其他公开页面...
];
```

### 3. 错误码配置
在 `handleTokenExpiry()` 函数中配置需要处理的错误码：

```javascript
if (response && (
  response.code === 401 || 
  response.code === 403 ||
  response.message === 'token expired' ||
  // 添加其他错误标识...
)) {
  redirectToLogin();
  return true;
}
```

## 注意事项

### 1. 防重复跳转
系统内置了防重复跳转机制，确保在并发请求时不会重复跳转到登录页。

### 2. 时间同步
token过期检查依赖本地时间，请确保设备时间准确。

### 3. 存储策略
- token过期时**不会自动清除**本地存储的token数据，仅跳转到登录页
- 只有在手动调用`logout()`时才会清除token数据
- 这样可以保留token信息用于调试或其他用途

### 4. 用户体验
- 跳转前会显示友好的提示信息
- 使用 `reLaunch` 确保登录后能正常返回
- 适当的延迟确保提示信息能够显示

## 测试建议

### 1. 过期时间测试
手动修改存储中的token过期时间进行测试：

```javascript
// 在控制台中执行
const tokenData = wx.getStorageSync('token');
tokenData.accessExpire = Math.floor(Date.now() / 1000) - 100; // 设置为已过期
wx.setStorageSync('token', tokenData);
```

### 2. 服务器响应测试
模拟服务器返回401状态码或特定错误信息进行测试。

### 3. 并发请求测试
同时发起多个请求，确保只会跳转一次登录页面。

## 故障排除

### 1. 无法跳转登录页
- 检查登录页面路径是否正确
- 确认页面配置是否正确

### 2. 重复跳转问题
- 检查是否多处调用了跳转逻辑
- 确认防重复跳转机制是否正常工作

### 3. Token检查不生效
- 确认请求是否通过统一的request工具发起
- 检查token数据格式是否正确

## 更新日志

### v1.1.0 (当前版本)
- **重要变更**：token过期时不再自动清除本地存储的token数据
- 只有手动调用`logout()`时才清除token数据
- 优化了存储策略，便于调试和问题排查

### v1.0.0
- 实现基本的token过期检测功能
- 添加自动跳转登录页面功能
- 支持多种错误响应格式
- 提供完整的token管理工具集