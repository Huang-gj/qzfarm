import { getLandsByTag } from '../../../model/landsApi';
import { genPicURL, processImageUrls, getFirstImageUrl } from '../../../utils/genURL';
import Toast from 'tdesign-miniprogram/toast/index';

const initFilters = {
  overall: 1,
  sorts: '',
  layout: 0,
};

Page({
  data: {
    landsList: [],
    layout: 0,
    sorts: '',
    overall: 1,
    show: false,
    minVal: '',
    maxVal: '',
    filter: initFilters,
    hasLoaded: false,
    loadMoreStatus: 0,
    loading: true,
    groupId: '',
    originalLandsList: [],
  },

  pageNum: 1,
  pageSize: 30,
  total: 0,

  handleFilterChange(e) {
    const { layout, overall, sorts } = e.detail;
    
    // 防止重复触发 - 检查排序条件是否真的变化了
    if (sorts === this.data.sorts && overall === this.data.overall) {
      return;
    }
    
    // 先显示加载中状态
    this.setData({
      loading: true,
      layout,
      sorts,
      overall,
      filter: { ...this.data.filter, overall, sorts },
    });
    
    // 使用setTimeout延迟数据获取和渲染
    setTimeout(() => {
      this.pageNum = 1;
      this.setData({ loadMoreStatus: 0 });
      this.init(true);
    }, 100);
  },

  generalQueryData(reset = false) {
    const { filter, keywords, minVal, maxVal, groupId, sorts, overall } = this.data;
    const { pageNum, pageSize } = this;
    
    const params = {
      sort: 0, // 0 综合，1 价格
      pageNum: 1,
      pageSize: 30,
      keyword: keywords,
      groupId: groupId,
    };

    // 如果有排序方式，则设置排序参数
    if (sorts) {
      params.sort = 1; // 1表示按价格排序
      params.sortType = sorts === 'desc' ? 1 : 0; // 1降序，0升序
    }

    // 如果是综合排序
    if (overall === 1) {
      params.sort = 0; // 0表示综合排序
    }
    
    // 设置价格范围（只有当值存在时才设置）
    if (minVal) {
      params.minPrice = parseFloat(minVal); // 单位：元
    }
    
    if (maxVal) {
      params.maxPrice = parseFloat(maxVal); // 单位：元
    }
    
    if (reset) return params;
    return {
      ...params,
      pageNum: pageNum + 1,
      pageSize,
    };
  },

  sortGoodsList(goodsList, sorts, overall) {
    if (!goodsList || !goodsList.length) return [];
    
    // 深拷贝数组，避免修改原数据
    const list = JSON.parse(JSON.stringify(goodsList));
    
    if (overall === 1) {
      // 综合排序 - 可以按照默认顺序或其他综合因素
      return list;
    } else if (sorts) {
      // 价格排序
      return list.sort((a, b) => {
        const priceA = a.minSalePrice || a.price || 0;
        const priceB = b.minSalePrice || b.price || 0;
        return sorts === 'desc' ? priceB - priceA : priceA - priceB;
      });
    }
    
    return list;
  },

  filterGoodsByPrice(goodsList, minVal, maxVal) {
    if (!goodsList || !goodsList.length) return [];
    if (!minVal && !maxVal) return goodsList; // 如果没有价格筛选条件，返回原列表
    
    const min = minVal !== '' ? parseFloat(minVal) : null;
    const max = maxVal !== '' ? parseFloat(maxVal) : null;
    
    return goodsList.filter(item => {
      const price = parseFloat(item.minSalePrice || item.price || 0);
      if (min !== null && max !== null) {
        return price >= min && price <= max;
      } else if (min !== null) {
        return price >= min;
      } else if (max !== null) {
        return price <= max;
      }
      return true;
    });
  },

  async init(reset = true) {
    const { loadMoreStatus, landsList = [], sorts, overall, minVal, maxVal, groupId } = this.data;
    
    if (reset) {
      // 只有第一次加载或刷新时才请求新数据
      if (loadMoreStatus !== 0) return;
      this.setData({ loadMoreStatus: 1, loading: true });
      
      try {
        // 使用分类名称作为标签来获取土地
        let landsList;
        if (groupId) {
          // 如果有标签，使用标签获取土地
          landsList = await getLandsByTag(groupId, 0);
        } else {
          // 如果没有标签，获取所有土地
          const { getAllLandsApi } = require('../../../model/landsApi');
          const response = await getAllLandsApi({ user_id: 0 });
          landsList = response.lands_list || [];
        }
        
        if (Array.isArray(landsList)) {
          const totalCount = landsList.length;
          
          if (totalCount === 0) {
            this.total = totalCount;
            this.setData({
              emptyInfo: {
                tip: '抱歉，未找到相关土地',
              },
              hasLoaded: true,
              loadMoreStatus: 0,
              loading: false,
              landsList: [],
            });
            return;
          }

          // 转换数据格式以适配前端显示，并处理图片URL
          const spuList = landsList.map((item) => {
            // 处理图片URL：现在数据库存储的是完整URL，直接使用
            const thumbUrl = getFirstImageUrl(item.image_urls);
            
            return {
              land_id: item.land_id,
              thumb: thumbUrl,
              title: item.land_name,
              price: item.price,
              originPrice: item.price,
              desc: item.detail || '',
              tags: item.land_tag ? [item.land_tag] : [],
              // 保留原始数据
              ...item
            };
          });

          this.originalLandsList = spuList; // 保存原始列表
          
          // 先按价格筛选
          const filteredList = this.filterGoodsByPrice(spuList, minVal, maxVal);
          
          // 再按排序条件排序
          const sortedList = this.sortGoodsList(filteredList, sorts, overall);
          
          this.pageNum = 1;
          this.total = totalCount;
          this.setData({
            landsList: sortedList,
            loadMoreStatus: sortedList.length === totalCount ? 2 : 0,
            loading: false,
            hasLoaded: true
          });
        } else {
          this.setData({
            loading: false,
          });
          wx.showToast({
            title: '查询失败，请稍候重试',
          });
        }
      } catch (error) {
        console.error('[init] 获取土地列表失败:', error);
        this.setData({ loading: false, hasLoaded: true });
        wx.showToast({
          title: '获取土地列表失败',
          icon: 'none'
        });
      }
    } else {
      // 先按价格筛选
      const filteredList = this.filterGoodsByPrice(this.originalLandsList, minVal, maxVal);
      
      // 再按排序条件排序
      const sortedList = this.sortGoodsList(filteredList, sorts, overall);
      
      this.setData({
        landsList: sortedList,
        loading: false
      });
    }
  },

  onLoad(options) {
    const { groupId = '', tag = '' } = options;
    // 优先使用 tag 参数，如果没有则使用 groupId
    let landTag = tag || groupId || '';
    
    // 如果tag参数被URL编码了，需要解码
    if (tag) {
      try {
        landTag = decodeURIComponent(tag);
      } catch (error) {
        console.error('[onLoad] URL解码失败:', error);
        landTag = tag;
      }
    }
    

    
    this.setData({ groupId: landTag }, () => {
      this.init(true);
    });

    // 使用节流包装handleFilterChange
    this.throttledFilterChange = throttle(this.handleFilterChange.bind(this), 300);
  },

  onReachBottom() {
    const { landsList } = this.data;
    const { total = 0 } = this;
    if (landsList.length === total) {
      this.setData({
        loadMoreStatus: 2,
      });
      return;
    }
    this.init(false);
  },

  handleAddCart() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '点击加购',
    });
  },

  tagClickHandle() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '点击标签',
    });
  },

  gotoLandDetail(e) {
    const { index } = e.detail;
    
    if (!this.data.landsList || !this.data.landsList[index]) {
      console.error('[gotoLandDetail] 数据不存在，index:', index, 'landsList长度:', this.data.landsList?.length);
      return;
    }
    
    const landItem = this.data.landsList[index];
    const { land_id } = landItem;
    
    if (!land_id) {
      console.error('[gotoLandDetail] land_id不存在');
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

  showFilterPopup() {
    this.setData({
      show: true,
    });
  },

  showFilterPopupClose() {
    this.setData({
      show: false,
    });
  },

  onMinValAction(e) {
    const { value } = e.detail;
    this.setData({ minVal: value });
  },

  onMaxValAction(e) {
    const { value } = e.detail;
    this.setData({ maxVal: value });
  },

  reset() {
    // 重置价格输入框
    this.setData({ 
      minVal: '', 
      maxVal: '' 
    });
  },

  confirm() {
    const { minVal, maxVal } = this.data;
    
    // 验证输入有效性
    if (minVal && maxVal && parseFloat(minVal) > parseFloat(maxVal)) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入正确价格范围',
      });
      return;
    }
    
    // 关闭弹窗并设置加载状态
    this.setData({
      show: false,
      loading: true,
      loadMoreStatus: 0
    }, () => {
      // 重置页码，准备重新加载数据
      this.pageNum = 1;
      // 调用init重新获取数据
      this.init(true);
      
      // 设置价格范围提示信息
      let message = '';
      if (minVal && !maxVal) {
        message = `已筛选: 价格 ≥ ${minVal}元`;
      } else if (!minVal && maxVal) {
        message = `已筛选: 价格 ≤ ${maxVal}元`;
      } else if (minVal && maxVal) {
        message = `已筛选: 价格 ${minVal}-${maxVal}元`;
      }
      
      if (message) {
        Toast({
          context: this,
          selector: '#t-toast',
          message,
          duration: 2000
        });
      }
    });
  },

  // 添加清除价格筛选的方法
  clearPriceFilter() {
    this.setData({
      minVal: '',
      maxVal: '',
      loading: true
    }, () => {
      this.pageNum = 1;
      this.init(true);
    });
  },
});

// 在页面顶部添加节流工具函数
function throttle(fn, delay = 300) {
  let timer = null;
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastTime = Date.now();
      }, delay);
    }
  };
}
