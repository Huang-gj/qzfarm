import { getCategoryList } from '../../../services/good/fetchCategoryList';
Page({
  data: {
    list: [],
  },
  async init() {
    try {
      const result = await getCategoryList();
      this.setData({
        list: result,
      });
    } catch (error) {
      console.error('err:', error);
    }
  },

  onShow() {
    this.getTabBar().init();
  },
  
  onChange(e) {
    // 获取点击的分类信息
    const { item } = e.detail;
    // 获取分类ID（groupId）
    const groupId = item.groupId || '';
    
    // 导航到商品列表页面并传递分类ID
    wx.navigateTo({
      url: `/pages/goods/list/index?groupId=${groupId}`,
    });
  },
  
  onLoad() {
    this.init(true);
  },
});
