import Toast from 'tdesign-miniprogram/toast/index';
import {
  fetchGood
} from '../../../services/good/fetchGood';
import {
  fetchActivityList
} from '../../../services/activity/fetchActivityList';
import {
  addGoodsToCart as originalAddGoodsToCart,
  updateCartNum,
  getCartCount
} from '../../../services/cart/cart';

// 确保addGoodsToCart返回Promise
const addGoodsToCart = (goodsInfo) => {
  console.log('[goods/details] 调用addGoodsToCart，参数:', goodsInfo);
  console.log('[goods/details] originalAddGoodsToCart类型:', typeof originalAddGoodsToCart);
  
  if (typeof originalAddGoodsToCart === 'function') {
    const result = originalAddGoodsToCart(goodsInfo);
    console.log('[goods/details] originalAddGoodsToCart返回结果:', result);
    
    if (result && typeof result.then === 'function') {
      return result;
    } else {
      // 如果不是Promise，包装成Promise
      return Promise.resolve(result);
    }
  } else {
    console.error('[goods/details] originalAddGoodsToCart不是函数:', originalAddGoodsToCart);
    return Promise.reject(new Error('addGoodsToCart函数未正确加载'));
  }
};
// import {
//   addGoodOrder
// } from '../../../services/order/addGoodOrder';
// import {
//   getGoodDetailsCommentList,
//   getGoodDetailsCommentsCount,
// } from '../../../services/good/fetchGoodDetails';
import {
  genPicURL,
  processImageUrls,
  getFirstImageUrl
} from '../../../utils/genURL';

import {
  cdnBase
} from '../../../config/index';

// 使用require方式导入
const { addGoodOrder } = require('../../../services/order/addGoodOrder');

