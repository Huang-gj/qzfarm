const { request } = require('../_utils/request');

/**
 * 添加土地订单到购物车
 * @param {Object} orderData - 订单数据
 * @param {number} orderData.land_id - 土地ID
 * @param {number} orderData.farm_id - 农场ID
 * @param {number} orderData.user_id - 用户ID
 * @param {string} orderData.farm_address - 农场地址
 * @param {number} orderData.price - 租赁价格
 * @param {number} orderData.count - 租赁时长（月数）
 * @param {string} orderData.detail - 订单详情
 * @param {string} orderData.image_urls - 图片URL
 * @returns {Promise} 返回添加结果
 */
function addLandOrder(orderData) {
  /* keep */
  
  // 获取token
  const token = wx.getStorageSync('token');
  if (!token || !token.accessToken) {
    console.error('[addLandOrder] 未找到有效的token');
    return Promise.reject(new Error('未找到有效的token'));
  }
  
  // 验证必需字段
  if (orderData.land_id === undefined || orderData.land_id === null) {
    console.error('[addLandOrder] 缺少land_id字段');
    return Promise.reject(new Error('缺少土地ID'));
  }
  
  if (!orderData.user_id) {
    console.error('[addLandOrder] 缺少user_id字段');
    return Promise.reject(new Error('缺少用户ID'));
  }
  
  if (!orderData.price) {
    console.error('[addLandOrder] 缺少price字段');
    return Promise.reject(new Error('缺少价格'));
  }
  
  if (!orderData.count) {
    console.error('[addLandOrder] 缺少count字段');
    return Promise.reject(new Error('缺少租赁时长'));
  }
  
  // 构建请求数据 - 根据API文件，只传递LandOrder中需要前端提供的字段
  const requestData = {
    land_order: {
      // 只包含需要前端提供的字段，不包含数据库自动生成的字段
      land_id: parseInt(orderData.land_id),
      farm_id: parseInt(orderData.farm_id || 1),
      user_id: parseInt(orderData.user_id),
      farm_address: orderData.farm_address || '',
      price: parseFloat(orderData.price),
      count: parseInt(orderData.count),
      detail: orderData.detail || '',
      image_urls: convertImageUrlsToString(orderData.image_urls),
      order_status: '待付款' // 新增订单状态字段
      // 不包含以下字段，这些由后端自动生成：
      // id, del_state, del_time, create_time, land_order_id
    }
  };
  
  /* keep */
  
  const requestConfig = {
    url: 'http://localhost:8891/api/AddLandOrder',
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
    console.error('[addLandOrder] 请求失败:', err);
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
  addLandOrder
}; 