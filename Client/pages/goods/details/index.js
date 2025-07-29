import Toast from 'tdesign-miniprogram/toast/index';
import {
  fetchGood
} from '../../../services/good/fetchGood';
import {
  fetchActivityList
} from '../../../services/activity/fetchActivityList';
import {
  addToCart,
  updateCartNum,
  getCartCount
} from '../../../services/cart/cart';
// import {
//   addGoodOrder
// } from '../../../services/order/addGoodOrder';
import {
  getGoodsDetailsCommentList,
  getGoodsDetailsCommentsCount,
} from '../../../services/good/fetchGoodsDetailsComments';
import {
  genPicURL
} from '../../../utils/genURL';

import {
  cdnBase
} from '../../../config/index';

// 使用require方式导入
const { addGoodOrder } = require('../../../services/order/addGoodOrder');

// 添加调试信息
console.log('[goods/details] addGoodOrder函数:', typeof addGoodOrder);
console.log('[goods/details] addGoodOrder函数内容:', addGoodOrder);

const imgPrefix = `${cdnBase}/`;

const recLeftImg = `${imgPrefix}common/rec-left.png`;
const recRightImg = `${imgPrefix}common/rec-right.png`;
const obj2Params = (obj = {}, encode = false) => {
  const result = [];
  Object.keys(obj).forEach((key) =>
    result.push(`${key}=${encode ? encodeURIComponent(obj[key]) : obj[key]}`),
  );

  return result.join('&');
};

