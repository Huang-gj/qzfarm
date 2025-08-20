// payment-test.js
import { wechatPayOrder } from '../order/order-confirm/pay';

Page({
  data: {
    testAmount: 1, // 测试金额（元）
    testDescription: '测试商品'
  },

  onLoad() {
    console.log('[payment-test] 支付测试页面加载');
  },

  // 输入金额
  onAmountInput(e) {
    this.setData({
      testAmount: parseFloat(e.detail.value) || 1
    });
  },

  // 输入商品描述
  onDescriptionInput(e) {
    this.setData({
      testDescription: e.detail.value || '测试商品'
    });
  },

  // 测试支付
  onTestPay() {
    const { testAmount, testDescription } = this.data;
    
    console.log('[payment-test] 开始测试支付:', {
      amount: testAmount,
      description: testDescription
    });

    // 构建测试订单信息
    const payOrderInfo = {
      orderId: `TEST_${Date.now()}`,
      orderAmt: testAmount,
      payAmt: testAmount,
      tradeNo: `TEST_${Date.now()}`,
      goodsList: [{
        skuId: 'test_sku_001',
        good_id: 'test_goods_001',
        goodsName: testDescription,
        title: testDescription,
        quantity: 1,
        price: testAmount,
        settlePrice: testAmount
      }]
    };

    // 调用微信支付
    wechatPayOrder(payOrderInfo);
  },

  // 查看支付配置
  onViewConfig() {
    const config = require('../../config/payment');
    console.log('[payment-test] 当前支付配置:', config.getPaymentConfig());
    
    wx.showModal({
      title: '支付配置',
      content: `AppID: ${config.getPaymentConfig().wechat.appid}\n商户号: ${config.getPaymentConfig().wechat.mchid}`,
      showCancel: false
    });
  }
}); 