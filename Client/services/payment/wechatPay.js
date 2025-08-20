import { post } from '../_utils/request.js';
import { getPaymentConfig } from '../../config/payment.js';

/**
 * 微信支付JSAPI下单
 * @param {Object} params - 下单参数
 * @param {number} params.totalAmount - 支付金额（分）
 * @param {string} params.description - 商品描述
 * @param {string} params.outTradeNo - 商户订单号
 * @param {string} params.openid - 用户openid
 * @param {Array} params.goodsList - 商品列表
 * @param {string} params.notifyUrl - 回调地址
 * @returns {Promise} 下单结果
 */
export function createWechatOrder(params) {
  console.log('[createWechatOrder] 开始创建微信支付订单:', params);
  
  // 构建商品详情
  const goodsDetail = params.goodsList && params.goodsList.length > 0 ? params.goodsList.map(item => ({
    merchant_goods_id: String(item.skuId || item.good_id),
    wechatpay_goods_id: String(item.skuId || item.good_id),
    goods_name: item.goodsName || item.title || '商品',
    quantity: parseInt(item.quantity) || 1,
    unit_price: Math.round((item.price || item.settlePrice || 0) * 100) // 转换为分
  })) : [];

  // 获取支付配置
  const config = getPaymentConfig();
  console.log('[createWechatOrder] 支付配置:', config);
  
  // 构建请求参数
  const requestData = {
    appid: config.wechat.appid,
    mchid: config.wechat.mchid,
    description: params.description || 'QZFarm商品购买',
    out_trade_no: params.outTradeNo,
    time_expire: getExpireTime(), // 30分钟后过期
    attach: JSON.stringify({
      orderType: 'goods',
      userId: params.userId
    }),
    notify_url: params.notifyUrl || config.wechat.notifyUrl,
    goods_tag: '',
    support_fapiao: false,
    amount: {
      total: params.totalAmount,
      currency: config.wechat.currency || 'CNY'
    },
    payer: {
      openid: params.openid
    },
    detail: {
      cost_price: params.totalAmount,
      invoice_id: '',
      goods_detail: goodsDetail
    },
    scene_info: {
      payer_client_ip: '127.0.0.1', // 实际使用时需要获取真实IP
      device_id: 'miniprogram',
      store_info: {
        id: 'QZFarm',
        name: 'QZFarm商城',
        area_code: '110000',
        address: '北京市朝阳区'
      }
    },
    settle_info: {
      profit_sharing: false
    }
  };

  console.log('[createWechatOrder] 发送的请求数据:', JSON.stringify(requestData, null, 2));
  console.log('[createWechatOrder] 商品详情:', goodsDetail);
  console.log('[createWechatOrder] 请求URL:', '/api/WechatOrder');
  
  // 检查必填字段
  console.log('[createWechatOrder] 必填字段检查:');
  console.log('  appid:', requestData.appid);
  console.log('  mchid:', requestData.mchid);
  console.log('  description:', requestData.description);
  console.log('  out_trade_no:', requestData.out_trade_no);
  console.log('  notify_url:', requestData.notify_url);
  console.log('  amount.total:', requestData.amount.total);
  console.log('  payer.openid:', requestData.payer.openid);

  return post('/api/WechatOrder', requestData)
    .then(res => {
      console.log('[createWechatOrder] 下单成功:', res);
      return res;
    })
    .catch(err => {
      console.error('[createWechatOrder] 下单失败:', err);
      throw err;
    });
}

/**
 * 发起微信支付
 * @param {Object} payInfo - 支付信息
 * @param {string} payInfo.timeStamp - 时间戳
 * @param {string} payInfo.nonceStr - 随机字符串
 * @param {string} payInfo.package - 订单详情扩展字符串
 * @param {string} payInfo.signType - 签名类型
 * @param {string} payInfo.paySign - 签名
 * @returns {Promise} 支付结果
 */
export function requestWechatPayment(payInfo) {
  console.log('[requestWechatPayment] 开始发起微信支付:', payInfo);
  
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      timeStamp: payInfo.timeStamp,
      nonceStr: payInfo.nonceStr,
      package: payInfo.package,
      signType: payInfo.signType,
      paySign: payInfo.paySign,
      success: (res) => {
        console.log('[requestWechatPayment] 支付成功:', res);
        resolve(res);
      },
      fail: (err) => {
        console.error('[requestWechatPayment] 支付失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 获取用户openid
 * @returns {Promise<string>} openid
 */
export function getUserOpenid() {
  return new Promise((resolve, reject) => {
    // 从本地存储获取openid
    const openid = wx.getStorageSync('openid');
    if (openid) {
      console.log('[getUserOpenid] 从本地存储获取openid:', openid);
      resolve(openid);
    } else {
      console.error('[getUserOpenid] 本地存储中没有openid，请先登录');
      reject(new Error('请先登录获取openid'));
    }
  });
}

/**
 * 生成订单过期时间（30分钟后）
 * @returns {string} 过期时间字符串
 */
function getExpireTime() {
  const now = new Date();
  const expireTime = new Date(now.getTime() + 30 * 60 * 1000); // 30分钟后
  return expireTime.toISOString().replace(/\.\d{3}Z$/, '+08:00');
}

/**
 * 生成商户订单号
 * @returns {string} 订单号
 */
export function generateOrderNo() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `QZ${timestamp}${random}`;
} 