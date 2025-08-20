# 订单状态图标修改说明

## 修改内容

将"我的订单"模块的五个订单状态图标从腾讯云图片改为TDesign图标库的t-icon组件。

## 使用的图标

根据项目中确实可用的图标，选择了以下图标：

| 订单状态 | 图标名称 | 说明 |
|----------|----------|------|
| 待付款 | `add` | 加号图标，表示添加付款 |
| 待发货 | `deliver` | 配送图标，表示物流运输 |
| 待收货 | `location` | 位置图标，表示收货地址 |
| 待评价 | `chat` | 聊天图标，表示评价交流 |
| 退款/售后 | `close` | 关闭图标，表示退款取消 |

## 修改的文件

### Client/pages/usercenter/index.js

- 移除了所有的 `iconUrl` 字段
- 移除了 `genPicURL` 导入
- 更新了图标名称为确实可用的TDesign图标

### 影响的数据结构

- `orderTagInfos` - 通用订单数据
- `goodsOrderTagInfos` - 商品订单数据  
- `landsOrderTagInfos` - 土地订单数据

## 技术细节

### 图标渲染逻辑
组件会检查是否有 `customIconUrl`，如果没有则使用 `t-icon` 组件：

```xml
<t-icon
  prefix="wr"
  name="{{item.iconName}}"
  size="56rpx"
  customStyle="background-image: -webkit-linear-gradient(90deg, #6a6a6a 0%,#929292 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;"
/>
```

### 图标前缀
使用 `prefix="wr"` 来访问TDesign图标库。

### 图标验证
所选的图标都在项目中其他地方有使用，确保可用性：
- `add` - 在多个地方使用，如stepper组件
- `deliver` - 在订单详情页使用  
- `location` - 在地址相关组件使用
- `chat` - 在评论组件使用
- `close` - 在popup、dialog等组件使用

## 优势

1. **性能提升**: 不再需要从腾讯云加载图片
2. **一致性**: 使用统一的图标库
3. **可靠性**: 图标不会加载失败
4. **维护性**: 易于修改和管理

## 测试验证

请测试以下场景：
1. 商品订单页面的五个图标是否正常显示
2. 土地订单页面的五个图标是否正常显示
3. 图标是否具有正确的渐变效果
4. 角标数字是否正常显示 