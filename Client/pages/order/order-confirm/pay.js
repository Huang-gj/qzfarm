import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';

import { dispatchCommitPay } from '../../../services/order/orderConfirm';
import { createWechatOrder, requestWechatPayment, getUserOpenid, generateOrderNo } from '../../../services/payment/wechatPay';

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

  // 确定商品类型
  let productType = 'goods'; // 默认为农产品
  if (goodsList && goodsList.length > 0) {
    const firstItem = goodsList[0];
    if (firstItem.cartType === 'land' || 
        firstItem.land_id || 
        (firstItem.title && firstItem.title.includes('土地'))) {
      productType = 'land';
    }
  }

  const params = {
    totalPaid: payAmt,
    orderNo: tradeNo,
    productType: productType, // 添加商品类型参数
  };
  if (groupId) {
    params.groupId = groupId;
  }
  if (promotionId) {
    params.promotionId = promotionId;
  }
  const paramsStr = Object.keys(params)
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  
  // 根据当前页面决定跳转行为
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
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
