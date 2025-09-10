// 我的关注相关服务

const { post } = require('../_utils/request');

/**
 * 获取用户关注的农场列表
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} 关注农场列表结果
 */
async function getMyFarmAttention(userId) {
  try {
    console.log('[myAttention] 获取用户关注农场列表，用户ID:', userId);
    
    const response = await post('/commodity/GetFarmAttention', {
      user_id: userId
    });
    
    console.log('[myAttention] 获取关注列表响应:', response);
    
    // 检查响应格式
    if (response && response.code === 200) {
      return {
        success: true,
        message: response.msg || '获取成功',
        data: response.farm_cat || []
      };
    } else {
      return {
        success: false,
        message: response?.msg || '获取关注列表失败',
        data: []
      };
    }
  } catch (error) {
    console.error('[myAttention] 获取关注列表失败:', error);
    return {
      success: false,
      message: error.message || '网络错误，获取失败',
      data: []
    };
  }
}

module.exports = {
  getMyFarmAttention
};