// 商品 API 相关接口调用

// 请求参数类型定义
/**
 * @typedef {Object} GetGoodsRequest
 * @property {number} user_id - 用户ID
 */

/**
 * @typedef {Object} GetGoodRequest
 * @property {number} user_id - 用户ID
 * @property {number} good_id - 商品ID
 */

// 响应数据类型定义
/**
 * @typedef {Object} Goods
 * @property {number} id - 主键ID
 * @property {number} del_state - 0-正常 1-删除
 * @property {string} del_time - 删除时间
 * @property {string} create_time - 创建时间
 * @property {number} good_id - 分布式唯一ID
 * @property {string} title - 商品名称
 * @property {string} good_tag - 商品标签
 * @property {number} farm_id - 所属农场ID
 * @property {string} image_urls - 图片信息（JSON字符串或逗号分隔）
 * @property {number} price - 价格
 * @property {string} units - 单位，如个/斤/千克等
 * @property {number} repertory - 库存
 * @property {string} detail - 商品详情
 */

/**
 * @typedef {Object} GetGoodsResponse
 * @property {number} code - 状态码
 * @property {string} msg - 响应信息
 * @property {Goods[]} goods_list - 商品列表
 */

/**
 * @typedef {Object} GetGoodResponse
 * @property {number} code - 状态码
 * @property {string} msg - 响应信息
 * @property {Goods} good - 商品信息
 */

/**
 * 获取所有商品信息
 * @param {GetGoodsRequest} params - 请求参数
 * @returns {Promise<GetGoodsResponse>} 响应数据
 */
