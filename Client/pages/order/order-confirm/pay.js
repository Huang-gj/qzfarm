import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';

import { dispatchCommitPay } from '../../../services/order/orderConfirm';
import { createWechatOrder, requestWechatPayment, getUserOpenid, generateOrderNo } from '../../../services/payment/wechatPay';
import { updateCartNum } from '../../../services/cart/cart';

// 真实的提交支付
export const commitPay = (params) => {
  return dispatchCommitPay({
    goodsRequestList: params.goodsRequestList, // 待结算的商品集合
    invoiceRequest: params.invoiceRequest, // 发票信息
    // isIgnore: params.isIgnore || false, // 删掉 是否忽视库存不足和商品失效,继续结算,true=继续结算 购物车请赋值false
    userAddressReq: params.userAddressReq, // 地址信息(用户在购物选择更换地址)
    currency: params.currency || 'CNY', // 支付货币: 人民币=CNY，美元=USD
    logisticsType: params.logisticsType || 1, // 配送方式 0=无需配送 1=快递 2=商家 3=同城 4=自提
    // orderMark: params.orderMark, // 下单备注
    orderType: params.orderType || 0, // 订单类型 0=普通订单 1=虚拟订单
    payType: params.payType || 1, // 支付类型(0=线上、1=线下)
    totalAmount: params.totalAmount, // 新增字段"totalAmount"总的支付金额
    userName: params.userName, // 用户名
    payWay: 1,
    authorizationCode: '', //loginCode, // 登录凭证
    storeInfoList: params.storeInfoList, //备注信息列表
    couponList: params.couponList,
    groupInfo: params.groupInfo,
  });
};

export const paySuccess = (payOrderInfo) => {
  const { payAmt, tradeNo, groupId, promotionId, goodsList } = payOrderInfo;
  // 支付成功
  Toast({
    context: this,
    selector: '#t-toast',
    message: '支付成功',
    duration: 2000,
    icon: 'check-circle',
  });

  // 获取商品类型（优先使用全局保存的，然后根据商品列表判断）
  const app = getApp();
  let productType = app.globalData.currentOrderType || 'goods';
  
  if (!app.globalData.currentOrderType && goodsList && goodsList.length > 0) {
    const firstItem = goodsList[0];
    if (firstItem.cartType === 'land' || 
        firstItem.land_id || 
        (firstItem.title && firstItem.title.includes('土地'))) {
      productType = 'land';
    }
  }

  // 检查是否为批量订单支付，如果是则清除购物车
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (currentPage && currentPage.isBatchOrder && goodsList && goodsList.length > 0) {
    console.log('[paySuccess] 批量订单支付成功，清除购物车中的已购买商品');
    clearPaidGoodsFromCart(goodsList, currentPage.cartType || productType);
  }

  const params = {
    totalPaid: payAmt,
    orderNo: tradeNo,
    productType: productType, // 添加商品类型参数
  };
  
  // 清除全局订单数据
  if (app.globalData.currentOrderId) {
    app.globalData.currentOrderId = null;
    app.globalData.currentOrderType = null;
  }
  if (groupId) {
    params.groupId = groupId;
  }
  if (promotionId) {
    params.promotionId = promotionId;
  }
  const paramsStr = Object.keys(params)
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  
  if (currentPage.route.includes('order-confirm')) {
    // 在订单确认页面，跳转到支付结果页面
    wx.redirectTo({ url: `/pages/order/pay-result/index?${paramsStr}` });
  } else {
    // 在其他页面（如订单列表），跳转到订单列表并刷新
    wx.redirectTo({ 
      url: '/pages/order/order-list/index',
      success: () => {
        // 延迟刷新订单列表
        setTimeout(() => {
          const orderListPage = getCurrentPages().find(page => 
            page.route.includes('order-list')
          );
          if (orderListPage && orderListPage.refreshList) {
            orderListPage.refreshList();
          }
        }, 500);
      }
    });
  }
};

