import Toast from 'tdesign-miniprogram/toast/index';

const shortageImg =
  'https://cdn-we-retail.ym.tencent.com/miniapp/cart/shortage.png';

Component({
  isSpecsTap: false, // 标记本次点击事件是否因为点击specs触发（由于底层goods-card组件没有catch specs点击事件，只能在此处加状态来避免点击specs时触发跳转商品详情）
  externalClasses: ['wr-class'],
  properties: {
    storeGoods: {
      type: Array,
      observer(storeGoods) {
        console.log('[cart-group] storeGoods observer 被调用:', storeGoods);
        
        for (const store of storeGoods) {
          console.log('[cart-group] 处理店铺:', store.storeName);
          console.log('[cart-group] promotionGoodsList:', store.promotionGoodsList);
          
          for (const activity of store.promotionGoodsList) {
            console.log('[cart-group] 处理活动:', activity);
            console.log('[cart-group] goodsPromotionList:', activity.goodsPromotionList);
            
            for (const goods of activity.goodsPromotionList) {
              console.log('[cart-group] 处理商品:', goods);
              // 安全地处理 specInfo
              if (goods.specInfo && Array.isArray(goods.specInfo)) {
                goods.specs = goods.specInfo.map((item) => item.specValue);
              } else {
                goods.specs = [];
              }
            }
          }
          
          for (const goods of store.shortageGoodsList) {
            // 安全地处理 specInfo
            if (goods.specInfo && Array.isArray(goods.specInfo)) {
              goods.specs = goods.specInfo.map((item) => item.specValue);
            } else {
              goods.specs = [];
            }
          }
        }

        console.log('[cart-group] 设置 _storeGoods:', storeGoods);
        this.setData({
          _storeGoods: storeGoods
        });
      },
    },
    invalidGoodItems: {
      type: Array,
      observer(invalidGoodItems) {
        console.log('[cart-group] invalidGoodItems observer 被调用:', invalidGoodItems);
        
        invalidGoodItems.forEach((goods) => {
          // 安全地处理 specInfo
          if (goods.specInfo && Array.isArray(goods.specInfo)) {
            goods.specs = goods.specInfo.map((item) => item.specValue);
          } else {
            goods.specs = [];
          }
        });
        
        console.log('[cart-group] 设置 _invalidGoodItems:', invalidGoodItems);
        this.setData({
          _invalidGoodItems: invalidGoodItems
        });
      },
    },
    thumbWidth: {
      type: null
    },
    thumbHeight: {
      type: null
    },
    // 添加购物车类型属性
    cartType: {
      type: String,
      value: 'goods' // 默认为农产品
    },
  },

  data: {
    shortageImg,
    isShowSpecs: false,
    currentGoods: {},
    isShowToggle: false,
    _storeGoods: [],
    _invalidGoodItems: [],
  },

  methods: {
    // 删除商品
    deleteGoods(e) {
      const {
        goods
      } = e.currentTarget.dataset;
      // 直接触发删除事件，不需要弹框确认，因为在swipe删除时已经有onGoodsDelete的弹框确认了
      this.triggerEvent('delete', {
        goods
      });
    },

    // 确认是否删除商品（从stepper减到0时调用）
    confirmDeleteGoods(goods) {
      console.log('[confirmDeleteGoods] 确认删除商品:', goods);
      
      wx.showModal({
        title: '提示',
        content: '确定将该商品从购物车中移除吗？',
        confirmText: '确定移除',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 用户点击确定，触发删除事件
            console.log('[confirmDeleteGoods] 用户确认删除，触发删除事件');
            this.triggerEvent('delete', {
              goods,
              skipConfirm: true // 标记已经确认过，跳过二次确认
            });
          } else {
            // 用户点击取消，恢复数量为1
            console.log('[confirmDeleteGoods] 用户取消删除，恢复数量为1');
            this.changeQuantity(1, goods);
          }
        }
      });
    },

    // 清空失效商品
    clearInvalidGoods() {
      this.triggerEvent('clearinvalidgoods');
    },

    // 选中商品
    selectGoods(e) {
      const {
        goods
      } = e.currentTarget.dataset;
      this.triggerEvent('selectgoods', {
        goods,
        isSelected: !goods.isSelected,
      });
    },

    changeQuantity(num, goods) {
      this.triggerEvent('changequantity', {
        goods,
        quantity: num,
      });
    },
    changeStepper(e) {
      const {
        value
      } = e.detail;
      const {
        goods
      } = e.currentTarget.dataset;
      let num = value;
      
      // 根据购物车类型设置最大数量限制
      const { cartType } = this.data;
      let maxQuantity = goods.stockQuantity;
      
      if (cartType === 'land') {
        // 土地购物车最大数量限制为1
        maxQuantity = 1;
        console.log('[changeStepper] 土地购物车，最大数量限制为1');
      }
      
      // 检查数量是否超过限制
      if (value > maxQuantity) {
        num = maxQuantity;
        console.log('[changeStepper] 数量超过限制，调整为:', num);
      }

      console.log('[changeStepper] 数量变化:', { 
        value, 
        num, 
        stockQuantity: goods.stockQuantity, 
        maxQuantity, 
        cartType 
      });

      // 当数量变为0时，弹出确认框询问是否删除
      if (num === 0) {
        console.log('[changeStepper] 数量为0，触发删除确认');
        this.confirmDeleteGoods(goods);
        return;
      }

      this.changeQuantity(num, goods);
    },

    input(e) {
      const {
        value
      } = e.detail;
      const {
        goods
      } = e.currentTarget.dataset;
      const num = parseInt(value) || 0;

      // 当数量为0时，触发删除确认，与changeStepper保持一致
      if (num === 0) {
        console.log('[input] 数量为0，触发删除确认');
        this.confirmDeleteGoods(goods);
        return;
      }

      this.changeQuantity(num, goods);
    },

    overlimit(e) {
      // 如果是减到0以下的情况，不提示任何信息
      if (e.detail.type === 'minus') {
        return;
      }

      const { cartType } = this.data;
      let text = '同一商品最多购买999件';
      
      if (cartType === 'land') {
        text = '土地商品最多购买1件';
      }
      
      console.log('[overlimit] 数量超出限制:', { cartType, text });
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: text,
      });
    },

    // 去凑单/再逛逛
    gotoBuyMore(e) {
      const {
        promotion,
        storeId = ''
      } = e.currentTarget.dataset;
      this.triggerEvent('gocollect', {
        promotion,
        storeId
      });
    },

    // 选中门店
    selectStore(e) {
      const {
        storeIndex
      } = e.currentTarget.dataset;
      const store = this.data.storeGoods[storeIndex];
      const isSelected = !store.isSelected;
      if (store.storeStockShortage && isSelected) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '部分商品库存不足',
        });
        return;
      }
      this.triggerEvent('selectstore', {
        store,
        isSelected,
      });
    },

    // 展开/收起切换
    showToggle() {
      this.setData({
        isShowToggle: !this.data.isShowToggle,
      });
    },

    // 展示规格popup
    specsTap(e) {
      this.isSpecsTap = true;
      const {
        goods
      } = e.currentTarget.dataset;
      this.setData({
        isShowSpecs: true,
        currentGoods: goods,
      });
    },

    hideSpecsPopup() {
      this.setData({
        isShowSpecs: false,
      });
    },

    goGoodsDetail(e) {
      if (this.isSpecsTap) {
        this.isSpecsTap = false;
        return;
      }
      const {
        goods
      } = e.currentTarget.dataset;
      this.triggerEvent('goodsclick', {
        goods
      });
    },

    gotoCoupons() {
      wx.navigateTo({
        url: '/pages/coupon/coupon-list/index'
      });
    },
  },
});