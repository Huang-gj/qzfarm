import { getGoodsList, getGoodsListByCategory } from './goods';
//搜索模块
/**
 * @param {number} sort
 * @param {number} pageNum
 * @param {number} pageSize
 * @param {number} minPrice
 * @param {number} maxPrice
 * @param {string} keyword
 * @param {string} groupId 分类ID
 * @param {number} sortType 排序类型：0-升序，1-降序
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

export async function getSearchResult(params = {}) {
  console.log('[getSearchResult] 开始获取搜索结果, 参数:', params);
  
  const { groupId, sort = 0, sortType = 0 } = params;
  
  try {
    // 根据是否提供分类ID决定使用哪个函数获取商品列表
    let spuList = [];
    if (groupId) {
      // 如果提供了分类ID，使用按分类筛选的函数
      console.log('[getSearchResult] 使用按分类筛选商品');
      spuList = await getGoodsListByCategory(groupId);
    } else {
      // 否则使用普通获取商品的函数
      console.log('[getSearchResult] 使用普通方式获取商品');
      spuList = await getGoodsList(0, 3); // 获取所有三种商品
    }
    
    console.log('[getSearchResult] 获取到商品数量:', spuList ? spuList.length : 0);
    
    // 确保spuList是一个数组
    if (!spuList) spuList = [];
    
    // 如果是按价格排序
    if (sort === 1 && spuList.length > 0) {
      console.log('[getSearchResult] 按价格排序');
      
      // 根据sortType决定升序或降序
      // sortType: 0-升序, 1-降序
      spuList.sort((a, b) => {
        const priceA = parseFloat(a.minSalePrice);
        const priceB = parseFloat(b.minSalePrice);
        
        if (sortType === 0) {
          // 升序：从低到高
          return priceA - priceB;
        } else {
          // 降序：从高到低
          return priceB - priceA;
        }
      });
      
      console.log('[getSearchResult] 排序完成, 方向:', sortType === 0 ? '升序' : '降序');
    }
    
    const result = {
      saasId: null,
      storeId: null,
      pageNum: 1,
      pageSize: 30,
      totalCount: spuList.length,
      spuList,
      algId: 0,
    };
    
    console.log('[getSearchResult] 返回结果');
    return result;
  } catch (error) {
    console.error('[getSearchResult] 错误:', error);
    // 出错时返回一个空结果而不是抛出错误
    return {
      saasId: null,
      storeId: null,
      pageNum: 1,
      pageSize: 30,
      totalCount: 0,
      spuList: [],
      algId: 0,
    };
  }
}
