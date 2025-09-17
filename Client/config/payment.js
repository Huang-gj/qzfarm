// 支付配置
export const paymentConfig = {
  // 微信支付配置
  wechat: {
    // 小程序AppID - 需要替换为实际的小程序AppID
    appid: 'your_miniprogram_appid',
    
    // 商户号 - 需要替换为实际的商户号
    mchid: 'your_merchant_id',
    
    // 支付回调地址 - 需要替换为实际的回调地址
    notifyUrl: 'https://your-domain.com/order/payment/notify',
    
    // 支付超时时间（分钟）
    timeout: 30,
    
    // 货币类型
    currency: 'CNY'
  },
  
  // 订单配置
  order: {
    // 订单号前缀
    prefix: 'QZ',
    
    // 订单号长度
    length: 20
  }
};

// 开发环境配置
export const devConfig = {
  // 开发环境下的支付配置
  wechat: {
    appid: 'wx66857ea5c2af3c77',
    mchid: '1725100870',
    // notifyUrl: 'http://8.133.19.244:8891/order/WechatOrderHandler'
    notifyUrl: 'https://qzfarm.top/order/WechatOrderHandler'
  }
};

// 生产环境配置
export const prodConfig = {
  // 生产环境下的支付配置
  wechat: {
    appid: 'wx66857ea5c2af3c77',
    mchid: '1725100870',
    // notifyUrl: 'http://8.133.19.244:8891/order/WechatOrderHandler'
    notifyUrl: 'https://qzfarm.top/order/WechatOrderHandler'
  }
};

// 根据环境获取配置
export function getPaymentConfig() {
  // 这里可以根据实际的环境判断逻辑来返回不同的配置
  // 暂时返回开发环境配置
  return {
    ...paymentConfig,
    wechat: {
      ...paymentConfig.wechat,
      ...devConfig.wechat
    }
  };
} 