# 图片URL处理说明

## 问题描述

在订单界面中，商品图片URL可能包含多个图片链接，用逗号分隔，例如：
```
"https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/丑八怪.jpg,https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/柚子.jpg"
```

由于订单界面只能显示一张图片，需要处理这种情况，只取第一个图片链接。

## 解决方案

### 1. 创建图片工具函数

创建了 `Client/utils/imageUtils.js` 文件，包含以下函数：

#### `getFirstImageUrl(imageUrls)`
- **功能**：从多个图片URL中提取第一个URL
- **参数**：`imageUrls` - 图片URL字符串，多个URL用逗号分隔
- **返回**：第一个图片URL，如果没有则返回空字符串

#### `processGoodsImage(primaryImage, thumb)`
- **功能**：处理商品图片URL，确保只返回第一个图片
- **参数**：
  - `primaryImage` - 主图片URL
  - `thumb` - 缩略图URL
- **返回**：处理后的图片URL

### 2. 修改订单确认服务

在 `Client/services/order/orderConfirm.js` 中：

```javascript
// 修改前
image: goods.primaryImage || goods.thumb,

// 修改后
image: processGoodsImage(goods.primaryImage, goods.thumb),
```

### 3. 修改订单确认页面

在 `Client/pages/order/order-confirm/index.js` 中：

```javascript
// 修改前
thumb: item.image,

// 修改后
thumb: getFirstImageUrl(item.image),
```

## 处理逻辑

### 1. 数据构建阶段（下单时）
- 在 `orderConfirm.js` 中使用 `processGoodsImage` 函数
- 优先使用 `primaryImage`，如果没有则使用 `thumb`
- 自动提取第一个图片URL

### 2. 数据展示阶段（订单界面）
- 在 `order-confirm/index.js` 中使用 `getFirstImageUrl` 函数
- 确保显示的图片URL只包含第一个链接

## 测试用例

创建了 `Client/utils/imageUtils.test.js` 文件，包含以下测试场景：

1. **多个图片URL，用逗号分隔**
   - 输入：`"url1.jpg,url2.jpg"`
   - 期望：`"url1.jpg"`

2. **单个图片URL**
   - 输入：`"url1.jpg"`
   - 期望：`"url1.jpg"`

3. **空值处理**
   - 输入：`null` 或 `undefined` 或 `""`
   - 期望：`""`

4. **带空格的多个URL**
   - 输入：`"url1.jpg , url2.jpg"`
   - 期望：`"url1.jpg"`

## 影响范围

### 修改的文件
1. `Client/utils/imageUtils.js` - 新增工具函数
2. `Client/services/order/orderConfirm.js` - 修改图片处理逻辑
3. `Client/pages/order/order-confirm/index.js` - 修改图片显示逻辑
4. `Client/utils/imageUtils.test.js` - 新增测试文件

### 影响的页面
- 订单确认页面 (`/pages/order/order-confirm/index`)
- 其他使用相同图片处理逻辑的页面

## 优势

1. **统一处理**：所有图片URL都通过统一的工具函数处理
2. **向后兼容**：对单个图片URL的处理保持不变
3. **容错性强**：对空值、null、undefined等异常情况有处理
4. **易于维护**：集中管理图片处理逻辑，便于后续修改

## 使用示例

```javascript
import { getFirstImageUrl, processGoodsImage } from '../../utils/imageUtils';

// 处理多个图片URL
const imageUrl = getFirstImageUrl('url1.jpg,url2.jpg,url3.jpg');
// 结果: 'url1.jpg'

// 处理商品图片
const goodsImage = processGoodsImage(
  'primary1.jpg,primary2.jpg',
  'thumb1.jpg,thumb2.jpg'
);
// 结果: 'primary1.jpg'
``` 