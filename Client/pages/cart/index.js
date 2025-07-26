import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  fetchCartGroupData,
  updateCartNum
} from '../../services/cart/cart';

Page({
  data: {
    cartGroupData: null,
    emptyCartImage: 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/TdesignCart (1).png',
  },

  // 调用自定义tabbar的init函数，使页面与tabbar激活状态保持一致
  onShow() {
    this.getTabBar().init();
    this.refreshData();
    updateCartNum(); // 更新购物车角标
  },

  onLoad() {
    this.refreshData();
  },

  refreshData() {
    this.getCartGroupData().then((res) => {
      if (!res || !res.data) {
        console.error('购物车数据格式错误');
        return;
      }

      let isEmpty = true;
      const cartGroupData = res.data;

      // 确保数据结构完整
      if (!cartGroupData.goodsList) {
        cartGroupData.goodsList = [];
      }

      if (!cartGroupData.invalidGoodItems) {
        cartGroupData.invalidGoodItems = [];
      }

      // 处理商品数据
      // 将扁平结构转换为组件需要的嵌套结构
      // 创建一个虚拟商店，包含所有商品
      let availableGoods = [];
      let shortageGoods = [];
      let isAllSelected = true;
      let hasStockShortage = false;

      // 处理有效商品
      cartGroupData.goodsList = cartGroupData.goodsList.filter(goods => {
        if (!goods) return false;

        goods.originPrice = undefined;

        // 检查库存状态
        if (goods.quantity > goods.stockQuantity) {
          goods.stockShortage = true;
          hasStockShortage = true;
        }

        // 检查选中状态
        if (!goods.isSelected) {
          isAllSelected = false;
        }

        // 区分有货和缺货商品
        if (goods.stockQuantity > 0) {
          availableGoods.push(goods);
          return true;
        } else {
          shortageGoods.push(goods);
          return false;
        }
      });

      // 处理无效商品
      cartGroupData.invalidGoodItems = cartGroupData.invalidGoodItems.filter(goods => {
        if (!goods) return false;
        goods.originPrice = undefined;
        return true;
      });

      // 构建组件需要的数据结构
      cartGroupData.storeGoods = [{
        storeId: '1000',
        storeName: '购物车',
        storeStatus: 1,
        isSelected: isAllSelected,
        storeStockShortage: hasStockShortage,
        totalDiscountSalePrice: '0',
        promotionGoodsList: [{
          goodsPromotionList: availableGoods
        }],
        shortageGoodsList: shortageGoods,
        lastJoinTime: new Date().toISOString(),
      }];

      // 更新空状态标志
      isEmpty = availableGoods.length === 0 && shortageGoods.length === 0 && cartGroupData.invalidGoodItems.length === 0;
      cartGroupData.isNotEmpty = !isEmpty;

      // 更新全选状态
      cartGroupData.isAllSelected = isAllSelected;

      this.setData({
        cartGroupData
      });
    }).catch(err => {
      console.error('获取购物车数据失败', err);
    });
  },

  findGoods(good_id, skuId) {
    let currentGoods;
    const {
      goodsList
    } = this.data.cartGroupData;

    // 直接在扁平的商品列表中查找
    for (const goods of goodsList) {
      if (goods.good_id === good_id && goods.skuId === skuId) {
        currentGoods = goods;
        return {
          currentGoods
        };
      }
    }

    return {
      currentGoods
    };
  },

  // 获取购物车数据，优先使用本地存储的数据
  getCartGroupData() {
    // 先尝试从本地缓存获取购物车数据
    const cartData = wx.getStorageSync('cart_data');
    if (cartData) {
      return Promise.resolve({
        data: cartData
      });
    }

    // 如果本地没有数据，则使用mock数据
    const {
      cartGroupData
    } = this.data;
    if (!cartGroupData) {
      return fetchCartGroupData();
    }
    return Promise.resolve({
      data: cartGroupData
    });
  },

  // 选择单个商品
  selectGoodsService({
    good_id,
    skuId,
    isSelected
  }) {
    this.findGoods(good_id, skuId).currentGoods.isSelected = isSelected;
    // 更新本地存储
    this.updateLocalStorage();
    return Promise.resolve();
  },

  // 全选门店(实际上是全选所有商品)
  selectStoreService({
    storeId,
    isSelected
  }) {
    const {
      goodsList
    } = this.data.cartGroupData;
    // 在扁平结构中，直接更新所有商品的选中状态
    goodsList.forEach(goods => {
      goods.isSelected = isSelected;
    });
    // 更新本地存储
    this.updateLocalStorage();
    return Promise.resolve();
  },

  // 加购数量变更
  changeQuantityService({
    good_id,
    skuId,
    quantity
  }) {
    this.findGoods(good_id, skuId).currentGoods.quantity = quantity;
    // 更新本地存储
    this.updateLocalStorage();
    return Promise.resolve();
  },

  // 删除加购商品
  deleteGoodsService({
    good_id,
    skuId
  }) {
    const {
      goodsList,
      invalidGoodItems
    } = this.data.cartGroupData;

    // 在扁平的商品列表中查找并删除
    const goodsIndex = goodsList.findIndex(goods =>
      goods.good_id === good_id && goods.skuId === skuId
    );

    if (goodsIndex > -1) {
      goodsList.splice(goodsIndex, 1);
      // 更新本地存储
      this.updateLocalStorage();
      return Promise.resolve();
    }

    // 在无效商品列表中查找并删除
    const invalidIndex = invalidGoodItems.findIndex(goods =>
      goods.good_id === good_id && goods.skuId === skuId
    );

    if (invalidIndex > -1) {
      invalidGoodItems.splice(invalidIndex, 1);
      // 更新本地存储
      this.updateLocalStorage();
      return Promise.resolve();
    }

    return Promise.reject();
  },

  // 更新本地存储的购物车数据
  updateLocalStorage() {
    const { cartGroupData } = this.data;
    if (cartGroupData) {
      // 计算总价和总选中商品数量
      let totalAmount = 0;
      let selectedGoodsCount = 0;
      let totalCount = 0; // 总商品数量（不管是否选中）
      
      cartGroupData.goodsList.forEach(goods => {
        totalCount += goods.quantity; // 累计总数量
        if (goods.isSelected) {
          totalAmount += parseFloat(goods.price) * goods.quantity;
          selectedGoodsCount += goods.quantity;
        }
      });
      
      // 更新购物车总价和选中商品数量
      cartGroupData.totalAmount = totalAmount.toFixed(0);
      cartGroupData.selectedGoodsCount = selectedGoodsCount;
      
      // 保存到本地存储
      wx.setStorageSync('cart_data', cartGroupData);
      
      // 更新TabBar的购物车角标
      updateCartNum();
      
      // 直接存储正确的购物车数量到本地，确保角标正确
      wx.setStorageSync('cart_count', totalCount);
    }
  },

  // 清空失效商品
  clearInvalidGoodsService() {
    this.data.cartGroupData.invalidGoodItems = [];
    // 更新本地存储
    this.updateLocalStorage();
    return Promise.resolve();
  },

  onGoodsSelect(e) {
    const {
      goods: {
        good_id,
        skuId
      },
      isSelected,
    } = e.detail;
    const {
      currentGoods
    } = this.findGoods(good_id, skuId);
    Toast({
      context: this,
      selector: '#t-toast',
      message: `${isSelected ? '选择' : '取消'}"${
        currentGoods.title.length > 5 ? `${currentGoods.title.slice(0, 5)}...` : currentGoods.title
      }"`,
      icon: '',
    });
    this.selectGoodsService({
      good_id,
      skuId,
      isSelected
    }).then(() => this.refreshData());
  },

  onStoreSelect(e) {
    const {
      store: {
        storeId
      },
      isSelected,
    } = e.detail;
    this.selectStoreService({
      storeId,
      isSelected
    }).then(() => this.refreshData());
  },

  onQuantityChange(e) {
    const {
      goods: {
        good_id,
        skuId
      },
      quantity,
    } = e.detail;
    const {
      currentGoods
    } = this.findGoods(good_id, skuId);
    
    // 基于 repertory 字段判断库存数量
    const stockQuantity = currentGoods.repertory || currentGoods.stockQuantity || 0;
    const maxPurchaseQuantity = Math.max(0, stockQuantity); // 确保不为负数
    
    console.log('[onQuantityChange] 库存检查:', {
      good_id,
      skuId,
      requestedQuantity: quantity,
      stockQuantity: stockQuantity,
      maxPurchaseQuantity: maxPurchaseQuantity,
      currentGoods: currentGoods
    });
    
    // 加购数量超过库存数量
    if (quantity > maxPurchaseQuantity) {
      // 加购数量等于库存数量的情况下继续加购
      if (currentGoods.quantity === maxPurchaseQuantity && quantity - maxPurchaseQuantity === 1) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '当前商品库存不足',
        });
        return;
      }
      
      // 获取商品单位信息
      const units = currentGoods.units || '个';
      
      Dialog.confirm({
          title: '商品库存不足',
          content: `当前商品库存不足，最大可购买数量为${maxPurchaseQuantity}${units}`,
          confirmBtn: '修改为最大可购买数量',
          cancelBtn: '取消',
        })
        .then(() => {
          this.changeQuantityService({
            good_id,
            skuId,
            quantity: maxPurchaseQuantity,
          }).then(() => this.refreshData());
        })
        .catch(() => {});
      return;
    }
    
    this.changeQuantityService({
      good_id,
      skuId,
      quantity
    }).then(() => this.refreshData());
  },

  goCollect() {
    /** 活动肯定有一个活动ID，用来获取活动banner，活动商品列表等 */
    const promotionID = '123';
    wx.navigateTo({
      url: `/pages/promotion-detail/index?promotion_id=${promotionID}`,
    });
  },

  goGoodsDetail(e) {
    const {
      good_id,
      storeId
    } = e.detail.goods;
    wx.navigateTo({
      url: `/pages/goods/details/index?goodId=${good_id}&storeId=${storeId}`,
    });
  },

  clearInvalidGoods() {
    // 清空失效商品
    this.clearInvalidGoodsService().then(() => this.refreshData());
  },

  onGoodsDelete(e) {
    const {
      goods: {
        good_id,
        skuId
      },
    } = e.detail;
    Dialog.confirm({
      content: '确认删除该商品吗?',
      confirmBtn: '确定',
      cancelBtn: '取消',
    }).then(() => {
      this.deleteGoodsService({
        good_id,
        skuId
      }).then(() => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '商品删除成功'
        });
        this.refreshData();
      });
    });
  },

  onSelectAll(event) {
    const {
      isAllSelected
    } = event?.detail ?? {};
    Toast({
      context: this,
      selector: '#t-toast',
      message: `${isAllSelected ? '取消' : '点击'}了全选按钮`,
    });
    this.selectStoreService({
      storeId: '1000',
      isSelected: !isAllSelected
    }).then(() => this.refreshData());
  },

  onToSettle() {
    const goodsRequestList = this.data.cartGroupData.goodsList.filter(goods => goods.isSelected === 1);
    wx.setStorageSync('order.goodsRequestList', JSON.stringify(goodsRequestList));
    wx.navigateTo({
      url: '/pages/order/order-confirm/index?type=cart'
    });
  },

  onGotoHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },
});