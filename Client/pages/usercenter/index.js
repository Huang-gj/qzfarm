import {
  fetchUserCenter
} from '../../services/usercenter/fetchUsercenter';
import { fetchGoodOrder } from '../../services/order/fetchGoodOrder';
import { fetchLandOrder } from '../../services/order/fetchLandOrder';
import Toast from 'tdesign-miniprogram/toast/index';

const menuData = [
  [{
      title: '收货地址',
      tit: '',
      url: '',
      type: 'address',
    },
    {
      title: '优惠券',
      tit: '',
      url: '',
      type: 'coupon',
    },
    {
      title: '积分',
      tit: '',
      url: '',
      type: 'point',
    },
  ],
  [{
      title: '帮助中心',
      tit: '',
      url: '',
      type: 'help-center',
    },
    {
      title: '客服热线',
      tit: '',
      url: '',
      type: 'service',
      icon: 'service',
    },
  ],
];

const orderTagInfos = [{
    title: '待付款',
    iconName: 'wallet',
    orderNum: 0,
    tabType: 5,
    status: 1,
  },
  {
    title: '待发货',
    iconName: 'forward',
    orderNum: 0,
    tabType: 10,
    status: 1,
  },
  {
    title: '待收货',
    iconName: 'location',
    orderNum: 0,
    tabType: 40,
    status: 1,
  },
  {
    title: '待评价',
    iconName: 'chat',
    orderNum: 0,
    tabType: 60,
    status: 1,
  },
  {
    title: '退款/售后',
    iconName: 'refresh',
    orderNum: 0,
    tabType: 0,
    status: 1,
  },
];

// 商品订单数据
const goodsOrderTagInfos = [{
    title: '待付款',
    iconName: 'wallet',
    orderNum: 0,
    tabType: 5,
    status: 1,
    orderType: 'goods',
  },
  {
    title: '待发货',
    iconName: 'forward',
    orderNum: 0,
    tabType: 10,
    status: 1,
    orderType: 'goods',
  },
  {
    title: '待收货',
    iconName: 'location',
    orderNum: 0,
    tabType: 40,
    status: 1,
    orderType: 'goods',
  },
  {
    title: '待评价',
    iconName: 'chat',
    orderNum: 0,
    tabType: 60,
    status: 1,
    orderType: 'goods',
  },
  {
    title: '退款/售后',
    iconName: 'refresh',
    orderNum: 0,
    tabType: 0,
    status: 1,
    orderType: 'goods',
  },
];

// 土地订单数据
const landsOrderTagInfos = [{
    title: '待付款',
    iconName: 'wallet',
    orderNum: 0,
    tabType: 5,
    status: 1,
    orderType: 'lands',
  },
  {
    title: '待发货',
    iconName: 'forward',
    orderNum: 0,
    tabType: 10,
    status: 1,
    orderType: 'lands',
  },
  {
    title: '待收货',
    iconName: 'location',
    orderNum: 0,
    tabType: 40,
    status: 1,
    orderType: 'lands',
  },
  {
    title: '待评价',
    iconName: 'chat',
    orderNum: 0,
    tabType: 60,
    status: 1,
    orderType: 'lands',
  },
  {
    title: '退款/售后',
    iconName: 'refresh',
    orderNum: 0,
    tabType: 0,
    status: 1,
    orderType: 'lands',
  },
];

const getDefaultData = () => {
  const app = getApp();
  console.log('[getDefaultData] app:', app);
  console.log('[getDefaultData] app.globalData:', app.globalData);
  console.log('[getDefaultData] app.globalData.userInfo:', app.globalData.userInfo);
  
  return {
    showMakePhone: false,
    userInfo: {
      avatarUrl: app.globalData.userInfo?.avatar || 'https://via.placeholder.com/100x100?text=默认头像',
      nickName: app.globalData.userInfo?.nickname || '',
      phoneNumber: app.globalData.userInfo?.phone_number || '',
    },
    menuData,
    orderTagInfos,
    goodsOrderTagInfos,
    landsOrderTagInfos,
    currentOrderType: 'goods', // 默认显示商品订单
    customerServiceInfo: {},
    currAuthStep: 1,
    showKefu: true,
    versionNo: '',
  };
};

