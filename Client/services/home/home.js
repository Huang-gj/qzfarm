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
        // tabList: [{
          //   text: '精选推荐',
          //   key: 0
          // },
          // {
          //   text: '菜地认养',
          //   key: 1
          // },
          // {
          //   text: '新鲜果蔬',
          //   key: 2
          // },
          // {
          //   text: '论坛',
          //   key: 3
          // },
          // {
          //   text: '农场人气榜',
          //   key: 4
          // },
          // {
          //   text: '农场好评榜',
          //   key: 5
          // },
          // {
          //   text: '线下活动',
          //   key: 6
          // },
        // ],
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
  return new Promise((resolve) => {
    resolve('real api');
  });
}