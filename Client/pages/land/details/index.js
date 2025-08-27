import Toast from 'tdesign-miniprogram/toast/index';
import {
  fetchLand
} from '../../../services/land/fetchLand';
import {
  fetchActivityList
} from '../../../services/activity/fetchActivityList';
import {
  addLandToCart,
  updateCartNum,
  getCartCount
} from '../../../services/cart/cart';
// import {
//   addLandOrder
// } from '../../../services/order/addLandOrder';
// import {
//   getLandDetailsCommentList,
//   getLandDetailsCommentsCount,
// } from '../../../services/land/fetchLandDetails';
import {
  genPicURL,
  processImageUrls
} from '../../../utils/genURL';

import {
  cdnBase
} from '../../../config/index';

// 使用require方式导入
const { addLandOrder } = require('../../../services/order/addLandOrder');

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
    comments: [],
    displayComments: [],
    showAllComments: false,
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

    // 注释掉后端API调用，只保留本地购物车功能
    console.log('[addCart] 加入购物车 - 仅添加到本地购物车，不调用后端API');
    
    try {
      // 只添加到本地购物车
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

    // 注释掉的后端API调用代码
    /*
    // 准备土地订单数据
    const orderData = {
      land_id: details.land_id || details.id,
      farm_id: details.farm_id || 1,
      user_id: userInfo.user_id,
      farm_address: details.farm_address || '',
      price: selectItem.price || details.minSalePrice || details.price || 0,
      count: buyNum,
      detail: details.detail || details.title || '',
      image_urls: details.image_urls || details.primaryImage || ''
    };

    console.log('[addCart] 准备添加土地订单:', orderData);

    // 调用添加土地订单API
    addLandOrder(orderData).then(res => {
      console.log('[addCart] API响应:', res);
      
      if (res.code === 200) {
        console.log('[addCart] API调用成功，开始添加到本地购物车');
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
        console.error('[addCart] API调用失败:', res);
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
    */
  },

  // 添加到本地购物车
  addToLocalCart(details, selectItem, buyNum) {
    console.log('[addToLocalCart] 开始添加土地到本地购物车');
    console.log('[addToLocalCart] details:', details);
    console.log('[addToLocalCart] selectItem:', selectItem);
    console.log('[addToLocalCart] buyNum:', buyNum);
    
    // 准备添加到购物车的土地信息
    const goodsInfo = {
      good_id: details.land_id, // 直接使用land_id，不使用fallback
      skuId: selectItem.skuId || details.land_id || details.id,
      title: details.land_name || details.title || `土地${details.land_id || details.id}`, // 优先使用land_name
      price: selectItem.price || details.minSalePrice || details.price || 0,
      originPrice: details.maxLinePrice || details.price || 0,
      primaryImage: details.primaryImage || details.image_urls || '',
      thumb: details.primaryImage || details.image_urls || '', // 添加thumb字段
      quantity: 1, // 土地商品数量固定为1
      stockQuantity: 1, // 土地库存设为1，限制最大购买数量
      specInfo: selectItem.specInfo || [{
        specTitle: '租赁时长',
        specValue: '1个月'
      }],
      // 添加缺失的关键字段
      farm_id: details.farm_id,
      farm_address: details.farm_address || '',
      units: details.units || '个月',
      detail: details.detail || details.land_name || details.title || ''
    };

    console.log('[addToLocalCart] 准备添加到购物车的土地信息:', goodsInfo);
    console.log('[addToLocalCart] details.land_id:', details.land_id);
    console.log('[addToLocalCart] details.id:', details.id);

    // 调用本地购物车服务
    addLandToCart(goodsInfo).then(res => {
      console.log('[addToLocalCart] 购物车服务响应:', res);
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
      good_id: this.data.details.land_id, // 直接使用land_id
      goodsName: this.data.details.title,
      skuId: type === 1 ? this.data.skuList[0].skuId : this.data.selectItem.skuId,
      available: this.data.details.available,
      price: this.data.details.minSalePrice,
      specInfo: this.data.details.specList?.map((item) => ({
        specTitle: item.title,
        specValue: item.specValueList[0].specValue,
      })),
      primaryImage: this.data.details.primaryImage,
      good_id: this.data.details.land_id, // 直接使用land_id
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
      console.log('[specsConfirm] 立即购买 - 调用后端API创建土地订单');
      
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

      // 准备土地订单数据
      const orderData = {
        land_id: details.land_id || details.id,
        farm_id: details.farm_id || 1,
        user_id: userInfo.user_id,
        farm_address: details.farm_address || '',
        price: selectItem.price || details.minSalePrice || details.price || 0,
        count: buyNum,
        detail: details.detail || details.title || '',
        image_urls: details.image_urls || details.primaryImage || ''
      };

      console.log('[specsConfirm] 准备创建土地订单:', orderData);

      try {
        // 调用添加土地订单API
        const res = await addLandOrder(orderData);
        console.log('[specsConfirm] API响应:', res);
        
        if (res.code === 200) {
          // 保存订单ID到全局数据
          const app = getApp();
          app.globalData.currentOrderId = res.order_id;
          app.globalData.currentOrderType = 'land';
          console.log('[specsConfirm] 保存订单ID:', res.order_id);
          
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
        console.error('[specsConfirm] 创建土地订单失败:', error);
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
    
    // 土地购买量固定为1，因为土地不存在库存概念
    const finalBuyNum = 1;
    
    console.log('[changeNum] 土地购买量固定为1，原始buyNum:', buyNum, '最终buyNum:', finalBuyNum);
    
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

  getDetail(landId) {
    console.log('[getDetail] 开始获取土地详情, landId:', landId);
    
    Promise.all([fetchLand(landId), fetchActivityList()]).then((res) => {
      const [details, activityList] = res;
      
      console.log('[getDetail] 获取到的土地数据:', details);
      console.log('[getDetail] 获取到的活动数据:', activityList);
      
      // 检查是否成功获取到土地数据
      if (!details) {
        console.error('[getDetail] 未获取到土地数据，landId:', landId);
        wx.showToast({
          title: '土地不存在',
          icon: 'none'
        });
        return;
      }
      

      
      const skuArray = [];
      const {
        skuList,
        primaryImage,
        isPutOnSale,
        minSalePrice,
        maxSalePrice,
        maxLinePrice,
        soldNum,
        // 土地数据格式的字段
        land_id,
        land_name,
        title,
        images,
        image_urls, // 添加image_urls字段
        price,
        area,
        detail,
        specList,
        sale_status,
        spuTagList,
        desc
      } = details;
      
      // 处理图片URL数组，用于轮播显示
      const imageUrlsArray = processImageUrls(image_urls || images);
      const firstImageUrl = imageUrlsArray[0];
      
      console.log('[getDetail] 原始图片数据:', image_urls);
      console.log('[getDetail] 处理后的图片数组:', imageUrlsArray);
      
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
        // 为土地数据格式创建默认的sku
        const defaultSku = {
          skuId: land_id || landId,
          quantity: sale_status === 0 ? 1 : 0, // 0-出售中 1-已被租赁
          repertory: sale_status === 0 ? 1 : 0, // 添加 repertory 字段
          specInfo: specList ? specList.map(spec => ({
            specId: spec.specId,
            specValueId: spec.specValueList[0]?.specValueId || 'area_value',
            specValue: spec.specValueList[0]?.specValue || ''
          })) : []
        };
        
   
        skuArray.push(defaultSku);
      }
      
      const promotionArray = [];
      // 检查activityList是否为数组
      if (activityList && Array.isArray(activityList)) {
        activityList.forEach((item) => {
          promotionArray.push({
            tag: item.promotionSubCode === 'MYJ' ? '满减' : '满折',
            label: '满100元减99.9元',
          });
        });
      } else {
        console.log('[getDetail] activityList不是数组或为空:', activityList);
      }
      
      // 基于 sale_status 字段判断租赁状态
      const saleStatus = sale_status || 0;
      const hasStock = saleStatus === 0; // 0-出售中 1-已被租赁
      const isSoldOut = saleStatus === 1; // 已被租赁
      
     
      
      this.setData({
        details: {
          ...details,
          images: imageUrlsArray, // 用于轮播显示的图片数组
          desc: details.desc || [] // 确保desc数组存在
        },
        activityList,
        isStock: hasStock,
        maxSalePrice: maxSalePrice ? parseFloat(maxSalePrice) : (price ? parseFloat(price) : 0),
        maxLinePrice: maxLinePrice ? parseFloat(maxLinePrice) : (price ? parseFloat(price) : 0),
        minSalePrice: minSalePrice ? parseFloat(minSalePrice) : (price ? parseFloat(price) : 0),
        list: promotionArray,
        skuArray: skuArray,
        primaryImage: primaryImage || firstImageUrl,
        soldout: isSoldOut,
        soldNum: soldNum || 0,
        landId: land_id || landId, // 保存land_id
        // 添加租赁状态信息
        saleStatus: saleStatus,
        maxPurchaseQuantity: hasStock ? 1 : 0,
        // 轮播相关配置
        current: 0,
        autoplay: false,
        duration: 300,
        interval: 3000,
        navigation: { type: 'dots' }
      });
    }).catch(error => {
      console.error('[getDetail] 获取土地详情失败:', error);
      wx.showToast({
        title: '获取土地详情失败',
        icon: 'none'
      });
    });
  },

  async getCommentsList() {
    // 暂时注释掉评论功能，等后端接口完成后再启用
    this.setData({
      commentsList: []
    });
    // try {
    //   const commentsList = await getLandDetailsCommentList(this.data.landId);
    //   this.setData({
    //     commentsList: commentsList.map((item) => {
    //       return {
    //         landSpu: item.land_id || item.land_id, // 优先使用land_id，兼容原有land_id
    //         userName: item.user_name || '',
    //         commentScore: item.rating,
    //         commentContent: item.comment || '用户未填写评价',
    //         userHeadUrl: item.user_avatar || this.anonymityAvatar,
    //       };
    //     }),
    //   });
    // } catch (error) {
    //   console.error('comments error:', error);
    // }
  },

  onShareAppMessage() {
    // 自定义的返回信息
    const {
      selectedAttrStr
    } = this.data;
    let shareSubTitle = '';
    if (selectedAttrStr.indexOf('亩') > -1) {
      const count = selectedAttrStr.indexOf('亩');
      shareSubTitle = selectedAttrStr.slice(count + 1, selectedAttrStr.length);
    }
    const customInfo = {
      imageUrl: this.data.details.primaryImage,
      title: this.data.details.land_name + shareSubTitle,
      path: `/pages/land/details/index?landId=${this.data.landId}`,
    };
    return customInfo;
  },

  /** 获取评价统计 */
  async getCommentsStatistics() {
    // 暂时注释掉评论统计功能，等后端接口完成后再启用
    console.log('[getCommentsStatistics] 评论统计功能暂时禁用');
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
    // try {
    //   const commentCount = await getLandDetailsCommentsCount(this.data.landId);
    //   const commentsList = this.data.commentsList || [];
    //   
    //   // 计算评价统计
    //   const goodCount = commentsList.filter(item => item.commentScore >= 4).length;
    //   const middleCount = commentsList.filter(item => item.commentScore === 3).length;
    //   const badCount = commentsList.filter(item => item.commentScore <= 2).length;
    //   const goodRate = commentCount > 0 ? (goodCount / commentCount) * 100 : 0;
    //   const hasImageCount = commentsList.filter(item => item.images && item.images.length > 0).length;
    //   
    //   const nextState = {
    //     commentsStatistics: {
    //       badCount: badCount,
    //       commentCount: commentCount,
    //       goodCount: goodCount,
    //       goodRate: Math.floor(goodRate * 10) / 10,
    //       hasImageCount: hasImageCount,
    //       middleCount: middleCount,
    //     },
    //   };
    //   this.setData(nextState);
    // } catch (error) {
    //   console.error('comments statistics error:', error);
    // }
  },

  /** 跳转到评价列表 */
  navToCommentsListPage() {
    wx.navigateTo({
      url: `/pages/land/comments/index?landId=${this.data.landId}`,
    });
  },

  onLoad(query) {
    console.log('[onLoad] 土地详情页面接收到的参数:', query);
    const {
      landId
    } = query;
    
    console.log('[onLoad] 原始landId:', landId);
    
    // 验证参数
    if (!landId || landId === 'undefined' || landId === 'null') {
      console.error('[onLoad] landId参数无效:', landId);
      wx.showToast({
        title: '土地信息不完整',
        icon: 'none'
      });
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 确保landId是数字类型
    const landIdNum = parseInt(landId, 10);
    console.log('[onLoad] 转换后的landId:', landIdNum);
    
    // 验证转换后的数字是否有效
    if (isNaN(landIdNum) || landIdNum < 0) {
      console.error('[onLoad] landId转换失败或无效:', landIdNum);
      wx.showToast({
        title: '土地ID无效',
        icon: 'none'
      });
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    this.setData({
      landId: landIdNum,
      // 清理之前的评论数据，避免缓存问题
      comments: [],
      displayComments: [],
      showAllComments: false,
    });
    this.getDetail(landIdNum);
    // 确保在setData完成后再加载评论
    wx.nextTick(() => {
      console.log('[onLoad] 准备调用loadComments, 当前landId:', this.data.landId, 'landIdNum:', landIdNum);
      this.loadComments(landIdNum);
    });
    this.getCommentsStatistics(landIdNum);

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
      // 这些是固定的图标URL，直接使用而不需要转换
      const homeIconUrl = 'https://via.placeholder.com/48x48?text=首页';
      const cartIconUrl = 'https://via.placeholder.com/48x48?text=购物车';

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

  // 加载评论：初始2条（土地）
	async loadComments(landId) {
		const targetLandId = landId || this.data.landId;
		console.log('[land loadComments] 开始加载评论, 参数landId:', landId, 'this.data.landId:', this.data.landId, '最终使用:', targetLandId);
		try {
			const { getComment } = require('../../../services/comments/getComment');
			console.log('[land loadComments] 准备调用getComment, 参数:', { good_id: 0, land_id: targetLandId });
			const res = await getComment({ good_id: 0, land_id: targetLandId });
			console.log('[land loadComments] getComment响应:', res);
			const list = Array.isArray(res?.comments) ? res.comments : [];
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
			console.error('[land loadComments] error:', e);
			const msg = (e && e.message) || '';
			if (msg.indexOf('HTTP 401') !== -1 || msg.indexOf('401') !== -1) {
				wx.showToast({ title: '请登录后查看评论', icon: 'none' });
			} else {
				wx.showToast({ title: '加载评论失败', icon: 'none' });
			}
			this.setData({ comments: [], displayComments: [], showAllComments: false });
		}
	},
	onToggleAllComments() {
		const { showAllComments, comments } = this.data;
		const nextShowAll = !showAllComments;
		this.setData({
			showAllComments: nextShowAll,
			displayComments: nextShowAll ? comments : comments.slice(0, 2),
		});
	},
	async onToggleReplies(e) {
		const { id, index } = e.currentTarget.dataset;
		const list = this.data.showAllComments ? [...this.data.comments] : [...this.data.displayComments];
		const target = list[index];
		if (!target) return;
		if (target.showReplies) {
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
				console.error('[land onToggleReplies] error:', err);
			}
		}
		list[index] = target;
		if (this.data.showAllComments) {
			this.setData({ comments: list });
		} else {
			this.setData({ displayComments: list });
		}
	},
});