/*
 * @Author: rileycai
 * @Date: 2022-03-14 21:18:07
 * @LastEditTime: 2022-03-22 21:17:16
 * @LastEditors: rileycai
 * @Description:
 * @FilePath: /tdesign-miniprogram-starter/pages/order/pay-result/index.js
 */
Page({
  data: {
    totalPaid: 0,
    orderNo: '',
    groupId: '',
    productType: 'goods',
    groupon: null,
    spu: null,
    adUrl: '',
  },

  onLoad(options) {
    const {
      totalPaid = 0, orderNo = '', groupId = '', productType = 'goods'
    } = options;
    this.setData({
      totalPaid,
      orderNo,
      groupId,
      productType,
    });
  },

  onTapReturn(e) {
    const target = e.currentTarget.dataset.type;
    const {
      orderNo, productType
    } = this.data;
    if (target === 'home') {

      wx.switchTab({
        url: '/pages/home/home'
      });
    } else if (target === 'orderList') {
      wx.navigateTo({
        url: `/pages/order/order-list/index?orderNo=${orderNo}&productType=${productType}`,
      });
    } else if (target === 'order') {
      wx.navigateTo({
        url: `/pages/order/order-detail/index?orderNo=${orderNo}&productType=${productType}`,
      });
    }
  },

  navBackHandle() {
    wx.navigateBack();
  },
});