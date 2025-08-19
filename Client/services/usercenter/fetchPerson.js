import { config } from '../../config/index';

/** 获取个人中心信息 */
function mockFetchPerson() {
  const { delay } = require('../_utils/delay');
  const { genSimpleUserInfo } = require('../../model/usercenter');
  const { genAddress } = require('../../model/address');
  const address = genAddress();
  return delay().then(() => ({
    ...genSimpleUserInfo(),
    address: {
      provinceName: address.provinceName,
      provinceCode: address.provinceCode,
      cityName: address.cityName,
      cityCode: address.cityCode,
    },
  }));
}

/** 获取个人中心信息 */
export function fetchPerson() {
  if (config.useMock) {
    return mockFetchPerson();
  }
  
  // 使用真实的用户数据
  return new Promise((resolve) => {
    const app = getApp();
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    
    console.log('[fetchPerson] 获取真实用户数据:', userInfo);
    
    if (userInfo) {
      // 转换用户数据格式以适配个人信息页面
      const realPersonInfo = {
        avatarUrl: userInfo.avatar || 'https://via.placeholder.com/100x100?text=默认头像',
        nickName: userInfo.nickname || '',
        phoneNumber: userInfo.phone_number || '',
        gender: userInfo.gender || '',
        address: userInfo.address || '',
      };
      
      console.log('[fetchPerson] 返回的个人信息数据:', realPersonInfo);
      resolve(realPersonInfo);
    } else {
      console.log('[fetchPerson] 没有用户信息，使用 mock 数据');
      // 如果没有用户信息，使用 mock 数据
      const { genSimpleUserInfo } = require('../../model/usercenter');
      const { genAddress } = require('../../model/address');
      const address = genAddress();
      resolve({
        ...genSimpleUserInfo(),
        address: {
          provinceName: address.provinceName,
          provinceCode: address.provinceCode,
          cityName: address.cityName,
          cityCode: address.cityCode,
        },
      });
    }
  });
}
