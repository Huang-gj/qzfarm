import {
  formatTime
} from '../../../utils/util';
import {
  OrderStatus,
  LogisticsIconMap
} from '../config';
import {
  fetchBusinessTime,
  fetchOrderDetail,
} from '../../../services/order/orderDetail';
import { genPicURL, processImageUrls, getFirstImageUrl } from '../../../utils/genURL';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  getAddressPromise
} from '../../usercenter/address/list/util';

Page({
  data: {
    pageLoading: true,
    order: {}, // 后台返回的原始数据
    _order: {}, // 内部使用和提供给 order-card 的数据
    storeDetail: {},
    countDownTime: null,
    addressEditable: false,
    backRefresh: false, // 用于接收其他页面back时的状态
    formatCreateTime: '', //格式化订单创建时间
    logisticsNodes: [],
    /** 订单评论状态 */
    orderHasCommented: true,
  },

  onLoad(query) {
    this.orderNo = query.orderNo;
    this.init();
    this.navbar = this.selectComponent('#navbar');
    this.pullDownRefresh = this.selectComponent('#wr-pull-down-refresh');
  },

  onShow() {
    // 当从其他页面返回，并且 backRefresh 被置为 true 时，刷新数据
    if (!this.data.backRefresh) return;
    this.onRefresh();
    this.setData({
      backRefresh: false
    });
  },

  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onImgError(e) {
    if (e.detail) {
      console.error('img 加载失败');
    }
  },

  // 页面初始化，会展示pageLoading
  init() {
    this.setData({
      pageLoading: true
    });
    this.getStoreDetail();
    this.getDetail()
      .then(() => {
        this.setData({
          pageLoading: false
        });
      })
      .catch((e) => {
        console.error(e);
      });
  },

  // 页面刷新，展示下拉刷新
  onRefresh() {
    this.init();
    // 如果上一页为订单列表，通知其刷新数据
    const pages = getCurrentPages();
    const lastPage = pages[pages.length - 2];
    if (lastPage) {
      lastPage.data.backRefresh = true;
    }
  },

  // 页面刷新，展示下拉刷新
  onPullDownRefresh_(e) {
    const {
      callback
    } = e.detail;
    return this.getDetail().then(() => callback && callback());
  },

  async getDetail() {
    console.log('[getDetail] 获取订单详情，orderNo:', this.orderNo);
    
    const params = {
      parameter: this.orderNo,
    };
    return fetchOrderDetail(params).then(async (res) => {
      console.log('[getDetail] 完整响应:', res);
      
      // 检查响应数据结构
      if (!res) {
        console.error('[getDetail] 响应数据为空，orderNo:', this.orderNo);
        wx.showToast({
          title: '订单不存在',
          icon: 'none'
        });
        return;
      }
      
      // 判断是商品订单还是土地订单
      let order;
      if (res.good_order) {
        // 商品订单
        order = res.good_order;
        console.log('[getDetail] 获取到的商品订单数据:', order);
      } else if (res.land_order) {
        // 土地订单
        order = res.land_order;
        console.log('[getDetail] 获取到的土地订单数据:', order);
      } else {
        console.error('[getDetail] 订单数据为空，orderNo:', this.orderNo);
        wx.showToast({
          title: '订单不存在',
          icon: 'none'
        });
        return;
      }
      
      // 根据订单类型处理数据
      let _order;
      if (order.good_order_id) {
        // 商品订单 - 处理图片URL
        const processedImageUrl = await this.processImageUrl(order.image_urls);
        _order = {
          id: order.good_order_id,
          orderNo: order.good_order_id.toString(),
          parentOrderNo: order.good_order_id.toString(),
          storeId: order.farm_id || 0,
          storeName: `农场${order.farm_id}`,
          status: 1, // 待付款状态
          statusDesc: '待付款',
          amount: order.price || 0,
          totalAmount: (order.price * order.count) || 0,
          logisticsNo: '', // 商品订单暂无物流信息
          goodsList: [{
            id: order.good_id,
            thumb: processedImageUrl,
            title: order.title || `商品${order.good_id}`,
            skuId: order.good_id,
            good_id: order.good_id,
            specs: [order.units || '个'],
            price: order.price || 0,
            num: order.count || 0,
            titlePrefixTags: [],
            buttons: [],
          }],
          buttons: [],
          createTime: order.create_time || '',
          receiverAddress: '',
          groupInfoVo: null,
        };
      } else if (order.land_order_id) {
        // 土地订单 - 处理图片URL
        const processedImageUrl = await this.processImageUrl(order.image_urls);
        _order = {
          id: order.land_order_id,
          orderNo: order.land_order_id.toString(),
          parentOrderNo: order.land_order_id.toString(),
          storeId: order.farm_id || 0,
          storeName: `农场${order.farm_id}`,
          status: 1, // 待付款状态
          statusDesc: '待付款',
          amount: order.price || 0,
          totalAmount: (order.price * order.count) || 0,
          logisticsNo: '', // 土地订单暂无物流信息
          goodsList: [{
            id: order.land_id,
            thumb: processedImageUrl,
            title: `土地${order.land_id}`,
            skuId: order.land_id,
            land_id: order.land_id,
            specs: [`租赁${order.count}个月`],
            price: order.price || 0,
            num: order.count || 0,
            titlePrefixTags: [],
            buttons: [],
          }],
          buttons: [],
          createTime: order.create_time || '',
          receiverAddress: '',
          groupInfoVo: null,
        };
      } else {
        // 兼容原有数据结构
        _order = {
          id: order.orderId,
          orderNo: order.orderNo,
          parentOrderNo: order.parentOrderNo,
          storeId: order.storeId,
          storeName: order.storeName,
          status: order.orderStatus,
          statusDesc: order.orderStatusName,
          amount: order.paymentAmount,
          totalAmount: order.goodsAmountApp,
          logisticsNo: order.logisticsVO?.logisticsNo || '',
          goodsList: (order.orderItemVOs || []).map((goods) =>
            Object.assign({}, goods, {
              id: goods.id,
              thumb: goods.goodsPictureUrl,
              title: goods.goodsName,
              skuId: goods.skuId,
              good_id: goods.good_id,
              specs: (goods.specifications || []).map((s) => s.specValue),
              price: goods.tagPrice ? goods.tagPrice : goods.actualPrice,
              num: goods.buyQuantity,
              titlePrefixTags: goods.tagText ? [{
                text: goods.tagText
              }] : [],
              buttons: goods.buttonVOs || [],
            }),
          ),
          buttons: order.buttonVOs || [],
          createTime: order.createTime,
          receiverAddress: this.composeAddress(order),
          groupInfoVo: order.groupInfoVo,
        };
      }
      
      // 处理时间格式
      let formattedCreateTime = '';
      if (_order.createTime) {
        console.log('[getDetail] 原始创建时间:', _order.createTime);
        // 直接使用 dayjs 处理时间字符串，不需要 parseFloat
        formattedCreateTime = formatTime(_order.createTime, 'YYYY-MM-DD HH:mm');
        console.log('[getDetail] 格式化后的创建时间:', formattedCreateTime);
      }
      
      this.setData({
        order,
        _order,
        formatCreateTime: formattedCreateTime,
        countDownTime: this.computeCountDownTime(order),
        addressEditable: [OrderStatus.PENDING_PAYMENT, OrderStatus.PENDING_DELIVERY].includes(
          _order.status,
        ),
        isPaid: false, // 简化处理
        invoiceStatus: 3, // 未开票
        invoiceDesc: '',
        invoiceType: '不开发票',
        logisticsNodes: [],
      });
    });
  },

  // 展开物流节点
  flattenNodes(nodes) {
    return (nodes || []).reduce((res, node) => {
      return (node.nodes || []).reduce((res1, subNode, index) => {
        res1.push({
          title: index === 0 ? node.title : '', // 子节点中仅第一个显示title
          desc: subNode.status,
          date: formatTime(+subNode.timestamp, 'YYYY-MM-DD HH:mm:ss'),
          icon: index === 0 ? LogisticsIconMap[node.code] || '' : '', // 子节点中仅第一个显示icon
        });
        return res1;
      }, res);
    }, []);
  },

  datermineInvoiceStatus(order) {
    // 1-已开票
    // 2-未开票（可补开）
    // 3-未开票
    // 4-门店不支持开票
    return order.invoiceStatus;
  },

  // 拼接省市区
  composeAddress(order) {
    return [
        //order.logisticsVO.receiverProvince,
        order.logisticsVO.receiverCity,
        order.logisticsVO.receiverCountry,
        order.logisticsVO.receiverArea,
        order.logisticsVO.receiverAddress,
      ]
      .filter((s) => !!s)
      .join(' ');
  },

  getStoreDetail() {
    fetchBusinessTime().then((res) => {
      console.log('[getStoreDetail] 获取到的数据:', res);
      
      // 添加安全检查
      if (!res || !res.data) {
        console.error('[getStoreDetail] 数据为空');
        return;
      }
      
      const storeDetail = {
        storeTel: res.data.telphone || '暂无',
        storeBusiness: res.data.businessTime ? res.data.businessTime.join('\n') : '暂无营业时间',
      };
      this.setData({
        storeDetail
      });
    }).catch((error) => {
      console.error('[getStoreDetail] 获取商店详情失败:', error);
      // 设置默认值
      const storeDetail = {
        storeTel: '暂无',
        storeBusiness: '暂无营业时间',
      };
      this.setData({
        storeDetail
      });
    });
  },

  // 仅对待支付状态计算付款倒计时
  // 返回时间若是大于2020.01.01，说明返回的是关闭时间，否则说明返回的直接就是剩余时间
  computeCountDownTime(order) {
    if (order.orderStatus !== OrderStatus.PENDING_PAYMENT) return null;
    return order.autoCancelTime > 1577808000000 ?
      order.autoCancelTime - Date.now() :
      order.autoCancelTime;
  },

  onCountDownFinish() {
    //this.setData({ countDownTime: -1 });
    const {
      countDownTime,
      order
    } = this.data;
    if (
      countDownTime > 0 ||
      (order && order.groupInfoVo && order.groupInfoVo.residueTime > 0)
    ) {
      this.onRefresh();
    }
  },

  onGoodsCardTap(e) {
    const {
      index
    } = e.currentTarget.dataset;
    const goods = this.data.order.orderItemVOs[index];
    wx.navigateTo({
      url: `/pages/goods/details/index?goodId=${goods.good_id}`
    });
  },

  onEditAddressTap() {
    getAddressPromise()
      .then((address) => {
        this.setData({
          'order.logisticsVO.receiverName': address.name,
          'order.logisticsVO.receiverPhone': address.phone,
          '_order.receiverAddress': address.address,
        });
      })
      .catch(() => {});

    wx.navigateTo({
      url: `/pages/usercenter/address/list/index?selectMode=1`,
    });
  },

  onOrderNumCopy() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
    });
  },

  onDeliveryNumCopy() {
    wx.setClipboardData({
      data: this.data.order.logisticsVO.logisticsNo,
    });
  },

  onToInvoice() {
    wx.navigateTo({
      url: `/pages/order/invoice/index?orderNo=${this.data._order.orderNo}`,
    });
  },

  onSuppleMentInvoice() {
    wx.navigateTo({
      url: `/pages/order/receipt/index?orderNo=${this.data._order.orderNo}`,
    });
  },

  onDeliveryClick() {
    const logisticsData = {
      nodes: this.data.logisticsNodes,
      company: this.data.order.logisticsVO.logisticsCompanyName,
      logisticsNo: this.data.order.logisticsVO.logisticsNo,
      phoneNumber: this.data.order.logisticsVO.logisticsCompanyTel,
    };
    wx.navigateTo({
      url: `/pages/order/delivery-detail/index?data=${encodeURIComponent(
        JSON.stringify(logisticsData),
      )}`,
    });
  },

  /** 跳转订单评价 */
  navToCommentCreate() {
    wx.navigateTo({
      url: `/pages/order/createComment/index?orderNo=${this.orderNo}`,
    });
  },

  /** 跳转拼团详情/分享页*/
  toGrouponDetail() {
    wx.showToast({
      title: '点击了拼团'
    });
  },

  clickService() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '您点击了联系客服',
    });
  },

  onOrderInvoiceView() {
    wx.navigateTo({
      url: `/pages/order/invoice/index?orderNo=${this.orderNo}`,
    });
  },

  /**
   * 处理图片URL，使用genPicURL转换云存储路径
   * @param {string} imageUrls - 图片URL字符串
   * @returns {Promise<string>} 处理后的图片URL
   */
  async processImageUrl(imageUrls) {
    console.log('[processImageUrl] 原始图片URL:', imageUrls);
    
    if (!imageUrls) {
      return 'https://via.placeholder.com/150x150?text=暂无图片';
    }
    
    try {
      // 使用统一的图片处理函数
      const imageUrl = getFirstImageUrl(imageUrls);
      
      console.log('[processImageUrl] 解析后的图片URL:', imageUrl);
      
      // 现在数据库存储的是完整URL，直接返回
      if (imageUrl) {
        console.log('[processImageUrl] 使用原始URL:', imageUrl);
        return imageUrl;
      } else {
        // 其他情况，返回占位图
        console.log('[processImageUrl] 使用占位图');
        return 'https://via.placeholder.com/150x150?text=暂无图片';
      }
    } catch (error) {
      console.error('[processImageUrl] 处理图片URL失败:', error);
      return 'https://via.placeholder.com/150x150?text=图片加载失败';
    }
  },
});