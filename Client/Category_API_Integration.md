# 分类API集成改造文档

## 🎯 改造目标

将微信小程序中硬编码的分类数据（如橘子、西瓜、池塘、果树等）改为从后端API动态获取，实现分类数据的动态管理。

## 📋 改造内容

### 1. 新增API服务层

**创建文件：** `services/category/category.js`

- 新增 `getCategory(categoryType)` 函数：通用分类获取接口
- 新增 `getGoodsCategory()` 函数：获取农产品分类（categoryType=1）
- 新增 `getLandCategory()` 函数：获取土地分类（categoryType=2）

**API接口配置：**
- 接口地址：`http://8.133.19.244:8889/commodity/GetCategory`
- 请求方法：POST
- 请求参数：`{ categoryType: 1|2 }`
- 响应格式：
  ```javascript
  {
    code: 200,
    msg: "成功",
    category: [
      {
        category_id: 1,
        name: "分类名称",
        category_type: 1,
        text: "分类描述",
        image_url: "图片URL"
      }
    ]
  }
  ```

### 2. 修改分类数据模型

**修改文件：** `model/category.js`

**主要变更：**
- 从硬编码的分类数据改为调用API获取
- 保留原有的数据结构格式，确保兼容性
- 增加错误处理，API失败时使用兜底的默认分类数据

**数据转换逻辑：**
```javascript
// API数据 → 小程序数据结构
{
  category_id: 1,
  name: "橘子",
  image_url: "https://..."
} 
→ 
{
  groupId: "2101",
  name: "橘子", 
  thumbnail: "https://..."
}
```

### 3. 修复页面跳转逻辑

**修改文件：** `pages/land/category/index.js`

**问题修复：**
- 原来土地分类页面错误地跳转到农产品列表页面
- 修正为根据`groupId`判断模块类型：
  - `groupId`以"1"开头：跳转到土地列表页面
  - `groupId`以"2"开头：跳转到农产品列表页面

### 4. 更新服务文件注释

**修改文件：** `services/good/fetchCategoryList.js`

- 更新注释说明现在使用真实API数据而非mock数据
- 函数名从`mockFetchGoodCategory`改为`fetchGoodCategory`

## 🔧 技术实现细节

### API集成
```javascript
// 使用小程序的请求工具
const { post } = require('../_utils/request');

// 发送POST请求获取分类
const response = await post('/commodity/GetCategory', {
  categoryType: categoryType
});
```

### 数据结构保持兼容
```javascript
// 原有三层嵌套结构保持不变
[{
  groupId: '1000',
  name: '土地',
  children: [{
    groupId: '1100', 
    name: '土地',
    children: [/* 具体分类 */]
  }]
}]
```

### 错误处理机制
- API请求失败时返回默认分类数据
- 添加详细的console日志用于调试
- 保证页面正常运行不受API异常影响

## 📱 影响的页面

1. **农产品分类页面：** `pages/goods/category/index.js`
2. **土地分类页面：** `pages/land/category/index.js`
3. **所有使用分类数据的列表页面**

## 🎉 改造效果

### 改造前
- 分类数据写死在代码中
- 新增分类需要修改代码重新发布
- 分类图片固定使用OSS地址

### 改造后  
- 分类数据从后端动态获取
- 管理员可通过后台管理系统添加/修改分类
- 分类图片支持动态上传和配置
- 支持分类描述文本信息

## ⚠️ 注意事项

1. **JWT认证：** API请求需要携带有效的JWT token
2. **错误兜底：** 确保API异常时有默认分类数据
3. **数据格式：** 后端返回的字段名为snake_case（如`category_id`），需注意映射
4. **图片地址：** 分类图片URL需要是完整的可访问地址

## 🚀 测试建议

1. **正常场景：** 验证API正常返回时分类显示正确
2. **异常场景：** 验证API失败时显示默认分类
3. **跳转测试：** 验证土地分类和农产品分类跳转到正确页面
4. **图片加载：** 验证分类图片能正常加载显示

---
*改造日期：2024年*
*涉及文件：5个文件新增/修改*
*向下兼容：✅*
*API依赖：commodity服务GetCategory接口*