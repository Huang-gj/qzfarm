# 商家客户端头像上传API更新说明

## 更新内容

### 1. 端口号变更
- **原端口**: 8893
- **新端口**: 7777
- **URL**: `http://8.133.19.244:7777/api/updateAvatar`

### 2. API字段变更
- **原字段**: `user_id`
- **新字段**: `admin_id`

### 3. API规格

#### 请求
```
POST /api/updateAvatar
Content-Type: multipart/form-data
```

#### 请求参数
- **文件**: `file` (在body中传递真实图片文件)
- **管理员ID**: `admin_id` (在form中传递)

#### 响应格式
```json
{
  "code": 200,
  "msg": "success"
}
```

### 4. 后端API定义
```go
@handler updateAvatarHandler
post /updateAvatar (UpdateAvatarRequest) returns (UpdateAvatarResponse)

type UpdateAvatarRequest{
    AdminID int `form:"admin_id"`
}

type UpdateAvatarResponse{
    Code int `json:"code"`
    Msg string `json:"msg"`
}
```

## 修改的文件

### Client_Farmer/vue-next-admin/src/api/auth.ts
- ✅ 更新接口定义 `UpdateAvatarRequest.admin_id`
- ✅ 更新函数参数 `adminId: number`
- ✅ 更新FormData字段 `admin_id`
- ✅ 更新端口号 `http://8.133.19.244:7777/api`

### 代理配置
- ✅ vite.config.ts 中代理配置已正确设置为7777端口

## 功能验证

1. **文件上传**: 确认真实图片文件通过body传递
2. **参数传递**: 确认admin_id通过form传递  
3. **端口连接**: 确认请求发送到7777端口
4. **响应处理**: 确认正确解析返回的JSON格式

## 与用户客户端的差异

| 项目 | 商家客户端 | 用户客户端 |
|------|------------|------------|
| 端口 | 7777 | 8893 |
| ID字段 | admin_id | user_id |
| 接口路径 | /api/updateAvatar | /api/updateAvatar |
| 文件字段 | file | file |

两个客户端现在都正确使用文件上传方式，但使用不同的端口和ID字段以区分管理员和普通用户。 