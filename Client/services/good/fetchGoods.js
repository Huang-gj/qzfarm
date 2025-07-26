import {
  getAllGoodsApi
} from '../../model/goodsApi';

/** 获取商品列表 */
async function fetchGoodsListFromApi(pageIndex = 1, pageSize = 20) {
  console.log('[fetchGoodsListFromApi] 开始获取商品列表, 页码:', pageIndex, '每页数量:', pageSize);

  try {
    // 调用API获取所有商品数据
    const response = await getAllGoodsApi({
      user_id: 0
    }); // 暂时使用默认用户ID

    // 添加调试信息
    console.log('[fetchGoodsListFromApi] 完整响应数据:', response);
    console.log('[fetchGoodsListFromApi] response.goods_list:', response.goods_list);
    console.log('[fetchGoodsListFromApi] response.goods_list类型:', typeof response.goods_list);
    console.log('[fetchGoodsListFromApi] response.goods_list是否为数组:', Array.isArray(response.goods_list));

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
    console.log('[fetchGoodsListFromApi] 分页参数 - pageIndex:', pageIndex, 'safePageIndex:', safePageIndex, 'pageSize:', pageSize);
    console.log('[fetchGoodsListFromApi] 分页计算 - startIndex:', startIndex, 'endIndex:', endIndex);
    console.log('[fetchGoodsListFromApi] 原始商品数量:', response.goods_list.length);
    console.log('[fetchGoodsListFromApi] 分页后商品数量:', paginatedGoods.length);
    console.log('[fetchGoodsListFromApi] 分页后的商品数据:', paginatedGoods);

    // 处理商品列表数据，转换为前端需要的格式
    const goodsList = paginatedGoods.map((item) => {
      const processedItem = {
        // 新模型字段
        id: item.id,
        del_state: item.del_state,
        del_time: item.del_time,
        create_time: item.create_time,
        good_id: item.good_id,
        title: item.title,
        good_tag: item.good_tag,
        farm_id: item.farm_id,
        image_urls: item.image_urls,
        price: item.price,
        units: item.units,
        repertory: item.repertory,
        detail: item.detail
      };

      // 打印每一个商品信息
      console.log('[fetchGoodsListFromApi] 商品信息:', processedItem);

      return processedItem;
    });

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