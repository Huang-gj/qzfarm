/* eslint-disable no-param-reassign */
import { config } from '../../config/index';

/** 获取商品列表 */
async function mockFetchGoodsList(params) {
  console.log('[mockFetchGoodsList] 开始获取商品列表, 参数:', params);
  console.log('[mockFetchGoodsList] config.useMock 设置为:', config.useMock);
  
  try {
    const { delay } = require('../_utils/delay');
    const { getSearchResult } = require('../../model/search');
    
    console.log('[mockFetchGoodsList] 已加载 delay 和 getSearchResult 函数');
    
    // 提取排序参数，确保传递给getSearchResult
    const { sort = 0, sortType = 0 } = params;
    
    // 异步调用getSearchResult
    const data = await getSearchResult({
      ...params,
      sort,
      sortType
    });
    console.log('[mockFetchGoodsList] getSearchResult 返回数据:', data ? '成功' : '失败');
    
    // 确保spuList存在并且是数组
    if (data && data.spuList && data.spuList.length) {
      console.log('[mockFetchGoodsList] 商品列表数量:', data.spuList.length);
      data.spuList.forEach((item) => {
        item.good_id = item.good_id;
        item.thumb = item.primaryImage;
        item.title = item.title;
        item.price = item.minSalePrice;
        item.originPrice = item.maxLinePrice;
        item.desc = '';
        if (item.spuTagList) {
          item.tags = item.spuTagList.map((tag) => tag.title);
        } else {
          item.tags = [];
        }
      });
    } else {
      console.log('[mockFetchGoodsList] 商品列表为空或不存在');
      // 确保data包含必要的结构
      if (!data) data = {};
      if (!data.spuList) data.spuList = [];
    }
    
    return delay().then(() => {
      console.log('[mockFetchGoodsList] 处理完成，返回数据');
      return data;
    }).catch(error => {
      console.error('[mockFetchGoodsList] 获取商品列表失败:', error);
      throw error;
    });
  } catch (error) {
    console.error('[mockFetchGoodsList] 执行过程中出错:', error);
    throw error;
  }
}

/** 获取商品列表 */
export function fetchGoodsList(params) {
  console.log('[fetchGoodsList] 开始调用, 参数:', params);
  console.log('[fetchGoodsList] useMock 设置:', config.useMock);
  
  if (config.useMock) {
    console.log('[fetchGoodsList] 使用模拟数据');
    return mockFetchGoodsList(params);
  }
  
  console.log('[fetchGoodsList] 使用真实 API');
  return new Promise((resolve) => {
    resolve('real api');
  });
}
