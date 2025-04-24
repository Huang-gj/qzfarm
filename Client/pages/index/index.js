const app = getApp();

Page({
  onLoad: function() {
    // 检查是否已登录
    if (!app.checkLogin()) {
      return; // 如果未登录，checkLogin会自动跳转到登录页
    }
    
    // 已登录，继续加载页面数据
    this.loadPageData();
  },
  
  loadPageData: function() {
    // 获取页面初始数据的逻辑
  }
  // 其他方法...
}); 