# 商家客户端头像上传CORS问题修复

## 🚨 **问题描述**
```
Access to XMLHttpRequest at 'http://localhost:7777/api/updateAvatar' from origin 'http://localhost:8888' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 **问题根本原因**

### 1. **代理配置 vs 直接访问的冲突**

**Vite代理配置** (`vite.config.ts`):
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:7777',
    changeOrigin: true,
    secure: false,
    ws: true,
  },
}
```

**问题代码** (`auth.ts` - 修复前):
```javascript
// ❌ 错误：绕过了Vite代理，直接访问后端
const uploadApi = axios.create({
  baseURL: 'http://localhost:7777/api', // 直接访问，导致CORS
  timeout: 30000,
});
```

**正确的其他API** (`auth.ts`):
```javascript
// ✅ 正确：通过Vite代理访问
const api = axios.create({
  baseURL: '/api', // 相对路径，通过代理转发
  timeout: 10000,
});
```

### 2. **工作流程对比**

| 类型 | 请求路径 | 实际访问 | CORS状态 |
|------|----------|----------|----------|
| **正常API** | `http://localhost:8888/api/login` → Vite代理 → `http://localhost:7777/api/login` | ✅ 通过代理 |
| **问题API** | `http://localhost:8888` → 直接访问 → `http://localhost:7777/api/updateAvatar` | ❌ 绕过代理 |

## 🛠️ **修复方案**

### **修复1: 使用现有API实例**

**修复前**:
```javascript
// 创建新的axios实例，直接访问后端
const uploadApi = axios.create({
  baseURL: 'http://localhost:7777/api', // 导致CORS
  timeout: 30000,
});

return uploadApi.post('/updateAvatar', formData);
```

**修复后**:
```javascript
// 使用现有的api实例，通过Vite代理访问
return api.post('/updateAvatar', formData);
```

### **修复2: 添加FormData处理支持**

为现有的`api`实例添加FormData处理能力：

```javascript
// 请求拦截器
api.interceptors.request.use((config) => {
  // 添加token
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // ✅ 新增：特殊处理FormData类型的请求
  if (config.data instanceof FormData) {
    // 删除默认的Content-Type，让浏览器自动设置(包含boundary)
    delete config.headers!['Content-Type'];
    console.log('auth.ts - 检测到FormData，已删除Content-Type让浏览器自动设置');
  }
  
  return config;
});
```

## 📊 **修复效果对比**

### **修复前的请求流程**:
```
浏览器 (localhost:8888) 
  ↓ 直接请求
❌ http://localhost:7777/api/updateAvatar (CORS阻止)
```

### **修复后的请求流程**:
```
浏览器 (localhost:8888) 
  ↓ 相对路径请求
✅ /api/updateAvatar 
  ↓ Vite代理转发
✅ http://localhost:7777/api/updateAvatar (成功)
```

## 🎯 **关键修复点**

1. **统一代理访问**: 所有API都通过Vite代理访问，保持一致性
2. **删除重复配置**: 移除自定义的axios实例，使用统一配置
3. **FormData支持**: 确保请求拦截器正确处理文件上传
4. **简化代码**: 从35行代码简化为2行，更容易维护

## ✅ **验证结果**

修复后，头像上传功能应该能够：
- ✅ 成功绕过CORS限制
- ✅ 正确发送文件和表单数据
- ✅ 携带正确的认证token
- ✅ 与其他API保持一致的行为

## 💡 **经验总结**

1. **统一使用代理**: 开发环境中所有API都应通过Vite代理访问
2. **避免绝对URL**: 前端API调用使用相对路径，让代理处理跨域
3. **复用axios实例**: 避免创建多个不同的axios实例，保持配置统一
4. **FormData处理**: 文件上传时需要删除Content-Type让浏览器自动设置

## 🔗 **相关文件**

- ✅ **修复文件**: `Client_Farmer/vue-next-admin/src/api/auth.ts`
- 📝 **代理配置**: `Client_Farmer/vue-next-admin/vite.config.ts`
- 📚 **参考实现**: `Client_Farmer/vue-next-admin/src/utils/request.ts` 