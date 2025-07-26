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

/** 添加商品到购物车 */
export function addToCart(goodsInfo) {
  // 从本地缓存获取购物车数据
  let cartData = wx.getStorageSync('cart_data');

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

  // 查找商品是否已经在购物车中
  let found = false;
  for (let i = 0; i < cartData.goodsList.length; i++) {
    if (cartData.goodsList[i].good_id === goodsInfo.good_id && cartData.goodsList[i].skuId === goodsInfo.skuId) {
      // 商品已存在，增加数量
      cartData.goodsList[i].quantity += goodsInfo.quantity || 1;
      found = true;
      break;
    }
  }

  // 如果商品不存在于购物车，添加新商品
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
      stockQuantity: goodsInfo.stockQuantity || 100,
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
    });
  }

  // 更新购物车数据
  updateCartTotalPrice(cartData);

  // 保存购物车数据到本地缓存
  wx.setStorageSync('cart_data', cartData);

  // 更新购物车数量显示
  updateCartNum();

  return Promise.resolve({
    code: 'Success',
    message: '添加成功'
  });
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
  let cartData = wx.getStorageSync('cart_data');
  let count = 0;

  if (cartData && cartData.goodsList) {
    cartData.goodsList.forEach(goods => {
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