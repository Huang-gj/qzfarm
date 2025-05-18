import {
  fetchUserCenter
} from '../../services/usercenter/fetchUsercenter';
import Toast from 'tdesign-miniprogram/toast/index';
import { genPicURL } from '../../utils/genURL';

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
    iconUrl: 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/TdesignMoney.png',
    orderNum: 0,
    tabType: 5,
    status: 1,
  },
  {
    title: '待发货',
    iconName: 'deliver',
    iconUrl: 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/StreamlineShippingTruck.png',
    orderNum: 0,
    tabType: 10,
    status: 1,
  },
  {
    title: '待收货',
    iconName: 'package',
    iconUrl: 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/HugeiconsPackageDelivered.png',
    orderNum: 0,
    tabType: 40,
    status: 1,
  },
  {
    title: '待评价',
    iconName: 'comment',
    iconUrl: 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/PajamasReviewList.png',
    orderNum: 0,
    tabType: 60,
    status: 1,
  },
  {
    title: '退款/售后',
    iconName: 'exchang',
    iconUrl: 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/MingcuteRefundCnyFill.png',
    orderNum: 0,
    tabType: 0,
    status: 1,
  },
];

const getDefaultData = () => ({
  showMakePhone: false,
  userInfo: {
    avatarUrl: 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/usercenter/微信图片_20250318105208.jpg',
    nickName: 'QZFarm',
    phoneNumber: '',
  },
  menuData,
  orderTagInfos,
  customerServiceInfo: {},
  currAuthStep: 1,
  showKefu: true,
  versionNo: '',
});

Page({
  data: getDefaultData(),

  onLoad() {
    this.getVersionInfo();
  },

  onShow() {
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
    fetchUserCenter().then(
      ({
        userInfo,
        countsData,
        orderTagInfos: orderInfo,
        customerServiceInfo,
      }) => {
        // eslint-disable-next-line no-unused-expressions
        menuData?.[0].forEach((v) => {
          countsData.forEach((counts) => {
            if (counts.type === v.type) {
              // eslint-disable-next-line no-param-reassign
              v.tit = counts.num;
            }
          });
        });
        
        // 为每个订单图标获取临时URL
        const processOrderIcons = async () => {
          const info = orderTagInfos.map((v, index) => {
            const item = {
              ...v,
              ...orderInfo[index],
            };
            return item;
          });
          
          // 转换所有图标URL
          const iconPromises = info.map(async (item) => {
            if (item.iconUrl) {
              try {
                const tempUrl = await genPicURL(item.iconUrl);
                item.customIconUrl = tempUrl;
              } catch (error) {
                console.error('获取图标URL失败:', error);
              }
            }
            return item;
          });
          
          const processedInfo = await Promise.all(iconPromises);

          // 修改用户头像和用户名
          userInfo.avatarUrl = 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/usercenter/微信图片_20250318105208.jpg';
          userInfo.nickName = 'QZFarm';

          this.setData({
            userInfo,
            menuData,
            orderTagInfos: processedInfo,
            customerServiceInfo,
            currAuthStep: 2,
          });
          wx.stopPullDownRefresh();
        };
        
        processOrderIcons();
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

  jumpNav(e) {
    const status = e.detail.tabType;

    if (status === 0) {
      wx.navigateTo({
        url: '/pages/order/after-service-list/index'
      });
    } else {
      wx.navigateTo({
        url: `/pages/order/order-list/index?status=${status}`
      });
    }
  },

  jumpAllOrder() {
    wx.navigateTo({
      url: '/pages/order/order-list/index'
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

  handleLogout: function() {
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

  refreshUserInfo: function() {
    const app = getApp();
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      });
    } else {
      this.setData({
        userInfo: {},
        isLoggedIn: false
      });
    }
  },
});