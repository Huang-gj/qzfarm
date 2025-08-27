import { OrderStatus } from '../config';
import {
  fetchOrders,
  fetchOrdersCount,
} from '../../../services/order/orderList';
import { fetchGoodOrder } from '../../../services/order/fetchGoodOrder';
import { fetchLandOrder } from '../../../services/order/fetchLandOrder';
import { cosThumb } from '../../../utils/util';
import { genPicURL, getFirstImageUrl } from '../../../utils/genURL';

Page({
  page: {
    size: 5,
    num: 1,
  },

  data: {
    tabs: [
      { key: -1, text: '全部' },
      { key: 5, text: '待付款', info: '' },
      { key: 10, text: '待发货', info: '' },
      { key: 40, text: '待收货', info: '' },
      { key: 60, text: '待评价', info: '' },
      { key: 0, text: '退款/售后', info: '' },
    ],
    curTab: -1,
    orderList: [],
    listLoading: 0,
    pullDownRefreshing: false,
    emptyImg:
      'https://cdn-we-retail.ym.tencent.com/miniapp/order/empty-order-list.png',
    backRefresh: false,
    status: -1,
    orderType: '', // 添加订单类型字段
    orderData: null, // 添加订单数据字段
    tabType: null, // 添加标签类型字段
    productType: 'goods', // 添加商品类型字段
  },

  onLoad(query) {
    console.log('[order-list onLoad] 接收到的参数:', query);
    
    // 如果有orderNo参数，说明是从支付结果页面跳转过来，需要强制刷新数据
    if (query.orderNo) {
      console.log('[order-list onLoad] 从支付结果页面跳转，强制刷新数据');
      console.log('[order-list onLoad] 商品类型:', query.productType);
      
      // 保存商品类型信息
      this.setData({
        productType: query.productType || 'goods'
      });
      
      // 清除缓存数据，强制从服务器获取最新订单
      const app = getApp();
      if (app.globalData.currentOrderData) {
        app.globalData.currentOrderData = null;
      }
      
      // 根据商品类型调用相应的API获取最新订单数据
      this.fetchOrdersByType(query.productType || 'goods');
      return;
    }
    
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
        console.log('[order-list onLoad] 根据tabType设置初始状态:', status);
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

  async init(status) {
    status = status !== undefined ? status : this.data.curTab;
    this.setData({
      status,
      curTab: status
    });
    
    console.log('[order-list init] 当前数据状态:', {
      orderData: this.data.orderData,
      orderType: this.data.orderType,
      tabType: this.data.tabType
    });
    
    // 如果有从用户中心传递过来的订单数据，直接使用
    if (this.data.orderData) {
      console.log('[order-list init] 使用传递过来的订单数据');
      await this.processOrderData(this.data.orderData);
    } else {
      // 否则使用原有的API调用方式
      console.log('[order-list init] 使用原有API调用方式');
      this.refreshList(status);
    }
  },

  // 订单排序工具函数 - 按创建时间倒序排列，最新订单在顶部
  sortOrdersByTime(orders) {
    return orders.sort((a, b) => {
      const timeA = new Date(a.createTime || 0).getTime() || 0;
      const timeB = new Date(b.createTime || 0).getTime() || 0;
      // 如果时间相同，则按订单ID倒序排列（假设ID越大越新）
      if (timeA === timeB) {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idB - idA;
      }
      return timeB - timeA; // 倒序：最新的在前
    });
  },

  // 处理订单数据的方法
  async processOrderData(orderData) {
    console.log('[order-list processOrderData] 处理订单数据:', orderData);
    console.log('[order-list processOrderData] 当前订单类型:', this.data.orderType);
    console.log('[order-list processOrderData] 当前标签类型:', this.data.tabType);
    
    try {
      let orderList = [];
      
      // 根据订单类型处理数据
      if (this.data.orderType === 'goods') {
        console.log('[order-list processOrderData] 处理商品订单数据');
        orderList = await this.processGoodOrderData(orderData);
      } else if (this.data.orderType === 'lands') {
        console.log('[order-list processOrderData] 处理土地订单数据');
        orderList = await this.processLandOrderData(orderData);
      } else {
        console.warn('[order-list processOrderData] 未知的订单类型:', this.data.orderType);
      }
      
      // 根据tabType筛选订单
      if (this.data.tabType !== null) {
        console.log('[order-list processOrderData] 开始根据tabType筛选订单, tabType:', this.data.tabType);
        orderList = this.filterOrdersByTabType(orderList);
        console.log('[order-list processOrderData] 筛选后的订单列表:', orderList);
      }
      
      console.log('[order-list processOrderData] 处理后的订单列表:', orderList);
      console.log('[order-list processOrderData] 订单列表长度:', orderList.length);
      
      this.setData({
        orderList,
        listLoading: 0
      });
      
      console.log('[order-list processOrderData] 数据设置完成，当前orderList:', this.data.orderList);
      
    } catch (error) {
      console.error('[order-list processOrderData] 处理订单数据失败:', error);
      this.setData({
        orderList: [],
        listLoading: 3
      });
    }
  },

  // 处理商品订单数据
  async processGoodOrderData(data) {
    console.log('[order-list processGoodOrderData] 处理商品订单数据:', data);
    console.log('[order-list processGoodOrderData] 数据类型:', typeof data);
    console.log('[order-list processGoodOrderData] 数据键:', Object.keys(data));
    
    // 根据API响应结构处理数据
    // API返回结构: { code: 200, msg: "success", good_order: [...] }
    const goodOrders = data.good_order || [];
    console.log('[order-list processGoodOrderData] 提取的good_orders:', goodOrders);
    console.log('[order-list processGoodOrderData] good_orders长度:', goodOrders.length);
    
    if (goodOrders.length === 0) {
      console.warn('[order-list processGoodOrderData] good_orders为空数组');
      return [];
    }
    
    const processedOrders = [];
    
    for (let index = 0; index < goodOrders.length; index++) {
      const order = goodOrders[index];
      console.log(`[order-list processGoodOrderData] 处理第${index + 1}个订单:`, order);
      
      // 获取第一张图片
      const thumb = this.getGoodOrderImage(order.image_urls);
      
      const processedOrder = {
        id: order.good_order_id || order.id,
        orderNo: order.good_order_id?.toString() || order.id?.toString(),
        parentOrderNo: order.good_order_id?.toString() || order.id?.toString(),
        storeId: order.farm_id || 0,
        storeName: `农场${order.farm_id}`,
        status: this.mapGoodOrderStatus(order), // 需要根据实际业务逻辑映射状态
        statusDesc: this.getGoodOrderStatusDesc(order),
        amount: (order.price * order.count) || 0,
        totalAmount: (order.price * order.count) || 0,
        createTime: order.create_time || '',
        // 商品信息
        goodsList: [{
          id: order.good_id, // 直接使用good_id
          thumb: thumb,
          title: order.title || `商品${order.good_id}`,
          skuId: order.good_id, // 直接使用good_id
          good_id: order.good_id, // 直接使用good_id
          specs: [order.units || '个'], // 直接使用字符串数组
          price: order.price || 0,
          num: order.count || 0,
          titlePrefixTags: []
        }],
        // 订单类型标识
        orderType: 'goods',
        // 原始数据
        rawData: order
      };
      
      console.log(`[order-list processGoodOrderData] 第${index + 1}个订单处理结果:`, processedOrder);
      processedOrders.push(processedOrder);
    }
    
    // 按创建时间倒序排列，最新订单在顶部
    this.sortOrdersByTime(processedOrders);
    
    console.log('[order-list processGoodOrderData] 最终处理结果:', processedOrders);
    return processedOrders;
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
    // 使用新的getFirstImageUrl函数，简化图片处理逻辑
    return getFirstImageUrl(imageUrls);
  },

  // 处理土地订单数据
  async processLandOrderData(data) {
    console.log('[order-list processLandOrderData] 处理土地订单数据:', data);
    console.log('[order-list processLandOrderData] 数据类型:', typeof data);
    console.log('[order-list processLandOrderData] 数据键:', Object.keys(data));
    
    // 根据API响应结构处理数据
    // API返回结构: { code: 200, msg: "success", land_order: [...] }
    const landOrders = data.land_order || [];
    console.log('[order-list processLandOrderData] 提取的land_orders:', landOrders);
    console.log('[order-list processLandOrderData] land_orders长度:', landOrders.length);
    
    if (landOrders.length === 0) {
      console.warn('[order-list processLandOrderData] land_orders为空数组');
      return [];
    }
    
    const processedOrders = [];
    
    for (let index = 0; index < landOrders.length; index++) {
      const order = landOrders[index];
      console.log(`[order-list processLandOrderData] 处理第${index + 1}个订单:`, order);
      
      // 异步处理图片
      const thumb = this.getLandOrderImage(order.image_urls);
      
      const processedOrder = {
        id: order.land_order_id || order.id,
        orderNo: order.land_order_id?.toString() || order.id?.toString(),
        parentOrderNo: order.land_order_id?.toString() || order.id?.toString(),
        storeId: order.farm_id || 0,
        storeName: `农场${order.farm_id}`,
        status: this.mapLandOrderStatus(order), // 需要根据实际业务逻辑映射状态
        statusDesc: this.getLandOrderStatusDesc(order),
        amount: (order.price * order.count) || 0,
        totalAmount: (order.price * order.count) || 0,
        createTime: order.create_time || '',
        // 土地信息
        goodsList: [{
          id: order.land_id || 0,
          thumb: thumb,
          title: `土地${order.land_id}`,
          skuId: order.land_id || 0,
          land_id: order.land_id || 0,
          specs: [`租赁${order.count}个月`], // 直接使用字符串数组
          price: order.price || 0,
          num: order.count || 0,
          titlePrefixTags: []
        }],
        // 订单类型标识
        orderType: 'lands',
        // 原始数据
        rawData: order
      };
      
      console.log(`[order-list processLandOrderData] 第${index + 1}个订单处理结果:`, processedOrder);
      processedOrders.push(processedOrder);
    }
    
    // 按创建时间倒序排列，最新订单在顶部
    this.sortOrdersByTime(processedOrders);
    
    console.log('[order-list processLandOrderData] 最终处理结果:', processedOrders);
    return processedOrders;
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
    // 使用新的getFirstImageUrl函数，简化图片处理逻辑
    return getFirstImageUrl(imageUrls);
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
          // 合并订单列表并按创建时间倒序排列
          const combinedOrderList = this.data.orderList.concat(orderList);
          this.sortOrdersByTime(combinedOrderList);
          
          this.setData({
            orderList: combinedOrderList,
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
    console.log('[onTabChange] 切换到tab:', value);
    
    this.setData({
      status: value,
    });
    
    // 如果有订单数据，直接进行筛选
    if (this.data.orderData) {
      console.log('[onTabChange] 使用现有订单数据进行筛选');
      this.filterAndDisplayOrders(value);
    } else {
      // 否则重新获取数据
      console.log('[onTabChange] 重新获取订单数据');
      this.refreshList(value);
    }
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
    console.log('[onOrderCardTap] 点击订单:', order);
    console.log('[onOrderCardTap] 当前订单类型:', this.data.orderType);
    
    // 根据订单类型传递正确的订单ID
    let orderNo;
    if (this.data.orderType === 'goods') {
      // 商品订单使用 good_order_id
      orderNo = order.id || order.orderNo;
      console.log('[onOrderCardTap] 商品订单，使用ID:', orderNo);
    } else if (this.data.orderType === 'lands') {
      // 土地订单使用 land_order_id
      orderNo = order.id || order.orderNo;
      console.log('[onOrderCardTap] 土地订单，使用ID:', orderNo);
    } else {
      // 兼容原有逻辑
      orderNo = order.orderNo;
      console.log('[onOrderCardTap] 使用默认orderNo:', orderNo);
    }
    
    const url = `/pages/order/order-detail/index?orderNo=${orderNo}`;
    console.log('[onOrderCardTap] 跳转URL:', url);
    
    wx.navigateTo({
      url: url,
    });
  },

  /**
   * 根据tabType筛选订单
   * @param {Array} orderList - 订单列表
   * @returns {Array} 筛选后的订单列表
   */
  filterOrdersByTabType(orderList) {
    console.log('[filterOrdersByTabType] 开始筛选订单, tabType:', this.data.tabType);
    console.log('[filterOrdersByTabType] 原始订单列表:', orderList);
    
    if (!orderList || orderList.length === 0) {
      console.log('[filterOrdersByTabType] 订单列表为空，无需筛选');
      return [];
    }
    
    // 定义tabType对应的订单状态
    const tabTypeStatusMap = {
      5: '待付款',    // 待付款
      10: '待发货',   // 待发货
      40: '待收货',   // 待收货
      60: '待评价',   // 待评价
      0: '退款/售后'  // 退款/售后
    };
    
    const targetStatus = tabTypeStatusMap[this.data.tabType];
    console.log('[filterOrdersByTabType] 目标状态:', targetStatus);
    
    if (!targetStatus) {
      console.warn('[filterOrdersByTabType] 未知的tabType:', this.data.tabType);
      return orderList; // 如果tabType未知，返回所有订单
    }
    
    // 筛选订单
    const filteredOrders = orderList.filter(order => {
      console.log('[filterOrdersByTabType] 检查订单:', order.id, '状态:', order.statusDesc);
      return order.statusDesc === targetStatus;
    });
    
    console.log('[filterOrdersByTabType] 筛选结果:', filteredOrders);
    console.log('[filterOrdersByTabType] 筛选后的订单数量:', filteredOrders.length);
    
    return filteredOrders;
  },

  /**
   * 根据tab值筛选并显示订单
   * @param {number} tabValue - tab的值
   */
  filterAndDisplayOrders(tabValue) {
    console.log('[filterAndDisplayOrders] 开始筛选订单, tabValue:', tabValue);
    
    // 定义tab值对应的订单状态（与用户中心按钮一一对应）
    const tabValueStatusMap = {
      '-1': 'ALL',     // 全部 - 不筛选
      '5': '待付款',   // 待付款
      '10': '待发货',  // 待发货
      '40': '待收货',  // 待收货
      '60': '待评价',  // 待评价
      '0': '退款/售后' // 退款/售后
    };
    
    const targetStatus = tabValueStatusMap[tabValue.toString()];
    console.log('[filterAndDisplayOrders] 目标状态:', targetStatus);
    
    // 获取原始订单数据
    let originalOrderList = [];
    if (this.data.orderType === 'goods' && this.data.orderData && this.data.orderData.good_order) {
      originalOrderList = this.data.orderData.good_order;
    } else if (this.data.orderType === 'lands' && this.data.orderData && this.data.orderData.land_order) {
      originalOrderList = this.data.orderData.land_order;
    }
    
    console.log('[filterAndDisplayOrders] 原始订单数据:', originalOrderList);
    
    if (!originalOrderList || originalOrderList.length === 0) {
      console.log('[filterAndDisplayOrders] 没有原始订单数据');
      this.setData({
        orderList: [],
        listLoading: 0
      });
      return;
    }
    
    // 如果是"全部"，显示所有订单
    if (targetStatus === 'ALL') {
      console.log('[filterAndDisplayOrders] 显示全部订单');
      this.processOrderData(this.data.orderData);
      return;
    }
    
    // 筛选订单
    const filteredOrders = originalOrderList.filter(order => {
      console.log('[filterAndDisplayOrders] 检查订单:', order.id, '状态:', order.order_status);
      return order.order_status === targetStatus;
    });
    
    console.log('[filterAndDisplayOrders] 筛选结果:', filteredOrders);
    console.log('[filterAndDisplayOrders] 筛选后的订单数量:', filteredOrders.length);
    
    // 处理筛选后的订单数据
    const processedOrderData = {
      ...this.data.orderData,
      good_order: this.data.orderType === 'goods' ? filteredOrders : [],
      land_order: this.data.orderType === 'lands' ? filteredOrders : []
    };
    
    this.processOrderData(processedOrderData);
  },

  /**
   * 根据商品类型获取订单数据
   * @param {string} productType - 商品类型 ('goods' 或 'land')
   */
  async fetchOrdersByType(productType) {
    console.log('[fetchOrdersByType] 开始获取订单，商品类型:', productType);
    
    try {
      // 获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo || !userInfo.user_id) {
        console.error('[fetchOrdersByType] 未找到用户信息');
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
      }

      const params = { user_id: userInfo.user_id };
      let orderData;

      if (productType === 'land') {
        console.log('[fetchOrdersByType] 调用土地订单API');
        orderData = await fetchLandOrder(params);
      } else {
        console.log('[fetchOrdersByType] 调用农产品订单API');
        orderData = await fetchGoodOrder(params);
      }

      console.log('[fetchOrdersByType] API响应数据:', orderData);

      // 处理订单数据并显示
      if (orderData && orderData.code === 200) {
        // 构造数据格式，与现有的 processOrderData 方法兼容
        const processedData = {
          good_order: productType === 'goods' ? (orderData.good_order || []) : [],
          land_order: productType === 'land' ? (orderData.land_order || []) : []
        };
        
        // 设置订单类型并处理数据
        this.setData({
          orderType: productType,
          orderData: processedData
        });
        
        await this.processOrderData(processedData);
        console.log('[fetchOrdersByType] 订单数据加载完成');
      } else {
        console.error('[fetchOrdersByType] API返回错误:', orderData);
        wx.showToast({ title: '获取订单失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[fetchOrdersByType] 获取订单失败:', error);
      wx.showToast({ title: '获取订单失败', icon: 'none' });
    }
  },
});
