import { OrderStatus } from '../config';
import {
  fetchOrders,
  fetchOrdersCount,
} from '../../../services/order/orderList';
import { cosThumb } from '../../../utils/util';

Page({
  page: {
    size: 5,
    num: 1,
  },

  data: {
    tabs: [
      { key: -1, text: '全部' },
      { key: OrderStatus.PENDING_PAYMENT, text: '待付款', info: '' },
      { key: OrderStatus.PENDING_DELIVERY, text: '待发货', info: '' },
      { key: OrderStatus.PENDING_RECEIPT, text: '待收货', info: '' },
      { key: OrderStatus.COMPLETE, text: '已完成', info: '' },
    ],
    curTab: -1,
    orderList: [],
    listLoading: 0,
    pullDownRefreshing: false,
    emptyImg:
      'https://cdn-we-retail.ym.tencent.com/miniapp/order/empty-order-list.png',
    backRefresh: false,
    status: -1,
  },

  onLoad(query) {
    console.log('[order-list onLoad] 接收到的参数:', query);
    
    // 获取从用户中心传递过来的订单数据
    const app = getApp();
    const currentOrderData = app.globalData.currentOrderData;
    
    if (currentOrderData) {
      console.log('[order-list onLoad] 获取到订单数据:', currentOrderData);
      this.setData({
        orderType: currentOrderData.orderType,
        orderData: currentOrderData.data,
        tabType: currentOrderData.tabType
      });
      
      // 根据tabType设置当前选中的tab
      let status = -1;
      if (currentOrderData.tabType !== null) {
        status = currentOrderData.tabType;
      }
      
      this.init(status);
    } else {
      // 兼容原有的URL参数方式
      let status = parseInt(query.status || -1);
      status = this.data.tabs.map((t) => t.key).includes(status) ? status : -1;
      this.init(status);
    }
    
    this.pullDownRefresh = this.selectComponent('#wr-pull-down-refresh');
  },

  onShow() {
    if (!this.data.backRefresh) return;
    this.onRefresh();
    this.setData({ backRefresh: false });
  },

  onReachBottom() {
    if (this.data.listLoading === 0) {
      this.getOrderList(this.data.curTab);
    }
  },

  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onPullDownRefresh_(e) {
    const { callback } = e.detail;
    this.setData({ pullDownRefreshing: true });
    this.refreshList(this.data.curTab)
      .then(() => {
        this.setData({ pullDownRefreshing: false });
        callback && callback();
      })
      .catch((err) => {
        this.setData({ pullDownRefreshing: false });
        Promise.reject(err);
      });
  },

  init(status) {
    status = status !== undefined ? status : this.data.curTab;
    this.setData({
      status,
      curTab: status
    });
    
    // 如果有从用户中心传递过来的订单数据，直接使用
    if (this.data.orderData) {
      console.log('[order-list init] 使用传递过来的订单数据');
      this.processOrderData(this.data.orderData);
    } else {
      // 否则使用原有的API调用方式
      console.log('[order-list init] 使用原有API调用方式');
      this.refreshList(status);
    }
  },

  // 处理订单数据的方法
  processOrderData(orderData) {
    console.log('[order-list processOrderData] 处理订单数据:', orderData);
    
    try {
      let orderList = [];
      
      if (orderData && orderData.data) {
        // 根据订单类型处理数据
        if (this.data.orderType === 'goods') {
          orderList = this.processGoodOrderData(orderData.data);
        } else if (this.data.orderType === 'lands') {
          orderList = this.processLandOrderData(orderData.data);
        }
      }
      
      this.setData({
        orderList,
        listLoading: 0
      });
      
      console.log('[order-list processOrderData] 处理后的订单列表:', orderList);
      
    } catch (error) {
      console.error('[order-list processOrderData] 处理订单数据失败:', error);
      this.setData({
        orderList: [],
        listLoading: 3
      });
    }
  },

  // 处理商品订单数据
  processGoodOrderData(data) {
    console.log('[order-list processGoodOrderData] 处理商品订单数据:', data);
    
    // 根据API响应结构处理数据
    // API返回结构: { code: 200, msg: "success", good_order: [...] }
    const goodOrders = data.good_order || [];
    
    return goodOrders.map(order => ({
      id: order.good_order_id || order.id,
      orderNo: order.good_order_id?.toString() || order.id?.toString(),
      parentOrderNo: order.good_order_id?.toString() || order.id?.toString(),
      storeId: order.farm_id || 0,
      storeName: `农场${order.farm_id}`,
      status: this.mapGoodOrderStatus(order), // 需要根据实际业务逻辑映射状态
      statusDesc: this.getGoodOrderStatusDesc(order),
      amount: order.price || 0,
      totalAmount: (order.price * order.count) || 0,
      createTime: order.create_time || '',
      // 商品信息
      goodsList: [{
        id: order.good_id, // 直接使用good_id
        thumb: this.getGoodOrderImage(order.image_urls),
        title: order.title || `商品${order.good_id}`,
        skuId: order.good_id, // 直接使用good_id
        good_id: order.good_id, // 直接使用good_id
        specs: [{
          specValue: order.units || '个'
        }],
        price: order.price || 0,
        num: order.count || 0,
        titlePrefixTags: []
      }],
      // 订单类型标识
      orderType: 'goods',
      // 原始数据
      rawData: order
    }));
  },

  // 映射商品订单状态
  mapGoodOrderStatus(order) {
    // 这里需要根据实际的业务逻辑来映射状态
    // 暂时返回一个默认状态，需要根据实际需求调整
    return 1; // 假设1表示待付款状态
  },

  // 获取商品订单状态描述
  getGoodOrderStatusDesc(order) {
    // 这里需要根据实际的业务逻辑来返回状态描述
    return '待付款';
  },

  // 获取商品订单图片
  getGoodOrderImage(imageUrls) {
    if (!imageUrls) return '';
    
    try {
      // 如果是JSON字符串，解析它
      if (typeof imageUrls === 'string' && imageUrls.startsWith('[')) {
        const images = JSON.parse(imageUrls);
        return images[0] || '';
      }
      
      // 如果是逗号分隔的字符串
      if (typeof imageUrls === 'string' && imageUrls.includes(',')) {
        const images = imageUrls.split(',');
        return images[0] || '';
      }
      
      // 如果直接是图片URL
      return imageUrls;
    } catch (error) {
      console.error('[getGoodOrderImage] 解析图片URL失败:', error);
      return '';
    }
  },

  // 处理土地订单数据
  processLandOrderData(data) {
    console.log('[order-list processLandOrderData] 处理土地订单数据:', data);
    
    // 根据API响应结构处理数据
    // API返回结构: { code: 200, msg: "success", land_order: [...] }
    const landOrders = data.land_order || [];
    
    return landOrders.map(order => ({
      id: order.land_order_id || order.id,
      orderNo: order.land_order_id?.toString() || order.id?.toString(),
      parentOrderNo: order.land_order_id?.toString() || order.id?.toString(),
      storeId: order.farm_id || 0,
      storeName: `农场${order.farm_id}`,
      status: this.mapLandOrderStatus(order), // 需要根据实际业务逻辑映射状态
      statusDesc: this.getLandOrderStatusDesc(order),
      amount: order.price || 0,
      totalAmount: (order.price * order.count) || 0,
      createTime: order.create_time || '',
      // 土地信息
      goodsList: [{
        id: order.land_id || 0,
        thumb: this.getLandOrderImage(order.image_urls),
        title: `土地${order.land_id}`,
        skuId: order.land_id || 0,
        land_id: order.land_id || 0,
        specs: [{
          specValue: `租赁${order.count}个月`
        }],
        price: order.price || 0,
        num: order.count || 0,
        titlePrefixTags: []
      }],
      // 订单类型标识
      orderType: 'lands',
      // 原始数据
      rawData: order
    }));
  },

  // 映射土地订单状态
  mapLandOrderStatus(order) {
    // 这里需要根据实际的业务逻辑来映射状态
    // 暂时返回一个默认状态，需要根据实际需求调整
    return 1; // 假设1表示待付款状态
  },

  // 获取土地订单状态描述
  getLandOrderStatusDesc(order) {
    // 这里需要根据实际的业务逻辑来返回状态描述
    return '待付款';
  },

  // 获取土地订单图片
  getLandOrderImage(imageUrls) {
    if (!imageUrls) return '';
    
    try {
      // 如果是JSON字符串，解析它
      if (typeof imageUrls === 'string' && imageUrls.startsWith('[')) {
        const images = JSON.parse(imageUrls);
        return images[0] || '';
      }
      
      // 如果是逗号分隔的字符串
      if (typeof imageUrls === 'string' && imageUrls.includes(',')) {
        const images = imageUrls.split(',');
        return images[0] || '';
      }
      
      // 如果直接是图片URL
      return imageUrls;
    } catch (error) {
      console.error('[getLandOrderImage] 解析图片URL失败:', error);
      return '';
    }
  },

  getOrderList(statusCode = -1, reset = false) {
    const params = {
      parameter: {
        pageSize: this.page.size,
        pageNum: this.page.num,
      },
    };
    if (statusCode !== -1) params.parameter.orderStatus = statusCode;
    this.setData({ listLoading: 1 });
    return fetchOrders(params)
      .then((res) => {
        this.page.num++;
        let orderList = [];
        if (res && res.data && res.data.orders) {
          orderList = (res.data.orders || []).map((order) => {
            return {
              id: order.orderId,
              orderNo: order.orderNo,
              parentOrderNo: order.parentOrderNo,
              storeId: order.storeId,
              storeName: order.storeName,
              status: order.orderStatus,
              statusDesc: order.orderStatusName,
              amount: order.paymentAmount,
              totalAmount: order.totalAmount,
              logisticsNo: order.logisticsVO.logisticsNo,
              createTime: order.createTime,
              goodsList: (order.orderItemVOs || []).map((goods) => ({
                id: goods.id,
                thumb: cosThumb(goods.goodsPictureUrl, 70),
                title: goods.goodsName,
                skuId: goods.skuId,
                good_id: goods.good_id,
                specs: (goods.specifications || []).map(
                  (spec) => spec.specValue,
                ),
                price: goods.tagPrice ? goods.tagPrice : goods.actualPrice,
                num: goods.buyQuantity,
                titlePrefixTags: goods.tagText ? [{ text: goods.tagText }] : [],
              })),
              buttons: order.buttonVOs || [],
              groupInfoVo: order.groupInfoVo,
              freightFee: order.freightFee,
            };
          });
        }
        return new Promise((resolve) => {
          if (reset) {
            this.setData({ orderList: [] }, () => resolve());
          } else resolve();
        }).then(() => {
          this.setData({
            orderList: this.data.orderList.concat(orderList),
            listLoading: orderList.length > 0 ? 0 : 2,
          });
        });
      })
      .catch((err) => {
        this.setData({ listLoading: 3 });
        return Promise.reject(err);
      });
  },

  onReTryLoad() {
    this.getOrderList(this.data.curTab);
  },

  onTabChange(e) {
    const { value } = e.detail;
    this.setData({
      status: value,
    });
    this.refreshList(value);
  },

  getOrdersCount() {
    return fetchOrdersCount().then((res) => {
      const tabsCount = res.data || [];
      const { tabs } = this.data;
      tabs.forEach((tab) => {
        const tabCount = tabsCount.find((c) => c.tabType === tab.key);
        if (tabCount) {
          tab.info = tabCount.orderNum;
        }
      });
      this.setData({ tabs });
    });
  },

  refreshList(status = -1) {
    this.page = {
      size: this.page.size,
      num: 1,
    };
    this.setData({ curTab: status, orderList: [] });

    return Promise.all([
      this.getOrderList(status, true),
      this.getOrdersCount(),
    ]);
  },

  onRefresh() {
    this.refreshList(this.data.curTab);
  },

  onOrderCardTap(e) {
    const { order } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/order-detail/index?orderNo=${order.orderNo}`,
    });
  },
});
