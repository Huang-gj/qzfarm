import { config } from '../../config/index';

/** 获取活动列表 */
function mockFetchActivityList(pageIndex = 1, pageSize = 20) {
  const { delay } = require('../_utils/delay');
  const { getActivityList } = require('../../model/activities');

  return delay().then(() => getActivityList(pageIndex, pageSize));
}

/** 获取活动列表 */
export function fetchActivityList(pageIndex = 1, pageSize = 20) {
  // 暂时总是使用mock数据，因为真实API还没有实现
  return mockFetchActivityList(pageIndex, pageSize);
}
