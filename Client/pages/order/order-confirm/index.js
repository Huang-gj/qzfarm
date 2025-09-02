import Toast from 'tdesign-miniprogram/toast/index';
import { fetchSettleDetail } from '../../../services/order/orderConfirm';
import { commitPay, wechatPayOrder } from './pay';
import { getAddressPromise, getDefaultAddress } from '../../usercenter/address/list/util';
import { getFirstImageUrl } from '../../../utils/imageUtils';

const stripeImg = `https://cdn-we-retail.ym.tencent.com/miniapp/order/stripe.png`;

Page({
  data: {
    placeholder: '备注信息',
    stripeImg,
    loading: false,
    settleDetailData: {
      storeGoodsList: [], //正常下单商品列表
      outOfStockGoodsList: [], //库存不足商品
      abnormalDeliveryGoodsList: [], // 不能正常配送商品
      inValidGoodsList: [], // 失效或者库存不足
      limitGoodsList: [], //限购商品
      couponList: [], //门店优惠券信息
    }, // 获取结算页详情 data
    orderCardList: [], // 仅用于商品卡片展示
    couponsShow: false, // 显示优惠券的弹框
    invoiceData: {
      email: '', // 发票发送邮箱
      buyerTaxNo: '', // 税号
      invoiceType: null, // 开票类型  1：增值税专用发票； 2：增值税普通发票； 3：增值税电子发票；4：增值税卷式发票；5：区块链电子发票。
      buyerPhone: '', //手机号
      buyerName: '', //个人或公司名称
      titleType: '', // 发票抬头 1-公司 2-个人
      contentType: '', //发票内容 1-明细 2-类别
    },
    goodsRequestList: [],
    userAddressReq: null,
    popupShow: false, // 不在配送范围 失效 库存不足 商品展示弹框
    notesPosition: 'center',
    storeInfoList: [],
    storeNoteIndex: 0, //当前填写备注门店index
    promotionGoodsList: [], //当前门店商品列表(优惠券)
    couponList: [], //当前门店所选优惠券
    submitCouponList: [], //所有门店所选优惠券
    currentStoreId: null, //当前优惠券storeId
    userAddress: null,
  },

  payLock: false,
  noteInfo: [],
  tempNoteInfo: [],
  onLoad(options) {
    console.log('[onLoad] 订单确认页面加载，参数:', options);
    
    this.setData({
      loading: true,
    });
    
    // 检查options是否存在
    if (!options) {
      console.error('[onLoad] options is undefined');
      this.handleError();
      return;
    }
    
    // 如果没有商品数据，使用测试数据
    if (!options.goodsRequestList) {
      console.log('[onLoad] 没有商品数据，使用测试数据');
      const testOptions = {
        goodsRequestList: JSON.stringify([{
          quantity: 1,
          storeId: '1000',
          good_id: 1000,
          goodsName: '测试商品',
          skuId: 'sku_001',
          available: true,
          price: 99.99,
          specInfo: [{
            specTitle: '规格',
            specValue: '标准规格'
          }],
          primaryImage: 'https://via.placeholder.com/100x100',
          thumb: 'https://via.placeholder.com/100x100',
          title: '测试商品'
        }])
      };
      this.handleOptionsParams(testOptions);
    } else {
      this.handleOptionsParams(options);
    }
  },
  onShow() {
    const invoiceData = wx.getStorageSync('invoiceData');
    if (invoiceData) {
      //处理发票
      this.invoiceData = invoiceData;
      this.setData({
        invoiceData,
      });
      wx.removeStorageSync('invoiceData');
    }
    
    // 检查是否需要更新默认地址
    if (!this.data.userAddress) {
      const defaultAddress = getDefaultAddress();
      if (defaultAddress && !this.userAddressReq) {
        this.userAddressReq = defaultAddress;
        this.setData({ userAddress: defaultAddress });
        console.log('[onShow] 设置默认地址:', defaultAddress);
      }
    }
  },

  init() {
    this.setData({
      loading: true,
    });
    const { goodsRequestList } = this;
    
    // 检查goodsRequestList是否存在
    if (!goodsRequestList || goodsRequestList.length === 0) {
      console.error('[init] goodsRequestList为空');
      this.handleError();
      return;
    }
    
    this.handleOptionsParams({ goodsRequestList });
  },
  // 处理不同情况下跳转到结算页时需要的参数
  handleOptionsParams(options, couponList) {
    let { goodsRequestList } = this; // 商品列表
    let { userAddressReq } = this; // 收货地址

    const storeInfoList = []; // 门店列表
    // 如果是从地址选择页面返回，则使用地址显选择页面新选择的地址去获取结算数据
    if (options.userAddressReq) {
      userAddressReq = options.userAddressReq;
    } else if (!userAddressReq) {
      // 如果没有传入地址且当前没有地址，尝试获取默认地址
      const defaultAddress = getDefaultAddress();
      if (defaultAddress) {
        userAddressReq = defaultAddress;
        console.log('[handleOptionsParams] 使用默认地址:', defaultAddress);
      }
    }
    if (options.type === 'cart') {
      // 从购物车跳转过来时，获取传入的商品列表数据
      const goodsRequestListJson = wx.getStorageSync('order.goodsRequestList');
      goodsRequestList = JSON.parse(goodsRequestListJson);
      console.log('[handleOptionsParams] 从购物车获取的商品列表:', goodsRequestList);
    } else if (typeof options.goodsRequestList === 'string') {
      try {
        goodsRequestList = JSON.parse(options.goodsRequestList);
        console.log('[handleOptionsParams] 从参数获取的商品列表:', goodsRequestList);
      } catch (error) {
        console.error('[handleOptionsParams] 解析商品列表JSON失败:', error);
        console.log('[handleOptionsParams] 原始字符串:', options.goodsRequestList);
        this.handleError();
        return;
      }
    }
    
    console.log('[handleOptionsParams] 最终使用的商品列表:', goodsRequestList);
    
    // 检查商品列表是否存在
    if (!goodsRequestList || goodsRequestList.length === 0) {
      console.error('[handleOptionsParams] 商品列表为空');
      Toast({
        context: this,
        selector: '#t-toast',
        message: '商品数据异常，请重新选择商品',
        duration: 2000,
        icon: 'help-circle',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      return;
    }
    
    //获取结算页请求数据列表
    const storeMap = {};
    goodsRequestList.forEach((goods) => {
      if (!storeMap[goods.storeId]) {
        storeInfoList.push({
          storeId: goods.storeId,
          storeName: goods.storeName,
        });
        storeMap[goods.storeId] = true;
      }
    });
    this.goodsRequestList = goodsRequestList;
    this.storeInfoList = storeInfoList;
    const params = {
      goodsRequestList,
      storeInfoList,
      userAddressReq,
      couponList,
    };
    fetchSettleDetail(params).then(
      (res) => {
        this.setData({
          loading: false,
        });
        console.log('[handleOptionsParams] fetchSettleDetail响应:', res);
        
        if (res && res.data) {
          this.initData(res.data);
        } else {
          console.error('[handleOptionsParams] fetchSettleDetail返回数据异常:', res);
          this.handleError();
        }
      },
      (error) => {
        console.error('[handleOptionsParams] fetchSettleDetail请求失败:', error);
        //接口异常处理
        this.handleError();
      },
    );
  },
  initData(resData) {
    console.log('[initData] 接收到的结算数据:', resData);
    
    // 检查resData是否存在
    if (!resData) {
      console.error('[initData] resData is undefined');
      this.handleError();
      return;
    }
    
    // 转换商品卡片显示数据
    this.handleResToGoodsCard(resData);
    console.log('[initData] 处理后的结算数据:', resData);
    console.log('[initData] 商品总额 totalSalePrice:', resData.totalSalePrice);
    console.log('[initData] 总支付金额 totalPayAmount:', resData.totalPayAmount);
    
    // 优先使用传入的地址，如果没有则使用默认地址
    let addressToUse = resData.userAddress;
    if (!addressToUse && this.userAddressReq) {
      addressToUse = this.userAddressReq;
      console.log('[initData] 使用已设置的地址:', addressToUse);
    } else if (!addressToUse) {
      // 如果都没有，尝试获取默认地址
      const defaultAddress = getDefaultAddress();
      if (defaultAddress) {
        addressToUse = defaultAddress;
        this.userAddressReq = defaultAddress;
        console.log('[initData] 使用默认地址:', defaultAddress);
      }
    }
    
    this.userAddressReq = addressToUse;

    if (addressToUse) {
      this.setData({ userAddress: addressToUse });
    }
    this.setData({ settleDetailData: resData });
    this.isInvalidOrder(resData);
  },

  isInvalidOrder(data) {
    // 检查data是否存在
    if (!data) {
      console.error('[isInvalidOrder] settleDetailData is undefined');
      return false;
    }
    
    // 失效 不在配送范围 限购的商品 提示弹窗
    if (
      (data.limitGoodsList && data.limitGoodsList.length > 0) ||
      (data.abnormalDeliveryGoodsList &&
        data.abnormalDeliveryGoodsList.length > 0) ||
      (data.inValidGoodsList && data.inValidGoodsList.length > 0)
    ) {
      this.setData({ popupShow: true });
      return true;
    }
    this.setData({ popupShow: false });
    if (data.settleType === 0) {
      return true;
    }
    return false;
  },

  handleError() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '结算异常, 请稍后重试',
      duration: 2000,
      icon: '',
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
    this.setData({
      loading: false,
    });
  },
  getRequestGoodsList(storeGoodsList) {
    const filterStoreGoodsList = [];
    storeGoodsList &&
      storeGoodsList.forEach((store) => {
        const { storeName } = store;
        store.skuDetailVos &&
          store.skuDetailVos.forEach((goods) => {
            const data = goods;
            data.storeName = storeName;
            filterStoreGoodsList.push(data);
          });
      });
    return filterStoreGoodsList;
  },
  handleGoodsRequest(goods, isOutStock = false) {
    const {
      reminderStock,
      quantity,
      storeId,
      uid,
      saasId,
      good_id,
      goodsName,
      skuId,
      storeName,
      roomId,
    } = goods;
    const resQuantity = isOutStock ? reminderStock : quantity;
    return {
      quantity: resQuantity,
      storeId,
      uid,
      saasId,
      good_id,
      goodsName,
      skuId,
      storeName,
      roomId,
    };
  },
  handleResToGoodsCard(data) {
    // 检查data是否存在
    if (!data) {
      console.error('[handleResToGoodsCard] data is undefined');
      return {
        storeGoodsList: [],
        totalSalePrice: 0,
        totalPayAmount: 0,
        totalGoodsCount: 0,
        settleType: 0
      };
    }
    
    // 转换数据 符合 goods-card展示
    const orderCardList = []; // 订单卡片列表
    const storeInfoList = [];
    const submitCouponList = []; //使用优惠券列表;

    data.storeGoodsList &&
      data.storeGoodsList.forEach((ele) => {
        const orderCard = {
          id: ele.storeId,
          storeName: ele.storeName,
          status: 0,
          statusDesc: '',
          amount: ele.storeTotalPayAmount,
          goodsList: [],
        }; // 订单卡片
        ele.skuDetailVos.forEach((item, index) => {
          orderCard.goodsList.push({
            id: index,
            thumb: getFirstImageUrl(item.image),
            title: item.goodsName,
            specs: item.skuSpecLst.map((s) => s.specValue), // 规格列表 string[]
            price: item.tagPrice || item.settlePrice || '0', // 优先取限时活动价
            settlePrice: item.settlePrice,
            titlePrefixTags: item.tagText ? [{ text: item.tagText }] : [],
            num: item.quantity,
            skuId: item.skuId,
            good_id: item.good_id,
            storeId: item.storeId,
          });
        });

        storeInfoList.push({
          storeId: ele.storeId,
          storeName: ele.storeName,
          remark: '',
        });
        submitCouponList.push({
          storeId: ele.storeId,
          couponList: ele.couponList || [],
        });
        this.noteInfo.push('');
        this.tempNoteInfo.push('');
        orderCardList.push(orderCard);
      });

    this.setData({ orderCardList, storeInfoList, submitCouponList });
    return data;
  },
  onGotoAddress() {
    /** 获取一个Promise */
    getAddressPromise()
      .then((address) => {
        this.handleOptionsParams({
          userAddressReq: { ...address, checked: true },
        });
      })
      .catch(() => {});

    const { userAddressReq } = this; // 收货地址

    let id = '';

    if (userAddressReq?.id) {
      id = `&id=${userAddressReq.id}`;
    }

    wx.navigateTo({
      url: `/pages/usercenter/address/list/index?selectMode=1&isOrderSure=1${id}`,
    });
  },
  onNotes(e) {
    const { storenoteindex: storeNoteIndex } = e.currentTarget.dataset;
    // 添加备注信息
    this.setData({
      dialogShow: true,
      storeNoteIndex,
    });
  },
  onInput(e) {
    const { storeNoteIndex } = this.data;
    this.noteInfo[storeNoteIndex] = e.detail.value;
  },
  onBlur() {
    this.setData({
      notesPosition: 'center',
    });
  },
  onFocus() {
    this.setData({
      notesPosition: 'self',
    });
  },
  onTap() {
    this.setData({
      placeholder: '',
    });
  },
  onNoteConfirm() {
    // 备注信息 确认按钮
    const { storeInfoList, storeNoteIndex } = this.data;
    this.tempNoteInfo[storeNoteIndex] = this.noteInfo[storeNoteIndex];
    storeInfoList[storeNoteIndex].remark = this.noteInfo[storeNoteIndex];

    this.setData({
      dialogShow: false,
      storeInfoList,
    });
  },
  onNoteCancel() {
    // 备注信息 取消按钮
    const { storeNoteIndex } = this.data;
    this.noteInfo[storeNoteIndex] = this.tempNoteInfo[storeNoteIndex];
    this.setData({
      dialogShow: false,
    });
  },

  onSureCommit() {
    // 商品库存不足继续结算
    const { settleDetailData } = this.data;
    const { outOfStockGoodsList, storeGoodsList, inValidGoodsList } =
      settleDetailData;
    if (
      (outOfStockGoodsList && outOfStockGoodsList.length > 0) ||
      (inValidGoodsList && storeGoodsList)
    ) {
      // 合并正常商品 和 库存 不足商品继续支付
      // 过滤不必要的参数
      const filterOutGoodsList = [];
      outOfStockGoodsList &&
        outOfStockGoodsList.forEach((outOfStockGoods) => {
          const { storeName } = outOfStockGoods;
          outOfStockGoods.unSettlementGoods.forEach((ele) => {
            const data = ele;
            data.quantity = ele.reminderStock;
            data.storeName = storeName;
            filterOutGoodsList.push(data);
          });
        });
      const filterStoreGoodsList = this.getRequestGoodsList(storeGoodsList);
      const goodsRequestList = filterOutGoodsList.concat(filterStoreGoodsList);
      this.handleOptionsParams({ goodsRequestList });
    }
  },
  // 提交订单
  submitOrder() {
    const {
      settleDetailData,
      userAddressReq,
      invoiceData,
      storeInfoList,
      submitCouponList,
    } = this.data;
    const { goodsRequestList } = this;

    console.log('[submitOrder] 开始提交订单');
    console.log('[submitOrder] settleDetailData:', settleDetailData);
    console.log('[submitOrder] userAddressReq:', userAddressReq);
    console.log('[submitOrder] goodsRequestList:', goodsRequestList);

    // 检查settleDetailData是否存在
    if (!settleDetailData) {
      console.error('[submitOrder] settleDetailData is undefined');
      Toast({
        context: this,
        selector: '#t-toast',
        message: '订单数据异常，请重新进入',
        duration: 2000,
        icon: 'help-circle',
      });
      return;
    }

    // 检查是否有收货地址
    const hasAddress = userAddressReq || settleDetailData.userAddress;
    if (!hasAddress) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请添加收货地址',
        duration: 2000,
        icon: 'help-circle',
      });
      return;
    }

    // 检查订单状态
    if (this.payLock) {
      console.log('[submitOrder] 支付锁定中，忽略重复提交');
      return;
    }

    if (!settleDetailData.settleType || !settleDetailData.totalAmount) {
      console.error('[submitOrder] 订单数据不完整:', {
        settleType: settleDetailData.settleType,
        totalAmount: settleDetailData.totalAmount
      });
      Toast({
        context: this,
        selector: '#t-toast',
        message: '订单数据不完整，请重新进入',
        duration: 2000,
        icon: 'help-circle',
      });
      return;
    }
    this.payLock = true;
    const resSubmitCouponList = this.handleCouponList(submitCouponList);
    
    // 获取用户地址信息
    const userAddress = settleDetailData.userAddress || userAddressReq;
    const userName = userAddress ? userAddress.name : '未知用户';
    
    const params = {
      userAddressReq: userAddress,
      goodsRequestList: goodsRequestList,
      userName: userName,
      totalAmount: settleDetailData.totalPayAmount, //取优惠后的结算金额
      invoiceRequest: null,
      storeInfoList,
      couponList: resSubmitCouponList,
    };
    
    console.log('[submitOrder] 提交订单参数:', params);
    
    if (invoiceData && invoiceData.email) {
      params.invoiceRequest = invoiceData;
    }
    commitPay(params).then(
      (res) => {
        this.payLock = false;
        console.log('[submitOrder] commitPay响应:', res);
        
        const { data } = res;
        
        // 检查响应是否成功
        if (!res || res.code !== 'Success') {
          console.error('[submitOrder] 订单提交失败:', res);
          Toast({
            context: this,
            selector: '#t-toast',
            message: res?.msg || '提交订单超时，请稍后重试',
            duration: 2000,
            icon: '',
          });
          setTimeout(() => {
            // 提交支付失败   返回购物车
            wx.navigateBack();
          }, 2000);
          return;
        }
        
        // 提交出现 失效 不在配送范围 限购的商品 提示弹窗
        if (this.isInvalidOrder(data)) {
          return;
        }
        
        console.log('[submitOrder] 订单提交成功，开始处理支付');
        this.handlePay(data, settleDetailData);
      },
      (err) => {
        this.payLock = false;
        if (
          err.code === 'CONTAINS_INSUFFICIENT_GOODS' ||
          err.code === 'TOTAL_AMOUNT_DIFFERENT'
        ) {
          Toast({
            context: this,
            selector: '#t-toast',
            message: err.msg || '支付异常',
            duration: 2000,
            icon: '',
          });
          this.init();
        } else if (err.code === 'ORDER_PAY_FAIL') {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '支付失败',
            duration: 2000,
            icon: 'close-circle',
          });
          setTimeout(() => {
            wx.redirectTo({ url: '/order/list' });
          });
        } else if (err.code === 'ILLEGAL_CONFIG_PARAM') {
          Toast({
            context: this,
            selector: '#t-toast',
            message:
              '支付失败，微信支付商户号设置有误，请商家重新检查支付设置。',
            duration: 2000,
            icon: 'close-circle',
          });
          setTimeout(() => {
            wx.redirectTo({ url: '/order/list' });
          });
        } else {
          Toast({
            context: this,
            selector: '#t-toast',
            message: err.msg || '提交支付超时，请稍后重试',
            duration: 2000,
            icon: '',
          });
          setTimeout(() => {
            // 提交支付失败  返回购物车
            wx.navigateBack();
          }, 2000);
        }
      },
    );
  },

  // 处理支付
  handlePay(data, settleDetailData) {
    console.log('[handlePay] 开始处理支付');
    console.log('[handlePay] 订单数据:', data);
    console.log('[handlePay] 结算数据:', settleDetailData);
    
    // 检查数据是否存在
    if (!data) {
      console.error('[handlePay] 订单数据为空');
      Toast({
        context: this,
        selector: '#t-toast',
        message: '订单数据异常',
        duration: 2000,
        icon: 'help-circle',
      });
      return;
    }
    
    if (!settleDetailData) {
      console.error('[handlePay] 结算数据为空');
      Toast({
        context: this,
        selector: '#t-toast',
        message: '结算数据异常',
        duration: 2000,
        icon: 'help-circle',
      });
      return;
    }
    
    const { channel, payInfo, tradeNo, interactId, transactionId } = data;
    const { totalAmount, totalPayAmount, storeGoodsList } = settleDetailData;
    
    // 构建商品列表
    const goodsList = [];
    if (storeGoodsList && storeGoodsList.length > 0) {
      storeGoodsList.forEach(store => {
        if (store.skuDetailVos && store.skuDetailVos.length > 0) {
          store.skuDetailVos.forEach(goods => {
            goodsList.push({
              skuId: goods.skuId,
              good_id: goods.good_id,
              goodsName: goods.goodsName,
              title: goods.goodsName,
              quantity: goods.quantity,
              price: goods.tagPrice || goods.settlePrice,
              settlePrice: goods.settlePrice
            });
          });
        }
      });
    }
    
    const payOrderInfo = {
      payInfo: payInfo,
      orderId: tradeNo,
      orderAmt: totalAmount,
      payAmt: totalPayAmount,
      interactId: interactId,
      tradeNo: tradeNo,
      transactionId: transactionId,
      goodsList: goodsList
    };

    if (channel === 'wechat') {
      wechatPayOrder(payOrderInfo);
    }
  },

  hide() {
    // 隐藏 popup
    this.setData({
      'settleDetailData.abnormalDeliveryGoodsList': [],
    });
  },
  onReceipt() {
    // 跳转 开发票
    const invoiceData = this.invoiceData || {};
    wx.navigateTo({
      url: `/pages/order/receipt/index?invoiceData=${JSON.stringify(
        invoiceData,
      )}`,
    });
  },

  onCoupons(e) {
    const { submitCouponList, currentStoreId } = this.data;
    const { goodsRequestList } = this;
    const { selectedList } = e.detail;
    const tempSubmitCouponList = submitCouponList.map((storeCoupon) => {
      return {
        couponList:
          storeCoupon.storeId === currentStoreId
            ? selectedList
            : storeCoupon.couponList,
      };
    });
    const resSubmitCouponList = this.handleCouponList(tempSubmitCouponList);
    //确定选择优惠券
    this.handleOptionsParams({ goodsRequestList }, resSubmitCouponList);
    this.setData({ couponsShow: false });
  },
  onOpenCoupons(e) {
    const { storeid } = e.currentTarget.dataset;
    this.setData({
      couponsShow: true,
      currentStoreId: storeid,
    });
  },

  handleCouponList(storeCouponList) {
    //处理门店优惠券   转换成接口需要
    if (!storeCouponList) return [];
    const resSubmitCouponList = [];
    storeCouponList.forEach((ele) => {
      resSubmitCouponList.push(...ele.couponList);
    });
    return resSubmitCouponList;
  },

  onGoodsNumChange(e) {
    const {
      detail: { value },
      currentTarget: {
        dataset: { goods },
      },
    } = e;
    const index = this.goodsRequestList.findIndex(
      ({ storeId, good_id, skuId }) =>
        goods.storeId === storeId &&
        goods.good_id === good_id &&
        goods.skuId === skuId,
    );
    if (index >= 0) {
      // eslint-disable-next-line no-confusing-arrow
      const goodsRequestList = this.goodsRequestList.map((item, i) =>
        i === index ? { ...item, quantity: value } : item,
      );
      this.handleOptionsParams({ goodsRequestList });
    }
  },

  onPopupChange() {
    this.setData({
      popupShow: !this.data.popupShow,
    });
  },
});
