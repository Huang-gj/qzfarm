# 微服务端口配置说明

## 服务端口分配

### 1. 商品/土地服务 (8889端口)
**服务类型**：商品和土地相关的API
**端口**：8889

**包含的接口**：
- `GET /api/getAllGoods` - 获取所有商品
- `GET /api/getGood` - 获取单个商品详情
- `GET /api/getGoodsByTag` - 根据标签获取商品
- `GET /api/getAllLands` - 获取所有土地
- `GET /api/getLand` - 获取单个土地详情
- `GET /api/getLandsByTag` - 根据标签获取土地
- `POST /api/getComment` - 获取评论列表（需要token）
- `POST /api/getCommentReply` - 获取评论回复（需要token）
- `POST /api/addComment` - 添加评论（需要token）
- `POST /api/addCommentReply` - 添加评论回复（需要token）

**相关文件**：
- `Client/model/goodsApi.js`
- `Client/model/landsApi.js`
- `Client/services/comments/getComment.js`
- `Client/services/comments/getCommentReply.js`

### 2. 订单服务 (8891端口)
**服务类型**：订单相关的API
**端口**：8891

**包含的接口**：
- `POST /api/GetGoodOrder` - 获取商品订单
- `POST /api/GetLandOrder` - 获取土地订单
- `POST /api/GetGoodOrderDetail` - 获取商品订单详情
- `POST /api/GetLandOrderDetail` - 获取土地订单详情
- `POST /api/AddGoodOrder` - 添加商品订单
- `POST /api/AddLandOrder` - 添加土地订单
- `POST /api/WechatOrder` - 微信支付下单
- `POST /api/WechatOrderHandler` - 微信支付回调通知

**相关文件**：
- `Client/services/order/fetchGoodOrder.js`
- `Client/services/order/fetchLandOrder.js`
- `Client/services/order/orderDetail.js`
- `Client/services/order/addGoodOrder.js`
- `Client/services/order/addLandOrder.js`
- `Client/services/payment/wechatPay.js`

### 3. 用户认证服务 (8893端口)
**服务类型**：用户认证相关的API
**端口**：8893

**包含的接口**：
- `POST /api/userLogin` - 用户登录
- `POST /api/getOpenid` - 获取微信openid

**相关文件**：
- `Client/pages/login/login.js`

## 配置说明

### 1. 通用请求工具
`Client/services/_utils/request.js` 中的baseUrl配置为8891端口，主要用于订单相关接口。

### 2. 特殊端口配置
某些服务需要直接指定端口号，不使用通用请求工具：

#### 商品/土地服务 (8889端口)
```javascript
// 直接使用wx.request指定端口，需要添加token
const tokenData = wx.getStorageSync('token');
let headers = {
  'Content-Type': 'application/json'
};

if (tokenData && tokenData.accessToken) {
  headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
}

wx.request({
  url: 'http://localhost:8889/api/getComment',
  method: 'POST',
  data: data,
  header: headers,
  // ...
});
```

#### 用户认证服务 (8893端口)
```javascript
// 直接使用wx.request指定端口
wx.request({
  url: 'http://127.0.0.1:8893/api/getOpenid',
  method: 'POST',
  data: { code: res.code },
  // ...
});
```

## 注意事项

1. **端口一致性**：确保前端调用的端口与后端服务实际运行的端口一致
2. **服务分类**：根据业务功能将接口分配到对应的服务端口
3. **错误排查**：如果接口调用失败，首先检查端口配置是否正确
4. **开发环境**：所有端口配置都是针对本地开发环境，生产环境需要相应调整

## 修改记录

- **getComment接口**：从8891端口修正为8889端口，添加token认证
- **getCommentReply接口**：从8891端口修正为8889端口，添加token认证
- **微信支付接口**：使用8891端口（订单服务）
- **微信支付回调接口**：使用8891端口（订单服务），路径为`/api/WechatOrderHandler`
- **用户登录接口**：使用8893端口（认证服务）

## 认证说明

### Token使用
- **需要token的接口**：评论相关接口（getComment、getCommentReply、addComment、addCommentReply）
- **token格式**：`Bearer {accessToken}`
- **token来源**：用户登录后存储在本地存储中的token

### 认证失败处理
如果接口返回"authorize failed: no token present in request"错误，请检查：
1. 用户是否已登录
2. token是否已正确保存到本地存储
3. 请求头中是否包含Authorization字段 