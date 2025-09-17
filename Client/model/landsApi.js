// 土地 API 相关接口调用

/**
 * @typedef {Object} Land
 * @property {number} id - 主键ID
 * @property {number} del_state - 0-正常 1-删除
 * @property {string} del_time - 删除时间
 * @property {string} create_time - 创建时间
 * @property {number} land_id - 土地唯一ID
 * @property {number} farm_id - 所属农场ID
 * @property {string} land_name - 土地名称
 * @property {string} land_tag - 土地标签
 * @property {string} area - 土地面积
 * @property {string} image_urls - 图片信息（JSON字符串或逗号分隔）
 * @property {number} price - 价格
 * @property {string} detail - 土地详情
 * @property {number} sale_status - 租赁状态 0-出售中 1-已被租赁
 * @property {string} sale_time - 租赁剩余时间
 */

/**
 * @typedef {Object} GetLandsResponse
 * @property {number} code - 状态码
 * @property {string} msg - 响应信息
 * @property {Land[]} lands_list - 土地列表
 */

/**
 * @typedef {Object} GetLandResponse
 * @property {number} code - 状态码
 * @property {string} msg - 响应信息
 * @property {Land} land - 土地信息
 */

/**
 * 解析图片URL字符串为数组
 * @param {string} imageUrls - 图片URL字符串
 * @returns {string[]} 图片URL数组
 */
function parseImageUrls(imageUrls) {
  if (!imageUrls) {
    return [];
  }
  
  // 如果已经是数组，直接返回
  if (Array.isArray(imageUrls)) {
    return imageUrls;
  }
  
  // 如果是字符串，进行解析
  if (typeof imageUrls === 'string') {
    try {
      // 尝试解析为JSON数组
      if (imageUrls.startsWith('[') || imageUrls.startsWith('{')) {
        const parsed = JSON.parse(imageUrls);
        return parsed;
      }
      
      // 如果是逗号分隔的字符串
      if (imageUrls.includes(',')) {
        const split = imageUrls.split(',').map(url => url.trim()).filter(url => url);
        return split;
      }
    
      // 单个URL
      return [imageUrls];
    } catch (error) {
      console.warn('[parseImageUrls] 解析图片URL失败:', error);
      return [imageUrls]; // 返回原始字符串作为单个元素
    }
  }
  
  // 其他类型，返回空数组
  return [];
}

/**
 * 获取所有土地信息
 * @param {Object} params - 请求参数（如分页等）
 * @returns {Promise<GetLandsResponse>} 响应数据
 */
export function getAllLandsApi(params = {}) {
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const tokenData = wx.getStorageSync('token');
    let headers = {
      'Content-Type': 'application/json'
    };
    if (tokenData && tokenData.accessToken) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }
    wx.request({
      // url: 'http://8.133.19.244:8889/commodity/getAllLands',
      url: 'https://qzfarm.top/commodity/getAllLands',
      method: 'POST',
      data: {
        user_id: params.user_id || 0,
        ...params
      },
      header: headers,
      timeout: 10000,
      success: (res) => {

        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = res.data;
          if (response.code === 200) {
            
            if (!response.lands_list) {
              console.error('[getAllLandsApi] lands_list为空');
              resolve({ ...response, lands_list: [] });
              return;
            }
            const landList = response.lands_list.map(land => ({
              ...land,
              image_urls: parseImageUrls(land.image_urls)
            }));

            resolve({ ...response, lands_list: landList });
          } else {
            reject(new Error(response.msg || '获取土地列表失败'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('获取土地列表失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

/**
 * 根据土地ID获取单个土地信息
 * @param {number} landId - 土地ID
 * @param {number} userId - 用户ID
 * @returns {Promise<Land|null>} 土地信息
 */
export function getLandById(landId, userId = 0) {
  return new Promise((resolve, reject) => {
    const tokenData = wx.getStorageSync('token');
    let headers = {
      'Content-Type': 'application/json'
    };
    if (tokenData && tokenData.accessToken) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }
    
    // 确保参数类型正确
    const numericLandId = parseInt(landId, 10);
    const numericUserId = parseInt(userId, 10);
    
    console.log('[getLandById] 原始参数:', { landId, userId });
    console.log('[getLandById] 转换后参数:', { numericLandId, numericUserId });
    console.log('[getLandById] 发送请求参数:', {
      user_id: numericUserId,
      land_id: numericLandId
    });
    
    wx.request({
      // url: 'http://8.133.19.244:8889/commodity/getLand',
      url: 'https://qzfarm.top/commodity/getLand',
      method: 'POST',
      data: {
        user_id: numericUserId,
        land_id: numericLandId
      },
      header: headers,
      timeout: 10000,
      success: (res) => {
        console.log('[getLandById] 响应状态码:', res.statusCode);
        console.log('[getLandById] 响应数据:', res.data);
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = res.data;
          if (response.code === 200) {
            const land = {
              ...response.land,
              image_urls: parseImageUrls(response.land.image_urls)
            };
            console.log('[getLandById] 解析后的土地数据:', land);
            resolve(land);
          } else {
            console.error('[getLandById] API返回错误:', response);
            reject(new Error(response.msg || '获取土地详情失败'));
          }
        } else {
          console.error('[getLandById] HTTP错误:', res.statusCode, res.data);
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('[getLandById] 网络请求失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

/**
 * 根据标签获取土地列表
 * @param {string} landTag - 土地标签
 * @param {number} userId - 用户ID
 * @returns {Promise<Land[]>} 土地列表
 */
export function getLandsByTag(landTag, userId = 0) {
  return new Promise((resolve, reject) => {
    const tokenData = wx.getStorageSync('token');
    let headers = {
      'Content-Type': 'application/json'
    };
    if (tokenData && tokenData.accessToken) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }
    wx.request({
      // url: 'http://8.133.19.244:8889/commodity/getLandsByTag',
      url: 'https://qzfarm.top/commodity/getLandsByTag',
      method: 'POST',
      data: {
        user_id: userId,
        land_tag: landTag
      },
      header: headers,
      timeout: 10000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = res.data;
          if (response.code === 200) {
            const landList = response.lands_list.map(land => ({
              ...land,
              image_urls: parseImageUrls(land.image_urls)
            }));
            resolve(landList);
          } else {
            reject(new Error(response.msg || '根据标签获取土地列表失败'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('根据标签获取土地列表失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
} 