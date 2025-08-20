import { config } from '../../config/index';
import { mockIp, mockReqId } from '../../utils/mock';

/** 获取结算mock数据 */
function mockFetchSettleDetail(params) {
  const { delay } = require('../_utils/delay');
  const { genSettleDetail } = require('../../model/order/orderConfirm');

  return delay().then(() => genSettleDetail(params));
}

/** 提交mock订单 */
function mockDispatchCommitPay() {
  const { delay } = require('../_utils/delay');

  return delay().then(() => ({
    data: {
      isSuccess: true,
      tradeNo: '350930961469409099',
      payInfo: '{}',
      code: null,
      transactionId: 'E-200915180100299000',
      msg: null,
      interactId: '15145',
      channel: 'wechat',
      limitGoodsList: null,
    },
    code: 'Success',
    msg: null,
    requestId: mockReqId(),
    clientIp: mockIp(),
    rt: 891,
    success: true,
  }));
}

/** 获取结算数据 */
export function fetchSettleDetail(params) {
  console.log('[fetchSettleDetail] 开始获取结算数据，参数:', params);
  
  if (config.useMock) {
    return mockFetchSettleDetail(params);
  }

  // 直接计算结算数据，不依赖后端API
  return new Promise((resolve) => {
    try {
      const { goodsRequestList, userAddressReq, couponList } = params;
      
      console.log('[fetchSettleDetail] 商品列表:', goodsRequestList);
      console.log('[fetchSettleDetail] 用户地址:', userAddressReq);
      console.log('[fetchSettleDetail] 优惠券列表:', couponList);
      
      // 计算商品总额
      let totalSalePrice = 0;
      let totalGoodsCount = 0;
      
      if (!goodsRequestList || goodsRequestList.length === 0) {
        console.error('[fetchSettleDetail] 商品列表为空');
        throw new Error('商品列表不能为空');
      }
      
      goodsRequestList.forEach(goods => {
        const itemPrice = (goods.price || 0) * (goods.quantity || 1);
        totalSalePrice += itemPrice;
        totalGoodsCount += goods.quantity || 1;
        console.log(`[fetchSettleDetail] 商品 ${goods.title}: 单价=${goods.price}, 数量=${goods.quantity}, 小计=${itemPrice}`);
      });
      
      console.log('[fetchSettleDetail] 计算出的商品总额:', totalSalePrice);
      console.log('[fetchSettleDetail] 商品总数量:', totalGoodsCount);
      
      // 构建结算数据
      const settleData = {
        settleType: userAddressReq ? 1 : 0,
        userAddress: userAddressReq,
        totalGoodsCount: totalGoodsCount,
        packageCount: 1,
        totalAmount: totalSalePrice,
        totalPayAmount: totalSalePrice, // 暂时不考虑优惠券和运费
        totalDiscountAmount: 0,
        totalPromotionAmount: 0,
        totalCouponAmount: 0,
        totalSalePrice: totalSalePrice,
        totalGoodsAmount: totalSalePrice,
        totalDeliveryFee: 0,
        invoiceRequest: null,
        skuImages: null,
        deliveryFeeList: null,
        storeGoodsList: [
          {
            storeId: '1000',
            storeName: 'QZFarm',
            remark: null,
            goodsCount: totalGoodsCount,
            deliveryFee: 0,
            deliveryWords: null,
            storeTotalAmount: totalSalePrice,
            storeTotalPayAmount: totalSalePrice,
            storeTotalDiscountAmount: 0,
            storeTotalCouponAmount: 0,
            skuDetailVos: goodsRequestList.map(goods => ({
              storeId: goods.storeId || '1000',
              good_id: goods.good_id,
              skuId: goods.skuId || `sku_${goods.good_id}`,
              goodsName: goods.title,
              image: goods.primaryImage || goods.thumb,
              reminderStock: 999,
              quantity: goods.quantity || 1,
              payPrice: goods.price || 0,
              totalSkuPrice: (goods.price || 0) * (goods.quantity || 1),
              discountSettlePrice: goods.price || 0,
              realSettlePrice: goods.price || 0,
              settlePrice: goods.price || 0,
              oriPrice: goods.originPrice || goods.price || 0,
              tagPrice: null,
              tagText: null,
              skuSpecLst: goods.specInfo || [],
              promotionIds: null,
              weight: 0.0,
              unit: 'KG',
              volume: null,
              masterGoodsType: 0,
              viceGoodsType: 0,
              roomId: goods.roomId || '',
              egoodsName: null,
            })),
            couponList: couponList || []
          }
        ],
        inValidGoodsList: null,
        outOfStockGoodsList: null,
        limitGoodsList: null,
        abnormalDeliveryGoodsList: null,
        invoiceSupport: 1,
      };
      
      console.log('[fetchSettleDetail] 构建的结算数据:', settleData);
      
      const response = {
        data: settleData,
        code: 'Success',
        msg: null,
        success: true
      };
      
      console.log('[fetchSettleDetail] 返回的响应数据:', response);
      resolve(response);
      
    } catch (error) {
      console.error('[fetchSettleDetail] 计算结算数据失败:', error);
      resolve({
        data: null,
        code: 'Error',
        msg: error.message,
        success: false
      });
    }
  });
}

/* 提交订单 */
export function dispatchCommitPay(params) {
  console.log('[dispatchCommitPay] 开始提交订单，参数:', params);
  
  if (config.useMock) {
    return mockDispatchCommitPay(params);
  }

  // 模拟真实的订单提交流程
  return new Promise((resolve) => {
    try {
      console.log('[dispatchCommitPay] 模拟订单提交成功');
      
      // 生成模拟的订单响应数据
      const mockOrderResponse = {
        code: 'Success',
        msg: null,
        data: {
          channel: 'wechat',
          payInfo: '{}',
          tradeNo: `ORDER${Date.now()}`,
          interactId: `INTERACT${Date.now()}`,
          transactionId: `TRANS${Date.now()}`,
          limitGoodsList: null,
          inValidGoodsList: null,
          outOfStockGoodsList: null,
          abnormalDeliveryGoodsList: null
        },
        success: true
      };
      
      console.log('[dispatchCommitPay] 返回订单响应:', mockOrderResponse);
      resolve(mockOrderResponse);
      
    } catch (error) {
      console.error('[dispatchCommitPay] 订单提交失败:', error);
      resolve({
        code: 'Error',
        msg: error.message || '订单提交失败',
        success: false
      });
    }
  });
}

/** 开发票 */
export function dispatchSupplementInvoice() {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay();
  }

  return new Promise((resolve) => {
    resolve('real api');
  });
}
