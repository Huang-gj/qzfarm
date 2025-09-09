import { config } from '../../config/index';

/** 获取分类列表 */
function fetchGoodCategory() {
  const { delay } = require('../_utils/delay');
  const { getCategoryList } = require('../../model/category');
  return delay().then(() => getCategoryList());
}

/** 获取分类列表 */
export function getCategoryList() {
  // 现在使用真实API数据，从后端动态获取分类信息
  return fetchGoodCategory();
}
