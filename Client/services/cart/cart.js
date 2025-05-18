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

  return delay().then(() => genCartGroupData(params));
}

/** 获取购物车数据 */
export function fetchCartGroupData(params) {
  if (config.useMock) {
    return mockFetchCartGroupData(params);
  }

  return new Promise((resolve) => {
    resolve('real api');
  });
}

/** 添加商品到购物车 */
export function addToCart(goodsInfo) {
  // 从本地缓存获取购物车数据
  let cartData = wx.getStorageSync('cart_data');

  // 如果之前没有购物车数据，初始化一个空的购物车
  if (!cartData) {
    cartData = {
      storeGoods: [{
        storeId: '1000',
        storeName: '水果店',
        storeStatus: 1,
        totalDiscountSalePrice: '0',
        promotionGoodsList: [{

        }],
        lastJoinTime: new Date().toISOString(),
      }],
      invalidGoodItems: [],
      isAllSelected: false,
      selectedGoodsCount: 0,
      totalAmount: '0',
      totalDiscountAmount: '0',
    };
  }

  // 查找商品是否已经在购物车中
  let found = false;
  let store = cartData.storeGoods[0]; // 假设只有一个商店
  let goodsList = store.promotionGoodsList[0].goodsPromotionList; // 假设只有一个促销活动

  for (let i = 0; i < goodsList.length; i++) {
    if (goodsList[i].spuId === goodsInfo.spuId && goodsList[i].skuId === goodsInfo.skuId) {
      // 商品已存在，增加数量
      goodsList[i].quantity += goodsInfo.quantity || 1;
      found = true;
      break;
    }
  }

  // 如果商品不存在于购物车，添加新商品
  if (!found) {
    goodsList.push({
      uid: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
      saasId: '88888888',
      storeId: store.storeId,
      spuId: goodsInfo.spuId,
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
  cartData.storeGoods.forEach(store => {
    store.promotionGoodsList.forEach(promotion => {
      promotion.goodsPromotionList.forEach(goods => {
        if (goods.isSelected) {
          totalAmount += parseFloat(goods.price) * goods.quantity;
          selectedGoodsCount += goods.quantity;
        }
      });
    });
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

  if (cartData && cartData.storeGoods) {
    cartData.storeGoods.forEach(store => {
      store.promotionGoodsList.forEach(promotion => {
        promotion.goodsPromotionList.forEach(goods => {
          count += goods.quantity;
        });
      });
    });
  }

  // 设置tabBar购物车角标
  if (count > 0) {
    wx.setTabBarBadge({
      index: 2, // 购物车的tabBar位置索引
      text: count > 99 ? '99+' : count.toString()
    }).catch(err => console.log('设置TabBar角标失败', err));
  } else {
    wx.removeTabBarBadge({
      index: 2
    }).catch(err => console.log('移除TabBar角标失败', err));
  }

  return count;
}

/** 获取购物车商品数量 */
export function getCartCount() {
  return updateCartNum();
}