// 清除购物车中已支付的商品
function clearPaidGoodsFromCart(paidGoodsList, cartType) {
  console.log('[clearPaidGoodsFromCart] 开始清除购物车商品');
  console.log('[clearPaidGoodsFromCart] 已支付商品:', paidGoodsList);
  console.log('[clearPaidGoodsFromCart] 购物车类型:', cartType);
  
  try {
    // 获取对应类型的购物车数据
    const storageKey = cartType === 'land' ? 'land_cart_data' : 'goods_cart_data';
    let cartData = wx.getStorageSync(storageKey);
    
    if (!cartData || !cartData.goodsList || cartData.goodsList.length === 0) {
      console.log('[clearPaidGoodsFromCart] 购物车为空，无需清除');
      return;
    }
    
    console.log('[clearPaidGoodsFromCart] 清除前购物车商品数量:', cartData.goodsList.length);
    
    // 删除已支付的商品
    paidGoodsList.forEach(paidGoods => {
      const index = cartData.goodsList.findIndex(cartItem => 
        cartItem.good_id == paidGoods.good_id && cartItem.skuId == paidGoods.skuId
      );
      
      if (index !== -1) {
        console.log('[clearPaidGoodsFromCart] 删除商品:', cartData.goodsList[index]);
        cartData.goodsList.splice(index, 1);
      }
    });
    
    console.log('[clearPaidGoodsFromCart] 清除后购物车商品数量:', cartData.goodsList.length);
    
    // 更新本地存储
    wx.setStorageSync(storageKey, cartData);
    
    // 更新购物车角标
    if (typeof updateCartNum === 'function') {
      updateCartNum();
    }
    
    // 触发购物车数据更新事件
    if (wx.eventCenter && typeof wx.eventCenter.emit === 'function') {
      wx.eventCenter.emit('cartDataUpdate', { 
        type: cartType,
        ts: Date.now(),
        reason: 'payment_success'
      });
    }
    
    console.log('[clearPaidGoodsFromCart] 购物车清除完成');
  } catch (error) {
    console.error('[clearPaidGoodsFromCart] 清除购物车失败:', error);
  }
}

export const payFail = (payOrderInfo, resultMsg) => {
  if (resultMsg === 'requestPayment:fail cancel') {
    if (payOrderInfo.dialogOnCancel) {
      //结算页，取消付款，dialog提示
      Dialog.confirm({
        title: '是否放弃付款',
        content: '商品可能很快就会被抢空哦，是否放弃付款？',
        confirmBtn: '放弃',
        cancelBtn: '继续付款',
      }).then(() => {
        wx.redirectTo({ url: '/pages/order/order-list/index' });
      });
    } else {
      //订单列表页，订单详情页，取消付款，toast提示
      Toast({
        context: this,
        selector: '#t-toast',
        message: '支付取消',
        duration: 2000,
        icon: 'close-circle',
      });
    }
  } else {
    Toast({
      context: this,
      selector: '#t-toast',
      message: `支付失败：${resultMsg}`,
      duration: 2000,
      icon: 'close-circle',
    });
    setTimeout(() => {
      wx.redirectTo({ url: '/pages/order/order-list/index' });
    }, 2000);
  }
};

// 微信支付方式
export const wechatPayOrder = async (payOrderInfo) => {
  try {
    console.log('[wechatPayOrder] 开始微信支付流程:', payOrderInfo);
    
    // 获取用户openid
    const openid = await getUserOpenid();
    console.log('[wechatPayOrder] 获取到openid:', openid);
    
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.user_id) {
      throw new Error('用户信息不存在，请重新登录');
    }
    
    // 生成商户订单号
    const outTradeNo = generateOrderNo();
    console.log('[wechatPayOrder] 生成订单号:', outTradeNo);
    
    // 构建商品列表
    const goodsList = payOrderInfo.goodsList || [];
    
    // 调用微信支付JSAPI下单
    const wechatOrderRes = await createWechatOrder({
      totalAmount: payOrderInfo.payAmt * 100, // 转换为分
      description: `QZFarm订单-${outTradeNo}`,
      outTradeNo: outTradeNo,
      openid: openid,
      goodsList: goodsList,
      userId: userInfo.user_id
    });
    
    console.log('[wechatPayOrder] 微信下单成功:', wechatOrderRes);
    
    // 发起微信支付
    await requestWechatPayment({
      timeStamp: wechatOrderRes.time_stamp,
      nonceStr: wechatOrderRes.nonce_str,
      package: wechatOrderRes.package,
      signType: wechatOrderRes.sign_type,
      paySign: wechatOrderRes.pay_sign
    });
    
    // 支付成功
    paySuccess({
      ...payOrderInfo,
      tradeNo: outTradeNo
    });
    
  } catch (err) {
    console.error('[wechatPayOrder] 微信支付失败:', err);
    payFail(payOrderInfo, err.message || err.errMsg || '支付失败');
  }
};
