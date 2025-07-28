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
  genPicURL
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
    this.goodListPagination = {
      index: 0,
      num: 20
    };
    this.privateData = {
      tabIndex: 0
    };
    this.init();

    this.loadCartIcon();
    this.loadSearchIcon();
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
    this.loadHomePage();
  },

  loadHomePage() {
    wx.stopPullDownRefresh();

    this.setData({
      pageLoading: true,
    });
    fetchHome().then(({
      swiper,
      tabList
    }) => {
      this.setData({
        tabList,
        imgSrcs: swiper,
        pageLoading: false,
      });
      this.loadGoodsList(true);
    });
  },

  tabChangeHandle(e) {
    // 增加调试输出，确认tab索引类型
    console.log('[tabChangeHandle] e.detail:', e.detail, typeof e.detail);
    const tabIndex = Number(e.detail.value); // 取value字段
    this.privateData.tabIndex = tabIndex;
    this.setData({
      currentTabIndex: tabIndex
    });
    if (tabIndex === 0) {
      this.loadGoodsList(true);
    } else if (tabIndex === 1) {
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
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      goodsListLoadStatus: 1
    });

    const pageSize = this.goodListPagination.num;
    let pageIndex = this.privateData.tabIndex * pageSize + this.goodListPagination.index + 1;
    if (fresh) {
      pageIndex = 0;
    }

    try {
      const nextList = await fetchGoodsList(pageIndex, pageSize);
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        goodsListLoadStatus: 0,
      });
      this.goodListPagination.index = pageIndex;
      this.goodListPagination.num = pageSize;
      // 调试输出
      console.log('[loadGoodsList] goodsList:', this.data.goodsList);
    } catch (err) {
      this.setData({
        goodsListLoadStatus: 3
      });
    }
  },

  async loadLandsList(fresh = false) {
    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({
      landsListLoadStatus: 1
    });

    const pageSize = this.landListPagination.num;
    let pageIndex = this.privateData.tabIndex * pageSize + this.landListPagination.index + 1;
    if (fresh) {
      pageIndex = 0;
    }

    try {
      const nextList = await fetchLandsList(pageIndex, pageSize);
      this.setData({
        landsList: fresh ? nextList : this.data.landsList.concat(nextList),
        landsListLoadStatus: 0,
      });
      this.landListPagination.index = pageIndex;
      this.landListPagination.num = pageSize;
      // 调试输出
      console.log('[loadLandsList] landsList:', this.data.landsList);
    } catch (err) {
      this.setData({
        landsListLoadStatus: 3
      });
    }
  },

  goodListClickHandle(e) {
    const {
      index
    } = e.detail;
    const {
      good_id
    } = this.data.goodsList[index];
    wx.navigateTo({
      url: `/pages/goods/details/index?goodId=${good_id}`,
    });
  },

  landListClickHandle(e) {
    const {
      index
    } = e.detail;
    console.log('[landListClickHandle] 点击事件:', e);
    console.log('[landListClickHandle] 点击的索引:', index);
    console.log('[landListClickHandle] 当前landsList:', this.data.landsList);
    
    if (!this.data.landsList || !this.data.landsList[index]) {
      console.error('[landListClickHandle] 数据不存在，index:', index, 'landsList长度:', this.data.landsList?.length);
      wx.showToast({
        title: '土地信息不完整',
        icon: 'none'
      });
      return;
    }
    
    const landItem = this.data.landsList[index];
    console.log('[landListClickHandle] 点击的土地项:', landItem);
    const { land_id } = landItem;
    console.log('[landListClickHandle] 土地ID:', land_id);
    
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
    const fileID = 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/TdesignCartAdd.png';
    genPicURL(fileID).then(url => {
      this.setData({
        cartIconUrl: url
      });
    }).catch(err => {
      console.error('购物车图标加载失败:', err);
    });
  },

  loadSearchIcon() {
    const fileID = 'cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/TDesign/TdesignSearch.png';
    genPicURL(fileID).then(url => {
      this.setData({
        searchIconUrl: url
      });
    }).catch(err => {
      console.error('搜索图标加载失败:', err);
    });
  },

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
    const {
      index: promotionID = 0
    } = detail || {};
    wx.navigateTo({
      url: `/pages/promotion-detail/index?promotion_id=${promotionID}`,
    });
  },
});