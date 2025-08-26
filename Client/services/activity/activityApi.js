/**
 * 获取活动主图列表
 * @param {number} farmId - 农场ID
 * @returns {Promise} 返回活动主图数据
 */
function getMainPic(farmId) {
  console.log('[getMainPic] 请求参数:', { farmId });
  console.log('[getMainPic] 即将发送POST请求到: http://localhost:8889/api/GetMainPic');
  
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const tokenData = wx.getStorageSync('token');
    let headers = {
      'Content-Type': 'application/json'
    };

    // 如果有token，添加Authorization头
    if (tokenData && tokenData.accessToken) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }

    wx.request({
      url: 'http://localhost:8889/api/GetMainPic',
      method: 'POST',
      data: {
        farm_id: farmId
      },
      header: headers,
      timeout: 10000,
      success: (res) => {
        console.log('[getMainPic] 响应数据:', res.data);
        console.log('=== GetMainPic 原始后端响应 ===');
        console.log('完整响应:', JSON.stringify(res.data, null, 2));
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = res.data;
          
          if (response.code === 0 || response.code === 200) {
            resolve({
              success: true,
              data: {
                activityIds: response.activity_ids || [],
                mainPics: response.main_pics || [],
                titles: response.title || []
              }
            });
          } else {
            reject(new Error(response.msg || '获取活动主图失败'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('[getMainPic] 请求失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

/**
 * 获取活动详情
 * @param {number} activityId - 活动ID
 * @returns {Promise} 返回活动详情数据
 */
function getActivityDetail(activityId) {
  console.log('[getActivityDetail] 请求参数:', { activityId });
  console.log('[getActivityDetail] 即将发送POST请求到: http://localhost:8889/api/GetActivityDetail');
  
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const tokenData = wx.getStorageSync('token');
    let headers = {
      'Content-Type': 'application/json'
    };

    // 如果有token，添加Authorization头
    if (tokenData && tokenData.accessToken) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }

    wx.request({
      url: 'http://localhost:8889/api/GetActivityDetail',
      method: 'POST',
      data: {
        activity_id: activityId
      },
      header: headers,
      timeout: 10000,
      success: (res) => {
        console.log('[getActivityDetail] 响应数据:', res.data);
        console.log('=== GetActivityDetail 原始后端响应 ===');
        console.log('完整响应:', JSON.stringify(res.data, null, 2));
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const response = res.data;
          
          if (response.code === 0 || response.code === 200) {
            let activity = response.activities || null;
            
            // 处理image_urls字段，确保它是数组格式
            if (activity && activity.image_urls) {
              if (typeof activity.image_urls === 'string') {
                try {
                  activity.image_urls = JSON.parse(activity.image_urls);
                } catch (e) {
                  console.warn('[getActivityDetail] 解析image_urls失败:', e);
                  activity.image_urls = [];
                }
              }
              
              // 确保image_urls是数组
              if (!Array.isArray(activity.image_urls)) {
                activity.image_urls = [];
              }
            }
            
            resolve({
              success: true,
              data: activity
            });
          } else {
            reject(new Error(response.msg || '获取活动详情失败'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('[getActivityDetail] 请求失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

module.exports = {
  getMainPic,
  getActivityDetail
};