Page({
  data: getDefaultData(),

  onLoad() {
    this.getVersionInfo();
  },

  onShow() {
    console.log('[onShow] 用户中心页面显示');
    this.getTabBar().init();
    this.init();
    this.refreshUserInfo();
  },
  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.fetUseriInfoHandle();
  },

  fetUseriInfoHandle() {
    console.log('[fetUseriInfoHandle] 开始获取用户信息');
    fetchUserCenter().then(
      ({
        userInfo,
        countsData,
        orderTagInfos: orderInfo,
        customerServiceInfo,
      }) => {
        console.log('[fetUseriInfoHandle] 获取到的用户信息:', userInfo);
        // eslint-disable-next-line no-unused-expressions
        menuData?.[0].forEach((v) => {
          countsData.forEach((counts) => {
            if (counts.type === v.type) {
              // eslint-disable-next-line no-param-reassign
              v.tit = counts.num;
            }
          });
        });

        // 直接处理订单数据，使用TDesign图标
        const processedInfo = orderTagInfos.map((v, index) => {
          const item = {
            ...v,
            ...(orderInfo[index] || {}),
          };
          return item;
        });

        // 处理商品订单数据
        const processedGoodsInfo = goodsOrderTagInfos.map((v, index) => {
          const item = {
            ...v,
            ...(orderInfo[index] || {}),
          };
          return item;
        });

        // 处理土地订单数据
        const processedLandsInfo = landsOrderTagInfos.map((v, index) => {
          const item = {
            ...v,
            ...(orderInfo[index] || {}),
          };
          return item;
        });

        console.log('[fetUseriInfoHandle] 设置用户信息到页面:', userInfo);
        console.log('[fetUseriInfoHandle] 处理后的订单图标数据:', processedInfo);
        console.log('[fetUseriInfoHandle] 商品订单图标数据:', processedGoodsInfo);
        console.log('[fetUseriInfoHandle] 土地订单图标数据:', processedLandsInfo);
        this.setData({
          userInfo,
          menuData,
          orderTagInfos: processedInfo,
          goodsOrderTagInfos: processedGoodsInfo,
          landsOrderTagInfos: processedLandsInfo,
          customerServiceInfo,
          currAuthStep: 2,
        });
        wx.stopPullDownRefresh();
      },
    );
  },

  onClickCell({
    currentTarget
  }) {
    const {
      type
    } = currentTarget.dataset;

    switch (type) {
      case 'address': {
        wx.navigateTo({
          url: '/pages/usercenter/address/list/index'
        });
        break;
      }
      case 'service': {
        this.openMakePhone();
        break;
      }
      case 'help-center': {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '你点击了帮助中心',
          icon: '',
          duration: 1000,
        });
        break;
      }
      case 'point': {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '你点击了积分菜单',
          icon: '',
          duration: 1000,
        });
        break;
      }
      case 'coupon': {
        wx.navigateTo({
          url: '/pages/coupon/coupon-list/index'
        });
        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  jumpAllOrder() {
    wx.navigateTo({
      url: '/pages/order/order-list/index'
    });
  },

  // 商品订单相关方法
  jumpAllGoodsOrder() {
    console.log('[jumpAllGoodsOrder] 跳转到商品订单页面');
    this.fetchOrderData('goods');
  },

  jumpGoodsOrderNav(e) {
    console.log('[jumpGoodsOrderNav] 接收到事件:', e);
    console.log('[jumpGoodsOrderNav] e.detail:', e.detail);
    
    if (!e.detail) {
      console.error('[jumpGoodsOrderNav] e.detail 为空');
      return;
    }
    
    const item = e.detail;
    console.log('[jumpGoodsOrderNav] 获取到的item:', item);
    
    if (!item || !item.tabType) {
      console.error('[jumpGoodsOrderNav] item 或 item.tabType 为空');
      return;
    }
    
    console.log('[jumpGoodsOrderNav] 跳转到商品订单详情, tabType:', item.tabType);
    this.fetchOrderData('goods', item.tabType);
  },

  // 土地订单相关方法
  jumpAllLandsOrder() {
    console.log('[jumpAllLandsOrder] 跳转到土地订单页面');
    this.fetchOrderData('lands');
  },

  jumpLandsOrderNav(e) {
    console.log('[jumpLandsOrderNav] 接收到事件:', e);
    console.log('[jumpLandsOrderNav] e.detail:', e.detail);
    
    if (!e.detail) {
      console.error('[jumpLandsOrderNav] e.detail 为空');
      return;
    }
    
    const item = e.detail;
    console.log('[jumpLandsOrderNav] 获取到的item:', item);
    
    if (!item || !item.tabType) {
      console.error('[jumpLandsOrderNav] item 或 item.tabType 为空');
      return;
    }
    
    console.log('[jumpLandsOrderNav] 跳转到土地订单详情, tabType:', item.tabType);
    this.fetchOrderData('lands', item.tabType);
  },

  // 统一的订单数据获取方法
  async fetchOrderData(orderType, tabType = null) {
    try {
      const app = getApp();
      const userInfo = app.globalData.userInfo;
      
      if (!userInfo || !userInfo.user_id) {
        console.error('[fetchOrderData] 用户信息不存在');
        Toast({
          context: this,
          selector: '#t-toast',
          message: '请先登录',
          icon: 'error',
          duration: 2000,
        });
        return;
      }

      // 检查token是否存在
      const token = wx.getStorageSync('token');
      if (!token || !token.accessToken) {
        console.error('[fetchOrderData] 未找到有效的token');
        Toast({
          context: this,
          selector: '#t-toast',
          message: '登录已过期，请重新登录',
          icon: 'error',
          duration: 2000,
        });
        return;
      }

      console.log('[fetchOrderData] 开始获取订单数据, orderType:', orderType, 'tabType:', tabType);
      
      let orderData;
      if (orderType === 'goods') {
        orderData = await fetchGoodOrder({ user_id: userInfo.user_id });
      } else if (orderType === 'lands') {
        orderData = await fetchLandOrder({ user_id: userInfo.user_id });
      } else {
        throw new Error('未知的订单类型');
      }

      console.log('[fetchOrderData] 获取到订单数据:', orderData);

      // 检查API响应状态
      if (orderData.code !== 200) {
        throw new Error(orderData.msg || '获取订单数据失败');
      }

      // 构建跳转URL
      let url = '/pages/order/order-list/index';
      const params = [`orderType=${orderType}`];
      
      if (tabType !== null) {
        params.push(`tabType=${tabType}`);
      }
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      // 将订单数据存储到全局数据中，供订单页面使用
      app.globalData.currentOrderData = {
        orderType,
        tabType,
        data: orderData
      };

      console.log('[fetchOrderData] 跳转到订单页面:', url);
      wx.navigateTo({ url });

    } catch (error) {
      console.error('[fetchOrderData] 获取订单数据失败:', error);
      
      let errorMessage = '获取订单数据失败';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.errMsg) {
        errorMessage = error.errMsg;
      }
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: errorMessage,
        icon: 'error',
        duration: 3000,
      });
    }
  },

  // 保留原有的导航方法（向后兼容）
  jumpNav(e) {
    const { item } = e.detail;
    wx.navigateTo({
      url: `/pages/order/order-list/index?tabType=${item.tabType}`
    });
  },

  // 切换到商品订单
  switchToGoods() {
    console.log('[switchToGoods] 切换到商品订单');
    this.setData({
      currentOrderType: 'goods'
    });
  },

  // 切换到土地订单
  switchToLands() {
    console.log('[switchToLands] 切换到土地订单');
    this.setData({
      currentOrderType: 'lands'
    });
  },

  openMakePhone() {
    this.setData({
      showMakePhone: true
    });
  },

  closeMakePhone() {
    this.setData({
      showMakePhone: false
    });
  },

  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.customerServiceInfo.servicePhone,
    });
  },

  gotoUserEditPage() {
    const {
      currAuthStep
    } = this.data;
    if (currAuthStep === 2) {
      wx.navigateTo({
        url: '/pages/usercenter/person-info/index'
      });
    } else {
      this.fetUseriInfoHandle();
    }
  },

  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const {
      version,
      envVersion = __wxConfig
    } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },

  handleLogout: function () {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmColor: '#FF5F15',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息和登录态
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('token');

          // 更新全局状态
          const app = getApp();
          app.globalData.isLoggedIn = false;
          app.globalData.userInfo = null;

          // 跳转到登录页面
          wx.reLaunch({
            url: '/pages/login/login'
          });

          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

    refreshUserInfo: function () {
    console.log('[refreshUserInfo] 开始刷新用户信息');
    const app = getApp();
    console.log('[refreshUserInfo] app:', app);
    console.log('[refreshUserInfo] app.globalData:', app.globalData);
    console.log('[refreshUserInfo] app.globalData.userInfo:', app.globalData.userInfo);
    
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    console.log('[refreshUserInfo] 获取到的用户信息:', userInfo);
    
    if (userInfo) {
      console.log('[refreshUserInfo] 设置用户信息:', userInfo);
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      });
    } else {
      console.log('[refreshUserInfo] 没有用户信息，设置为空');
      this.setData({
        userInfo: {},
        isLoggedIn: false
      });
    }
  },
});