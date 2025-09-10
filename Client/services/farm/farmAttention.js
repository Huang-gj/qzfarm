// 农场关注相关服务

const { post } = require('../_utils/request');

/**
 * 添加关注农场
 * @param {number} userId - 用户ID
 * @param {number} farmId - 农场ID
 * @returns {Promise<Object>} 添加关注结果
 */
async function addFarmAttention(userId, farmId) {
  try {
    console.log('[farmAttention] 添加农场关注，用户ID:', userId, '农场ID:', farmId);
    
    const response = await post('/commodity/AddAttention', {
      user_id: userId,
      farm_id: farmId
    });
    
    console.log('[farmAttention] 添加关注响应:', response);
    
    // 检查响应格式
    if (response && response.code === 200) {
      return {
        success: true,
        message: response.msg || '关注成功',
        data: response
      };
    } else {
      return {
        success: false,
        message: response?.msg || '关注失败，请稍后重试',
        data: response
      };
    }
  } catch (error) {
    console.error('[farmAttention] 添加关注失败:', error);
    return {
      success: false,
      message: error.message || '网络错误，关注失败',
      data: null
    };
  }
}

/**
 * 取消关注农场
 * @param {number} userId - 用户ID
 * @param {number} farmId - 农场ID
 * @returns {Promise<Object>} 取消关注结果
 */
async function delFarmAttention(userId, farmId) {
  try {
    console.log('[farmAttention] 取消农场关注，用户ID:', userId, '农场ID:', farmId);
    
    const response = await post('/commodity/DelAttention', {
      user_id: userId,
      farm_id: farmId
    });
    
    console.log('[farmAttention] 取消关注响应:', response);
    
    // 检查响应格式
    if (response && response.code === 200) {
      return {
        success: true,
        message: response.msg || '取消关注成功',
        data: response
      };
    } else {
      return {
        success: false,
        message: response?.msg || '取消关注失败，请稍后重试',
        data: response
      };
    }
  } catch (error) {
    console.error('[farmAttention] 取消关注失败:', error);
    return {
      success: false,
      message: error.message || '网络错误，取消关注失败',
      data: null
    };
  }
}

/**
 * 检查用户是否已关注农场
 * @param {number} userId - 用户ID
 * @param {number} farmId - 农场ID
 * @returns {Promise<Object>} 关注状态检查结果
 */
async function checkFarmAttention(userId, farmId) {
  try {
    console.log('[farmAttention] 检查关注状态，用户ID:', userId, '农场ID:', farmId);
    
    // 这里需要根据后端实际的检查接口来实现
    // 如果后端没有提供检查接口，可以暂时返回默认状态
    // 或者在添加/取消关注时在本地存储状态
    
    // 暂时从本地存储中检查关注状态
    const attentionKey = `farm_attention_${userId}_${farmId}`;
    const isFollowed = wx.getStorageSync(attentionKey) || false;
    
    return {
      success: true,
      message: '获取关注状态成功',
      data: {
        isFollowed: isFollowed
      }
    };
  } catch (error) {
    console.error('[farmAttention] 检查关注状态失败:', error);
    return {
      success: false,
      message: '获取关注状态失败',
      data: {
        isFollowed: false
      }
    };
  }
}

/**
 * 本地存储关注状态
 * @param {number} userId - 用户ID
 * @param {number} farmId - 农场ID
 * @param {boolean} isFollowed - 是否关注
 */
function saveAttentionStatus(userId, farmId, isFollowed) {
  try {
    const attentionKey = `farm_attention_${userId}_${farmId}`;
    wx.setStorageSync(attentionKey, isFollowed);
    console.log('[farmAttention] 保存关注状态:', attentionKey, isFollowed);
  } catch (error) {
    console.error('[farmAttention] 保存关注状态失败:', error);
  }
}

module.exports = {
  addFarmAttention,
  delFarmAttention,
  checkFarmAttention,
  saveAttentionStatus
};