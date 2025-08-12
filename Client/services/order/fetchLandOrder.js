import { request } from '../_utils/request';

/**
 * 获取土地订单数据
 * @param {Object} params - 请求参数
 * @param {number} params.user_id - 用户ID
 * @returns {Promise} 返回土地订单数据
 */
export function fetchLandOrder(params) {
  console.log('[fetchLandOrder] 请求参数:', params);
  
  // 获取token
  const token = wx.getStorageSync('token');
  if (!token || !token.accessToken) {
    console.error('[fetchLandOrder] 未找到有效的token');
    return Promise.reject(new Error('未找到有效的token'));
  }
  
  return request({
    url: 'http://localhost:8891/api/GetLandOrder', // 使用端口8892
    method: 'POST',
    header: {
      'Authorization': `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json'
    },
    data: {
      user_id: params.user_id || 0
    }
  }).then(res => {
    console.log('[fetchLandOrder] 响应数据:', res);
    return res;
  }).catch(err => {
    console.error('[fetchLandOrder] 请求失败:', err);
    throw err;
  });
} 