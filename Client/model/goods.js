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

/**
 * 获取所有固定的商品数据（橘子、橘子2、西瓜、梨）
 * @returns {Promise<Array>} 所有商品
 */
async function getAllFixedGoods() {
  try {
    // 获取所有四种固定商品
    const goods = await Promise.all([
      genGood(0), // 橘子
      genGood(1), // 橘子2
      genGood(2), // 西瓜
      genGood(3) // 梨
    ]);
    return goods;
  } catch (error) {
    console.error('[getAllFixedGoods] 错误:', error);
    return [];
  }
}

/**
 * 根据分类ID获取商品列表
 * @param {string} groupId 分类ID
 * @returns {Promise<Array>} 商品列表
 */
export async function getGoodsListByCategory(groupId) {
  try {
    console.log('[getGoodsListByCategory] 开始按分类ID过滤商品:', groupId);

    // 获取所有商品
    const allGoods = await getAllFixedGoods();
    console.log('[getGoodsListByCategory] 获取到所有商品, 数量:', allGoods.length);

    // 详细打印所有商品信息
    allGoods.forEach(good => {
      console.log(`[getGoodsListByCategory] 商品详情:`, {
        title: good.title,
        spuId: good.spuId,
        categoryIds: good.categoryIds || []
      });
    });

    // 如果没有提供分类ID或分类ID为空，返回所有商品
    if (!groupId) {
      console.log('[getGoodsListByCategory] 没有提供分类ID, 返回所有商品');
      return allGoods;
    }

    // 根据分类ID过滤商品
    const filteredGoods = allGoods.filter(good => {
      // 详细记录每个商品的过滤过程
      console.log(`[getGoodsListByCategory] 开始过滤商品: ${good.title}`);
      console.log(`[getGoodsListByCategory] 商品分类IDs: ${JSON.stringify(good.categoryIds)}`);

      // 如果商品没有分类信息，默认不匹配
      if (!good.categoryIds || !good.categoryIds.length) {
        console.log(`[getGoodsListByCategory] 商品 ${good.title} 没有分类信息，不匹配`);
        return false;
      }

      // 检查商品的分类ID是否精确匹配当前选中的分类ID
      const isMatch = good.categoryIds.some(catId => {
        const catIdStr = catId.toString();
        console.log(`[getGoodsListByCategory] 比较: ${catIdStr} === ${groupId}`);

        // 只进行精确匹配
        if (catIdStr === groupId) {
          console.log(`[getGoodsListByCategory] 商品 ${good.title} 精确匹配分类ID ${groupId}`);
          return true;
        }

        return false;
      });

      console.log(`[getGoodsListByCategory] 商品 ${good.title} ${isMatch ? '匹配' : '不匹配'} 分类ID ${groupId}`);
      return isMatch;
    });

    console.log('[getGoodsListByCategory] 最终匹配到商品数量:', filteredGoods.length);
    console.log('[getGoodsListByCategory] 匹配到的商品:', filteredGoods.map(g => g.title));
    return filteredGoods;
  } catch (error) {
    console.error('[getGoodsListByCategory] 错误:', error);
    return [];
  }
}

// goodsList 需要异步获取，因此不再导出静态变量
// export const goodsList = getGoodsList();