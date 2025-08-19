import { config } from '../../config/index';

/** 获取个人中心信息 */
function mockFetchUserCenter() {
  const { delay } = require('../_utils/delay');
  const { genUsercenter } = require('../../model/usercenter');
  return delay(200).then(() => genUsercenter());
}

/** 获取个人中心信息 */
export function fetchUserCenter() {
  if (config.useMock) {
    return mockFetchUserCenter();
  }
  
  // 使用真实的用户数据
  return new Promise((resolve) => {
    const app = getApp();
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    
    console.log('[fetchUserCenter] 获取真实用户数据:', userInfo);
    
    if (userInfo) {
      // 转换用户数据格式以适配用户中心页面
      const realUserInfo = {
        avatarUrl: userInfo.avatar || 'https://via.placeholder.com/100x100?text=默认头像',
        nickName: userInfo.nickname || '',
        phoneNumber: userInfo.phone_number || '',
        gender: userInfo.gender || '',
      };
      
      // 使用 mock 数据作为默认值，但用户信息使用真实数据
      const { genUsercenter } = require('../../model/usercenter');
      const mockData = genUsercenter();
      
      const result = {
        userInfo: realUserInfo,
        countsData: mockData.countsData,
        orderTagInfos: mockData.orderTagInfos,
        customerServiceInfo: mockData.customerServiceInfo,
      };
      
      console.log('[fetchUserCenter] 返回的用户中心数据:', result);
      resolve(result);
    } else {
      console.log('[fetchUserCenter] 没有用户信息，使用 mock 数据');
      // 如果没有用户信息，使用 mock 数据
      const { genUsercenter } = require('../../model/usercenter');
      resolve(genUsercenter());
    }
  });
}
