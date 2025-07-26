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
    // 获取分类名称作为标签
    const categoryName = item.name || '';
    
    console.log('[onChange] 分类点击:', {
      groupId: item.groupId,
      name: item.name,
      categoryName: categoryName
    });
    
    // 导航到商品列表页面并传递分类名称作为标签
    wx.navigateTo({
      url: `/pages/goods/list/index?tag=${encodeURIComponent(categoryName)}`,
    });
  },
  
  onLoad() {
    this.init(true);
  },
});
