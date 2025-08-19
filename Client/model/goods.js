import { getAllGoodsApi } from './goodsApi';

/**
 * 获取商品列表
 * @param {number} baseID 起始ID
 * @param {number} length 列表长度
 * @returns {Promise<Array>} 商品列表
 */
export async function getGoodsList(baseID = 0, length = 10) {
  try {
    // 使用新的API获取所有商品
    const response = await getAllGoodsApi({ user_id: 0 });
    const allGoods = response.goods_list || [];
    
    // 根据baseID和length进行分页
    const startIndex = baseID;
    const endIndex = startIndex + length;
    const paginatedGoods = allGoods.slice(startIndex, endIndex);
    
    // 转换为原有格式
    const convertedGoods = paginatedGoods.map(good => ({
      // 原有渲染需要的字段
      good_id: good.good_id,
      title: good.title,
      primaryImage: Array.isArray(good.image_urls) && good.image_urls.length > 0 ? good.image_urls[0] : '',
      images: good.image_urls || [],
      price: good.price,
      minSalePrice: good.price,
      maxSalePrice: good.price,
      minLinePrice: good.price,
      maxLinePrice: good.price,
      spuStockQuantity: good.repertory,
      soldNum: 0, // 新模型没有销量字段，设为0
      isPutOnSale: good.del_state === 0 ? 1 : 0,
      available: good.del_state === 0 ? 1 : 0,
      
      // 规格信息
      specList: [{
        specId: 'units',
        title: '单位',
        specValueList: [{
          specValueId: 'units_value',
          specValue: good.units || '个'
        }]
      }],
      
      // 标签信息
      spuTagList: good.good_tag ? [{
        id: 'tag_001',
        title: good.good_tag,
        image: null
      }] : [],
      
      // 描述信息
      desc: good.detail ? [good.detail] : [],
      
      // 新模型字段 - 保留所有原始数据
      id: good.id,
      del_state: good.del_state,
      del_time: good.del_time,
      create_time: good.create_time,
      good_id: good.good_id,
      good_tag: good.good_tag,
      farm_id: good.farm_id,
      image_urls: good.image_urls,
      units: good.units,
      repertory: good.repertory,
      detail: good.detail
    }));

    return convertedGoods;
  } catch (error) {
    console.error('[getGoodsList] 错误:', error);
    // 返回空数组而不是抛出错误，避免应用崩溃
    return [];
  }
}

/**
 * 获取所有固定的商品数据
 * @returns {Promise<Array>} 所有商品
 */
async function getAllFixedGoods() {
  try {
    // 使用新的API获取所有商品
    const response = await getAllGoodsApi({ user_id: 0 });
    const allGoods = response.goods_list || [];
    
    // 转换为原有格式
    const convertedGoods = allGoods.map(good => ({
      // 原有渲染需要的字段
      good_id: good.good_id,
      title: good.title,
      primaryImage: Array.isArray(good.image_urls) && good.image_urls.length > 0 ? good.image_urls[0] : '',
      images: good.image_urls || [],
      price: good.price,
      minSalePrice: good.price,
      maxSalePrice: good.price,
      minLinePrice: good.price,
      maxLinePrice: good.price,
      spuStockQuantity: good.repertory,
      soldNum: 0, // 新模型没有销量字段，设为0
      isPutOnSale: good.del_state === 0 ? 1 : 0,
      available: good.del_state === 0 ? 1 : 0,
      
      // 规格信息
      specList: [{
        specId: 'units',
        title: '单位',
        specValueList: [{
          specValueId: 'units_value',
          specValue: good.units || '个'
        }]
      }],
      
      // 标签信息
      spuTagList: good.good_tag ? [{
        id: 'tag_001',
        title: good.good_tag,
        image: null
      }] : [],
      
      // 描述信息
      desc: good.detail ? [good.detail] : [],
      
      // 新模型字段 - 保留所有原始数据
      id: good.id,
      del_state: good.del_state,
      del_time: good.del_time,
      create_time: good.create_time,
      good_id: good.good_id,
      good_tag: good.good_tag,
      farm_id: good.farm_id,
      image_urls: good.image_urls,
      units: good.units,
      repertory: good.repertory,
      detail: good.detail
    }));
    
    return convertedGoods;
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

    // 如果没有提供分类ID或分类ID为空，返回所有商品
    if (!groupId) {
      console.log('[getGoodsListByCategory] 没有提供分类ID, 返回所有商品');
      return allGoods;
    }

    // 根据分类ID过滤商品（新模型暂时不按分类过滤，返回所有商品）
    console.log('[getGoodsListByCategory] 新模型暂不支持分类过滤，返回所有商品');
    return allGoods;
  } catch (error) {
    console.error('[getGoodsListByCategory] 错误:', error);
    return [];
  }
}

// goodsList 需要异步获取，因此不再导出静态变量
// export const goodsList = getGoodsList();