const { getMyFarmAttention } = require('../../../services/usercenter/myAttention');

Page({
  data: {
    farmList: [],
    loading: true
  },

  onLoad() {
    console.log('[my-attention] 页面加载');
    this.loadMyAttention();
  },

  onShow() {
    console.log('[my-attention] 页面显示');
    // 每次显示页面时重新加载数据，以防用户在其他页面取消了关注
    this.loadMyAttention();
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('[my-attention] 下拉刷新');
    this.loadMyAttention(true);
  },

  // 加载我的关注列表
  async loadMyAttention(isRefresh = false) {
    try {
      if (!isRefresh) {
        this.setData({
          loading: true
        });
      }

      // 获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo || !userInfo.user_id) {
        console.error('[my-attention] 用户未登录');
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        
        // 跳转到登录页
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }, 1500);
        return;
      }

      const userId = userInfo.user_id;
      console.log('[my-attention] 获取关注列表，用户ID:', userId);

      const result = await getMyFarmAttention(userId);
      console.log('[my-attention] 获取关注列表结果:', result);

      if (result.success) {
        // 处理农场数据
        const processedFarmList = result.data.map(farm => ({
          farm_id: farm.farm_id,
          farm_name: farm.farm_name,
          description: farm.description || '',
          address: farm.address || '',
          logo_url: farm.logo_url || '',
          image_urls: farm.image_urls || [],
          contact_phone: farm.contact_phone || '',
          status: farm.status || 0
        }));

        this.setData({
          farmList: processedFarmList,
          loading: false
        });

        console.log('[my-attention] 关注列表加载成功，农场数量:', processedFarmList.length);

        if (isRefresh) {
          wx.showToast({
            title: '刷新成功',
            icon: 'success',
            duration: 1500
          });
        }
      } else {
        console.error('[my-attention] 获取关注列表失败:', result.message);
        
        this.setData({
          farmList: [],
          loading: false
        });

        wx.showToast({
          title: result.message || '获取失败',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('[my-attention] 加载关注列表异常:', error);
      
      this.setData({
        farmList: [],
        loading: false
      });

      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      if (isRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  // 点击农场项目
  onClickFarm(e) {
    const { farm } = e.currentTarget.dataset;
    console.log('[my-attention] 点击农场:', farm);

    if (!farm || !farm.farm_id) {
      wx.showToast({
        title: '农场信息错误',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const farmId = farm.farm_id;
    const url = `/pages/farm/details/index?farmId=${farmId}`;
    
    console.log('[my-attention] 跳转到农场详情');
    console.log('[my-attention] 农场名称:', farm.farm_name);
    console.log('[my-attention] 农场ID:', farmId);
    console.log('[my-attention] 完整URL:', url);

    wx.navigateTo({
      url: url,
      success: (result) => {
        console.log('[my-attention] 农场详情跳转成功:', result);
      },
      fail: (error) => {
        console.error('[my-attention] 农场详情跳转失败:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});