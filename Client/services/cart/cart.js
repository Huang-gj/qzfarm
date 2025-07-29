import {
  config
} from '../../config/index';

/** 获取购物车mock数据 */
function mockFetchCartGroupData(params) {
  const {
    delay
  } = require('../_utils/delay');
  const {
    genCartGroupData
  } = require('../../model/cart');

  // 创建简化的数据结构
  return delay().then(() => {
    const data = genCartGroupData(params);
    // 简化后的购物车数据
    const cartData = {
      goodsList: [],
      invalidGoodItems: data.invalidGoodItems || [],
      isAllSelected: false,
      selectedGoodsCount: 0,
      totalAmount: '0',
      totalDiscountAmount: '0',
    };

    // 从嵌套结构中提取商品列表
    if (data.storeGoods && data.storeGoods.length > 0) {
      data.storeGoods.forEach(store => {
        if (store.promotionGoodsList && store.promotionGoodsList.length > 0) {
          store.promotionGoodsList.forEach(promotion => {
            if (promotion.goodsPromotionList && promotion.goodsPromotionList.length > 0) {
              cartData.goodsList = cartData.goodsList.concat(promotion.goodsPromotionList);
            }
          });
        }
      });
    }

    return {
      data: cartData
    };
  });
}

/** 获取购物车数据 */
export function fetchCartGroupData(params) {
  if (config.useMock) {
    return mockFetchCartGroupData(params);
  }

  return new Promise((resolve) => {
    resolve({
      data: {
        goodsList: [],
        invalidGoodItems: [],
        isAllSelected: false,
        selectedGoodsCount: 0,
        totalAmount: '0',
        totalDiscountAmount: '0',
      }
    });
  });
}

/** 获取农产品购物车数据 */
export function fetchGoodsCartData() {
  let cartData = wx.getStorageSync('goods_cart_data');
  
  console.log('[fetchGoodsCartData] 从本地存储获取农产品购物车数据:', cartData);
  
  if (!cartData) {
    cartData = {
      goodsList: [],
      invalidGoodItems: [],
      isAllSelected: false,
      selectedGoodsCount: 0,
      totalAmount: '0',
      totalDiscountAmount: '0',
    };
    console.log('[fetchGoodsCartData] 初始化空的农产品购物车数据');
  }

  console.log('[fetchGoodsCartData] 返回农产品购物车数据:', cartData);
  return Promise.resolve({
    data: cartData
  });
}

/** 获取土地购物车数据 */
export function fetchLandCartData() {
  let cartData = wx.getStorageSync('land_cart_data');
  
  console.log('[fetchLandCartData] 从本地存储获取土地购物车数据:', cartData);
  
  if (!cartData) {
    cartData = {
      goodsList: [],
      invalidGoodItems: [],
      isAllSelected: false,
      selectedGoodsCount: 0,
      totalAmount: '0',
      totalDiscountAmount: '0',
    };
    console.log('[fetchLandCartData] 初始化空的土地购物车数据');
  }

  console.log('[fetchLandCartData] 返回土地购物车数据:', cartData);
  return Promise.resolve({
    data: cartData
  });
}

/** 添加农产品到购物车 */
export function addGoodsToCart(goodsInfo) {
  console.log('[addGoodsToCart] 开始添加商品到购物车');
  console.log('[addGoodsToCart] 接收到的goodsInfo:', goodsInfo);
  console.log('[addGoodsToCart] goodsInfo.good_id:', goodsInfo.good_id);
  console.log('[addGoodsToCart] goodsInfo的类型:', typeof goodsInfo.good_id);
  
  try {
    // 获取现有的购物车数据
    const cartData = wx.getStorageSync('goods_cart_data') || [];
    console.log('[addGoodsToCart] 现有购物车数据:', cartData);
    
    // 检查商品是否已存在
    const existingIndex = cartData.findIndex(item => 
      item.good_id === goodsInfo.good_id && item.skuId === goodsInfo.skuId
    );
    
    console.log('[addGoodsToCart] 查找现有商品索引:', existingIndex);
    console.log('[addGoodsToCart] 查找条件 - good_id:', goodsInfo.good_id, 'skuId:', goodsInfo.skuId);
    
    if (existingIndex !== -1) {
      // 如果商品已存在，更新数量
      cartData[existingIndex].quantity += goodsInfo.quantity;
      console.log('[addGoodsToCart] 更新现有商品数量:', cartData[existingIndex]);
    } else {
      // 如果商品不存在，添加新商品
      const newItem = {
        ...goodsInfo,
        cartType: 'goods'
      };
      cartData.push(newItem);
      console.log('[addGoodsToCart] 添加新商品:', newItem);
    }
    
    // 保存到本地存储
    wx.setStorageSync('goods_cart_data', cartData);
    console.log('[addGoodsToCart] 保存后的购物车数据:', cartData);
    
    // 更新购物车数量
    updateCartNum();
    
    return {
      code: 'Success',
      message: '添加成功'
    };
  } catch (error) {
    console.error('[addGoodsToCart] 添加商品到购物车失败:', error);
    return {
      code: 'Error',
      message: error.message
    };
  }
}

