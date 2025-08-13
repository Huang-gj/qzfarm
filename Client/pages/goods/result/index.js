/* eslint-disable no-param-reassign */
import { getSearchResult } from '../../../services/good/fetchSearchResult';
import Toast from 'tdesign-miniprogram/toast/index';
import { genPicURL } from '../../../utils/genURL';

const initFilters = {
  overall: 1,
  sorts: '',
};

async function normalizeImages(list) {
  const mapped = await Promise.all(
    (list || []).map(async (item) => {
      const next = { ...item };
      const fixOne = async (url) => {
        if (!url) return '';
        if (typeof url === 'string' && url.startsWith('cloud://')) {
          try {
            return await genPicURL(url);
          } catch (e) {
            console.error('[result] genPicURL失败，使用原值', url, e);
            return url;
          }
        }
        return url;
      };
      next.primaryImage = await fixOne(next.primaryImage);
      next.thumb = await fixOne(next.thumb || next.primaryImage);
      if (!next.thumb) {
        next.thumb = 'https://via.placeholder.com/300x300?text=%E5%95%86%E5%93%81';
      }
      return next;
    })
  );
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

  total: 0,
  pageNum: 1,
  pageSize: 30,

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

  generalQueryData(reset = false) {
    const { filter, keywords, minVal, maxVal } = this.data;
    const { pageNum, pageSize } = this;
    const { sorts, overall } = filter;
    const params = {
      // 后端仅需要 keyword
      keyword: keywords,
    };
    return params;
  },

  async init(reset = true) {
    const { loadMoreStatus, goodsList = [] } = this.data;
    const params = this.generalQueryData(reset);
    this.setData({
      loadMoreStatus: 1,
      loading: true,
    });
    try {
      const result = await getSearchResult(params);
      const code = 'Success';
      const data = result;
      if (code.toUpperCase() === 'SUCCESS') {
        const { spuList, totalCount = 0 } = data;
        let _goodsList = spuList;
        _goodsList.forEach((v) => {
          v.tags = (v.spuTagList || []).map((u) => u.title || u);
          v.hideKey = { desc: true };
        });
        _goodsList = await normalizeImages(_goodsList);
        const _loadMoreStatus = 2; // 后端不分页，直接置为没有更多
        this.pageNum = 1;
        this.total = _goodsList.length;
        this.setData({
          goodsList: _goodsList,
          loadMoreStatus: _loadMoreStatus,
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
      this.setData({
        loading: false,
      });
    }
    this.setData({
      hasLoaded: true,
      loading: false,
    });
  },

  handleCartTap() {
    wx.switchTab({
      url: '/pages/cart/index',
    });
  },

  handleSubmit() {
    this.setData(
      {
        goodsList: [],
        loadMoreStatus: 0,
      },
      () => {
        this.init(true);
      },
    );
  },

  onReachBottom() {
    // 无分页，忽略
  },

  handleAddCart() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '点击加购',
    });
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

  handleFilterChange(e) {
    const { overall, sorts } = e.detail;
    const { total } = this;
    const _filter = {
      sorts,
      overall,
    };
    this.setData({
      filter: _filter,
      sorts,
      overall,
    });

    this.pageNum = 1;
    this.setData(
      {
        goodsList: [],
        loadMoreStatus: 0,
      },
      () => {
        total && this.init(true);
      },
    );
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
    this.setData({ minVal: '', maxVal: '' });
  },

  confirm() {
    const { minVal, maxVal } = this.data;
    let message = '';
    if (minVal && !maxVal) {
      message = `价格最小是${minVal}`;
    } else if (!minVal && maxVal) {
      message = `价格范围是0-${minVal}`;
    } else if (minVal && maxVal && minVal <= maxVal) {
      message = `价格范围${minVal}-${this.data.maxVal}`;
    } else {
      message = '请输入正确范围';
    }
    if (message) {
      Toast({
        context: this,
        selector: '#t-toast',
        message,
      });
    }
    this.pageNum = 1;
    this.setData(
      {
        show: false,
        minVal: '',
        goodsList: [],
        loadMoreStatus: 0,
        maxVal: '',
      },
      () => {
        this.init();
      },
    );
  },
});
