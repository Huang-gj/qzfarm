# 微信支付模块配置说明

## 概述

本项目已集成微信小程序支付功能，支持JSAPI支付方式。支付流程包括：
1. 获取用户openid
2. 调用微信支付JSAPI下单接口
3. 发起微信支付
4. 处理支付结果

## 配置步骤

### 1. 微信支付配置

在 `Client/config/payment.js` 文件中配置以下信息：

```javascript
export const paymentConfig = {
  wechat: {
    // 替换为你的小程序AppID
    appid: 'your_miniprogram_appid',
    
    // 替换为你的商户号
    mchid: 'your_merchant_id',
    
    // 支付回调地址
    notifyUrl: 'https://your-domain.com/api/payment/notify',
    
    timeout: 30,
    currency: 'CNY'
  }
};
```

### 2. 后端服务配置

确保后端服务运行在正确的端口上，并配置以下信息：

- **订单服务端口**：8891（用于微信支付下单）
- **登录服务端口**：8893（用于获取openid）

- 微信支付商户证书
- 微信支付API密钥
- 小程序AppSecret

### 3. 小程序配置

在小程序管理后台配置：

1. **支付域名**：添加支付回调域名到白名单
2. **业务域名**：添加后端服务域名
3. **服务器域名**：添加后端API域名

## 使用说明

### 支付流程

1. **用户下单**：用户在订单确认页面点击支付
2. **获取openid**：系统自动获取用户openid
3. **创建支付订单**：调用微信支付JSAPI下单接口
4. **发起支付**：调用 `wx.requestPayment` 发起支付
5. **处理结果**：根据支付结果跳转到相应页面

### 代码示例

```javascript
// 在订单确认页面
import { wechatPayOrder } from './pay';

// 处理支付
handlePay(data, settleDetailData) {
  const payOrderInfo = {
    payAmt: settleDetailData.totalPayAmount,
    goodsList: goodsList, // 商品列表
    // ... 其他订单信息
  };
  
  wechatPayOrder(payOrderInfo);
}
```

## API接口

### 1. 获取openid

**接口地址**：`POST http://localhost:8893/api/getOpenid`

**请求参数**：
```json
{
  "code": "微信登录凭证"
}
```

**响应数据**：
```json
{
  "openid": "用户openid",
  "session_key": "会话密钥",
  "unionid": "用户unionid（可选）"
}
```

### 2. 微信支付下单

**接口地址**：`POST http://localhost:8891/api/WechatOrder`

**请求参数**：参考 `WechatPay.api` 文件中的 `WechatOrderRequest` 结构

**响应数据**：
```json
{
  "timeStamp": "时间戳",
  "nonceStr": "随机字符串",
  "package": "订单详情扩展字符串",
  "signType": "签名类型",
  "paySign": "签名"
}
```

## 注意事项

1. **金额单位**：所有金额都以分为单位
2. **订单号**：系统自动生成，格式为 `QZ{timestamp}{random}`
3. **超时时间**：支付订单30分钟后自动过期
4. **错误处理**：支付失败时会显示相应错误信息
5. **回调处理**：支付成功后需要处理微信支付回调通知

## 开发调试

### 1. 本地开发

- 订单服务运行在 `localhost:8891`（微信支付相关）
- 登录服务运行在 `localhost:8893`（用户认证相关）
- 前端请求配置在 `Client/services/_utils/request.js`

### 2. 测试环境

- 使用微信支付沙箱环境进行测试
- 配置测试用的AppID和商户号

### 3. 生产环境

- 使用正式的微信支付环境
- 配置生产环境的域名和证书

## 常见问题

### 1. 支付失败

- 检查AppID和商户号配置
- 确认用户openid获取成功
- 检查金额格式（必须为整数，单位为分）

### 2. 回调失败

- 检查回调地址配置
- 确认域名已添加到微信支付白名单
- 检查服务器证书配置

### 3. 订单创建失败

- 检查商品信息格式
- 确认商户订单号唯一性
- 检查必填字段完整性

## 更新日志

- **v1.0.0**：初始版本，支持基本的微信支付功能
- 支持JSAPI支付
- 自动获取用户openid
- 完整的错误处理机制 