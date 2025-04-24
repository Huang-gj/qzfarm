import {
  config
} from '../../config/index';

/** 获取商品列表 */
async function mockFetchGoodsList(pageIndex = 1, pageSize = 20) {
  console.log('[mockFetchGoodsList] 开始获取商品列表, 页码:', pageIndex, '每页数量:', pageSize);

  try {
    const {
      delay
    } = require('../_utils/delay');
    const {
      getGoodsList
    } = require('../../model/goods');

    // 使用await直接获取结果，而不是使用then链
    const goodsData = await getGoodsList(pageIndex, pageSize);

    // 确保goodsData是数组
    if (!Array.isArray(goodsData)) {
      console.error('[mockFetchGoodsList] 获取的数据不是数组:', typeof goodsData);
      return [];
    }

    // 处理商品列表数据
    const goodsList = goodsData.map((item) => {
      return {
        spuId: item.spuId,
        thumb: item.primaryImage,
        title: item.title,
        price: item.minSalePrice,
        originPrice: item.maxLinePrice,
        tags: item.spuTagList ? item.spuTagList.map((tag) => tag.title) : [],
      };
    });

    console.log('[mockFetchGoodsList] 成功处理商品列表, 数量:', goodsList.length);

    // 应用延迟并返回结果
    await delay();
    return goodsList;
  } catch (error) {
    console.error('[mockFetchGoodsList] 处理失败:', error);
    // 出错时返回空数组，避免应用崩溃
    return [];
  }
}

/** 获取商品列表 */
export function fetchGoodsList(pageIndex = 1, pageSize = 20) {
  console.log('[fetchGoodsList] 开始调用, 页码:', pageIndex, '每页数量:', pageSize);
  console.log('[fetchGoodsList] useMock 设置:', config.useMock);

  if (config.useMock) {
    console.log('[fetchGoodsList] 使用模拟数据');
    return mockFetchGoodsList(pageIndex, pageSize);
  }

  console.log('[fetchGoodsList] 使用真实 API');
  return new Promise((resolve) => {
    resolve('real api');
  });
}