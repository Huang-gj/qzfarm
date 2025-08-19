/* eslint-disable no-param-reassign */
import { getSearchResult } from '../../../services/good/fetchSearchResult';
import Toast from 'tdesign-miniprogram/toast/index';
import { genPicURL, getFirstImageUrl } from '../../../utils/genURL';

const initFilters = {
  overall: 1,
  sorts: '',
};

function normalizeImages(list) {
  const mapped = (list || []).map((item) => {
    const next = { ...item };
    const fixOne = (url) => {
      // 现在数据库存储的是完整URL，直接返回第一张图片
      return getFirstImageUrl(url);
    };
    next.primaryImage = fixOne(next.primaryImage);
    next.thumb = fixOne(next.thumb || next.primaryImage);
    if (!next.thumb) {
      next.thumb = 'https://via.placeholder.com/300x300?text=%E5%95%86%E5%93%81';
    }
    return next;
  });
  return mapped;
}

Page({
  data: {
    goodsList: [],
    sorts: '',
    overall: 1,
    show: false,
    minVal: '',
    maxVal: '',
    minSalePriceFocus: false,
    maxSalePriceFocus: false,
    filter: initFilters,
    hasLoaded: false,
    keywords: '',
    loadMoreStatus: 0,
    loading: true,
  },

  // 缓存完整结果，用于本地排序/筛选
  allGoodsList: [],

  onLoad(options) {
    const { searchValue = '' } = options || {};
    this.setData(
      {
        keywords: decodeURIComponent(searchValue || ''),
      },
      () => {
        this.init(true);
      },
    );
  },

  // 仅首屏请求一次数据
  async init(reset = true) {
    const params = { keyword: this.data.keywords };
    this.setData({
      loadMoreStatus: 1,
      loading: true,
    });
    try {
      const result = await getSearchResult(params);
      const code = 'Success';
      const data = result;
      if (code.toUpperCase() === 'SUCCESS') {
        const { spuList } = data;
        let _goodsList = normalizeImages(spuList);
        _goodsList.forEach((v) => {
          v.tags = (v.spuTagList || []).map((u) => u.title || u);
          v.hideKey = { desc: true };
        });
        this.allGoodsList = _goodsList; // 缓存完整数据
        this.applyView(); // 首次按当前筛选/排序渲染
        this.setData({
          loadMoreStatus: 2, // 无分页
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({ title: '查询失败，请稍候重试' });
      }
    } catch (error) {
      this.setData({ loading: false });
    }
    this.setData({ hasLoaded: true, loading: false });
  },

  // 本地排序/筛选渲染
  applyView() {
    const { minVal, maxVal, sorts, overall } = this.data;
    let list = [...this.allGoodsList];

    // 价格筛选（单位：元）
    const min = minVal !== '' ? parseFloat(minVal) : null;
    const max = maxVal !== '' ? parseFloat(maxVal) : null;
    if (min !== null) list = list.filter((i) => (parseFloat(i.price) || 0) >= min);
    if (max !== null) list = list.filter((i) => (parseFloat(i.price) || 0) <= max);

    // 排序：overall=综合(保持原顺序)，否则按价格；sorts: 'asc'|'desc'
    if (!overall) {
      const dir = sorts === 'desc' ? -1 : 1;
      list.sort((a, b) => (parseFloat(a.price) - parseFloat(b.price)) * dir);
    }

    this.setData({ goodsList: list });
  },

  // 价格输入
  onMinValAction(e) {
    const { value } = e.detail;
    this.setData({ minVal: value });
  },
  onMaxValAction(e) {
    const { value } = e.detail;
    this.setData({ maxVal: value });
  },

  // 打开/关闭筛选弹窗
  showFilterPopup() {
    this.setData({ show: true });
  },
  showFilterPopupClose() {
    this.setData({ show: false });
  },

  // 重置筛选
  reset() {
    this.setData({ minVal: '', maxVal: '' }, () => this.applyView());
  },

  // 确认筛选
  confirm() {
    this.setData({ show: false }, () => this.applyView());
  },

  // 排序切换（来自 filter 组件）
  handleFilterChange(e) {
    const { overall, sorts } = e.detail;
    this.setData(
      {
        filter: { overall, sorts },
        overall,
        sorts,
      },
      () => this.applyView()
    );
  },

  handleCartTap() {
    wx.switchTab({ url: '/pages/cart/index' });
  },

  // 结果页不支持再次发起搜索，该函数不再触发请求
  handleSubmit() {
    // no-op
  },

  onReachBottom() {
    // 无分页
  },

  handleAddCart() {
    Toast({ context: this, selector: '#t-toast', message: '点击加购' });
  },

  gotoGoodsDetail(e) {
    const { index } = e.detail;
    const item = this.data.goodsList[index];
    if (item?.isLand) {
      wx.navigateTo({ url: `/pages/land/details/index?landId=${item.good_id}` });
    } else {
      wx.navigateTo({ url: `/pages/goods/details/index?goodId=${item.good_id}` });
    }
  },
});