/** 添加土地到购物车 */
export function addLandToCart(goodsInfo) {
  // 从本地缓存获取土地购物车数据
  let cartData = wx.getStorageSync('land_cart_data');

  // 如果之前没有购物车数据，初始化一个空的购物车
  if (!cartData) {
    cartData = {
      goodsList: [],
      invalidGoodItems: [],
      isAllSelected: false,
      selectedGoodsCount: 0,
      totalAmount: '0',
      totalDiscountAmount: '0',
    };
  }

  // 查找土地是否已经在购物车中
  let found = false;
  for (let i = 0; i < cartData.goodsList.length; i++) {
    if (cartData.goodsList[i].good_id === goodsInfo.good_id && cartData.goodsList[i].skuId === goodsInfo.skuId) {
      // 土地已存在，增加数量
      cartData.goodsList[i].quantity += goodsInfo.quantity || 1;
      found = true;
      break;
    }
  }

  // 如果土地不存在于购物车，添加新土地
  if (!found) {
    cartData.goodsList.push({
      uid: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
      saasId: '88888888',
      storeId: '1000', // 保留一个默认值
      good_id: goodsInfo.good_id,
      skuId: goodsInfo.skuId || '135681631',
      isSelected: 1,
      thumb: goodsInfo.thumb || goodsInfo.primaryImage,
      title: goodsInfo.title,
      primaryImage: goodsInfo.primaryImage,
      quantity: goodsInfo.quantity || 1,
      stockStatus: true,
      stockQuantity: goodsInfo.stockQuantity || 999, // 土地库存设为较大值
      price: goodsInfo.price || '0',
      originPrice: goodsInfo.originPrice || goodsInfo.price || '0',
      tagPrice: null,
      titlePrefixTags: null,
      roomId: null,
      specInfo: goodsInfo.specInfo || [],
      joinCartTime: new Date().toISOString(),
      available: 1,
      putOnSale: 1,
      etitle: null,
      cartType: 'land', // 标记为土地
    });
  }

  // 更新购物车数据
  updateCartTotalPrice(cartData);

  // 保存购物车数据到本地缓存
  wx.setStorageSync('land_cart_data', cartData);

  // 更新购物车数量显示
  updateCartNum();

  return Promise.resolve({
    code: 'Success',
    message: '添加成功'
  });
}

/** 兼容旧版本的添加商品到购物车 */
export function addToCart(goodsInfo) {
  // 根据商品信息判断是农产品还是土地
  if (goodsInfo.cartType === 'land' || goodsInfo.title && goodsInfo.title.includes('土地')) {
    return addLandToCart(goodsInfo);
  } else {
    return addGoodsToCart(goodsInfo);
  }
}

/** 更新购物车总价格 */
function updateCartTotalPrice(cartData) {
  let totalAmount = 0;
  let selectedGoodsCount = 0;

  // 计算总价
  cartData.goodsList.forEach(goods => {
    if (goods.isSelected) {
      totalAmount += parseFloat(goods.price) * goods.quantity;
      selectedGoodsCount += goods.quantity;
    }
  });

  // 更新购物车总价和选中商品数量
  cartData.totalAmount = totalAmount.toFixed(0);
  cartData.selectedGoodsCount = selectedGoodsCount;

  return cartData;
}

/** 更新购物车角标数量 */
export function updateCartNum() {
  let goodsCartData = wx.getStorageSync('goods_cart_data');
  let landCartData = wx.getStorageSync('land_cart_data');
  let count = 0;

  // 计算农产品购物车数量
  if (goodsCartData && goodsCartData.goodsList) {
    goodsCartData.goodsList.forEach(goods => {
      count += goods.quantity;
    });
  }

  // 计算土地购物车数量
  if (landCartData && landCartData.goodsList) {
    landCartData.goodsList.forEach(goods => {
      count += goods.quantity;
    });
  }

  try {
    // 更新全局数据
    const app = getApp();
    if (app) {
      app.globalData = app.globalData || {};
      app.globalData.cartCount = count;
      
      // 使用应用的全局方法刷新所有页面的购物车角标
      if (typeof app.refreshCartBadge === 'function') {
        app.refreshCartBadge();
      }
    }
    
    // 简单存储到本地，供自定义TabBar读取
    wx.setStorageSync('cart_count', count);
    
    // 发布购物车更新事件
    if (wx.eventCenter && typeof wx.eventCenter.emit === 'function') {
      wx.eventCenter.emit('cartUpdate', { count });
    }
  } catch (err) {
    console.log('更新购物车数量失败', err);
  }

  return count;
}

/** 获取购物车商品数量 */
export function getCartCount() {
  return updateCartNum();
}