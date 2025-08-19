# 用户头像上传功能说明

## 概述
用户客户端（小程序）的头像上传功能已从URL传递方式改为文件上传方式，与商家客户端保持一致。

## 新的实现方式

### 1. 头像上传服务 (`updateAvatar.js`)
- **接口**: `http://localhost:8893/api/updateAvatar`
- **方法**: `wx.uploadFile`
- **文件字段**: `file`（在body中传递真实图片文件）
- **表单字段**: `user_id`（在formData中传递）

### 2. 用户交互流程
1. 用户点击头像 → 选择图片文件
2. 调用 `updateAvatar()` 上传真实文件到服务器
3. 上传成功后调用 `fetchPerson()` 获取最新用户信息
4. 更新页面显示和全局状态

### 3. 文件大小限制
- 最大支持 10MB 图片文件
- 支持压缩选项以优化上传性能

## API对接要求

### 后端接口 `/api/updateAvatar`
- **端口**: 8893
- **请求方式**: POST (multipart/form-data)
- **文件**: 从 `file` 字段获取真实图片文件
- **用户ID**: 从 `user_id` 表单字段获取
- **响应格式**: 
  ```json
  {
    "code": 200,
    "msg": "success"
  }
  ```

### 与商家客户端的一致性
- ✅ 使用8893端口
- ✅ 传递真实文件而非URL
- ✅ 文件在body中，user_id在表单中
- ✅ 支持JWT认证

## 文件修改列表

### 新增文件
- `Client/services/usercenter/updateAvatar.js` - 头像上传服务

### 修改文件
- `Client/pages/usercenter/person-info/index.js` - 修改头像上传逻辑

### 主要变更
1. **头像上传**: 从 `updateUserInfo()` 改为 `updateAvatar()`
2. **文件传输**: 从URL字符串改为真实文件上传
3. **接口分离**: 头像更新和其他信息更新使用不同接口

## 测试要点
1. 选择图片文件是否正常上传
2. 上传后头像是否正确显示
3. 其他用户信息更新是否不受影响
4. 错误处理是否正常工作 