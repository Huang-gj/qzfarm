import {
  cdnBase
} from '../../config/index';

const { getMainPic } = require('../activity/activityApi');

// Mock数据已删除，现在只使用真实的活动数据

/** 获取农场ID */
function getFarmId() {
  // 获取用户信息
  const app = getApp();
  const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
  
  // 如果用户信息中有farm_id，使用它
  if (userInfo && userInfo.farm_id) {
    return userInfo.farm_id;
  }
  
  // 否则使用默认的农场ID（临时方案）
  console.log('[getFarmId] 用户信息中没有farm_id，使用默认值43');
  return 43;
}

/** 获取真实的活动轮播图数据 */
function fetchRealActivityData() {
  const farmId = getFarmId();
  
  console.log('[fetchRealActivityData] 开始获取活动数据，farmId:', farmId);
  
  return getMainPic(farmId).then(response => {
    console.log('[fetchRealActivityData] 获取活动数据成功:', response);
    console.log('=== GetMainPic 接口返回的完整数据 ===');
    console.log('response:', JSON.stringify(response, null, 2));
    
    if (response.success && response.data) {
      const { activityIds, mainPics, titles } = response.data;
      console.log('=== 解析后的数据 ===');
      console.log('activityIds:', activityIds);
      console.log('mainPics:', mainPics);
      console.log('titles:', titles);
      
      // 构建轮播图数据和活动映射关系
      const swiperData = [];
      const activityMapping = []; // 存储活动ID映射关系，与轮播图索引一一对应
      const maxLength = Math.min(activityIds.length, mainPics.length, titles.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (activityIds[i] && mainPics[i]) {
          // t-swiper组件期望的是字符串数组（图片URL）
          swiperData.push(mainPics[i]);
          // 保存对应的活动信息
          activityMapping.push({
            activityId: activityIds[i],
            title: titles[i] || `活动 ${i + 1}`,
            mainPic: mainPics[i]
          });
        }
      }
      
      console.log('[fetchRealActivityData] 构建的轮播图数据:', swiperData);
      
      return {
        swiper: swiperData,
        activityMapping: activityMapping, // 轮播图索引与活动信息的映射
        activities: {
          activityIds,
          mainPics,
          titles
        },
        tabList: [{
            text: '农产品',
            key: 0
          },
          {
            text: '土地认养',
            key: 1
          },
        ],
        activityImg: `${cdnBase}/activity/banner.png`,
      };
    } else {
      throw new Error('获取活动数据失败');
    }
  }).catch(error => {
    console.error('[fetchRealActivityData] 获取活动数据失败:', error);
    // 返回空的轮播图数据
    return {
      swiper: [],
      activities: null,
      tabList: [{
          text: '农产品',
          key: 0
        },
        {
          text: '土地认养',
          key: 1
        },
      ],
      activityImg: `${cdnBase}/activity/banner.png`,
    };
  });
}

/** 获取首页数据 */
export function fetchHome() {
  console.log('[fetchHome] 开始执行fetchHome函数');
  // 直接获取真实的活动数据，不再使用mock
  console.log('[fetchHome] 准备调用fetchRealActivityData');
  return fetchRealActivityData();
}