import updateManager from './common/updateManager';

// 创建简单的事件中心
const eventCenter = {
  events: {},
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  },
  emit(eventName, data) {
    const callbacks = this.events[eventName];
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  },
  off(eventName, callback) {
    const callbacks = this.events[eventName];
    if (callbacks) {
      if (callback) {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
      } else {
        this.events[eventName] = [];
      }
    }
  }
};

App({
 // ... existing code ...
 onLaunch: function (options) {
  // 初始化事件中心
  wx.eventCenter = eventCenter;
  
  wx.cloud.init({
    env: 'cloud1-2gorklioe3299acb',
    traceUser: true
  });

  // 保存启动参数，包括场景值和路径
  this.globalData.launchOptions = options;

  // 检查登录状态
  this.checkLoginStatus();

  // 如果用户未登录且不是登录或注册页面，则重定向到登录页
  if (!this.globalData.isLoggedIn && 
      options.path !== 'pages/login/login' && 
      options.path !== 'pages/register/register') {
    // 保存用户想要访问的页面信息，登录后可以跳回
    this.globalData.redirectPath = options.path;
    this.globalData.redirectQuery = options.query;
    wx.redirectTo({
      url: '/pages/login/login'
    });
  }
// ... existing code ...

    // 测试云文件URL转换
    const {
      genPicURL
    } = require('./utils/genURL');
    const testFileID = 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/toBar/TdesignHome.jpg';

    genPicURL(testFileID).then(url => {
      console.log('云文件转换测试成功:', url);
    }).catch(err => {
      console.error('云文件转换测试失败:', err);
    });
  },
  onShow: function () {
    updateManager();
  },
  checkLoginStatus: function () {
    console.log('[checkLoginStatus] 开始检查登录状态');
    const userInfo = wx.getStorageSync('userInfo');
    console.log('[checkLoginStatus] 从本地存储获取的用户信息:', userInfo);

    // 全局状态设置
    this.globalData.isLoggedIn = !!userInfo;
    this.globalData.userInfo = userInfo || null;
    console.log('[checkLoginStatus] 设置后的全局数据:', this.globalData);
  },
  checkLogin: function () {
    if (!this.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return false;
    }
    return true;
  },
  // 刷新购物车角标
  refreshCartBadge() {
    // 从本地存储获取最新购物车数量
    try {
      const cartData = wx.getStorageSync('cart_data');
      let count = 0;
      
      if (cartData && cartData.goodsList) {
        cartData.goodsList.forEach(goods => {
          count += goods.quantity;
        });
      }
      
      // 更新全局数据
      this.globalData.cartCount = count;
      
      // 存储到本地
      wx.setStorageSync('cart_count', count);
      
      // 发布事件通知所有订阅者
      wx.eventCenter.emit('cartUpdate', { count });
      
      return count;
    } catch (err) {
      console.error('刷新购物车角标失败', err);
      return 0;
    }
  },
  globalData: {
    isLoggedIn: false,
    userInfo: null,
    launchOptions: null,
    redirectPath: null,
    redirectQuery: null,
    cartCount: 0
  }
});