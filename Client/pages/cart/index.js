import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  fetchGoodsCartData,
  fetchLandCartData,
  updateCartNum
} from '../../services/cart/cart';

Page({
  data: {
    cartGroupData: null,
    emptyCartImage: 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/TdesignCart (1).png',
    currentCartType: 'goods', // 当前购物车类型：goods-农产品，land-土地
    cartTypeList: [
      {
        name: '农产品',
        value: 'goods'
      },
      {
        name: '土地',
        value: 'land'
      }
    ]
  },

  // 调用自定义tabbar的init函数，使页面与tabbar激活状态保持一致
  onShow() {
    console.log('[cart] 页面显示');
    this.getTabBar().init();
    
    // 延迟刷新数据，避免与页面加载冲突
    setTimeout(() => {
      this.refreshData();
      updateCartNum(); // 更新购物车角标
    }, 100);
  },

  onLoad() {
    console.log('[cart] 页面加载，设置默认购物车类型为农产品');
    this.setData({
      currentCartType: 'goods'
    });
    this.refreshData();
  },

  // 切换购物车类型
  onCartTypeChange(e) {
    const { value } = e.detail;
    console.log('[cart] 切换购物车类型:', value);
    this.setData({
      currentCartType: value
    });
    this.refreshData();
  },

  refreshData() {
    // 防止重复调用
    if (this.isRefreshing) {
      console.log('[refreshData] 正在刷新中，跳过重复调用');
      return;
    }
    
    this.isRefreshing = true;
    console.log('[refreshData] 开始刷新购物车数据');
    console.log('[refreshData] 当前购物车类型:', this.data.currentCartType);
    
    const refreshPromise = this.data.currentCartType === 'goods' 
      ? fetchGoodsCartData()
      : fetchLandCartData();
    
    refreshPromise.then(res => {
      console.log('[refreshData] 购物车原始数据:', res);
      const cartData = res.data;
      console.log('[refreshData] 购物车数据:', cartData);
      
      // 转换为组件需要的格式
      const cartGroupData = this.convertCartDataToGroupFormat(cartData);
      console.log('[refreshData] 转换后的购物车数据:', cartGroupData);
      
      this.setData({
        cartGroupData,
      });
    }).catch(err => {
      console.error('[refreshData] 获取购物车数据失败:', err);
    }).finally(() => {
      this.isRefreshing = false;
    });
  },

  findGoods(good_id, skuId) {
    const {
      cartGroupData
    } = this.data;
    let goods = null;
    let storeIndex = -1;
    let promotionIndex = -1;
    let goodsIndex = -1;

    console.log('[findGoods] 查找商品:', { good_id, skuId });
    console.log('[findGoods] good_id类型:', typeof good_id);
    console.log('[findGoods] skuId类型:', typeof skuId);

    cartGroupData.storeGoods.forEach((store, storeIdx) => {
      store.promotionGoodsList.forEach((promotion, promotionIdx) => {
        promotion.goodsPromotionList.forEach((item, goodsIdx) => {
          console.log('[findGoods] 比较商品:', {
            item_good_id: item.good_id,
            item_skuId: item.skuId,
            target_good_id: good_id,
            target_skuId: skuId,
            good_id_match: item.good_id == good_id,
            skuId_match: item.skuId == skuId
          });
          
          if (item.good_id == good_id && item.skuId == skuId) {
            goods = item;
            storeIndex = storeIdx;
            promotionIndex = promotionIdx;
            goodsIndex = goodsIdx;
            console.log('[findGoods] 找到商品:', { storeIndex, promotionIndex, goodsIndex });
          }
        });
      });
    });

    console.log('[findGoods] 查找结果:', { goods, storeIndex, promotionIndex, goodsIndex });
    return {
      goods,
      storeIndex,
      promotionIndex,
      goodsIndex,
    };
  },

  getCartGroupData() {
    const { currentCartType } = this.data;
    return currentCartType === 'goods' ? fetchGoodsCartData() : fetchLandCartData();
  },

  // 将购物车数据转换为组件需要的格式
  convertCartDataToGroupFormat(cartData) {
    console.log('[convertCartDataToGroupFormat] 开始转换购物车数据格式');
    console.log('[convertCartDataToGroupFormat] 输入数据:', cartData);
    
    const { currentCartType } = this.data;
    const storeName = currentCartType === 'goods' ? '农产品购物车' : '土地购物车';
    
    // 检查是否有商品数据
    const hasGoods = cartData.goodsList && cartData.goodsList.length > 0;
    console.log('[convertCartDataToGroupFormat] 是否有商品数据:', hasGoods);
    console.log('[convertCartDataToGroupFormat] 商品列表长度:', cartData.goodsList ? cartData.goodsList.length : 0);
    
    // 构建组件需要的格式
    const cartGroupData = {
      storeGoods: [{
        storeId: '1',
        storeName: storeName,
        isSelected: cartData.isAllSelected || false,
        promotionGoodsList: [{
          promotionId: '1',
          promotionName: '',
          goodsPromotionList: cartData.goodsList || []
        }],
        shortageGoodsList: [] // 添加缺货商品列表
      }],
      invalidGoodItems: cartData.invalidGoodItems || [],
      isAllSelected: cartData.isAllSelected || false,
      selectedGoodsCount: cartData.selectedGoodsCount || 0,
      totalAmount: cartData.totalAmount || '0',
      totalDiscountAmount: cartData.totalDiscountAmount || '0',
      isNotEmpty: hasGoods // 添加这个属性来控制显示
    };
    
    console.log('[convertCartDataToGroupFormat] 转换后的数据:', cartGroupData);
    console.log('[convertCartDataToGroupFormat] 商品列表:', cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList);
    console.log('[convertCartDataToGroupFormat] isNotEmpty:', cartGroupData.isNotEmpty);
    console.log('[convertCartDataToGroupFormat] storeGoods长度:', cartGroupData.storeGoods.length);
    console.log('[convertCartDataToGroupFormat] promotionGoodsList长度:', cartGroupData.storeGoods[0].promotionGoodsList.length);
    console.log('[convertCartDataToGroupFormat] goodsPromotionList长度:', cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList.length);
    
    return cartGroupData;
  },

  selectGoodsService({
    good_id,
    skuId,
    isSelected
  }) {
    console.log('[selectGoodsService] 开始处理商品选择:', { good_id, skuId, isSelected });
    
    const {
      cartGroupData
    } = this.data;
    const {
      storeIndex,
      promotionIndex,
      goodsIndex
    } = this.findGoods(good_id, skuId);

    console.log('[selectGoodsService] 查找结果:', { storeIndex, promotionIndex, goodsIndex });

    if (goodsIndex > -1) {
      cartGroupData.storeGoods[storeIndex].promotionGoodsList[promotionIndex].goodsPromotionList[goodsIndex].isSelected = isSelected;
      console.log('[selectGoodsService] 更新商品选择状态成功');
      
      // 检查是否需要更新全选状态
      this.checkAndUpdateSelectAllStatus();
      
      this.setData({
        cartGroupData,
      });
    } else {
      console.error('[selectGoodsService] 未找到商品:', { good_id, skuId });
    }
  },

  selectStoreService({
    storeId,
    isSelected
  }) {
    console.log('[selectStoreService] 选择店铺服务:', { storeId, isSelected });
    
    const {
      cartGroupData
    } = this.data;
    cartGroupData.storeGoods.forEach((store) => {
      if (store.storeId === storeId) {
        store.isSelected = isSelected;
        store.promotionGoodsList.forEach((promotion) => {
          promotion.goodsPromotionList.forEach((goods) => {
            goods.isSelected = isSelected;
          });
        });
      }
    });
    
    // 检查是否需要更新全选状态
    this.checkAndUpdateSelectAllStatus();
    
    this.setData({
      cartGroupData,
    });
  },

  changeQuantityService({
    good_id,
    skuId,
    quantity
  }) {
    console.log('[changeQuantityService] 开始处理数量变化:', { good_id, skuId, quantity });
    
    const {
      cartGroupData
    } = this.data;
    const {
      storeIndex,
      promotionIndex,
      goodsIndex
    } = this.findGoods(good_id, skuId);

    console.log('[changeQuantityService] 查找结果:', { storeIndex, promotionIndex, goodsIndex });

    if (goodsIndex > -1) {
      cartGroupData.storeGoods[storeIndex].promotionGoodsList[promotionIndex].goodsPromotionList[goodsIndex].quantity = quantity;
      console.log('[changeQuantityService] 更新商品数量成功');
      this.setData({
        cartGroupData,
      });
    } else {
      console.error('[changeQuantityService] 未找到商品:', { good_id, skuId });
    }
  },

  deleteGoodsService({
    good_id,
    skuId
  }) {
    console.log('[deleteGoodsService] 开始删除商品:', { good_id, skuId });
    
    const {
      cartGroupData
    } = this.data;
    const {
      storeIndex,
      promotionIndex,
      goodsIndex
    } = this.findGoods(good_id, skuId);

    console.log('[deleteGoodsService] 查找结果:', { storeIndex, promotionIndex, goodsIndex });

    if (goodsIndex > -1) {
      // 删除商品
      cartGroupData.storeGoods[storeIndex].promotionGoodsList[promotionIndex].goodsPromotionList.splice(goodsIndex, 1);
      console.log('[deleteGoodsService] 商品删除成功');
      
      // 如果该店铺没有商品了，可以选择删除整个店铺
      if (cartGroupData.storeGoods[storeIndex].promotionGoodsList[promotionIndex].goodsPromotionList.length === 0) {
        console.log('[deleteGoodsService] 店铺商品为空，删除店铺');
        cartGroupData.storeGoods.splice(storeIndex, 1);
      }
      
      // 检查是否需要更新全选状态
      this.checkAndUpdateSelectAllStatus();
      
      this.setData({
        cartGroupData,
      });
    } else {
      console.error('[deleteGoodsService] 未找到要删除的商品:', { good_id, skuId });
    }
  },

  updateLocalStorage() {
    const { currentCartType, cartGroupData } = this.data;
    const storageKey = currentCartType === 'goods' ? 'goods_cart_data' : 'land_cart_data';
    
    // 提取商品列表
    let goodsList = [];
    if (cartGroupData.storeGoods && cartGroupData.storeGoods.length > 0) {
      cartGroupData.storeGoods.forEach(store => {
        if (store.promotionGoodsList && store.promotionGoodsList.length > 0) {
          store.promotionGoodsList.forEach(promotion => {
            if (promotion.goodsPromotionList && promotion.goodsPromotionList.length > 0) {
              goodsList = goodsList.concat(promotion.goodsPromotionList);
            }
          });
        }
      });
    }

    // 保存到本地存储
    const cartData = {
      goodsList,
      invalidGoodItems: cartGroupData.invalidGoodItems || [],
      isAllSelected: cartGroupData.isAllSelected || false,
      selectedGoodsCount: cartGroupData.selectedGoodsCount || 0,
      totalAmount: cartGroupData.totalAmount || '0',
      totalDiscountAmount: cartGroupData.totalDiscountAmount || '0',
    };

    wx.setStorageSync(storageKey, cartData);
    updateCartNum(); // 更新购物车角标
  },

  clearInvalidGoodsService() {
    const {
      cartGroupData
    } = this.data;
    cartGroupData.invalidGoods = [];
    this.setData({
      cartGroupData,
    });
  },

  // 更新购物车总价和选中商品数量
  updateCartTotalPrice() {
    const { cartGroupData } = this.data;
    let totalAmount = 0;
    let selectedGoodsCount = 0;

    console.log('[updateCartTotalPrice] 开始计算总价');

    // 遍历所有商品，计算选中商品的总价和数量
    if (cartGroupData.storeGoods && cartGroupData.storeGoods.length > 0) {
      cartGroupData.storeGoods.forEach(store => {
        if (store.promotionGoodsList && store.promotionGoodsList.length > 0) {
          store.promotionGoodsList.forEach(promotion => {
            if (promotion.goodsPromotionList && promotion.goodsPromotionList.length > 0) {
              promotion.goodsPromotionList.forEach(goods => {
                if (goods.isSelected) {
                  const price = parseFloat(goods.price) || 0;
                  const quantity = parseInt(goods.quantity) || 0;
                  const itemTotal = price * quantity;
                  totalAmount += itemTotal;
                  selectedGoodsCount += quantity;
                  
                  console.log('[updateCartTotalPrice] 商品计算:', {
                    title: goods.title,
                    price,
                    quantity,
                    itemTotal,
                    isSelected: goods.isSelected
                  });
                }
              });
            }
          });
        }
      });
    }

    // 更新总价和选中商品数量
    cartGroupData.totalAmount = totalAmount.toFixed(2);
    cartGroupData.selectedGoodsCount = selectedGoodsCount;

    console.log('[updateCartTotalPrice] 计算结果:', {
      totalAmount: cartGroupData.totalAmount,
      selectedGoodsCount: cartGroupData.selectedGoodsCount
    });

    this.setData({
      cartGroupData,
    });
  },

  // 检查并更新全选状态
  checkAndUpdateSelectAllStatus() {
    const { cartGroupData } = this.data;
    let allSelected = true;
    let hasGoods = false;

    // 检查是否所有商品都被选中
    if (cartGroupData.storeGoods && cartGroupData.storeGoods.length > 0) {
      cartGroupData.storeGoods.forEach(store => {
        if (store.promotionGoodsList && store.promotionGoodsList.length > 0) {
          store.promotionGoodsList.forEach(promotion => {
            if (promotion.goodsPromotionList && promotion.goodsPromotionList.length > 0) {
              promotion.goodsPromotionList.forEach(goods => {
                hasGoods = true;
                if (!goods.isSelected) {
                  allSelected = false;
                }
              });
            }
          });
        }
      });
    }

    // 只有在有商品的情况下才更新全选状态
    if (hasGoods && cartGroupData.isAllSelected !== allSelected) {
      cartGroupData.isAllSelected = allSelected;
      console.log('[checkAndUpdateSelectAllStatus] 更新全选状态:', allSelected);
      
      this.setData({
        cartGroupData,
      });
    }
  },

  onGoodsSelect(e) {
    console.log('[onGoodsSelect] 收到商品选择事件:', e.detail);
    const {
      goods,
      isSelected
    } = e.detail;
    
    // 从goods对象中提取good_id和skuId
    const good_id = goods.good_id;
    const skuId = goods.skuId;
    
    console.log('[onGoodsSelect] 提取的数据:', { good_id, skuId, isSelected });
    
    this.selectGoodsService({
      good_id,
      skuId,
      isSelected
    });
    
    // 重新计算总价和选中商品数量
    this.updateCartTotalPrice();
    
    this.updateLocalStorage();
  },

  onStoreSelect(e) {
    console.log('[onStoreSelect] 收到店铺选择事件:', e.detail);
    const {
      store,
      isSelected
    } = e.detail;
    
    // 从store对象中提取storeId
    const storeId = store.storeId;
    
    console.log('[onStoreSelect] 提取的数据:', { storeId, isSelected });
    
    this.selectStoreService({
      storeId,
      isSelected
    });
    
    // 重新计算总价和选中商品数量
    this.updateCartTotalPrice();
    
    this.updateLocalStorage();
  },

  onQuantityChange(e) {
    console.log('[onQuantityChange] 收到数量变化事件:', e.detail);
    const {
      goods,
      quantity
    } = e.detail;
    
    // 从goods对象中提取good_id和skuId
    const good_id = goods.good_id;
    const skuId = goods.skuId;
    
    console.log('[onQuantityChange] 提取的数据:', { good_id, skuId, quantity });
    
    this.changeQuantityService({
      good_id,
      skuId,
      quantity
    });
    
    // 重新计算总价和选中商品数量
    this.updateCartTotalPrice();
    
    this.updateLocalStorage();
  },

  goCollect() {
    wx.navigateTo({
      url: '/pages/collect/index',
    });
  },

  goGoodsDetail(e) {
    const { goods } = e.detail;
    const { currentCartType } = this.data;
    
    console.log('[goGoodsDetail] 点击的商品信息:', e.detail);
    console.log('[goGoodsDetail] goods对象:', goods);
    console.log('[goGoodsDetail] 当前购物车类型:', currentCartType);
    console.log('[goGoodsDetail] goods对象的完整内容:', JSON.stringify(goods, null, 2));
    
    // 从goods对象中提取good_id和skuId
    const good_id = goods.good_id;
    const skuId = goods.skuId;
    
    console.log('[goGoodsDetail] 提取的good_id:', good_id);
    console.log('[goGoodsDetail] 提取的skuId:', skuId);
    console.log('[goGoodsDetail] good_id的类型:', typeof good_id);
    console.log('[goGoodsDetail] good_id的值:', good_id);
    
    // 验证数据完整性
    if (!good_id) {
      console.error('[goGoodsDetail] good_id为空，无法跳转');
      wx.showToast({
        title: '商品信息不完整',
        icon: 'none'
      });
      return;
    }
    
    // 根据购物车类型跳转到对应的详情页面
    if (currentCartType === 'goods') {
      const url = `/pages/goods/details/index?goodId=${good_id}&skuId=${skuId || ''}`;
      console.log('[goGoodsDetail] 跳转到商品详情页面:', url);
      wx.navigateTo({
        url: url,
      });
    } else {
      // 土地详情页面使用landId参数，与首页保持一致
      const url = `/pages/land/details/index?landId=${good_id}&skuId=${skuId || ''}`;
      console.log('[goGoodsDetail] 跳转到土地详情页面:', url);
      wx.navigateTo({
        url: url,
      });
    }
  },

  clearInvalidGoods() {
    this.clearInvalidGoodsService();
    this.updateLocalStorage();
  },

  onGoodsDelete(e) {
    console.log('[onGoodsDelete] 收到删除事件:', e.detail);
    const {
      goods
    } = e.detail;
    
    // 从goods对象中提取good_id和skuId
    const good_id = goods.good_id;
    const skuId = goods.skuId;
    
    console.log('[onGoodsDelete] 提取的数据:', { good_id, skuId });
    
    Dialog.confirm({
      context: this,
      selector: '#t-dialog',
      title: '确认删除',
      content: '确定要删除这个商品吗？',
      confirmBtn: '删除',
      cancelBtn: '取消',
    }).then(() => {
      this.deleteGoodsService({
        good_id,
        skuId
      });
      this.updateLocalStorage();
      Toast({
        context: this,
        selector: '#t-toast',
        message: '删除成功',
        icon: 'check-circle',
        duration: 1000,
      });
    });
  },

  onSelectAll(event) {
    const {
      isAllSelected
    } = event.detail;
    const {
      cartGroupData
    } = this.data;
    
    console.log('[onSelectAll] 全选状态变化:', isAllSelected);
    
    cartGroupData.isAllSelected = isAllSelected;
    cartGroupData.storeGoods.forEach((store) => {
      store.isSelected = isAllSelected;
      store.promotionGoodsList.forEach((promotion) => {
        promotion.goodsPromotionList.forEach((goods) => {
          goods.isSelected = isAllSelected;
        });
      });
    });
    
    // 重新计算总价和选中商品数量
    this.updateCartTotalPrice();
    
    this.setData({
      cartGroupData,
    });
    this.updateLocalStorage();
  },

  onToSettle() {
    const { currentCartType, cartGroupData } = this.data;
    
    // 获取选中的商品
    let selectedGoods = [];
    if (cartGroupData.storeGoods && cartGroupData.storeGoods.length > 0) {
      cartGroupData.storeGoods.forEach(store => {
        if (store.promotionGoodsList && store.promotionGoodsList.length > 0) {
          store.promotionGoodsList.forEach(promotion => {
            if (promotion.goodsPromotionList && promotion.goodsPromotionList.length > 0) {
              promotion.goodsPromotionList.forEach(goods => {
                if (goods.isSelected) {
                  selectedGoods.push(goods);
                }
              });
            }
          });
        }
      });
    }

    if (selectedGoods.length === 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择要结算的商品',
        icon: '',
        duration: 1000,
      });
      return;
    }

    // 跳转到结算页面，传递购物车类型
    const query = {
      goodsRequestList: JSON.stringify(selectedGoods),
      cartType: currentCartType
    };
    
    let urlQueryStr = Object.keys(query).map(key => `${key}=${encodeURIComponent(query[key])}`).join('&');
    const path = `/pages/order/order-confirm/index?${urlQueryStr}`;
    
    wx.navigateTo({
      url: path,
    });
  },

  onGotoHome() {
    wx.switchTab({
      url: '/pages/home/home',
    });
  },
});