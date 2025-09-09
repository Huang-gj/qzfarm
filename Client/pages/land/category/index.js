const { getGoodsCategory, getLandCategory } = require('../../../services/category/category');

Page({
  data: {
    list: [
      {
        groupId: '1000',
        name: '土地',
        thumbnail: 'https://via.placeholder.com/100x100?text=土地',
        children: [{
          groupId: '1100',
          name: '土地',
          thumbnail: 'https://via.placeholder.com/100x100?text=土地',
          children: [], // 初始为空，点击时加载
        }],
      },
      {
        groupId: '2000',
        name: '农产品',
        thumbnail: 'https://via.placeholder.com/100x100?text=农产品',
        children: [{
          groupId: '2100',
          name: '农产品',
          thumbnail: 'https://via.placeholder.com/100x100?text=农产品',
          children: [], // 初始为空，点击时加载
        }],
      }
    ],
    currentCategoryType: null, // 当前选中的分类类型
  },

  /**
   * 页面初始化 - 不再预加载分类数据
   */
  async init() {
    console.log('[land/category] ========== 页面初始化开始 ==========');
    console.log('[land/category] 使用静态分类结构，按需加载子分类数据');
    console.log('[land/category] ========== 页面初始化完成 ==========');
  },

  /**
   * 左侧分类标签点击事件 - 动态加载对应分类的数据
   */
  async onParentChange(event) {
    console.log('[land/category] ========== 左侧分类点击事件 ==========');
    console.log('[land/category] 完整事件对象:', event);
    console.log('[land/category] 事件类型:', event.type);
    console.log('[land/category] 事件detail:', event.detail);
    console.log('[land/category] detail的所有键:', Object.keys(event.detail || {}));
    console.log('[land/category] detail内容:', JSON.stringify(event.detail, null, 2));
    
    let index = event.detail?.index;
    
    // 处理不同的事件格式
    if (index === undefined || index === null) {
      // 检查是否是数组格式 [activeKey, subActiveKey]
      if (Array.isArray(event.detail) && event.detail.length > 0) {
        index = event.detail[0]; // activeKey
        console.log('[land/category] 从数组格式获取索引(activeKey):', index);
      } else {
        console.error('[land/category] 无法获取有效的分类索引');
        console.error('[land/category] 完整事件detail:', event.detail);
        return;
      }
    }
    
    console.log('[land/category] 最终提取的索引:', index);
    console.log('[land/category] 索引类型:', typeof index);
    
    // 确保索引是数字类型
    const validIndex = parseInt(index);
    if (isNaN(validIndex) || validIndex < 0) {
      console.error('[land/category] 无效的分类索引:', index);
      return;
    }
    
    // 判断点击的是哪个分类类型
    let categoryType, categoryTypeName;
    if (validIndex === 0) {
      categoryType = 2; // 土地分类
      categoryTypeName = '土地';
    } else if (validIndex === 1) {
      categoryType = 1; // 农产品分类  
      categoryTypeName = '农产品';
    } else {
      console.error('[land/category] 未知的分类索引:', validIndex);
      return;
    }
    
    console.log('[land/category] 分类类型:', categoryTypeName, 'categoryType:', categoryType);
    
    // 检查是否已经加载过该分类的数据
    if (this.data.currentCategoryType === categoryType) {
      console.log('[land/category] 该分类数据已加载，跳过重复请求');
      return;
    }
    
    // 显示加载提示
    wx.showLoading({
      title: `加载${categoryTypeName}分类...`,
    });
    
    try {
      console.log('[land/category] ===== 开始加载分类数据 =====');
      
      let result;
      if (categoryType === 1) {
        result = await getGoodsCategory();
        console.log('[land/category] 农产品分类结果:', result);
      } else {
        result = await getLandCategory();
        console.log('[land/category] 土地分类结果:', result);
      }
      
      if (result.success && result.data && result.data.length > 0) {
        // 处理分类数据
        const categories = result.data.map((item, itemIndex) => ({
          groupId: `${categoryType}10${itemIndex + 1}`, // 1101, 1102... 或 2101, 2102...
          name: item.name,
          thumbnail: item.image_url || `https://via.placeholder.com/100x100?text=${encodeURIComponent(item.name)}`
        }));
        
        console.log('[land/category] 处理后的分类数据:', categories);
        
        // 更新对应分类的children数据
        const newList = [...this.data.list];
        newList[validIndex].children[0].children = categories;
        
        this.setData({
          list: newList,
          currentCategoryType: categoryType
        });
        
        console.log('[land/category] 分类数据更新完成，数量:', categories.length);
        
      } else {
        console.warn('[land/category] 分类数据为空或请求失败:', result.message);
        wx.showToast({
          title: result.message || '获取分类失败',
          icon: 'none'
        });
      }
      
    } catch (error) {
      console.error('[land/category] ===== 加载分类数据失败 =====');
      console.error('[land/category] 错误信息:', error.message);
      console.error('[land/category] 错误详情:', error);
      
      wx.showToast({
        title: '加载分类失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  onShow() {
    this.getTabBar().init();
  },
  
  onChange(e) {
    console.log('[land/category] ========== 分类点击事件触发 ==========');
    console.log('[land/category] 事件对象:', e);
    console.log('[land/category] 事件详情:', JSON.stringify(e.detail, null, 2));
    
    // 获取点击的分类信息
    const { item } = e.detail;
    
    console.log('[land/category] ===== 解析点击的分类信息 =====');
    console.log('[land/category] item对象:', JSON.stringify(item, null, 2));
    console.log('[land/category] item类型:', typeof item);
    console.log('[land/category] item是否为空:', !item);
    
    if (!item) {
      console.error('[land/category] 错误: 未获取到分类信息');
      return;
    }
    
    // 获取分类名称作为标签
    const categoryName = item.name || '';
    
    console.log('[land/category] 提取的分类名称:', categoryName);
    console.log('[land/category] 分类groupId:', item.groupId);
    
    console.log('[land/category] 分类点击详情:', {
      groupId: item.groupId,
      name: item.name,
      categoryName: categoryName
    });
    
    // 根据分类的groupId判断模块类型
    // 现在：groupId以11开头的是农产品模块，以21开头的是土地模块
    const groupIdPrefix = item.groupId ? item.groupId.substring(0, 2) : '21';
    const moduleType = groupIdPrefix === '11' ? 'goods' : 'land';
    
    console.log('[land/category] ===== 判断跳转类型 =====');
    console.log('[land/category] groupId:', item.groupId);
    console.log('[land/category] groupId前两位:', groupIdPrefix);
    console.log('[land/category] 模块类型:', moduleType);
    console.log('[land/category] 判断逻辑: 11开头=农产品, 21开头=土地');
    
    if (moduleType === 'land') {
      // 土地模块：跳转到土地列表页面
      const url = `/pages/land/list/index?tag=${encodeURIComponent(categoryName)}`;
      console.log('[land/category] ===== 跳转到土地列表 =====');
      console.log('[land/category] 目标URL:', url);
      
      wx.navigateTo({
        url: url,
        success: (result) => {
          console.log('[land/category] 土地列表跳转成功:', result);
        },
        fail: (error) => {
          console.error('[land/category] 土地列表跳转失败:', error);
          // 尝试不编码的URL
          const simpleUrl = `/pages/land/list/index?tag=${categoryName}`;
          console.log('[land/category] 尝试简单URL:', simpleUrl);
          wx.navigateTo({
            url: simpleUrl,
            success: (result) => {
              console.log('[land/category] 简单URL跳转成功:', result);
            },
            fail: (simpleError) => {
              console.error('[land/category] 简单URL跳转也失败:', simpleError);
              wx.showToast({
                title: '页面跳转失败',
                icon: 'none'
              });
            }
          });
        }
      });
    } else {
      // 农产品模块：跳转到商品列表页面
      const url = `/pages/goods/list/index?tag=${encodeURIComponent(categoryName)}`;
      console.log('[land/category] ===== 跳转到商品列表 =====');
      console.log('[land/category] 目标URL:', url);
      
      wx.navigateTo({
        url: url,
        success: (result) => {
          console.log('[land/category] 商品列表跳转成功:', result);
        },
        fail: (error) => {
          console.error('[land/category] 商品列表跳转失败:', error);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    }
  },
  
  onLoad() {
    console.log('[land/category] onLoad 被调用');
    this.init();
  },
});
