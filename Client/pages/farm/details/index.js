const { getFarmDetail } = require('../../../services/farm/farmDetail');
const { getFarmGoods } = require('../../../services/farm/farmGoods');
const { getFarmLands } = require('../../../services/farm/farmLands');
const { addFarmAttention, delFarmAttention, checkFarmAttention, saveAttentionStatus } = require('../../../services/farm/farmAttention');

Page({
  data: {
    farmInfo: null,
    loading: true,
    isSuspended: false, // 是否暂停营业
    currentTab: 'info', // 当前选项卡: info, goods, land
    goodsList: [], // 农产品列表
    landList: [], // 土地租赁列表
    loadingProducts: false, // 商品加载状态
    isFollowed: false, // 是否已关注
    followLoading: false // 关注按钮加载状态
  },

  onLoad(options) {
    console.log('[farm/details] 页面加载，参数:', options);
    console.log('[farm/details] 原始farmId:', options.farmId, '类型:', typeof options.farmId);
    
    // 确保farmId是数字类型
    const farmId = parseInt(options.farmId) || 1;
    console.log('[farm/details] 转换后的农场ID:', farmId, '类型:', typeof farmId);
    
    this.setData({
      farmId: farmId
    });
    
    this.loadFarmDetails(farmId);
  },

  async loadFarmDetails(farmId) {
    console.log('[farm/details] 开始加载农场详情，ID:', farmId);
    console.log('[farm/details] farmId类型:', typeof farmId);
    console.log('[farm/details] farmId值:', farmId);
    
    try {
      wx.showLoading({
        title: '加载中...',
      });

      console.log('[farm/details] 即将调用 getFarmDetail API...');
      const result = await getFarmDetail(farmId);
      console.log('[farm/details] API调用完成，结果:', result);
      
      if (result.success && result.data) {
        const farmData = result.data;
        
        // 检查营业状态
        const isSuspended = farmData.status === 1;
        console.log('[farm/details] 农场营业状态:', isSuspended ? '暂停营业' : '正常营业');
        
        this.setData({
          farmInfo: {
            farmId: farmData.farm_id,
            farmName: farmData.farm_name,
            description: farmData.description,
            address: farmData.address,
            logoUrl: farmData.logo_url,
            imageUrls: farmData.image_urls || [],
            contactPhone: farmData.contact_phone,
            status: farmData.status
          },
          isSuspended: isSuspended,
          loading: false
        });

        // 如果暂停营业，显示提示
        if (isSuspended) {
          wx.showToast({
            title: '该农场暂停营业',
            icon: 'none',
            duration: 2000
          });
        }

        // 加载关注状态
        this.loadAttentionStatus();
        
      } else {
        console.error('[farm/details] 获取农场详情失败:', result.message);
        
        // 使用模拟数据作为兜底
        console.log('[farm/details] 使用模拟数据作为兜底');
        this.setData({
          farmInfo: {
            farmId: farmId,
            farmName: `测试农场${farmId}`,
            description: `这是农场${farmId}的详细介绍。这是一个现代化的生态农场，致力于提供优质的农产品和土地租赁服务。`,
            address: '示例市示例区示例街道123号',
            logoUrl: 'https://via.placeholder.com/200x200?text=农场Logo',
            imageUrls: [
              'https://via.placeholder.com/400x300?text=农场图片1',
              'https://via.placeholder.com/400x300?text=农场图片2',
              'https://via.placeholder.com/400x300?text=农场图片3'
            ],
            contactPhone: '138-0000-0000',
            status: 0
          },
          isSuspended: false,
          loading: false
        });
        
        wx.showToast({
          title: '使用模拟数据展示',
          icon: 'none',
          duration: 2000
        });

        // 加载关注状态
        this.loadAttentionStatus();
      }
    } catch (error) {
      console.error('[farm/details] 加载农场详情异常:', error);
      console.error('[farm/details] 错误详情:', error.message);
      
      // 异常情况也使用模拟数据
      console.log('[farm/details] 异常情况，使用模拟数据');
      this.setData({
        farmInfo: {
          farmId: farmId,
          farmName: `示例农场${farmId}`,
          description: `这是农场${farmId}的详细介绍。由于网络问题，当前显示模拟数据。`,
          address: '示例市示例区示例街道456号',
          logoUrl: 'https://via.placeholder.com/200x200?text=农场Logo',
          imageUrls: [
            'https://via.placeholder.com/400x300?text=农场环境1',
            'https://via.placeholder.com/400x300?text=农场环境2'
          ],
          contactPhone: '139-0000-0000',
          status: 0
        },
        isSuspended: false,
        loading: false
      });
      
      wx.showToast({
        title: '网络异常，显示模拟数据',
        icon: 'none',
        duration: 2000
      });

      // 加载关注状态
      this.loadAttentionStatus();
    } finally {
      wx.hideLoading();
    }
  },

  // 切换选项卡
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    console.log('[farm/details] 切换选项卡:', tab);
    
    this.setData({
      currentTab: tab
    });

    // 根据选项卡加载对应数据
    if (tab === 'goods') {
      this.loadFarmGoods();
    } else if (tab === 'land') {
      this.loadFarmLands();
    }
  },

  // 加载农场农产品
  async loadFarmGoods() {
    console.log('[farm/details] 加载农场农产品');
    console.log('[farm/details] 当前农场ID:', this.data.farmId);
    
    this.setData({
      loadingProducts: true
    });

    try {
      // 调用农场农产品接口
      const farmId = this.data.farmId;
      const result = await getFarmGoods(farmId);
      
      console.log('[farm/details] 获取农场农产品结果:', result);
      
      if (result.success) {
        // 处理数据格式，转换为页面需要的格式
        const processedGoods = result.data.map(item => ({
          id: item.good_id,
          name: item.title,
          price: item.price,
          image: item.thumb,
          description: item.detail || `${item.title} - ${item.units}`,
          units: item.units,
          repertory: item.repertory,
          isSoldOut: item.soldout,
          good_id: item.good_id
        }));
        
        this.setData({
          goodsList: processedGoods,
          loadingProducts: false
        });
        
        console.log('[farm/details] 农场农产品加载成功，商品数量:', processedGoods.length);
      } else {
        // API调用失败，使用模拟数据
        console.warn('[farm/details] API调用失败，使用模拟数据:', result.message);
        this.setData({
          goodsList: [
            {
              id: 1,
              name: '有机苹果',
              price: 15.8,
              image: 'https://via.placeholder.com/200x200?text=有机苹果',
              description: '新鲜有机苹果，口感香甜',
              good_id: 1
            },
            {
              id: 2,
              name: '土鸡蛋',
              price: 2.5,
              image: 'https://via.placeholder.com/200x200?text=土鸡蛋',
              description: '农场散养土鸡蛋，营养丰富',
              good_id: 2
            }
          ],
          loadingProducts: false
        });
        
        wx.showToast({
          title: result.message || '使用模拟数据展示',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('[farm/details] 加载农场农产品失败:', error);
      
      // 使用模拟数据作为兜底
      this.setData({
        goodsList: [
          {
            id: 1,
            name: '有机苹果',
            price: 15.8,
            image: 'https://via.placeholder.com/200x200?text=有机苹果',
            description: '新鲜有机苹果，口感香甜',
            good_id: 1
          },
          {
            id: 2,
            name: '土鸡蛋',
            price: 2.5,
            image: 'https://via.placeholder.com/200x200?text=土鸡蛋',
            description: '农场散养土鸡蛋，营养丰富',
            good_id: 2
          }
        ],
        loadingProducts: false
      });
      
      wx.showToast({
        title: '网络异常，使用模拟数据',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 加载农场土地租赁
  async loadFarmLands() {
    console.log('[farm/details] 加载农场土地租赁');
    console.log('[farm/details] 当前农场ID:', this.data.farmId);
    
    this.setData({
      loadingProducts: true
    });

    try {
      // 调用农场土地接口
      const farmId = this.data.farmId;
      const result = await getFarmLands(farmId);
      
      console.log('[farm/details] 获取农场土地结果:', result);
      
      if (result.success) {
        // 处理数据格式，转换为页面需要的格式
        const processedLands = result.data.map(item => ({
          id: item.land_id,
          name: item.land_name || item.title,
          price: item.price,
          unit: '月',
          image: item.thumb,
          description: item.detail || `${item.land_name} - ${item.area}`,
          area: item.area,
          isRented: item.soldout,
          land_id: item.land_id
        }));
        
        this.setData({
          landList: processedLands,
          loadingProducts: false
        });
        
        console.log('[farm/details] 农场土地加载成功，土地数量:', processedLands.length);
      } else {
        // API调用失败，使用模拟数据
        console.warn('[farm/details] API调用失败，使用模拟数据:', result.message);
        this.setData({
          landList: [
            {
              id: 1,
              name: '有机菜园',
              price: 500,
              unit: '月',
              image: 'https://via.placeholder.com/200x200?text=有机菜园',
              description: '10平米有机菜园，可种植蔬菜',
              land_id: 1
            },
            {
              id: 2,
              name: '果树认养',
              price: 200,
              unit: '年',
              image: 'https://via.placeholder.com/200x200?text=果树认养',
              description: '苹果树认养，享受全年收成',
              land_id: 2
            }
          ],
          loadingProducts: false
        });
        
        wx.showToast({
          title: result.message || '使用模拟数据展示',
          icon: 'none',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('[farm/details] 加载农场土地失败:', error);
      
      // 使用模拟数据作为兜底
      this.setData({
        landList: [
          {
            id: 1,
            name: '有机菜园',
            price: 500,
            unit: '月',
            image: 'https://via.placeholder.com/200x200?text=有机菜园',
            description: '10平米有机菜园，可种植蔬菜',
            land_id: 1
          },
          {
            id: 2,
            name: '果树认养',
            price: 200,
            unit: '年',
            image: 'https://via.placeholder.com/200x200?text=果树认养',
            description: '苹果树认养，享受全年收成',
            land_id: 2
          }
        ],
        loadingProducts: false
      });
      
      wx.showToast({
        title: '网络异常，使用模拟数据',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 点击商品
  onClickProduct(e) {
    const { type, item } = e.currentTarget.dataset;
    console.log('[farm/details] 点击商品:', type, item);

    if (type === 'goods') {
      // 使用 good_id 作为商品详情页面的参数
      const goodId = item.good_id || item.id;
      console.log('[farm/details] 跳转到商品详情，goodId:', goodId);
      wx.navigateTo({
        url: `/pages/goods/details/index?goodId=${goodId}`
      });
    } else if (type === 'land') {
      // 使用 land_id 作为土地详情页面的参数
      const landId = item.land_id || item.id;
      console.log('[farm/details] 跳转到土地详情，landId:', landId);
      wx.navigateTo({
        url: `/pages/land/details/index?landId=${landId}`
      });
    }
  },

  // 图片预览
  onPreviewImage(e) {
    const { current, urls } = e.currentTarget.dataset;
    wx.previewImage({
      current: current,
      urls: urls
    });
  },

  // 加载关注状态
  async loadAttentionStatus() {
    try {
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo || !userInfo.user_id) {
        console.log('[farm/details] 未登录，无法获取关注状态');
        return;
      }

      const userId = userInfo.user_id;
      const farmId = this.data.farmId;
      
      console.log('[farm/details] 检查关注状态，用户ID:', userId, '农场ID:', farmId);
      
      const result = await checkFarmAttention(userId, farmId);
      if (result.success) {
        this.setData({
          isFollowed: result.data.isFollowed
        });
        console.log('[farm/details] 关注状态加载成功:', result.data.isFollowed);
      }
    } catch (error) {
      console.error('[farm/details] 加载关注状态失败:', error);
    }
  },

  // 关注按钮点击
  async onFollowClick() {
    console.log('[farm/details] 关注按钮被点击');
    
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.user_id) {
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

    // 防止重复点击
    if (this.data.followLoading) {
      return;
    }

    const userId = userInfo.user_id;
    const farmId = this.data.farmId;
    const isFollowed = this.data.isFollowed;
    
    console.log('[farm/details] 执行关注操作，当前状态:', isFollowed ? '已关注' : '未关注');
    
    this.setData({
      followLoading: true
    });

    try {
      let result;
      if (isFollowed) {
        // 取消关注
        result = await delFarmAttention(userId, farmId);
      } else {
        // 添加关注
        result = await addFarmAttention(userId, farmId);
      }

      if (result.success) {
        const newFollowStatus = !isFollowed;
        
        // 更新UI状态
        this.setData({
          isFollowed: newFollowStatus
        });
        
        // 保存到本地存储
        saveAttentionStatus(userId, farmId, newFollowStatus);
        
        // 显示成功提示
        wx.showToast({
          title: result.message || (newFollowStatus ? '关注成功' : '取消关注成功'),
          icon: 'success',
          duration: 1500
        });
        
        console.log('[farm/details] 关注操作成功，新状态:', newFollowStatus);
      } else {
        // 显示错误提示
        wx.showToast({
          title: result.message || '操作失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        console.error('[farm/details] 关注操作失败:', result.message);
      }
    } catch (error) {
      console.error('[farm/details] 关注操作异常:', error);
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({
        followLoading: false
      });
    }
  },

  onShow() {
    console.log('[farm/details] 页面显示');
  }
});