import {
  config,
  cdnBase
} from '../../config/index';

/** 获取首页数据 */
function mockFetchHome() {
  const {
    delay
  } = require('../_utils/delay');
  const {
    genSwiperImageList
  } = require('../../model/swiper');

  return delay().then(() => {
    return genSwiperImageList().then(swiperImages => { // 处理 Promise
      return {
        swiper: swiperImages, // 确保这里是图片 URL 数组
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
  });
}

/** 获取首页数据 */
export function fetchHome() {
  if (config.useMock) {
    return mockFetchHome();
  }
  // 当不使用mock时，仍然返回mock数据作为默认值
  return mockFetchHome();
}