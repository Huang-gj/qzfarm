import { config } from '../../config/index';

/** 获取商品详情页评论数 */
function mockFetchGoodDetailsCommentsCount(good_id = 0) {
  const { delay } = require('../_utils/delay');
  const {
    getGoodsDetailsCommentsCount,
  } = require('../../model/detailsComments');
  return delay().then(() => getGoodsDetailsCommentsCount(good_id));
}

/** 获取商品详情页评论数 */
export function getGoodsDetailsCommentsCount(good_id = 0) {
  if (config.useMock) {
    return mockFetchGoodDetailsCommentsCount(good_id);
  }
  return new Promise((resolve) => {
    resolve('real api');
  });
}

/** 获取商品详情页评论 */
function mockFetchGoodDetailsCommentList(good_id = 0) {
  const { delay } = require('../_utils/delay');
  const { getGoodsDetailsComments } = require('../../model/detailsComments');
  return delay().then(() => getGoodsDetailsComments(good_id));
}

/** 获取商品详情页评论 */
export function getGoodsDetailsCommentList(good_id = 0) {
  if (config.useMock) {
    return mockFetchGoodDetailsCommentList(good_id);
  }
  return new Promise((resolve) => {
    resolve('real api');
  });
}