Page({
  data: {
    commentsList: [],
    commentsStatistics: {
      badCount: 0,
      commentCount: 0,
      goodCount: 0,
      goodRate: 0,
      hasImageCount: 0,
      middleCount: 0,
    },
    isShowPromotionPop: false,
    activityList: [],
    recLeftImg,
    recRightImg,
    details: {},
    goodsTabArray: [{
        name: '商品',
        value: '', // 空字符串代表置顶
      },
      {
        name: '详情',
        value: 'goods-page',
      },
    ],
    storeLogo: `${imgPrefix}common/store-logo.png`,
    storeName: '',
    jumpArray: [{
        title: '首页',
        url: '/pages/home/home',
        iconName: 'home',
        customIcon: true,
        iconImage: ''
      },
      {
        title: '购物车',
        url: '/pages/cart/index',
        iconName: 'cart',
        showCartNum: true,
        customIcon: true,
        iconImage: ''
      },
    ],

    isStock: true,
    cartNum: 0,
    soldout: false,
    buttonType: 1,
    buyNum: 1,
    selectedAttrStr: '',
    skuArray: [],
    primaryImage: '',
    specImg: '',
    isSpuSelectPopupShow: false,
    isAllSelectedSku: false,
    buyType: 0,
    outOperateStatus: false, // 是否外层加入购物车
    operateType: 0,
    selectSkuSellsPrice: 0,
    maxLinePrice: 0,
    minSalePrice: 0,
    maxSalePrice: 0,
    list: [],
    goodId: '', // 替换good_id为goodId
    navigation: {
      type: 'fraction'
    },
    current: 0,
    autoplay: true,
    duration: 500,
    interval: 5000,
    soldNum: 0, // 已售数量
  },

  handlePopupHide() {
    this.setData({
      isSpuSelectPopupShow: false,
    });
  },

  showSkuSelectPopup(type) {
    this.setData({
      buyType: type || 0,
      outOperateStatus: type >= 1,
      isSpuSelectPopupShow: true,
    });
  },

  buyItNow() {
    this.showSkuSelectPopup(1);
  },

  toAddCart() {
    this.showSkuSelectPopup(2);
  },

  toNav(e) {
    const {
      url
    } = e.detail;
    wx.switchTab({
      url: url,
    });
  },

  showCurImg(e) {
    const {
      index
    } = e.detail;
    const {
      images
    } = this.data.details;
    wx.previewImage({
      current: images[index],
      urls: images, // 需要预览的图片http链接列表
    });
  },

  onPageScroll({
    scrollTop
  }) {
    const goodsTab = this.selectComponent('#goodsTab');
    goodsTab && goodsTab.onScroll(scrollTop);
  },

  chooseSpecItem(e) {
    const {
      specList
    } = this.data.details;
    const {
      selectedSku,
      isAllSelectedSku
    } = e.detail;
    if (!isAllSelectedSku) {
      this.setData({
        selectSkuSellsPrice: 0,
      });
    }
    this.setData({
      isAllSelectedSku,
    });
    this.getSkuItem(specList, selectedSku);
  },

  getSkuItem(specList, selectedSku) {
    const {
      skuArray,
      primaryImage
    } = this.data;
    const selectedSkuValues = this.getSelectedSkuValues(specList, selectedSku);
    let selectedAttrStr = ` 件  `;
    selectedSkuValues.forEach((item) => {
      selectedAttrStr += `，${item.specValue}  `;
    });
    // eslint-disable-next-line array-callback-return
    const skuItem = skuArray.filter((item) => {
      let status = true;
      (item.specInfo || []).forEach((subItem) => {
        if (
          !selectedSku[subItem.specId] ||
          selectedSku[subItem.specId] !== subItem.specValueId
        ) {
          status = false;
        }
      });
      if (status) return item;
    });
    this.selectSpecsName(selectedSkuValues.length > 0 ? selectedAttrStr : '');
    if (skuItem) {
      this.setData({
        selectItem: skuItem,
        selectSkuSellsPrice: skuItem.price || 0,
      });
    } else {
      this.setData({
        selectItem: null,
        selectSkuSellsPrice: 0,
      });
    }
    this.setData({
      specImg: skuItem && skuItem.skuImage ? skuItem.skuImage : primaryImage,
    });
  },

  // 获取已选择的sku名称
  getSelectedSkuValues(skuTree, selectedSku) {
    const normalizedTree = this.normalizeSkuTree(skuTree);
    return Object.keys(selectedSku).reduce((selectedValues, skuKeyStr) => {
      const skuValues = normalizedTree[skuKeyStr];
      const skuValueId = selectedSku[skuKeyStr];
      if (skuValueId !== '') {
        const skuValue = skuValues.filter((value) => {
          return value.specValueId === skuValueId;
        })[0];
        skuValue && selectedValues.push(skuValue);
      }
      return selectedValues;
    }, []);
  },

  normalizeSkuTree(skuTree) {
    const normalizedTree = {};
    skuTree.forEach((treeItem) => {
      normalizedTree[treeItem.specId] = treeItem.specValueList;
    });
    return normalizedTree;
  },

  selectSpecsName(selectSpecsName) {
    if (selectSpecsName) {
      this.setData({
        selectedAttrStr: selectSpecsName,
      });
    } else {
      this.setData({
        selectedAttrStr: '',
      });
    }
  },

  addCart() {
    const {
      isAllSelectedSku,
      selectItem,
      buyNum,
      details
    } = this.data;
    if (!isAllSelectedSku) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择规格',
        icon: '',
        duration: 1000,
      });
      return;
    }

    // 获取用户信息
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    if (!userInfo || !userInfo.user_id) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请先登录',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    // 准备订单数据
    const orderData = {
      good_id: details.good_id || details.id, // 兼容不同的字段名
      farm_id: details.farm_id || 1,
      user_id: userInfo.user_id,
      user_address: userInfo.address || '',
      farm_address: details.farm_address || '',
      price: selectItem.price || details.minSalePrice || details.price || 0,
      units: selectItem.units || details.units || '个',
      count: buyNum,
      detail: details.detail || details.title || '',
      image_urls: details.image_urls || details.primaryImage || ''
    };

    console.log('[addCart] 准备添加商品订单:', orderData);
    console.log('[addCart] 商品详情数据:', details);
    console.log('[addCart] 选择的规格:', selectItem);
    console.log('[addCart] 用户信息:', userInfo);
    console.log('[addCart] addGoodOrder函数类型:', typeof addGoodOrder);
    console.log('[addCart] addGoodOrder函数内容:', addGoodOrder);

    // 检查addGoodOrder函数是否存在
    if (typeof addGoodOrder !== 'function') {
      console.error('[addCart] addGoodOrder不是函数:', addGoodOrder);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '系统错误：函数未正确加载',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    // 调用添加商品订单API
    addGoodOrder(orderData).then(res => {
      console.log('[addCart] API响应:', res);
      
      if (res.code === 200) {
        // 同时添加到本地购物车
        this.addToLocalCart(details, selectItem, buyNum);
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '加入购物车成功',
          icon: 'check-circle',
          duration: 1000,
        });

        // 更新购物车数量显示
        this.updateCartBadge();

        // 关闭规格选择弹窗
        this.handlePopupHide();
      } else {
        Toast({
          context: this,
          selector: '#t-toast',
          message: res.msg || '加入购物车失败',
          icon: 'close-circle',
          duration: 1000,
        });
      }
    }).catch(err => {
      console.error('[addCart] 加入购物车失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加入购物车失败',
        icon: 'close-circle',
        duration: 1000,
      });
    });
  },

  // 添加到本地购物车
  addToLocalCart(details, selectItem, buyNum) {
    // 准备添加到购物车的商品信息
    const goodsInfo = {
      good_id: details.good_id || details.id,
      skuId: selectItem.skuId || details.good_id || details.id,
      title: details.title,
      price: selectItem.price || details.minSalePrice || details.price || 0,
      originPrice: details.maxLinePrice || details.price || 0,
      primaryImage: details.primaryImage || details.image_urls,
      quantity: buyNum,
      stockQuantity: selectItem.quantity || details.repertory || 100,
      specInfo: selectItem.specInfo || []
    };

    // 调用本地购物车服务
    addToCart(goodsInfo).then(res => {
      if (res.code === 'Success') {
        console.log('[addToLocalCart] 本地购物车添加成功');
      } else {
        console.error('[addToLocalCart] 本地购物车添加失败:', res);
      }
    }).catch(err => {
      console.error('[addToLocalCart] 本地购物车添加失败:', err);
    });
  },

  gotoBuy(type) {
    const {
      isAllSelectedSku,
      buyNum
    } = this.data;
    if (!isAllSelectedSku) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择规格',
        icon: '',
        duration: 1000,
      });
      return;
    }
    this.handlePopupHide();
    const query = {
      quantity: buyNum,
      storeId: '1',
      good_id: this.data.goodId,
      goodsName: this.data.details.title,
      skuId: type === 1 ? this.data.skuList[0].skuId : this.data.selectItem.skuId,
      available: this.data.details.available,
      price: this.data.details.minSalePrice,
      specInfo: this.data.details.specList?.map((item) => ({
        specTitle: item.title,
        specValue: item.specValueList[0].specValue,
      })),
      primaryImage: this.data.details.primaryImage,
      good_id: this.data.details.good_id || this.data.details.good_id, // 优先使用good_id，兼容原有good_id
      thumb: this.data.details.primaryImage,
      title: this.data.details.title,
    };
    let urlQueryStr = obj2Params({
      goodsRequestList: JSON.stringify([query]),
    });
    urlQueryStr = urlQueryStr ? `?${urlQueryStr}` : '';
    const path = `/pages/order/order-confirm/index${urlQueryStr}`;
    wx.navigateTo({
      url: path,
    });
  },

  specsConfirm() {
    const {
      buyType
    } = this.data;
    if (buyType === 1) {
      this.gotoBuy();
    } else {
      this.addCart();
    }
  },

  changeNum(e) {
    const { buyNum } = e.detail;
    const { stockQuantity = 0 } = this.data;
    
    // 确保购买数量不超过库存
    const maxQuantity = Math.max(0, stockQuantity);
    const finalBuyNum = Math.min(buyNum, maxQuantity);
    
 
    
    this.setData({
      buyNum: finalBuyNum,
    });
  },

  closePromotionPopup() {
    this.setData({
      isShowPromotionPop: false,
    });
  },

  promotionChange(e) {
    const {
      index
    } = e.detail;
    wx.navigateTo({
      url: `/pages/promotion-detail/index?promotion_id=${index}`,
    });
  },

  showPromotionPopup() {
    this.setData({
      isShowPromotionPop: true,
    });
  },

  getDetail(goodId) {
    Promise.all([fetchGood(goodId), fetchActivityList()]).then((res) => {
      const [details, activityList] = res;
      
      // 检查是否成功获取到商品数据
      if (!details) {
        console.error('[getDetail] 未获取到商品数据，goodId:', goodId);
        wx.showToast({
          title: '商品不存在',
          icon: 'none'
        });
        return;
      }
      
      console.log('[getDetail] 获取到商品数据:', details);
      
      const skuArray = [];
      const {
        skuList,
        primaryImage,
        isPutOnSale,
        minSalePrice,
        maxSalePrice,
        maxLinePrice,
        soldNum,
        // 新数据格式的字段
        good_id,
        title,
        image_urls,
        price,
        units,
        repertory,
        detail,
        specList
      } = details;
      
      // 如果有原有的skuList，使用它；否则创建默认的sku
      if (skuList && skuList.length > 0) {
        skuList.forEach((item) => {
          skuArray.push({
            skuId: item.skuId,
            quantity: item.stockInfo ? item.stockInfo.stockQuantity : 0,
            specInfo: item.specInfo,
          });
        });
      } else {
        // 为新数据格式创建默认的sku
        const defaultSku = {
          skuId: good_id || goodId,
          quantity: repertory || 0,
          repertory: repertory || 0, // 添加 repertory 字段
          specInfo: specList ? specList.map(spec => ({
            specId: spec.specId,
            specValueId: spec.specValueList[0]?.specValueId || 'units_value',
            specValue: spec.specValueList[0]?.specValue || ''
          })) : []
        };
        
        skuArray.push(defaultSku);
      }
      
      const promotionArray = [];
      // 添加安全检查，确保activityList是数组
      if (activityList && Array.isArray(activityList)) {
        activityList.forEach((item) => {
          promotionArray.push({
            tag: item.promotionSubCode === 'MYJ' ? '满减' : '满折',
            label: '满100元减99.9元',
          });
        });
      }
      
      // 基于 repertory 字段判断库存状态
      const stockQuantity = repertory || 0;
      const hasStock = stockQuantity > 0;
      const isSoldOut = stockQuantity <= 0;
      
      this.setData({
        details,
        activityList: activityList || [], // 确保activityList不为undefined
        isStock: hasStock,
        maxSalePrice: maxSalePrice ? parseInt(maxSalePrice) : (price ? parseInt(price) : 0),
        maxLinePrice: maxLinePrice ? parseInt(maxLinePrice) : (price ? parseInt(price) : 0),
        minSalePrice: minSalePrice ? parseInt(minSalePrice) : (price ? parseInt(price) : 0),
        list: promotionArray,
        skuArray: skuArray,
        primaryImage: primaryImage || (image_urls && image_urls.length > 0 ? image_urls[0] : ''),
        soldout: isSoldOut,
        soldNum: soldNum || 0,
        goodId: good_id || goodId, // 保存good_id
        // 添加库存数量信息
        stockQuantity: stockQuantity,
        maxPurchaseQuantity: stockQuantity
      });
    }).catch(error => {
      console.error('[getDetail] 获取商品详情失败:', error);
      wx.showToast({
        title: '获取商品详情失败',
        icon: 'none'
      });
    });
  },

  async getCommentsList() {
    try {
      const code = 'Success';
      const data = await getGoodsDetailsCommentList();
      const {
        homePageComments
      } = data;
      if (code.toUpperCase() === 'SUCCESS') {
        // 添加安全检查，确保homePageComments是数组
        const commentsList = Array.isArray(homePageComments) ? homePageComments.map((item) => {
          return {
            goodsSpu: item.good_id || item.good_id, // 优先使用good_id，兼容原有good_id
            userName: item.userName || '',
            commentScore: item.commentScore,
            commentContent: item.commentContent || '用户未填写评价',
            userHeadUrl: item.isAnonymity ?
              this.anonymityAvatar :
              item.userHeadUrl || this.anonymityAvatar,
          };
        }) : [];
        
        const nextState = {
          commentsList: commentsList,
        };
        this.setData(nextState);
      }
    } catch (error) {
      console.error('comments error:', error);
      // 设置默认的空评论列表
      this.setData({
        commentsList: []
      });
    }
  },

  onShareAppMessage() {
    // 自定义的返回信息
    const {
      selectedAttrStr
    } = this.data;
    let shareSubTitle = '';
    if (selectedAttrStr.indexOf('件') > -1) {
      const count = selectedAttrStr.indexOf('件');
      shareSubTitle = selectedAttrStr.slice(count + 1, selectedAttrStr.length);
    }
    const customInfo = {
      imageUrl: this.data.details.primaryImage,
      title: this.data.details.title + shareSubTitle,
      path: `/pages/goods/details/index?goodId=${this.data.goodId}`,
    };
    return customInfo;
  },

  /** 获取评价统计 */
  async getCommentsStatistics() {
    try {
      const code = 'Success';
      const data = await getGoodsDetailsCommentsCount();
      if (code.toUpperCase() === 'SUCCESS' && data) {
        const {
          badCount,
          commentCount,
          goodCount,
          goodRate,
          hasImageCount,
          middleCount,
        } = data;
        const nextState = {
          commentsStatistics: {
            badCount: parseInt(`${badCount || 0}`),
            commentCount: parseInt(`${commentCount || 0}`),
            goodCount: parseInt(`${goodCount || 0}`),
            /** 后端返回百分比后数据但没有限制位数 */
            goodRate: Math.floor((goodRate || 0) * 10) / 10,
            hasImageCount: parseInt(`${hasImageCount || 0}`),
            middleCount: parseInt(`${middleCount || 0}`),
          },
        };
        this.setData(nextState);
      }
    } catch (error) {
      console.error('comments statistics error:', error);
      // 设置默认的评论统计
      this.setData({
        commentsStatistics: {
          badCount: 0,
          commentCount: 0,
          goodCount: 0,
          goodRate: 0,
          hasImageCount: 0,
          middleCount: 0,
        }
      });
    }
  },

  /** 跳转到评价列表 */
  navToCommentsListPage() {
    wx.navigateTo({
      url: `/pages/goods/comments/index?goodId=${this.data.goodId}`,
    });
  },

  onLoad(query) {
    const {
      goodId
    } = query;
    
    // 确保goodId是数字类型
    const goodIdNum = parseInt(goodId, 10);

    this.setData({
      goodId: goodIdNum,
    });
    this.getDetail(goodIdNum);
    this.getCommentsList(); // 移除参数
    this.getCommentsStatistics(); // 移除参数

    // 加载云存储图片链接
    this.loadCustomIcons();

    // 等组件渲染完成后再获取购物车数量和设置监听
    wx.nextTick(() => {
      // 更新购物车数量
      this.updateCartBadge();
      
      // 监听购物车更新事件
      if (wx.eventCenter && typeof wx.eventCenter.on === 'function') {
        this.cartUpdateListener = (data) => {
          this.setData({ cartNum: data.count });
          // 更新buy-bar组件的购物车数量
          const buyBar = this.selectComponent('.goods-details-card');
          if (buyBar) {
            buyBar.setData({ shopCartNum: data.count });
          }
        };
        wx.eventCenter.on('cartUpdate', this.cartUpdateListener);
      }
    });
  },

  onUnload() {
    // 页面卸载时，取消事件监听
    if (wx.eventCenter && typeof wx.eventCenter.off === 'function' && this.cartUpdateListener) {
      wx.eventCenter.off('cartUpdate', this.cartUpdateListener);
    }
  },

  async loadCustomIcons() {
    try {
      // 获取首页图标链接
      const homeIconUrl = await genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/toBar/TdesignHome.png');
      // 获取购物车图标链接
      const cartIconUrl = await genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/toBar/TdesignCart.png');

      // 更新 jumpArray 中的图标链接
      const jumpArray = this.data.jumpArray;
      jumpArray[0].iconImage = homeIconUrl;
      jumpArray[1].iconImage = cartIconUrl;

      this.setData({
        jumpArray
      });
    } catch (error) {
      console.error('加载自定义图标失败:', error);
    }
  },

  updateCartBadge() {
    // 获取购物车数量并更新显示
    const cartNum = getCartCount();
    
    // 更新页面上的购物车数量
    this.setData({
      cartNum 
    });
    
    // 确保购物车数量正确设置到buy-bar组件
    const buyBar = this.selectComponent('.goods-details-card');
    if (buyBar) {
      buyBar.setData({
        shopCartNum: cartNum
      });
    }
  },
});