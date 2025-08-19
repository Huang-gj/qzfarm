import {
  getSearchHistory,
  // getSearchPopular, // removed
} from '../../../services/good/fetchSearchHistory';
import { genPicURL, getFirstImageUrl } from '../../../utils/genURL';

Page({
  data: {
    historyWords: [],
    // popularWords: [], // removed
    searchValue: '',
    dialog: {
      title: '确认删除当前历史记录',
      showCancelButton: true,
      message: '',
    },
    dialogShow: false,
    searchIconUrl: '',
  },

  deleteType: 0,
  deleteIndex: '',

  onLoad() {
    this.loadSearchIcon();
  },

  onShow() {
    this.queryHistory();
    // this.queryPopular(); // removed
  },

  // 本地缓存key
  getHistoryStorageKey() {
    return 'search_history_words';
  },

  // 从本地缓存加载历史
  queryHistory() {
    try {
      const key = this.getHistoryStorageKey();
      const list = wx.getStorageSync(key) || [];
      this.setData({ historyWords: Array.isArray(list) ? list : [] });
    } catch (e) {
      console.error('[queryHistory] 读取本地历史失败', e);
      this.setData({ historyWords: [] });
    }
  },

  // 保存关键字到本地历史（去重，最近在前，最多20条）
  saveKeywordToHistory(keyword) {
    const key = this.getHistoryStorageKey();
    const trimmed = (keyword || '').trim();
    if (!trimmed) return;
    try {
      let list = wx.getStorageSync(key) || [];
      if (!Array.isArray(list)) list = [];
      list = list.filter((w) => w !== trimmed);
      list.unshift(trimmed);
      if (list.length > 20) list = list.slice(0, 20);
      wx.setStorageSync(key, list);
      this.setData({ historyWords: list });
    } catch (e) {
      console.error('[saveKeywordToHistory] 写入本地历史失败', e);
    }
  },

  loadSearchIcon() {
    // 使用占位图标
    const searchIconUrl = 'https://via.placeholder.com/48x48?text=搜索';
    this.setData({
      searchIconUrl: searchIconUrl
    });
  },

  onInputChange(e) {
    const { value } = e.detail;
    this.setData({ searchValue: value });
  },

  onLeftIconTap() {
    const { searchValue } = this.data;
    const kw = (searchValue || '').trim();
    if (!kw) return;
    this.saveKeywordToHistory(kw);
    wx.navigateTo({
      url: `/pages/goods/result/index?searchValue=${kw}`,
    });
  },

  async queryHistoryMockRemoved() {},

  confirm() {
    const { historyWords } = this.data;
    const { deleteType, deleteIndex } = this;
    historyWords.splice(deleteIndex, 1);
    if (deleteType === 0) {
      this.setData({
        historyWords,
        dialogShow: false,
      });
      try { wx.setStorageSync(this.getHistoryStorageKey(), historyWords); } catch (e) {}
    } else {
      this.setData({ historyWords: [], dialogShow: false });
      try { wx.setStorageSync(this.getHistoryStorageKey(), []); } catch (e) {}
    }
  },

  close() {
    this.setData({ dialogShow: false });
  },

  handleClearHistory() {
    const { dialog } = this.data;
    this.deleteType = 1;
    this.setData({
      dialog: {
        ...dialog,
        message: '确认删除所有历史记录',
      },
      dialogShow: true,
    });
  },

  deleteCurr(e) {
    const { index } = e.currentTarget.dataset;
    const { dialog } = this.data;
    this.deleteIndex = index;
    this.setData({
      dialog: {
        ...dialog,
        message: '确认删除当前历史记录',
        deleteType: 0,
      },
      dialogShow: true,
    });
  },

  handleHistoryTap(e) {
    const { historyWords } = this.data;
    const { dataset } = e.currentTarget;
    const _searchValue = (historyWords[dataset.index || 0] || '').trim();
    if (_searchValue) {
      wx.navigateTo({
        url: `/pages/goods/result/index?searchValue=${_searchValue}`,
      });
    }
  },

  handleSubmit(e) {
    const { value } = e.detail.value;
    const kw = (value || '').trim();
    if (!kw) return;
    this.saveKeywordToHistory(kw);
    wx.navigateTo({
      url: `/pages/goods/result/index?searchValue=${kw}`,
    });
  },
});
