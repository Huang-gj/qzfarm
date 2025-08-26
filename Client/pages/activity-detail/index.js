const { getActivityDetail } = require('../../services/activity/activityApi');

Page({
  data: {
    loading: true,
    activity: null,
    error: null,
    imageList: [], // 用于图片预览
  },

  onLoad(options) {
    console.log('[activity-detail] 页面加载，参数:', options);
    
    const activityId = parseInt(options.activity_id);
    if (activityId && activityId > 0) {
      this.loadActivityDetail(activityId);
    } else {
      this.setData({
        loading: false,
        error: '无效的活动ID'
      });
    }
  },

  onShow() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '活动详情'
    });
  },

  // 加载活动详情
  loadActivityDetail(activityId) {
    console.log('[loadActivityDetail] 开始加载活动详情，activityId:', activityId);
    
    this.setData({ loading: true, error: null });

    getActivityDetail(activityId).then(response => {
      console.log('[loadActivityDetail] 获取活动详情成功:', response);
      
      if (response.success && response.data) {
        const activity = response.data;
        
        // 处理图片列表，用于预览
        let imageList = [];
        if (activity.main_pic) {
          imageList.push(activity.main_pic);
        }
        
        // 确保image_urls是数组格式
        if (activity.image_urls) {
          if (typeof activity.image_urls === 'string') {
            try {
              activity.image_urls = JSON.parse(activity.image_urls);
            } catch (e) {
              console.warn('[loadActivityDetail] 解析image_urls失败:', e);
              activity.image_urls = [];
            }
          }
          
          if (Array.isArray(activity.image_urls)) {
            imageList = imageList.concat(activity.image_urls);
          }
        }
        
        this.setData({
          loading: false,
          activity: activity,
          imageList: imageList
        });
        
        // 更新页面标题为活动标题
        if (activity.title) {
          wx.setNavigationBarTitle({
            title: activity.title
          });
        }
      } else {
        throw new Error('获取活动详情失败');
      }
    }).catch(error => {
      console.error('[loadActivityDetail] 获取活动详情失败:', error);
      this.setData({
        loading: false,
        error: error.message || '获取活动详情失败'
      });
      
      wx.showToast({
        title: '加载失败',
        icon: 'none',
        duration: 2000
      });
    });
  },

  // 重试加载
  onRetry() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    
    const activityId = parseInt(options.activity_id);
    if (activityId && activityId > 0) {
      this.loadActivityDetail(activityId);
    }
  },

  // 预览图片
  onImageTap(e) {
    const { current } = e.currentTarget.dataset;
    const { imageList } = this.data;
    
    if (imageList && imageList.length > 0) {
      wx.previewImage({
        current: current || imageList[0],
        urls: imageList
      });
    }
  },


});