import updateManager from './common/updateManager';

App({
 // ... existing code ...
 onLaunch: function (options) {
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
    const userInfo = wx.getStorageSync('userInfo');

    // 全局状态设置
    this.globalData.isLoggedIn = !!userInfo;
    this.globalData.userInfo = userInfo || null;
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
  globalData: {
    isLoggedIn: false,
    userInfo: null,
    launchOptions: null,
    redirectPath: null,
    redirectQuery: null
  }
});