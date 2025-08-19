const { request } = require('../_utils/request');

/**
 * 添加商品订单到购物车
 * @param {Object} orderData - 订单数据
 * @param {number} orderData.good_id - 商品ID
 * @param {number} orderData.farm_id - 农场ID
 * @param {number} orderData.user_id - 用户ID
 * @param {string} orderData.user_address - 用户地址
 * @param {string} orderData.farm_address - 农场地址
 * @param {number} orderData.price - 价格
 * @param {string} orderData.units - 单位
 * @param {number} orderData.count - 购买数量
 * @param {string} orderData.detail - 订单详情
 * @param {string} orderData.image_urls - 图片URL
 * @returns {Promise} 返回添加结果
 */
function addGoodOrder(orderData) {
  /* keep */
  
  // 获取token
  const token = wx.getStorageSync('token');
  if (!token || !token.accessToken) {
    console.error('[addGoodOrder] 未找到有效的token');
    return Promise.reject(new Error('未找到有效的token'));
  }
  
  // 验证必需字段
  if (orderData.good_id === undefined || orderData.good_id === null) {
    console.error('[addGoodOrder] 缺少good_id字段');
    return Promise.reject(new Error('缺少商品ID'));
  }
  
  if (!orderData.user_id) {
    console.error('[addGoodOrder] 缺少user_id字段');
    return Promise.reject(new Error('缺少用户ID'));
  }
  
  if (!orderData.price) {
    console.error('[addGoodOrder] 缺少price字段');
    return Promise.reject(new Error('缺少价格'));
  }
  
  if (!orderData.count) {
    console.error('[addGoodOrder] 缺少count字段');
    return Promise.reject(new Error('缺少购买数量'));
  }
  
  // 构建请求数据 - 根据API文件，只传递GoodOrder中需要前端提供的字段
  const requestData = {
    good_order: {
      // 只包含需要前端提供的字段，不包含数据库自动生成的字段
      good_id: parseInt(orderData.good_id),
      farm_id: parseInt(orderData.farm_id || 1),
      user_id: parseInt(orderData.user_id),
      user_address: orderData.user_address || '',
      farm_address: orderData.farm_address || '',
      price: parseFloat(orderData.price),
      units: orderData.units || '个',
      count: parseInt(orderData.count),
      detail: orderData.detail || '',
      image_urls: convertImageUrlsToString(orderData.image_urls),
      order_status: '待付款' // 新增订单状态字段
      // 不包含以下字段，这些由后端自动生成：
      // id, del_state, del_time, create_time, good_order_id
    }
  };
  
  /* keep */
  
  const requestConfig = {
    url: 'http://localhost:8891/api/AddGoodOrder',
    method: 'POST',
    header: {
      'Authorization': `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json'
    },
    data: requestData
  };
  
  /* keep */
  
  return request(requestConfig).then(res => {
    /* keep */
    return res;
  }).catch(err => {
    console.error('[addGoodOrder] 请求失败:', err);
    throw err;
  });
}

// 辅助函数：将图片URL转换为字符串格式
function convertImageUrlsToString(imageUrls) {
  if (!imageUrls) return '';
  
  // 如果是字符串，直接返回
  if (typeof imageUrls === 'string') {
    return imageUrls;
  }
  
  // 如果是数组，转换为逗号分隔的字符串
  if (Array.isArray(imageUrls)) {
    return imageUrls.join(',');
  }
  
  // 如果是对象，尝试提取URL
  if (typeof imageUrls === 'object') {
    // 如果是包含图片URL的对象，尝试提取
    if (imageUrls.url) return imageUrls.url;
    if (imageUrls.primaryImage) return imageUrls.primaryImage;
    if (imageUrls.thumb) return imageUrls.thumb;
  }
  
  // 其他情况返回空字符串
  return '';
}

module.exports = {
  addGoodOrder
}; 