// 添加调试信息
console.log('[goods/details] addGoodOrder函数:', typeof addGoodOrder);
console.log('[goods/details] addGoodOrder函数内容:', addGoodOrder);
console.log('[goods/details] addGoodsToCart函数:', typeof addGoodsToCart);
console.log('[goods/details] addGoodsToCart函数内容:', addGoodsToCart);

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
    // 新增评论展示所需数据
    comments: [],
    displayComments: [],
    showAllComments: false,
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

  async addCart() {
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

    // 注释掉后端API调用，只保留本地购物车功能
    console.log('[addCart] 加入购物车 - 仅添加到本地购物车，不调用后端API');
    
    try {
      // 只添加到本地购物车
      await this.addToLocalCart(details, selectItem, buyNum);
      
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
    } catch (error) {
      console.error('[addCart] 添加到本地购物车失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加入购物车失败',
        icon: 'error',
        duration: 2000,
      });
    }
  },

  // 添加到本地购物车
  async addToLocalCart(details, selectItem, buyNum) {
    console.log('[addToLocalCart] 开始添加到本地购物车');
    console.log('[addToLocalCart] details.image_urls:', details.image_urls);
    
    // 转换图片URL
    let imageUrl = details.image_urls;
    console.log('[addToLocalCart] 原始image_urls类型:', typeof imageUrl);
    console.log('[addToLocalCart] 原始image_urls值:', imageUrl);
    
    // 处理图片URL：现在数据库存储的是完整URL，直接使用
    imageUrl = getFirstImageUrl(imageUrl);
    console.log('[addToLocalCart] 处理后的图片URL:', imageUrl);
    
    // 准备添加到购物车的商品信息
    const goodsInfo = {
      good_id: details.good_id, // 直接使用good_id
      skuId: details.good_id, // 直接使用good_id作为skuId
      title: details.title,
      price: selectItem.price || details.minSalePrice || details.price || 0,
      originPrice: details.maxLinePrice || details.price || 0,
      primaryImage: imageUrl, // 使用转换后的图片URL
      quantity: buyNum,
      stockQuantity: details.repertory || 100,
      specInfo: selectItem.specInfo || [],
      // 添加缺失的关键字段
      farm_id: details.farm_id,
      farm_address: details.farm_address || '',
      units: details.units || '个',
      detail: details.detail || details.title || '',
      thumb: imageUrl
    };

    console.log('[addToLocalCart] 准备添加到购物车的商品信息:', goodsInfo);
    console.log('[addToLocalCart] details.good_id:', details.good_id);
    console.log('[addToLocalCart] details.id:', details.id);

    // 调用本地购物车服务
    console.log('[addToLocalCart] addGoodsToCart函数类型:', typeof addGoodsToCart);
    console.log('[addToLocalCart] addGoodsToCart函数内容:', addGoodsToCart);
    
    try {
      addGoodsToCart(goodsInfo).then(res => {
        if (res.code === 'Success') {
          console.log('[addToLocalCart] 本地购物车添加成功');
        } else {
          console.error('[addToLocalCart] 本地购物车添加失败:', res);
        }
      }).catch(err => {
        console.error('[addToLocalCart] 本地购物车添加失败:', err);
      });
    } catch (error) {
      console.error('[addToLocalCart] 调用addGoodsToCart时出错:', error);
    }
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
      good_id: this.data.details.good_id, // 直接使用good_id
      goodsName: this.data.details.title,
      skuId: type === 1 ? this.data.skuList[0].skuId : this.data.selectItem.skuId,
      available: this.data.details.available,
      price: this.data.details.minSalePrice,
      specInfo: this.data.details.specList?.map((item) => ({
        specTitle: item.title,
        specValue: item.specValueList[0].specValue,
      })),
      primaryImage: this.data.details.primaryImage,
      good_id: this.data.details.good_id, // 直接使用good_id
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

  async specsConfirm() {
    const {
      buyType,
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

    if (buyType === 1) {
      // 立即购买 - 调用后端API创建订单
      console.log('[specsConfirm] 立即购买 - 调用后端API创建订单');
      
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
        good_id: details.good_id,
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

      console.log('[specsConfirm] 准备创建商品订单:', orderData);

      try {
        // 调用添加商品订单API
        const res = await addGoodOrder(orderData);
        console.log('[specsConfirm] API响应:', res);
        
        if (res.code === 200) {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '订单创建成功',
            icon: 'check-circle',
            duration: 1000,
          });

          // 关闭规格选择弹窗
          this.handlePopupHide();
          
          // 跳转到订单确认页面
          this.gotoBuy();
        } else {
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.msg || '订单创建失败',
            icon: 'close-circle',
            duration: 1000,
          });
        }
      } catch (error) {
        console.error('[specsConfirm] 创建订单失败:', error);
        Toast({
          context: this,
          selector: '#t-toast',
          message: '订单创建失败',
          icon: 'close-circle',
          duration: 1000,
        });
      }
    } else {
      // 加入购物车
      this.addCart();
    }
  },

  changeNum(e) {
    const { buyNum } = e.detail;
    const { stockQuantity = 0 } = this.data;
    
    console.log('[changeNum] 接收到数量变化事件:', e.detail);
    console.log('[changeNum] 当前stockQuantity:', stockQuantity);
    console.log('[changeNum] 请求的buyNum:', buyNum);
    
    // 确保购买数量不超过库存
    const maxQuantity = Math.max(0, stockQuantity);
    const finalBuyNum = Math.min(buyNum, maxQuantity);
    
    console.log('[changeNum] 计算后的maxQuantity:', maxQuantity);
    console.log('[changeNum] 最终buyNum:', finalBuyNum);
    
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
      console.log('[getDetail] details.good_id:', details.good_id);
      console.log('[getDetail] details.id:', details.id);
      console.log('[getDetail] 解构的good_id:', good_id);
      console.log('[getDetail] 原始goodId参数:', goodId);
      console.log('[getDetail] 完整的details对象:', JSON.stringify(details, null, 2));
      
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
          skuId: good_id, // 直接使用good_id
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
      
      console.log('[getDetail] 库存相关数据:', {
        repertory,
        stockQuantity,
        hasStock,
        isSoldOut
      });
      
      // 处理图片URL数组，用于轮播显示
      const imageUrlsArray = processImageUrls(image_urls);
      const firstImageUrl = imageUrlsArray[0];
      
      console.log('[getDetail] 原始图片数据:', image_urls);
      console.log('[getDetail] 处理后的图片数组:', imageUrlsArray);
      
      this.setData({
        details: {
          ...details,
          images: imageUrlsArray, // 用于轮播显示的图片数组
          image_urls: image_urls, // 保留原始数据
          desc: details.desc || [] // 确保desc数组存在
        },
        activityList: activityList || [], // 确保activityList不为undefined
        isStock: hasStock,
        maxSalePrice: maxSalePrice ? parseFloat(maxSalePrice) : (price ? parseFloat(price) : 0),
        maxLinePrice: maxLinePrice ? parseFloat(maxLinePrice) : (price ? parseFloat(price) : 0),
        minSalePrice: minSalePrice ? parseFloat(minSalePrice) : (price ? parseFloat(price) : 0),
        list: promotionArray,
        skuArray: skuArray,
        primaryImage: primaryImage || firstImageUrl,
        soldout: isSoldOut,
        soldNum: soldNum || 0,
        goodId: good_id, // 直接使用good_id
        good_id: good_id, // 直接使用good_id
        // 添加库存数量信息
        stockQuantity: stockQuantity,
        maxPurchaseQuantity: stockQuantity,
        // 轮播相关配置
        current: 0,
        autoplay: false,
        duration: 300,
        interval: 3000,
        navigation: { type: 'dots' }
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
            goodsSpu: item.good_id, // 直接使用good_id
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



  /** 跳转到评价列表 */
  navToCommentsListPage() {
    wx.navigateTo({
      url: `/pages/goods/comments/index?goodId=${this.data.goodId}`,
    });
  },

  onLoad(query) {
    console.log('[onLoad] 商品详情页面接收到的参数:', query);
    const {
      goodId
    } = query;
    
    console.log('[onLoad] 原始goodId:', goodId);
    
    // 验证参数
    if (!goodId || goodId === 'undefined' || goodId === 'null') {
      console.error('[onLoad] goodId参数无效:', goodId);
      wx.showToast({
        title: '商品信息不完整',
        icon: 'none'
      });
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 确保goodId是数字类型
    const goodIdNum = parseInt(goodId, 10);
    console.log('[onLoad] 转换后的goodId:', goodIdNum);
    
    // 验证转换后的数字是否有效
    if (isNaN(goodIdNum) || goodIdNum < 0) {
      console.error('[onLoad] goodId转换失败或无效:', goodIdNum);
      wx.showToast({
        title: '商品ID无效',
        icon: 'none'
      });
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    this.setData({
      goodId: goodIdNum,
      // 清理之前的评论数据，避免缓存问题
      comments: [],
      displayComments: [],
      showAllComments: false,
    });
    this.getDetail(goodIdNum);
    // 确保在setData完成后再加载评论
    wx.nextTick(() => {
      console.log('[onLoad] 准备调用loadComments, 当前goodId:', this.data.goodId, 'goodIdNum:', goodIdNum);
      this.loadComments(goodIdNum);
    });

    // 加载云存储图片链接
    this.loadCustomIcons();

    // 等组件渲染完成后再获取购物车数量和设置监听
    wx.nextTick(() => {
      // 更新购物车数量
      this.updateCartBadge();
      
      // 监听购物车更新事件（避免重复绑定）
      if (wx.eventCenter && typeof wx.eventCenter.on === 'function') {
        // 先移除之前的监听器
        if (this.cartUpdateListener) {
          wx.eventCenter.off('cartUpdate', this.cartUpdateListener);
        }
        
        this.cartUpdateListener = (data) => {
          console.log('[goods/details] 收到购物车更新事件:', data);
          this.setData({ cartNum: data.count });
          // 更新buy-bar组件的购物车数量
          const buyBar = this.selectComponent('.goods-details-card');
          if (buyBar) {
            buyBar.setData({ shopCartNum: data.count });
          }
        };
        wx.eventCenter.on('cartUpdate', this.cartUpdateListener);
        console.log('[goods/details] 购物车更新监听器已绑定');
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

  // 加载评论：初始2条
  async loadComments(goodId) {
    const targetGoodId = goodId || this.data.goodId;
    console.log('[loadComments] 开始加载评论, 参数goodId:', goodId, 'this.data.goodId:', this.data.goodId, '最终使用:', targetGoodId);
    try {
      const { getComment } = require('../../../services/comments/getComment');
      console.log('[loadComments] 准备调用getComment, 参数:', { good_id: targetGoodId, land_id: 0 });
      const res = await getComment({ good_id: targetGoodId, land_id: 0 });
      console.log('[loadComments] getComment响应:', res);
      // 返回结构：{ code, msg, comments }
      const list = Array.isArray(res?.comments) ? res.comments : [];
      // 规范字段名到小程序模板使用的驼峰/下划线保持后端
      const normalized = list.map((c) => ({
        id: c.id || c.ID,
        create_time: c.create_time,
        text: c.text || c.TEXT,
        comment_id: c.comment_id || c.CommentID,
        good_id: c.good_id || c.GoodID,
        land_id: c.land_id || c.LandID,
        user_id: c.user_id || c.UserID,
        avatar: c.avatar,
        nickname: c.nickname,
        comment_reply_num: c.comment_reply_num || c.CommentReplyNum,
        showReplies: false,
        replies: [],
      }));
      this.setData({
        comments: normalized,
        displayComments: normalized.slice(0, 2),
        showAllComments: false,
      });
    } catch (e) {
      console.error('[loadComments] error:', e);
      const msg = (e && e.message) || '';
      if (msg.indexOf('HTTP 401') !== -1 || msg.indexOf('401') !== -1) {
        wx.showToast({ title: '请登录后查看评论', icon: 'none' });
      } else {
        wx.showToast({ title: '加载评论失败', icon: 'none' });
      }
      this.setData({ comments: [], displayComments: [], showAllComments: false });
    }
  },
  // 展开/收起全部评论
  onToggleAllComments() {
    const { showAllComments, comments } = this.data;
    const nextShowAll = !showAllComments;
    this.setData({
      showAllComments: nextShowAll,
      displayComments: nextShowAll ? comments : comments.slice(0, 2),
    });
  },
  // 展开某条评论的回复
  async onToggleReplies(e) {
    const { id, index } = e.currentTarget.dataset;
    const list = this.data.showAllComments ? [...this.data.comments] : [...this.data.displayComments];
    const realIndex = index;
    const target = list[realIndex];
    if (!target) return;
    if (target.showReplies) {
      // 已展开则收起
      target.showReplies = false;
      target.replies = [];
    } else {
      try {
        const { getCommentReply } = require('../../../services/comments/getCommentReply');
        const res = await getCommentReply({ comment_id: id });
        const repliesRaw = Array.isArray(res?.comment_reply || res?.commentReplies) ? (res.comment_reply || res.commentReplies) : [];
        const replies = repliesRaw.map((r) => ({
          id: r.id || r.ID,
          create_time: r.create_time,
          comment_id: r.comment_id || r.CommentID,
          comment_reply_id: r.comment_reply_id || r.CommentReplyID,
          reply_to: r.reply_to || r.ReplyTo,
          text: r.text || r.TEXT,
          user_id: r.user_id || r.UserID,
          avatar: r.avatar,
          nickname: r.nickname,
        }));
        target.showReplies = true;
        target.replies = replies;
      } catch (err) {
        console.error('[onToggleReplies] error:', err);
      }
    }
    list[realIndex] = target;
    if (this.data.showAllComments) {
      this.setData({ comments: list });
    } else {
      this.setData({ displayComments: list });
    }
    },
});