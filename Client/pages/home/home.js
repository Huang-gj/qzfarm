import {
  fetchHome
} from '../../services/home/home';
import {
  fetchGoodsList
} from '../../services/good/fetchGoods';
import {
  fetchLandsList
} from '../../services/land/fetchLands';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  genPicURL,
  getFirstImageUrl
} from '../../utils/genURL';

Page({
  data: {
    imgSrcs: [],
    tabList: [],
    goodsList: [],
    landsList: [],
    goodsListLoadStatus: 0,
    landsListLoadStatus: 0,
    pageLoading: false,
    current: 1,
    autoplay: true,
    duration: '500',
    interval: 5000,
    navigation: {
      type: 'dots'
    },
    swiperImageProps: {
      mode: 'scaleToFill'
    },
    cartIconUrl: '',
    searchIconUrl: '',
    currentTabIndex: 0,
    activities: null, // 活动数据
  },

  goodListPagination: {
    index: 0,
    num: 20,
  },
  landListPagination: {
    index: 0,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },

  onShow() {
    this.getTabBar().init();
  },

  onLoad() {
    console.log('[onLoad] 首页开始加载');
    this.goodListPagination = {
      index: 0,
      num: 20
    };
    this.landListPagination = {
      index: 0,
      num: 20
    };
    this.privateData = {
      tabIndex: 0
    };
    console.log('[onLoad] 准备调用init方法');
    this.init();

    this.loadCartIcon();
    // 移除搜索图标加载，直接使用 TDesign 内置图标
  },

  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0 && this.privateData.tabIndex === 0) {
      this.loadGoodsList();
    } else if (this.data.landsListLoadStatus === 0 && this.privateData.tabIndex === 1) {
      this.loadLandsList();
    }
  },

  onPullDownRefresh() {
    this.init();
  },

  init() {
    console.log('[init] 初始化首页，准备调用loadHomePage');
    this.loadHomePage();
  },

  loadHomePage() {
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: true,
    });
    
    console.log('[loadHomePage] 开始加载首页数据');
    
    fetchHome().then(({
      swiper,
      activityMapping,
      tabList,
      activities
    }) => {
      console.log('[loadHomePage] 获取到首页数据:', { swiper, activityMapping, tabList, activities });

      // 过滤掉土地认养标签，暂时隐藏土地认养模块
      const filteredTabList = tabList.filter(tab => tab.key !== 1);

      this.setData({
        tabList: filteredTabList,
        imgSrcs: swiper,
        activityMapping: activityMapping || [], // 保存活动映射关系
        activities: activities || null, // 保存活动数据
        pageLoading: false,
        currentTabIndex: 0, // 初始化当前tab索引为0（农产品）
      });
      
      console.log('[loadHomePage] 设置页面数据完成，开始加载商品列表');
      this.loadGoodsList(true);
    }).catch(error => {
      console.error('[loadHomePage] 加载首页数据失败:', error);
      this.setData({
        pageLoading: false,
      });
    });
  },

  tabChangeHandle(e) {
    const tabIndex = Number(e.detail.value); // 取value字段
    console.log('[tabChangeHandle] tab切换:', tabIndex, 'e.detail:', e.detail);
    
    this.privateData.tabIndex = tabIndex;
    this.setData({
      currentTabIndex: tabIndex
    });
    
    if (tabIndex === 0) {
      console.log('[tabChangeHandle] 切换到农产品tab，加载商品列表');
      this.loadGoodsList(true);
    } else if (tabIndex === 1) {
      console.log('[tabChangeHandle] 切换到土地认养tab，加载土地列表');
      this.loadLandsList(true);
    }
  },

  onReTry() {
    if (this.privateData.tabIndex === 0) {
      this.loadGoodsList();
    } else if (this.privateData.tabIndex === 1) {
      this.loadLandsList();
    }
  },

  async loadGoodsList(fresh = false) {
    console.log('[loadGoodsList] 开始加载商品列表, fresh:', fresh);
    
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      goodsListLoadStatus: 1
    });

    // 确保 goodListPagination 存在
    if (!this.goodListPagination) {
      console.log('[loadGoodsList] goodListPagination不存在，重新初始化');
      this.goodListPagination = {
        index: 0,
        num: 20
      };
    }

    const pageSize = this.goodListPagination.num;
    let pageIndex = this.privateData.tabIndex * pageSize + this.goodListPagination.index + 1;
    if (fresh) {
      pageIndex = 0;
    }

    try {
      console.log('[loadGoodsList] 调用fetchGoodsList, pageIndex:', pageIndex, 'pageSize:', pageSize);
      const nextList = await fetchGoodsList(pageIndex, pageSize);
      console.log('[loadGoodsList] 获取到商品数据:', nextList);
      
      // 处理商品状态：检查库存
      const processedList = nextList.map(goods => {
        const isSoldOut = goods.repertory === 0;
        return {
          ...goods,
          isSoldOut,
          statusText: isSoldOut ? '已售罄' : ''
        };
      });
      
      console.log('[loadGoodsList] 处理后的商品数据:', processedList);
      
      this.setData({
        goodsList: fresh ? processedList : this.data.goodsList.concat(processedList),
        goodsListLoadStatus: 0,
      });
      this.goodListPagination.index = pageIndex;
      this.goodListPagination.num = pageSize;

    } catch (err) {
      console.error('[loadGoodsList] 加载商品列表失败:', err);
      this.setData({
        goodsListLoadStatus: 3
      });
    }
  },

  async loadLandsList(fresh = false) {
    console.log('[loadLandsList] 开始加载土地列表, fresh:', fresh);
    
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      landsListLoadStatus: 1
    });

    // 确保 landListPagination 存在
    if (!this.landListPagination) {
      console.log('[loadLandsList] landListPagination不存在，重新初始化');
      this.landListPagination = {
        index: 0,
        num: 20
      };
    }

    const pageSize = this.landListPagination.num;
    let pageIndex = this.privateData.tabIndex * pageSize + this.landListPagination.index + 1;
    if (fresh) {
      pageIndex = 0;
    }

    try {
      console.log('[loadLandsList] 调用fetchLandsList, pageIndex:', pageIndex, 'pageSize:', pageSize);
      const nextList = await fetchLandsList(pageIndex, pageSize);
      console.log('[loadLandsList] 获取到土地数据:', nextList);
      
      // 处理土地状态：检查租赁状态
      const processedList = nextList.map(land => {
        const isRented = land.sale_status === 1;
        return {
          ...land,
          isRented,
          statusText: isRented ? '已租赁' : ''
        };
      });
      
      console.log('[loadLandsList] 处理后的土地数据:', processedList);
      
      this.setData({
        landsList: fresh ? processedList : this.data.landsList.concat(processedList),
        landsListLoadStatus: 0,
      });
      this.landListPagination.index = pageIndex;
      this.landListPagination.num = pageSize;

    } catch (err) {
      console.error('[loadLandsList] 加载土地列表失败:', err);
      this.setData({
        landsListLoadStatus: 3
      });
    }
  },

  goodListClickHandle(e) {
    const {
      index
    } = e.detail;
    const goods = this.data.goodsList[index];
    
    // 检查商品是否已售罄
    if (goods.isSoldOut) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '该商品已售罄',
        icon: 'close-circle',
        duration: 2000,
      });
      return;
    }
    
    const {
      good_id
    } = goods;
    wx.navigateTo({
      url: `/pages/goods/details/index?goodId=${good_id}`,
    });
  },

  landListClickHandle(e) {
    const {
      index
    } = e.detail;
    
    if (!this.data.landsList || !this.data.landsList[index]) {
      console.error('[landListClickHandle] 数据不存在，index:', index, 'landsList长度:', this.data.landsList?.length);
      wx.showToast({
        title: '土地信息不完整',
        icon: 'none'
      });
      return;
    }
    
    const landItem = this.data.landsList[index];
    
    // 检查土地是否已租赁
    if (landItem.isRented) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '该土地已租赁',
        icon: 'close-circle',
        duration: 2000,
      });
      return;
    }
    
    const { land_id } = landItem;
    
    if (!land_id) {
      console.error('[landListClickHandle] land_id不存在');
      wx.showToast({
        title: '土地信息不完整',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/land/details/index?landId=${land_id}`,
    });
  },

  loadCartIcon() {
    // 使用占位图标
    const cartIconUrl = 'https://via.placeholder.com/48x48?text=购物车';
    this.setData({
      cartIconUrl: cartIconUrl
    });
  },

  // loadSearchIcon() 方法已移除，直接使用 TDesign 内置搜索图标

  goodListAddCartHandle() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '点击加入购物车',
    });
  },

  navToSearchPage() {
    wx.navigateTo({
      url: '/pages/goods/search/index'
    });
  },

  navToActivityDetail({
    detail
  }) {
    console.log('[navToActivityDetail] 轮播图点击事件:', detail);
    
    const { index = 0 } = detail || {};
    const { activityMapping } = this.data;
    
    // 使用活动映射关系获取对应的活动信息
    if (activityMapping && activityMapping[index]) {
      const activityInfo = activityMapping[index];
      console.log('[navToActivityDetail] 点击的活动信息:', activityInfo);
      
      if (activityInfo.activityId) {
        console.log('[navToActivityDetail] 跳转到活动详情页，activityId:', activityInfo.activityId);
        wx.navigateTo({
          url: `/pages/activity-detail/index?activity_id=${activityInfo.activityId}`,
          fail: (err) => {
            console.error('[navToActivityDetail] 跳转失败:', err);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      } else {
        // 如果没有activityId，跳转到原来的促销详情页
        console.log('[navToActivityDetail] 跳转到促销详情页，index:', index);
        wx.navigateTo({
          url: `/pages/promotion-detail/index?promotion_id=${index}`,
        });
      }
    } else {
      console.warn('[navToActivityDetail] 未找到对应的活动映射数据');
      wx.showToast({
        title: '数据异常',
        icon: 'none',
        duration: 2000
      });
    }
  },
});