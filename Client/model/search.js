import { getGoodsList } from './goods';
//搜索模块
/**
 * @param {number} sort
 * @param {number} pageNum
 * @param {number} pageSize
 * @param {number} minPrice
 * @param {number} maxPrice
 * @param {string} keyword
 */
//获取历史搜索信息
export function getSearchHistory() {
  return {
    historyWords: [
      
    ],
  };
}
//获取热门搜索信息
export function getSearchPopular() {
  return {
    popularWords: [
      
    ],
  };
}

export function getSearchResult() {
  return {
    saasId: null,
    storeId: null,
    pageNum: 1,
    pageSize: 30,
    totalCount: 1,
    spuList: getGoodsList(7),
    algId: 0,
  };
}
