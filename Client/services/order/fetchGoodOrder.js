import { request } from '../_utils/request';

/**
 * 获取商品订单数据
 * @param {Object} params - 请求参数
 * @param {number} params.user_id - 用户ID
 * @returns {Promise} 返回商品订单数据
 */
export function fetchGoodOrder(params) {
  console.log('[fetchGoodOrder] 请求参数:', params);
  
  // 获取token
  const token = wx.getStorageSync('token');
  if (!token || !token.accessToken) {
    console.error('[fetchGoodOrder] 未找到有效的token');
    return Promise.reject(new Error('未找到有效的token'));
  }
  
  return request({
    url: 'http://8.133.19.244:8891/api/GetGoodOrder', // 使用端口8891
    method: 'POST',
    header: {
      'Authorization': `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json'
    },
    data: {
      user_id: params.user_id || 0
    }
  }).then(res => {
    console.log('[fetchGoodOrder] 响应数据:', res);
    return res;
  }).catch(err => {
    console.error('[fetchGoodOrder] 请求失败:', err);
    throw err;
  });
} 