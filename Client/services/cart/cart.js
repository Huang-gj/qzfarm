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
  
  // 检查数据版本，如果发现缺少关键字段，清除缓存重新开始
  if (cartData && cartData.goodsList && Array.isArray(cartData.goodsList)) {
    const sampleItem = cartData.goodsList[0];
    if (sampleItem && sampleItem.farm_id === undefined) {
      console.log('[fetchGoodsCartData] 检测到旧版本数据缺少farm_id字段，清除缓存');
      wx.removeStorageSync('goods_cart_data');
      cartData = null;
    }
  }
  
  // 处理旧格式数据（数组格式）转换为新格式
  if (Array.isArray(cartData)) {
    console.log('[fetchGoodsCartData] 检测到旧格式数据，正在转换...');
    const convertedData = {
      goodsList: cartData.map(item => ({
        uid: item.uid || `${Date.now()}${Math.floor(Math.random() * 1000)}`,
        saasId: item.saasId || '88888888',
        storeId: item.storeId || '1',
        good_id: item.good_id,
        skuId: item.skuId,
        isSelected: item.isSelected || 1,
        thumb: item.thumb || item.primaryImage,
        title: item.title,
        primaryImage: item.primaryImage,
        quantity: item.quantity,
        stockStatus: item.stockStatus || true,
        stockQuantity: item.stockQuantity || 999,
        price: item.price || '0',
        originPrice: item.originPrice || item.price || '0',
        tagPrice: item.tagPrice || null,
        titlePrefixTags: item.titlePrefixTags || null,
        roomId: item.roomId || null,
        specInfo: item.specInfo || [],
        joinCartTime: item.joinCartTime || new Date().toISOString(),
        available: item.available || 1,
        putOnSale: item.putOnSale || 1,
        etitle: item.etitle || null,
        cartType: item.cartType || 'goods',
        farm_id: item.farm_id,
        farm_address: item.farm_address || '',
        units: item.units || '个',
        detail: item.detail || ''
      })),
      invalidGoodItems: [],
      isAllSelected: false,
      selectedGoodsCount: 0,
      totalAmount: '0',
      totalDiscountAmount: '0',
    };
    
    // 更新购物车总价和选中商品数量
    updateCartTotalPrice(convertedData);
    
    // 保存转换后的数据
    wx.setStorageSync('goods_cart_data', convertedData);
    cartData = convertedData;
    console.log('[fetchGoodsCartData] 数据转换完成:', cartData);
  }
  
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
  
  // 检查数据版本，如果发现缺少关键字段，清除缓存重新开始
  if (cartData && cartData.goodsList && Array.isArray(cartData.goodsList)) {
    const sampleItem = cartData.goodsList[0];
    if (sampleItem && sampleItem.farm_id === undefined) {
      console.log('[fetchLandCartData] 检测到旧版本数据缺少farm_id字段，清除缓存');
      wx.removeStorageSync('land_cart_data');
      cartData = null;
    }
  }
  
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
  
  return new Promise((resolve, reject) => {
    try {
      // 获取现有的购物车数据，确保格式正确
      let cartData = wx.getStorageSync('goods_cart_data');
      console.log('[addGoodsToCart] 现有购物车数据:', cartData);
      
      // 如果数据不存在或格式不正确，初始化为正确的格式
      if (!cartData || !cartData.goodsList) {
        cartData = {
          goodsList: [],
          invalidGoodItems: [],
          isAllSelected: false,
          selectedGoodsCount: 0,
          totalAmount: '0',
          totalDiscountAmount: '0',
        };
        console.log('[addGoodsToCart] 初始化新的购物车数据格式');
      }
      
      // 检查商品是否已存在
      const existingIndex = cartData.goodsList.findIndex(item => 
        item.good_id === goodsInfo.good_id && item.skuId === goodsInfo.skuId
      );
      
      console.log('[addGoodsToCart] 查找现有商品索引:', existingIndex);
      console.log('[addGoodsToCart] 查找条件 - good_id:', goodsInfo.good_id, 'skuId:', goodsInfo.skuId);
      
      if (existingIndex !== -1) {
        // 如果商品已存在，更新数量
        cartData.goodsList[existingIndex].quantity += goodsInfo.quantity;
        console.log('[addGoodsToCart] 更新现有商品数量:', cartData.goodsList[existingIndex]);
      } else {
        // 如果商品不存在，添加新商品
        // 确保图片URL是字符串类型
        let processedPrimaryImage = goodsInfo.primaryImage;
        if (Array.isArray(processedPrimaryImage)) {
          processedPrimaryImage = processedPrimaryImage[0] || '';
        } else if (typeof processedPrimaryImage !== 'string') {
          processedPrimaryImage = String(processedPrimaryImage || '');
        }
        
        console.log('[addGoodsToCart] 处理后的图片URL:', processedPrimaryImage);
        
        const newItem = {
          uid: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
          saasId: '88888888',
          storeId: '1',
          good_id: goodsInfo.good_id,
          skuId: goodsInfo.skuId,
          isSelected: 1,
          thumb: processedPrimaryImage,
          title: goodsInfo.title,
          primaryImage: processedPrimaryImage,
          quantity: goodsInfo.quantity,
          stockStatus: true,
          stockQuantity: goodsInfo.stockQuantity || 999,
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
          cartType: 'goods',
          farm_id: goodsInfo.farm_id,
          farm_address: goodsInfo.farm_address || '',
          units: goodsInfo.units || '个',
          detail: goodsInfo.detail || ''
        };
        cartData.goodsList.push(newItem);
        console.log('[addGoodsToCart] 添加新商品:', newItem);
      }
      
      // 更新购物车总价和选中商品数量
      updateCartTotalPrice(cartData);
      
      // 保存到本地存储
      wx.setStorageSync('goods_cart_data', cartData);
      console.log('[addGoodsToCart] 保存后的购物车数据:', cartData);
      
      // 更新购物车数量
      updateCartNum();
      
        // 通知购物车页面刷新数据
  try {
    if (wx.eventCenter && typeof wx.eventCenter.emit === 'function') {
      wx.eventCenter.emit('cartDataUpdate', {
        type: 'goods',
        action: 'add',
        data: cartData,
        ts: Date.now()
      });
    }
  } catch (e) {
    console.log('[addGoodsToCart] 发送事件通知失败:', e);
  }
      
      resolve({
        code: 'Success',
        message: '添加成功'
      });
    } catch (error) {
      console.error('[addGoodsToCart] 添加商品到购物车失败:', error);
      reject({
        code: 'Error',
        message: error.message
      });
    }
  });
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
      // 土地已存在，但土地商品数量限制为1，不增加数量
      console.log('[addLandToCart] 土地已存在于购物车中，不增加数量');
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
      quantity: 1, // 土地商品数量固定为1
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
      farm_id: goodsInfo.farm_id,
      farm_address: goodsInfo.farm_address || '',
      units: goodsInfo.units || '个月',
      detail: goodsInfo.detail || ''
    });
  }

  // 更新购物车数据
  updateCartTotalPrice(cartData);

  // 保存购物车数据到本地缓存
  wx.setStorageSync('land_cart_data', cartData);

  // 更新购物车数量显示
  updateCartNum();

  // 通知购物车页面刷新数据
  try {
    if (wx.eventCenter && typeof wx.eventCenter.emit === 'function') {
      wx.eventCenter.emit('cartDataUpdate', {
        type: 'land',
        action: 'add',
        data: cartData,
        ts: Date.now()
      });
    }
  } catch (e) {
    console.log('[addLandToCart] 发送事件通知失败:', e);
  }

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

  console.log('[updateCartTotalPrice] 开始计算购物车总价');
  console.log('[updateCartTotalPrice] 商品列表:', cartData.goodsList);

  // 计算总价
  cartData.goodsList.forEach((goods, index) => {
    console.log(`[updateCartTotalPrice] 商品${index + 1}:`, {
      title: goods.title,
      price: goods.price,
      quantity: goods.quantity,
      isSelected: goods.isSelected,
      priceType: typeof goods.price,
      quantityType: typeof goods.quantity
    });
    
    if (goods.isSelected) {
      const price = parseFloat(goods.price) || 0;
      const quantity = parseInt(goods.quantity) || 0;
      const itemTotal = price * quantity;
      
      totalAmount += itemTotal;
      selectedGoodsCount += quantity;
      
      console.log(`[updateCartTotalPrice] 选中商品计算:`, {
        title: goods.title,
        price,
        quantity,
        itemTotal,
        runningTotal: totalAmount,
        runningCount: selectedGoodsCount
      });
    }
  });

  // 更新购物车总价和选中商品数量
  cartData.totalAmount = totalAmount.toFixed(2);
  cartData.selectedGoodsCount = selectedGoodsCount;

  console.log('[updateCartTotalPrice] 最终计算结果:', {
    totalAmount: cartData.totalAmount,
    selectedGoodsCount: cartData.selectedGoodsCount
  });

  return cartData;
}

