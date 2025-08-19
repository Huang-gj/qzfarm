import { getCategoryList } from '../../../services/good/fetchCategoryList';
Page({
  data: {
    list: [],
  },
  async init() {
    try {
      console.log('[category] 开始获取分类数据');
      const result = await getCategoryList();
      console.log('[category] 获取到的分类数据:', result);
      
      this.setData({
        list: result,
      });
      
      console.log('[category] 设置数据后的list:', this.data.list);
    } catch (error) {
      console.error('[category] 获取分类数据失败:', error);
    }
  },

  onShow() {
    console.log('[category] onShow 被调用');
    this.getTabBar().init();
  },
  
  onChange(e) {
    console.log('[category] onChange 被调用:', e.detail);
    // 获取点击的分类信息
    const { item } = e.detail;
    // 获取分类名称作为标签
    const categoryName = item.name || '';
    
    console.log('[category] 点击的分类:', item);
    console.log('[category] 分类名称:', categoryName);
    
    // 根据分类的groupId判断模块类型
    // groupId以1开头的是土地模块，以2开头的是农产品模块
    const moduleType = item.groupId ? item.groupId.charAt(0) : '2';
    
    console.log('[category] 模块类型:', moduleType);
    
    if (moduleType === '1') {
      // 土地模块：跳转到土地列表页面，调用8890端口API
      const url = `/pages/land/list/index?tag=${encodeURIComponent(categoryName)}`;
      console.log('[category] 跳转到土地列表:', url);
      wx.navigateTo({
        url: url,
        fail: (error) => {
          console.error('[onChange] 跳转失败:', error);
          // 尝试不编码的URL
          const simpleUrl = `/pages/land/list/index?tag=${categoryName}`;
          wx.navigateTo({
            url: simpleUrl,
            fail: (simpleError) => {
              console.error('[onChange] 简单URL跳转也失败:', simpleError);
            }
          });
        }
      });
    } else {
      // 农产品模块：跳转到商品列表页面，调用8889端口API
      const url = `/pages/goods/list/index?tag=${encodeURIComponent(categoryName)}`;
      console.log('[category] 跳转到商品列表:', url);
      wx.navigateTo({
        url: url,
      });
    }
  },
  
  onLoad() {
    console.log('[category] onLoad 被调用');
    this.init(true);
  },
});
