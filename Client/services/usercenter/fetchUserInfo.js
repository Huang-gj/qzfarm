import { request } from '../_utils/request';

/**
 * 从服务器获取最新的用户信息
 * @param {number} userId - 用户ID
 * @returns {Promise} 用户信息
 */
export function fetchUserInfo(userId) {
  console.log('[fetchUserInfo] 开始获取用户信息:', userId);

  return request({
    // url: `http://8.133.19.244:8893/user/getUserInfo`,
    url: `https://qzfarm.top/user/getUserInfo`,
    method: 'POST',
    data: {
      user_id: userId
    }
  }).then(res => {
    console.log('[fetchUserInfo] 获取用户信息成功:', res);
    return res;
  }).catch(err => {
    console.error('[fetchUserInfo] 获取用户信息失败:', err);
    throw err;
  });
} 