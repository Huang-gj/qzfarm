import { config } from '../../config/index';

/** 获取商品列表 */
function mockFetchGood(ID = 0) {
  console.log('[mockFetchGood] 开始获取商品，ID:', ID);
  console.log('[mockFetchGood] config.useMock 设置为:', config.useMock);
  
  try {
    const { delay } = require('../_utils/delay');
    const { genGood } = require('../../model/good');
    
    console.log('[mockFetchGood] 已加载 delay 和 genGood 函数');
    
    // 首先调用异步的 genGood 函数获取商品数据
    return genGood(ID)
      .then(good => {
        console.log('[mockFetchGood] 成功获取商品数据:', good ? '获取成功' : '获取失败');
        // 然后应用延迟
        return delay().then(() => good);
      })
      .catch(error => {
        console.error('[mockFetchGood] 获取商品数据失败:', error);
        throw error;
      });
  } catch (error) {
    console.error('[mockFetchGood] 执行过程中出错:', error);
    throw error;
  }
}

/** 获取商品列表 */
export function fetchGood(ID = 0) {
  console.log('[fetchGood] 开始调用, ID:', ID);
  console.log('[fetchGood] useMock 设置:', config.useMock);
  
  if (config.useMock) {
    console.log('[fetchGood] 使用模拟数据');
    return mockFetchGood(ID);
  }
  console.log('[fetchGood] 使用真实 API');
  return new Promise((resolve) => {
    resolve('real api');
  });
}

// 获取单个商品的基本信息
