# 分类按需加载改造文档

## 🎯 改造目标

将分类数据加载方式从**页面初始化时一次性获取所有数据**改为**用户点击分类类型时按需加载**，实现：

- 点击"土地"分类 → 发送 `categoryType=2` 的请求
- 点击"农产品"分类 → 发送 `categoryType=1` 的请求

## 🔄 改造前后对比

### 改造前的逻辑
```
页面加载 → 同时获取土地和农产品分类 → 显示完整分类树
```

### 改造后的逻辑
```
页面加载 → 显示静态分类框架
     ↓
用户点击"土地" → 发送categoryType=2请求 → 加载土地分类数据
用户点击"农产品" → 发送categoryType=1请求 → 加载农产品分类数据
```

## 📋 主要修改内容

### 1. 页面数据结构调整

**修改文件：** 
- `Client/pages/goods/category/index.js`
- `Client/pages/land/category/index.js`

**数据结构变化：**
```javascript
// 改造前：页面初始化时list为空，异步获取后填充
data: {
  list: [], // 空数组，等待异步数据
}

// 改造后：静态分类框架，children为空等待按需加载
data: {
  list: [
    {
      groupId: '1000',
      name: '土地',
      children: [{
        groupId: '1100',
        name: '土地', 
        children: [], // 初始为空，点击时加载
      }],
    },
    {
      groupId: '2000',
      name: '农产品',
      children: [{
        groupId: '2100',
        name: '农产品',
        children: [], // 初始为空，点击时加载
      }],
    }
  ],
  currentCategoryType: null, // 跟踪当前已加载的分类类型
}
```

### 2. 新增左侧分类点击处理

**新增方法：** `onParentChange(event)`

**功能说明：**
- 监听左侧分类标签的点击事件
- 根据点击索引判断分类类型（0=土地，1=农产品）
- 发送对应的API请求获取子分类数据
- 更新页面数据并渲染

**请求逻辑：**
```javascript
// 索引映射
index === 0 → categoryType = 2 (土地分类)
index === 1 → categoryType = 1 (农产品分类)

// API调用
if (categoryType === 1) {
  result = await getGoodsCategory(); // 农产品
} else {
  result = await getLandCategory(); // 土地
}
```

### 3. 事件绑定修改

**修改文件：**
- `Client/pages/goods/category/index.wxml`
- `Client/pages/land/category/index.wxml`

**绑定变化：**
```xml
<!-- 添加左侧分类点击事件绑定 -->
<goods-category
  level="{{3}}"
  custom-class="goods-category-class"
  category="{{list}}"
  bind:change="onParentChange"         <!-- 新增：左侧分类点击 -->
  bind:changeCategory="onChange"       <!-- 保留：右侧子分类点击 -->
/>
```

### 4. 优化用户体验

#### 加载提示
```javascript
// 显示加载状态
wx.showLoading({
  title: `加载${categoryTypeName}分类...`,
});

// 请求完成后隐藏
wx.hideLoading();
```

#### 防重复请求
```javascript
// 检查是否已经加载过该分类
if (this.data.currentCategoryType === categoryType) {
  console.log('该分类数据已加载，跳过重复请求');
  return;
}
```

#### 错误处理
```javascript
// API失败时显示错误提示
wx.showToast({
  title: result.message || '获取分类失败',
  icon: 'none'
});
```

## 🔍 调试信息

### 点击事件调试日志
```
[goods/category] ========== 左侧分类点击事件 ==========
[goods/category] 点击的分类索引: 0
[goods/category] 分类类型: 土地 categoryType: 2
[goods/category] ===== 开始加载分类数据 =====
[getCategory] ===== 开始获取分类数据 =====
[getCategory] 输入参数 - categoryType: 2 类型: number
[request] ===== 发送网络请求 =====
[request] 完整URL: http://8.133.19.244:8889/commodity/GetCategory
[goods/category] 分类数据更新完成，数量: 3
```

### 数据处理日志
```
[goods/category] 土地分类结果: {success: true, data: [...]}
[goods/category] 处理后的分类数据: [
  {groupId: "2101", name: "农田", thumbnail: "https://..."},
  {groupId: "2102", name: "池塘", thumbnail: "https://..."}
]
```

## 🎯 测试场景

### 1. 基本功能测试
1. **页面加载测试**：验证静态分类框架正常显示
2. **土地分类点击**：点击"土地"，验证发送`categoryType=2`请求
3. **农产品分类点击**：点击"农产品"，验证发送`categoryType=1`请求
4. **数据渲染测试**：验证获取的分类数据正确显示在右侧

### 2. 用户体验测试
1. **加载提示测试**：验证点击时显示加载动画
2. **防重复请求测试**：连续点击同一分类，验证只发送一次请求
3. **错误处理测试**：模拟网络错误，验证错误提示
4. **页面跳转测试**：点击具体分类项，验证正确跳转

### 3. 性能测试
1. **按需加载效果**：验证只有被点击的分类才会发送请求
2. **响应速度**：测试从点击到数据显示的时间
3. **内存使用**：对比改造前后的内存占用

## 📊 性能提升

### 网络请求优化
- **改造前**：页面加载时发送2个API请求（土地+农产品）
- **改造后**：按需发送，最多1个请求（用户实际点击的分类）
- **提升效果**：网络请求减少50%，页面加载速度提升

### 数据传输优化
- **改造前**：一次性获取所有分类数据
- **改造后**：按需获取，减少不必要的数据传输
- **提升效果**：首屏数据量减少，加载更快

## ⚠️ 注意事项

### 1. 事件绑定要求
- `goods-category` 组件必须支持 `change` 事件绑定
- 确保事件参数格式：`{index: number}`

### 2. 数据格式兼容
- 保持现有的数据结构格式不变
- `groupId` 生成规则：`${categoryType}10${index + 1}`

### 3. 错误处理
- 网络异常时保持页面可用性
- 提供用户友好的错误提示

### 4. 状态管理
- `currentCategoryType` 用于防重复请求
- 页面切换时状态会重置

## 🚀 后续优化建议

1. **缓存机制**：为已加载的分类数据添加本地缓存
2. **预加载策略**：在用户hover时预加载数据
3. **离线支持**：添加离线数据支持
4. **分页加载**：如果分类数据量大，考虑分页加载

---
*改造日期：2024年*
*改造范围：微信小程序分类页面*
*性能提升：网络请求减少50%，首屏加载更快*
*用户体验：按需加载，响应更流畅*