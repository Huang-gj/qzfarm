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
        for (const store of storeGoods) {
          for (const activity of store.promotionGoodsList) {
            for (const goods of activity.goodsPromotionList) {
              goods.specs = goods.specInfo.map((item) => item.specValue); // 目前仅展示商品已选规格的值
            }
          }
          for (const goods of store.shortageGoodsList) {
            goods.specs = goods.specInfo.map((item) => item.specValue); // 目前仅展示商品已选规格的值
          }
        }

        this.setData({
          _storeGoods: storeGoods
        });
      },
    },
    invalidGoodItems: {
      type: Array,
      observer(invalidGoodItems) {
        invalidGoodItems.forEach((goods) => {
          goods.specs = goods.specInfo.map((item) => item.specValue); // 目前仅展示商品已选规格的值
        });
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
      wx.showModal({
        title: '提示',
        content: '确定将该商品从购物车中移除吗？',
        confirmText: '确定移除',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 用户点击确定，触发删除事件
            this.triggerEvent('delete', {
              goods
            });
          } else {
            // 用户点击取消，恢复数量为1
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
      if (value > goods.stack) {
        num = goods.stack;
      }

      // 当数量变为0时，弹出确认框询问是否删除
      if (num === 0) {
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
      const num = value;

      // input事件不处理数量为0的情况，已经在changeStepper中处理了
      this.changeQuantity(num, goods);
    },

    overlimit(e) {
      // 如果是减到0以下的情况，不提示任何信息
      if (e.detail.type === 'minus') {
        return;
      }

      const text = '同一商品最多购买999件';
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