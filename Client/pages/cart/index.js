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
      // 强制刷新数据，确保显示最新的购物车内容
      console.log('[onShow] 确保购物车数据一致性');
      this.ensureDataConsistency();
      updateCartNum(); // 更新购物车角标
    }, 100);
  },

  onLoad() {
    console.log('[cart] 页面加载，设置默认购物车类型为农产品');
    this.setData({
      currentCartType: 'goods'
    });
    this.refreshData();
    
    // 监听购物车数据更新事件
    this.setupEventListeners();

    // 页面初次加载后，确保只预刷新农产品购物车数据
    setTimeout(() => {
      console.log('[onLoad] 预刷新农产品购物车数据');
      this.refreshData();
    }, 0);
  },

  onUnload() {
    console.log('[cart] 页面卸载，清理事件监听器');
    this.cleanupEventListeners();
  },

  // 切换购物车类型
  onCartTypeChange(e) {
    const { value } = e.detail;
    console.log('[cart] 切换购物车类型:', value);

    // 检查是否切换到土地购物车
    if (value === 'land') {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '土地购物车功能暂时不支持',
        icon: 'info-circle',
        duration: 2000,
      });
      return;
    }

    this.setData({
      currentCartType: value
    });
    this.refreshData();
  },

  refreshData() {
    // 防止重复调用
    if (this.isRefreshing) {
      console.log('[refreshData] 正在刷新中，跳过重复调用');
      this.pendingRefresh = true; // 记录一次待刷新请求
      return;
    }
    
    this.isRefreshing = true;
    this.refreshingCartType = this.data.currentCartType;
    console.log('[refreshData] 开始刷新购物车数据');
    console.log('[refreshData] 当前购物车类型:', this.data.currentCartType);
    
    // 目前只支持农产品购物车
    const refreshPromise = fetchGoodsCartData();
    
    refreshPromise.then(res => {
      console.log('[refreshData] 购物车原始数据:', res);
      const cartData = res.data;
      console.log('[refreshData] 购物车数据:', cartData);
      
      // 调试：检查第一个商品的farm_id
      if (cartData.goodsList && cartData.goodsList.length > 0) {
        const firstItem = cartData.goodsList[0];
        console.log('[refreshData] 第一个商品的farm_id:', firstItem.farm_id);
        console.log('[refreshData] 第一个商品完整数据:', firstItem);
      }
      
      // 转换为组件需要的格式
      const cartGroupData = this.convertCartDataToGroupFormat(cartData);
      console.log('[refreshData] 转换后的购物车数据:', cartGroupData);
      
      this.setData({
        cartGroupData,
      });
      
      // 刷新数据后重新计算价格，确保界面显示正确
      console.log('[refreshData] 重新计算价格');
      this.updateCartTotalPrice();
    }).catch(err => {
      console.error('[refreshData] 获取购物车数据失败:', err);
    }).finally(() => {
      this.isRefreshing = false;
      this.refreshingCartType = null;
      if (this.pendingRefresh) {
        console.log('[refreshData] 处理挂起的刷新请求');
        this.pendingRefresh = false;
        // 再次刷新，确保最终状态正确
        setTimeout(() => this.refreshData(), 0);
      }
    });
  },

  // 强制刷新数据，跳过防重复调用检查
  forceRefreshData() {
    const wasRefreshing = this.isRefreshing;
    this.isRefreshing = false; // 临时重置标志
    console.log('[forceRefreshData] 强制刷新购物车数据, 之前状态:', wasRefreshing);
    this.refreshData();
  },

  // 确保数据和价格都正确的完整刷新
  ensureDataConsistency() {
    console.log('[ensureDataConsistency] 确保数据一致性');
    
    // 先强制刷新数据
    this.forceRefreshData();
    
    // 延迟一下确保价格计算正确
    setTimeout(() => {
      console.log('[ensureDataConsistency] 重新计算价格确保一致性');
      this.updateCartTotalPrice();
    }, 150);
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
    console.log('[findGoods] cartGroupData.storeGoods长度:', cartGroupData.storeGoods.length);
    
    if (cartGroupData.storeGoods.length === 0) {
      console.log('[findGoods] 购物车为空，没有商品可以查找');
      return { goods: null, storeIndex: -1, promotionIndex: -1, goodsIndex: -1 };
    }

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
          
          // 使用更严格的比较，确保类型一致
          const good_id_match = String(item.good_id) === String(good_id);
          const skuId_match = String(item.skuId) === String(skuId);
          
          if (good_id_match && skuId_match) {
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
    // 目前只支持农产品购物车
    return fetchGoodsCartData();
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
    console.log('[convertCartDataToGroupFormat] cartData.goodsList存在:', !!cartData.goodsList);
    console.log('[convertCartDataToGroupFormat] cartData.goodsList类型:', typeof cartData.goodsList);
    if (cartData.goodsList) {
      console.log('[convertCartDataToGroupFormat] 商品列表前3项:', cartData.goodsList.slice(0, 3));
    }
    
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
    
    console.log('[convertCartDataToGroupFormat] 输入的价格数据:', {
      totalAmount: cartData.totalAmount,
      selectedGoodsCount: cartData.selectedGoodsCount,
      isAllSelected: cartData.isAllSelected
    });
    
    console.log('[convertCartDataToGroupFormat] 输出的价格数据:', {
      totalAmount: cartGroupData.totalAmount,
      selectedGoodsCount: cartGroupData.selectedGoodsCount,
      isAllSelected: cartGroupData.isAllSelected
    });
    
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
      const targetGoods = cartGroupData.storeGoods[storeIndex].promotionGoodsList[promotionIndex].goodsPromotionList[goodsIndex];
      targetGoods.quantity = quantity;
      
      // 如果数量为0，自动取消选中状态
      if (quantity <= 0) {
        console.log('[changeQuantityService] 数量为0，取消选中状态');
        targetGoods.isSelected = false;
      }
      
      console.log('[changeQuantityService] 更新商品数量成功');
      this.setData({
        cartGroupData,
      });
      
      // 更新本地存储
      this.updateLocalStorage();
      
      // 发送购物车数据更新事件
      try {
        if (wx.eventCenter && typeof wx.eventCenter.emit === 'function') {
          wx.eventCenter.emit('cartDataUpdate', {
            type: this.data.currentCartType,
            action: 'quantity_change',
            data: null
          });
        }
      } catch (e) {
        console.log('[changeQuantityService] 发送事件通知失败:', e);
      }
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
      
      // 重新计算总价和选中商品数量
      this.updateCartTotalPrice();
      
      // 更新本地存储
      this.updateLocalStorage();
      
      // 发送购物车数据更新事件
      try {
        if (wx.eventCenter && typeof wx.eventCenter.emit === 'function') {
          wx.eventCenter.emit('cartDataUpdate', {
            type: this.data.currentCartType,
            action: 'delete',
            data: null
          });
        }
      } catch (e) {
        console.log('[deleteGoodsService] 发送事件通知失败:', e);
      }
    } else {
      console.error('[deleteGoodsService] 未找到要删除的商品:', { good_id, skuId });
    }
  },

  updateLocalStorage() {
    // 只处理农产品购物车存储
    const { cartGroupData } = this.data;
    const storageKey = 'goods_cart_data';
    
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
                  const quantity = Math.max(0, parseInt(goods.quantity) || 0);
                  
                  // 如果商品数量为0，应该取消选中状态
                  if (quantity === 0) {
                    console.log('[updateCartTotalPrice] 发现数量为0的选中商品，取消选中:', goods.title);
                    goods.isSelected = false;
                    return; // 跳过此商品的价格计算
                  }
                  
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
    
    // 目前只支持农产品详情页面
    const url = `/pages/goods/details/index?goodId=${good_id}&skuId=${skuId || ''}`;
    console.log('[goGoodsDetail] 跳转到商品详情页面:', url);
    wx.navigateTo({
      url: url,
    });
  },

  clearInvalidGoods() {
    this.clearInvalidGoodsService();
    this.updateLocalStorage();
  },

  onGoodsDelete(e) {
    /* keep */
    /* keep */
    
    const {
      goods,
      skipConfirm
    } = e.detail;
    
    /* keep */
    /* keep */
    console.log('[onGoodsDelete] goods.good_id:', goods.good_id);
    console.log('[onGoodsDelete] goods.skuId:', goods.skuId);
    
    // 从goods对象中提取good_id和skuId
    const good_id = goods.good_id || goods.id;
    const skuId = goods.skuId || goods.good_id;
    
    console.log('[onGoodsDelete] 提取的数据:');
    console.log('[onGoodsDelete] good_id:', good_id, '类型:', typeof good_id);
    console.log('[onGoodsDelete] skuId:', skuId, '类型:', typeof skuId);
    console.log('[onGoodsDelete] good_id来源:', goods.good_id ? 'goods.good_id' : 'goods.id');
    console.log('[onGoodsDelete] skuId来源:', goods.skuId ? 'goods.skuId' : 'goods.good_id');
    
    // 执行删除操作的函数
    const performDelete = () => {
      console.log('[onGoodsDelete] 执行删除操作');
      console.log('[onGoodsDelete] 传递给deleteGoodsService的参数:', { good_id, skuId });
      
      if (good_id && skuId) {
        this.deleteGoodsService({
          good_id,
          skuId
        });
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '删除成功',
          icon: 'check-circle',
          duration: 1000,
        });
      } else {
        console.error('[onGoodsDelete] good_id或skuId为空，无法删除商品');
        Toast({
          context: this,
          selector: '#t-toast',
          message: '删除失败：商品信息不完整',
          icon: 'close-circle',
          duration: 1000,
        });
      }
    };
    
    // 如果已经确认过（来自stepper减到0），直接删除
    if (skipConfirm) {
      console.log('[onGoodsDelete] 跳过确认对话框，直接删除');
      performDelete();
    } else {
      // 显示确认对话框（来自swipe删除）
      console.log('[onGoodsDelete] 准备显示确认对话框');
      
      Dialog.confirm({
        context: this,
        selector: '#t-dialog',
        title: '确认删除',
        content: '确定要删除这个商品吗？',
        confirmBtn: '删除',
        cancelBtn: '取消',
      }).then(() => {
        console.log('[onGoodsDelete] 用户点击了确认按钮');
        performDelete();
      }).catch(() => {
        console.log('[onGoodsDelete] 用户取消了删除操作');
      });
    }
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

  // 去结算 - 跳转到批量订单确认页面
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

    console.log('[onToSettle] 跳转到批量订单确认页面');
    console.log('[onToSettle] 购物车类型:', currentCartType);
    console.log('[onToSettle] 选中的商品数量:', selectedGoods.length);
    console.log('[onToSettle] 选中的商品:', selectedGoods);

    // 构建商品请求列表，转换为订单确认页面需要的格式
    const goodsRequestList = selectedGoods.map(goods => {
      return {
        storeId: '1000', // 默认店铺ID
        quantity: goods.quantity || 1,
        good_id: goods.good_id,
        skuId: goods.skuId || goods.good_id,
        goodsName: goods.title || goods.goodsName,
        price: goods.price || goods.minSalePrice || 0,
        settlePrice: goods.price || goods.minSalePrice || 0,
        tagPrice: goods.price || goods.minSalePrice || 0,
        available: true,
        primaryImage: goods.primaryImage || goods.thumb,
        thumb: goods.primaryImage || goods.thumb,
        title: goods.title || goods.goodsName,
        specInfo: [{
          specTitle: '规格',
          specValue: goods.units || '标准规格'
        }],
        // 添加购物车类型标识，目前只支持农产品
        cartType: 'goods',
        farm_id: goods.farm_id,
        farm_address: goods.farm_address,
        detail: goods.detail,
        units: goods.units
      };
    });

    console.log('[onToSettle] 转换后的商品请求列表:', goodsRequestList);

    // 跳转到订单确认页面
    wx.navigateTo({
      url: `/pages/order/order-confirm/index?goodsRequestList=${encodeURIComponent(JSON.stringify(goodsRequestList))}&isBatchOrder=true&cartType=goods`
    });
  },

  // 从购物车中删除已创建订单的商品
  async removeOrderedGoodsFromCart(orderedGoods) {
    console.log('[removeOrderedGoodsFromCart] 开始从购物车删除商品:', orderedGoods);
    
    const { currentCartType } = this.data;
    
    // 获取农产品购物车数据
    let cartData = wx.getStorageSync('goods_cart_data');

    if (!cartData || !cartData.goodsList) {
      console.log('[removeOrderedGoodsFromCart] 购物车数据为空');
      return;
    }

    // 删除已创建订单的商品
    orderedGoods.forEach(goods => {
      const index = cartData.goodsList.findIndex(item => 
        item.good_id == goods.good_id && item.skuId == goods.skuId
      );
      
      if (index !== -1) {
        console.log('[removeOrderedGoodsFromCart] 删除商品:', cartData.goodsList[index]);
        cartData.goodsList.splice(index, 1);
      }
    });

    // 更新农产品购物车本地存储
    wx.setStorageSync('goods_cart_data', cartData);

    // 更新购物车数量
    updateCartNum();
    
    console.log('[removeOrderedGoodsFromCart] 购物车更新完成');
  },

  onGotoHome() {
    wx.switchTab({
      url: '/pages/home/home',
    });
  },

  // 设置事件监听器
  setupEventListeners() {
    try {
      if (wx.eventCenter && typeof wx.eventCenter.on === 'function') {
        console.log('[setupEventListeners] 设置购物车数据更新监听器');
        this.cartDataUpdateListener = (eventData) => {
          console.log('[cartDataUpdate] 收到购物车数据更新事件:', eventData);
          console.log('[cartDataUpdate] 当前页面状态:', {
            currentCartType: this.data.currentCartType,
            isRefreshing: this.isRefreshing
          });
          
          // 只有农产品购物车类型的事件才处理
          if (eventData.type === 'goods') {
            // 去抖：相同时间戳的重复事件不处理
            if (this.lastCartUpdateTs && eventData.ts && eventData.ts === this.lastCartUpdateTs) {
              console.log('[cartDataUpdate] 跳过重复事件');
              return;
            }
            this.lastCartUpdateTs = eventData.ts || Date.now();
            console.log('[cartDataUpdate] 类型匹配，准备刷新购物车数据');
            
            // 如果正在刷新，等待刷新完成后再次刷新
            if (this.isRefreshing) {
              console.log('[cartDataUpdate] 当前正在刷新，延迟处理');
              setTimeout(() => {
                this.cartDataUpdateListener(eventData);
              }, 200);
              return;
            }
            
            // 延迟一下刷新，确保数据已经保存完成
            setTimeout(() => {
              console.log('[cartDataUpdate] 执行完整的数据一致性检查');
              this.ensureDataConsistency();
            }, 100);
          } else {
            console.log('[cartDataUpdate] 类型不匹配，不刷新数据', {
              eventType: eventData.type,
              currentType: this.data.currentCartType
            });
          }
        };
        
        wx.eventCenter.on('cartDataUpdate', this.cartDataUpdateListener);
      }
    } catch (e) {
      console.error('[setupEventListeners] 设置事件监听器失败:', e);
    }
  },

  // 清理事件监听器
  cleanupEventListeners() {
    try {
      if (wx.eventCenter && typeof wx.eventCenter.off === 'function' && this.cartDataUpdateListener) {
        console.log('[cleanupEventListeners] 清理购物车数据更新监听器');
        wx.eventCenter.off('cartDataUpdate', this.cartDataUpdateListener);
        this.cartDataUpdateListener = null;
      }
    } catch (e) {
      console.error('[cleanupEventListeners] 清理事件监听器失败:', e);
    }
  },
});