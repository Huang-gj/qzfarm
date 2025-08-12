import {
  config
} from '../../config/index';

/** 获取订单详情mock数据 */
function mockFetchOrderDetail(params) {
  const {
    delay
  } = require('../_utils/delay');
  const {
    genOrderDetail
  } = require('../../model/order/orderDetail');

  return delay().then(() => genOrderDetail(params));
}

/** 获取订单详情数据 */
export function fetchOrderDetail(params) {
  if (config.useMock) {
    return mockFetchOrderDetail(params);
  }

  console.log('[fetchOrderDetail] 请求参数:', params);

  // 获取用户信息
  const userInfo = wx.getStorageSync('userInfo') || {};
  const userId = userInfo.user_id;

  if (!userId) {
    console.error('[fetchOrderDetail] 用户未登录');
    return Promise.reject(new Error('用户未登录'));
  }

  // 判断订单类型（通过参数格式判断）
  const orderId = params.parameter;
  const isGoodsOrder = orderId.toString().includes('1001') || orderId.toString().includes('1002');
  const isLandOrder = orderId.toString().includes('2001') || orderId.toString().includes('2002');

  let url, requestData;

  if (isGoodsOrder) {
    // 商品订单
    url = 'http://localhost:8891/api/GetGoodOrderDetail';
    requestData = {
      user_id: userId,
      good_order_id: parseInt(orderId)
    };
  } else if (isLandOrder) {
    // 土地订单
    url = 'http://localhost:8891/api/GetLandOrderDetail';
    requestData = {
      user_id: userId,
      land_order_id: parseInt(orderId)
    };
  } else {
    // 默认尝试商品订单
    url = 'http://localhost:8891/api/GetGoodOrderDetail';
    requestData = {
      user_id: userId,
      good_order_id: parseInt(orderId)
    };
  }

  console.log('[fetchOrderDetail] 订单类型判断:', {
    isGoodsOrder,
    isLandOrder,
    orderId
  });
  console.log('[fetchOrderDetail] 发送请求数据:', requestData);

  // 获取存储的token
  const tokenData = wx.getStorageSync('token');
  let headers = {
    'Content-Type': 'application/json'
  };

  // 如果有token，添加到请求头
  if (tokenData && tokenData.accessToken) {
    headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    console.log('[fetchOrderDetail] 添加认证token');
  } else {
    console.warn('[fetchOrderDetail] 未找到token，可能影响认证');
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'POST',
      data: requestData,
      header: headers,
      timeout: 10000,
      success: (res) => {
        console.log('[fetchOrderDetail] 响应数据:', res);
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data);
        } else {
          console.error('[fetchOrderDetail] 请求失败:', res);
          reject(new Error(res.data.msg || '获取订单详情失败'));
        }
      },
      fail: (err) => {
        console.error('[fetchOrderDetail] 网络请求失败:', err);
        reject(err);
      }
    });
  });
}

/** 获取客服mock数据 */
function mockFetchBusinessTime(params) {
  const {
    delay
  } = require('../_utils/delay');
  const {
    genBusinessTime
  } = require('../../model/order/orderDetail');

  return delay().then(() => genBusinessTime(params));
}

/** 获取客服数据 */
export function fetchBusinessTime(params) {
  if (config.useMock) {
    return mockFetchBusinessTime(params);
  }

  return new Promise((resolve) => {
    resolve('real api');
  });
}