export function getAllGoodsApi(params = {}) {
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const tokenData = wx.getStorageSync('token');
    let headers = {
      'Content-Type': 'application/json'
    };

    // 如果有token，添加到请求头
    if (tokenData && tokenData.accessToken) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }

    wx.request({
      url: 'http://8.133.19.244:8889/api/getAllGoods',
      method: 'POST',
      data: {
        user_id: params.user_id || 0
      },
      header: headers,
      timeout: 10000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = res.data;
          if (response.code === 200) {
            // 如果 image_urls 是字符串，尝试解析为数组
            const goodsList = response.goods_list.map(good => ({
              ...good,
              image_urls: parseImageUrls(good.image_urls)
            }));
            
            resolve({
              ...response,
              goods_list: goodsList
            });
          } else {
            reject(new Error(response.msg || '获取商品列表失败'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('获取商品列表失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

/**
 * 解析图片URL字符串为数组
 * @param {string} imageUrls - 图片URL字符串
 * @returns {string[]} 图片URL数组
 */
function parseImageUrls(imageUrls) {
  if (!imageUrls) return [];
  
  // 如果已经是数组，直接返回
  if (Array.isArray(imageUrls)) {
    return imageUrls;
  }
  
  // 如果是字符串，进行解析
  if (typeof imageUrls === 'string') {
    try {
      // 尝试解析为JSON数组
      if (imageUrls.startsWith('[') || imageUrls.startsWith('{')) {
        return JSON.parse(imageUrls);
      }
      
      // 如果是逗号分隔的字符串
      if (imageUrls.includes(',')) {
        return imageUrls.split(',').map(url => url.trim()).filter(url => url);
      }
      
      // 单个URL
      return [imageUrls];
    } catch (error) {
      console.warn('解析图片URL失败:', error);
      return [imageUrls]; // 返回原始字符串作为单个元素
    }
  }
  
  // 其他类型，返回空数组
  return [];
}

/**
 * 根据商品ID获取单个商品信息
 * @param {number} goodId - 商品ID
 * @param {number} userId - 用户ID
 * @returns {Promise<Goods|null>} 商品信息
 */
export function getGoodById(goodId, userId = 0) {
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const tokenData = wx.getStorageSync('token');
    let headers = {
      'Content-Type': 'application/json'
    };

    // 如果有token，添加到请求头
    if (tokenData && tokenData.accessToken) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }

    // 确保参数类型正确
    const numericGoodId = parseInt(goodId, 10);
    const numericUserId = parseInt(userId, 10);
    
    console.log('[getGoodById] 原始参数:', { goodId, userId });
    console.log('[getGoodById] 转换后参数:', { numericGoodId, numericUserId });
    console.log('[getGoodById] 发送请求参数:', {
      user_id: numericUserId,
      good_id: numericGoodId
    });

    wx.request({
      url: 'http://8.133.19.244:8889/api/getGood',
      method: 'POST',
      data: {
        user_id: numericUserId,
        good_id: numericGoodId
      },
      header: headers,
      timeout: 10000,
      success: (res) => {
        console.log('[getGoodById] 响应状态码:', res.statusCode);
        console.log('[getGoodById] 响应数据:', res.data);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = res.data;
          console.log('[getGoodById] 完整API响应:', response);
          console.log('[getGoodById] response.good:', response.good);
          console.log('[getGoodById] response.good.id:', response.good?.id);
          console.log('[getGoodById] response.good.good_id:', response.good?.good_id);
          
          if (response.code === 200) {
            // 如果 image_urls 是字符串，尝试解析为数组
            const good = {
              ...response.good,
              image_urls: parseImageUrls(response.good.image_urls)
            };
            
            console.log('[getGoodById] 解析后的商品数据:', good);
            console.log('[getGoodById] 最终good.id:', good.id);
            console.log('[getGoodById] 最终good.good_id:', good.good_id);
            resolve(good);
          } else {
            console.error('[getGoodById] API返回错误:', response);
            reject(new Error(response.msg || '获取商品详情失败'));
          }
        } else {
          console.error('[getGoodById] HTTP错误:', res.statusCode, res.data);
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('[getGoodById] 网络请求失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

/**
 * 根据农场ID获取商品列表
 * @param {number} farmId - 农场ID
 * @param {number} userId - 用户ID
 * @returns {Promise<Goods[]>} 商品列表
 */
export function getGoodsByFarmId(farmId, userId = 0) {
  return new Promise((resolve, reject) => {
    getAllGoodsApi({ user_id: userId })
      .then(response => {
        const goods = response.goods_list.filter(item => item.farm_id === farmId);
        resolve(goods);
      })
      .catch(error => {
        console.error('获取农场商品列表失败:', error);
        resolve([]);
      });
  });
}

/**
 * 根据标签获取商品列表
 * @param {string} goodTag - 商品标签
 * @param {number} userId - 用户ID
 * @returns {Promise<Goods[]>} 商品列表
 */
export function getGoodsByTag(goodTag, userId = 0) {
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const tokenData = wx.getStorageSync('token');
    let headers = {
      'Content-Type': 'application/json'
    };

    // 如果有token，添加到请求头
    if (tokenData && tokenData.accessToken) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }

    wx.request({
      url: 'http://8.133.19.244:8889/api/getGoodsByTag',
      method: 'POST',
      data: {
        user_id: userId,
        good_tag: goodTag
      },
      header: headers,
      timeout: 10000,
      success: (res) => {

        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = res.data;
          if (response.code === 200) {
            // 如果 image_urls 是字符串，尝试解析为数组
            const goodsList = response.goods_list.map(good => ({
              ...good,
              image_urls: parseImageUrls(good.image_urls)
            }));
            
            resolve(goodsList);
          } else {
            reject(new Error(response.msg || '根据标签获取商品列表失败'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('根据标签获取商品列表失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

/**
 * 搜索商品（根据标题或标签）
 * @param {string} keyword - 搜索关键词
 * @param {number} userId - 用户ID
 * @returns {Promise<Goods[]>} 商品列表
 */
export function searchGoods(keyword, userId = 0) {
  return new Promise((resolve, reject) => {
    getAllGoodsApi({ user_id: userId })
      .then(response => {
        const lowerKeyword = keyword.toLowerCase();
        const goods = response.goods_list.filter(item => 
          item.title.toLowerCase().includes(lowerKeyword) ||
          item.good_tag.toLowerCase().includes(lowerKeyword)
        );
        resolve(goods);
      })
      .catch(error => {
        console.error('搜索商品失败:', error);
        resolve([]);
      });
  });
} 