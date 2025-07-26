import {
  getAllGoodsApi
} from '../../model/goodsApi';
import { genPicURL } from '../../utils/genURL';

/** 获取商品列表 */
async function fetchGoodsListFromApi(pageIndex = 1, pageSize = 20) {
  console.log('[fetchGoodsListFromApi] 开始获取商品列表, 页码:', pageIndex, '每页数量:', pageSize);

  try {
    // 调用API获取所有商品数据
    const response = await getAllGoodsApi({
      user_id: 0
    }); // 暂时使用默认用户ID

    // 添加调试信息


    // 确保goods_list是数组
    if (!Array.isArray(response.goods_list)) {
      console.error('[fetchGoodsListFromApi] 获取的数据不是数组:', typeof response.goods_list);
      return [];
    }

    // 处理分页 - 确保pageIndex从1开始
    const safePageIndex = Math.max(1, pageIndex); // 确保页码至少为1
    const startIndex = (safePageIndex - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedGoods = response.goods_list.slice(startIndex, endIndex);

    // 添加分页调试信息

    // 处理商品列表数据，转换为前端需要的格式
    const goodsList = await Promise.all(paginatedGoods.map(async (item) => {
      // 转换图片URL
      let thumbUrl = '';
      if (Array.isArray(item.image_urls) && item.image_urls.length > 0) {
        try {
          thumbUrl = await genPicURL(item.image_urls[0]);
          console.log('[fetchGoodsListFromApi] 图片URL转换成功:', {
            original: item.image_urls[0],
            converted: thumbUrl
          });
        } catch (error) {
          console.error('[fetchGoodsListFromApi] 图片URL转换失败:', error);
          thumbUrl = item.image_urls[0]; // 转换失败时使用原始URL
        }
      }

      // 基于 repertory 字段计算库存状态
      const stockQuantity = item.repertory || 0;
      const hasStock = stockQuantity > 0;
      const isSoldOut = stockQuantity <= 0;
      
      const processedItem = {
        // 原有渲染需要的字段
        thumb: thumbUrl,
        title: item.title,
        price: item.price,
        originPrice: item.price, // 暂时使用相同价格作为原价
        tags: item.good_tag ? [item.good_tag] : [], // 将good_tag作为标签
        
        // 库存相关字段
        spuId: item.good_id, // 使用 good_id 作为 spuId
        spuStockQuantity: stockQuantity, // 库存数量
        isStock: hasStock, // 是否有库存
        soldout: isSoldOut, // 是否售罄
        maxPurchaseQuantity: stockQuantity, // 最大可购买数量
        
        // 新模型字段 - 添加到原有结构中
        id: item.id,
        del_state: item.del_state,
        del_time: item.del_time,
        create_time: item.create_time,
        good_id: item.good_id,
        good_tag: item.good_tag,
        farm_id: item.farm_id,
        units: item.units,
        repertory: item.repertory,
        detail: item.detail,
        
        // 为了兼容原有specList结构，将units添加到specList中
        specList: [{
          specId: 'units',
          title: '单位',
          specValueList: [{
            specValueId: 'units_value',
            specValue: item.units || '个'
          }]
        }]
      };
      
      // 打印每一个商品信息
      console.log('[fetchGoodsListFromApi] 商品信息:', processedItem);

      return processedItem;
    }));

    console.log('[fetchGoodsListFromApi] 成功处理商品列表, 数量:', goodsList.length);
    return goodsList;
  } catch (error) {
    console.error('[fetchGoodsListFromApi] 处理失败:', error);
    // 出错时返回空数组，避免应用崩溃
    return [];
  }
}

/** 获取商品列表 */
export function fetchGoodsList(pageIndex = 1, pageSize = 20) {
  console.log('[fetchGoodsList] 开始调用, 页码:', pageIndex, '每页数量:', pageSize);

  // 直接使用API获取数据
  console.log('[fetchGoodsList] 使用真实 API');
  return fetchGoodsListFromApi(pageIndex, pageSize);
}