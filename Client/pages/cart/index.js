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
    this.getTabBar().init();
    this.refreshData();
    updateCartNum(); // 更新购物车角标
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
    console.log('[refreshData] 开始刷新购物车数据');
    console.log('[refreshData] 当前购物车类型:', this.data.currentCartType);
    
    if (this.data.currentCartType === 'goods') {
      console.log('[refreshData] 获取农产品购物车数据');
      fetchGoodsCartData().then(res => {
        console.log('[refreshData] 农产品购物车原始数据:', res);
        const cartData = res.data;
        console.log('[refreshData] 农产品购物车数据:', cartData);
        
        // 转换为组件需要的格式
        const cartGroupData = this.convertCartDataToGroupFormat(cartData);
        console.log('[refreshData] 转换后的购物车数据:', cartGroupData);
        
        this.setData({
          cartGroupData,
        });
      }).catch(err => {
        console.error('[refreshData] 获取农产品购物车数据失败:', err);
      });
    } else {
      console.log('[refreshData] 获取土地购物车数据');
      fetchLandCartData().then(res => {
        console.log('[refreshData] 土地购物车原始数据:', res);
        const cartData = res.data;
        console.log('[refreshData] 土地购物车数据:', cartData);
        
        // 转换为组件需要的格式
        const cartGroupData = this.convertCartDataToGroupFormat(cartData);
        console.log('[refreshData] 转换后的购物车数据:', cartGroupData);
        
        this.setData({
          cartGroupData,
        });
      }).catch(err => {
        console.error('[refreshData] 获取土地购物车数据失败:', err);
      });
    }
  },

  findGoods(good_id, skuId) {
    const {
      cartGroupData
    } = this.data;
    let goods = null;
    let storeIndex = -1;
    let promotionIndex = -1;
    let goodsIndex = -1;

    cartGroupData.storeGoods.forEach((store, storeIdx) => {
      store.promotionGoodsList.forEach((promotion, promotionIdx) => {
        promotion.goodsPromotionList.forEach((item, goodsIdx) => {
          if (item.good_id === good_id && item.skuId === skuId) {
            goods = item;
            storeIndex = storeIdx;
            promotionIndex = promotionIdx;
            goodsIndex = goodsIdx;
          }
        });
      });
    });

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
        }]
      }],
      invalidGoodItems: cartData.invalidGoodItems || [],
      isAllSelected: cartData.isAllSelected || false,
      selectedGoodsCount: cartData.selectedGoodsCount || 0,
      totalAmount: cartData.totalAmount || '0',
      totalDiscountAmount: cartData.totalDiscountAmount || '0'
    };
    
    console.log('[convertCartDataToGroupFormat] 转换后的数据:', cartGroupData);
    console.log('[convertCartDataToGroupFormat] 商品列表:', cartGroupData.storeGoods[0].promotionGoodsList[0].goodsPromotionList);
    
    return cartGroupData;
  },

  selectGoodsService({
    good_id,
    skuId,
    isSelected
  }) {
    const {
      cartGroupData
    } = this.data;
    const {
      storeIndex,
      promotionIndex,
      goodsIndex
    } = this.findGoods(good_id, skuId);

    if (goodsIndex > -1) {
      cartGroupData.storeGoods[storeIndex].promotionGoodsList[promotionIndex].goodsPromotionList[goodsIndex].isSelected = isSelected;
      this.setData({
        cartGroupData,
      });
    }
  },

  selectStoreService({
    storeId,
    isSelected
  }) {
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
    this.setData({
      cartGroupData,
    });
  },

  changeQuantityService({
    good_id,
    skuId,
    quantity
  }) {
    const {
      cartGroupData
    } = this.data;
    const {
      storeIndex,
      promotionIndex,
      goodsIndex
    } = this.findGoods(good_id, skuId);

    if (goodsIndex > -1) {
      cartGroupData.storeGoods[storeIndex].promotionGoodsList[promotionIndex].goodsPromotionList[goodsIndex].quantity = quantity;
      this.setData({
        cartGroupData,
      });
    }
  },

  deleteGoodsService({
    good_id,
    skuId
  }) {
    const {
      cartGroupData
    } = this.data;
    const {
      storeIndex,
      promotionIndex,
      goodsIndex
    } = this.findGoods(good_id, skuId);

    if (goodsIndex > -1) {
      cartGroupData.storeGoods[storeIndex].promotionGoodsList[promotionIndex].goodsPromotionList.splice(goodsIndex, 1);
      this.setData({
        cartGroupData,
      });
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

  onGoodsSelect(e) {
    const {
      good_id,
      skuId,
      isSelected
    } = e.detail;
    this.selectGoodsService({
      good_id,
      skuId,
      isSelected
    });
    this.updateLocalStorage();
  },

  onStoreSelect(e) {
    const {
      storeId,
      isSelected
    } = e.detail;
    this.selectStoreService({
      storeId,
      isSelected
    });
    this.updateLocalStorage();
  },

  onQuantityChange(e) {
    const {
      good_id,
      skuId,
      quantity
    } = e.detail;
    this.changeQuantityService({
      good_id,
      skuId,
      quantity
    });
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
    const {
      good_id,
      skuId
    } = e.detail;
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
    cartGroupData.isAllSelected = isAllSelected;
    cartGroupData.storeGoods.forEach((store) => {
      store.isSelected = isAllSelected;
      store.promotionGoodsList.forEach((promotion) => {
        promotion.goodsPromotionList.forEach((goods) => {
          goods.isSelected = isAllSelected;
        });
      });
    });
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