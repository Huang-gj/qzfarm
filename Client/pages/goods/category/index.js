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
    
    console.log('[onChange] 分类点击详情:', {
      groupId: item.groupId,
      name: item.name,
      categoryName: categoryName,
      item: item
    });
    
    // 根据分类的groupId判断模块类型
    // groupId以1开头的是土地模块，以2开头的是农产品模块
    const moduleType = item.groupId ? item.groupId.charAt(0) : '2';
    
    console.log('[onChange] 模块类型判断:', {
      groupId: item.groupId,
      moduleType: moduleType,
      categoryName: categoryName
    });
    
    if (moduleType === '1') {
      // 土地模块：跳转到土地列表页面，调用8890端口API
      console.log('[onChange] 跳转到土地列表，调用8890端口API');
      const url = `/pages/land/list/index?tag=${encodeURIComponent(categoryName)}`;
      console.log('[onChange] 跳转URL:', url);
      wx.navigateTo({
        url: url,
        success: () => {
          console.log('[onChange] 跳转成功');
        },
        fail: (error) => {
          console.error('[onChange] 跳转失败:', error);
          // 尝试不编码的URL
          const simpleUrl = `/pages/land/list/index?tag=${categoryName}`;
          console.log('[onChange] 尝试简单URL:', simpleUrl);
          wx.navigateTo({
            url: simpleUrl,
            success: () => {
              console.log('[onChange] 简单URL跳转成功');
            },
            fail: (simpleError) => {
              console.error('[onChange] 简单URL跳转也失败:', simpleError);
            }
          });
        }
      });
    } else {
      // 农产品模块：跳转到商品列表页面，调用8889端口API
      console.log('[onChange] 跳转到商品列表，调用8889端口API');
      wx.navigateTo({
        url: `/pages/goods/list/index?tag=${encodeURIComponent(categoryName)}`,
      });
    }
  },
  
  onLoad() {
    this.init(true);
  },
});
