import {
  request
} from '../_utils/request';

/**
 * 更新用户信息
 * @param {Object} userInfo - 用户信息对象
 * @param {number} userInfo.user_id - 用户ID
 * @param {string} userInfo.phone_number - 手机号
 * @param {string} userInfo.avatar - 头像URL
 * @param {string} userInfo.nickname - 昵称
 * @param {string} userInfo.address - 地址
 * @param {number} userInfo.gender - 性别 (1:男, 2:女)
 * @returns {Promise} 更新结果
 */
export function updateUserInfo(userInfo) {
  console.log('[updateUserInfo] 开始更新用户信息:', userInfo);

  const requestData = {

    user_info: {
      user_id: userInfo.user_id,
      phone_number: userInfo.phone_number || '',
      avatar: userInfo.avatar || '',
      nickname: userInfo.nickname || '',
      address: userInfo.address || '',
      gender: userInfo.gender || 0,
    }
  };

  console.log('[updateUserInfo] 发送的请求数据:', JSON.stringify(requestData, null, 2));

  return request({
    // url: 'http://8.133.19.244:8893/user/uploadUserInfo',
    url: 'https://qzfarm.top/user/uploadUserInfo',
    method: 'POST',
    data: requestData
  }).then(res => {
    console.log('[updateUserInfo] 更新用户信息成功:', res);
    return res;
  }).catch(err => {
    console.error('[updateUserInfo] 更新用户信息失败:', err);
    throw err;
  });
}