import { updateUserInfo } from '../../../services/usercenter/updateUserInfo';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    nameValue: '',
    originalUserInfo: null,
  },
  onLoad(options) {
    const { name } = options;
    this.setData({
      nameValue: name,
    });
    
    // 获取原始用户信息
    const app = getApp();
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        originalUserInfo: userInfo,
      });
    }
  },
  async onSubmit() {
    const { nameValue, originalUserInfo } = this.data;
    
    if (!nameValue.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '昵称不能为空',
        theme: 'error',
      });
      return;
    }
    
    if (!originalUserInfo) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '用户信息获取失败',
        theme: 'error',
      });
      return;
    }
    
    try {
      console.log('[name-edit] 开始更新昵称:', nameValue);
      
      const updateData = {
        user_id: originalUserInfo.user_id,
        phone_number: originalUserInfo.phone_number || '',
        avatar: originalUserInfo.avatar || '',
        nickname: nameValue.trim(),
        address: originalUserInfo.address || '',
        gender: originalUserInfo.gender || 0,
      };
      
      console.log('[name-edit] 准备更新的数据:', updateData);
      console.log('[name-edit] 原始用户信息:', originalUserInfo);
      
      const result = await updateUserInfo(updateData);
      
      if (result.code === 200) {
        console.log('[name-edit] 昵称更新成功');
        
        // 更新全局用户信息
        const app = getApp();
        const updatedUserInfo = {
          ...originalUserInfo,
          nickname: nameValue.trim(),
        };
        
        app.globalData.userInfo = updatedUserInfo;
        wx.setStorageSync('userInfo', updatedUserInfo);
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '昵称更新成功',
          theme: 'success',
        });
        
        // 返回上一页并刷新
        wx.navigateBack({ 
          backRefresh: true 
        });
      } else {
        throw new Error(result.msg || '更新失败');
      }
    } catch (error) {
      console.error('[name-edit] 更新昵称失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.message || '更新昵称失败',
        theme: 'error',
      });
    }
  },
  clearContent() {
    this.setData({
      nameValue: '',
    });
  },
});
