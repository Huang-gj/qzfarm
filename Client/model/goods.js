import {
  genGood
} from './good';

/**
 * 获取商品列表
 * @param {number} baseID 起始ID
 * @param {number} length 列表长度
 * @returns {Promise<Array>} 商品列表
 */
export async function getGoodsList(baseID = 0, length = 10) {
  try {
    // 使用Promise.all并行获取所有商品数据
    const promises = new Array(length).fill(0).map((_, idx) => genGood(idx + baseID));
    const goodsList = await Promise.all(promises);
    
    return goodsList;
  } catch (error) {
    console.error('[getGoodsList] 错误:', error);
    // 返回空数组而不是抛出错误，避免应用崩溃
    return [];
  }
}

// goodsList 需要异步获取，因此不再导出静态变量
// export const goodsList = getGoodsList();