// 防重复调用标志
let isUpdatingCartNum = false;

/** 更新购物车角标数量 */
export function updateCartNum() {
  // 防止重复调用
  if (isUpdatingCartNum) {
    console.log('[updateCartNum] 正在更新中，跳过重复调用');
    return 0;
  }
  
  isUpdatingCartNum = true;
  
  try {
    let goodsCartData = wx.getStorageSync('goods_cart_data');
    let landCartData = wx.getStorageSync('land_cart_data');
    let count = 0;

    // 计算农产品购物车数量
    if (goodsCartData) {
      // 兼容旧格式（数组）和新格式（对象）
      if (Array.isArray(goodsCartData)) {
        goodsCartData.forEach(goods => {
          count += goods.quantity || 0;
        });
      } else if (goodsCartData.goodsList) {
        goodsCartData.goodsList.forEach(goods => {
          count += goods.quantity || 0;
        });
      }
    }

    // 计算土地购物车数量
    if (landCartData && landCartData.goodsList) {
      landCartData.goodsList.forEach(goods => {
        count += goods.quantity || 0;
      });
    }

    console.log('[updateCartNum] 计算出的购物车数量:', count);

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
    
    return count;
  } catch (err) {
    console.error('[updateCartNum] 更新购物车数量失败', err);
    return 0;
  } finally {
    // 重置标志
    isUpdatingCartNum = false;
  }
}

/** 获取购物车商品数量 */
export function getCartCount() {
  return updateCartNum();
}