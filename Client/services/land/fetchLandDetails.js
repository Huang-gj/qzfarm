import { config } from '../../config/index';

/** 获取土地详情页评论数 */
function mockFetchLandDetailsCommentsCount(land_id = 0) {
  const { delay } = require('../_utils/delay');
  const {
    getLandDetailsCommentsCount,
  } = require('../../model/landDetailsComments');
  return delay().then(() => getLandDetailsCommentsCount(land_id));
}

/** 获取土地详情页评论数 */
export function getLandDetailsCommentsCount(land_id = 0) {
  if (config.useMock) {
    return mockFetchLandDetailsCommentsCount(land_id);
  }
  return new Promise((resolve) => {
    resolve('real api');
  });
}

/** 获取土地详情页评论 */
function mockFetchLandDetailsCommentList(land_id = 0) {
  const { delay } = require('../_utils/delay');
  const { getLandDetailsComments } = require('../../model/landDetailsComments');
  return delay().then(() => getLandDetailsComments(land_id));
}

/** 获取土地详情页评论 */
export function getLandDetailsCommentList(land_id = 0) {
  if (config.useMock) {
    return mockFetchLandDetailsCommentList(land_id);
  }
  return new Promise((resolve) => {
    resolve('real api');
  });
} 