import { fetchPerson } from '../../../services/usercenter/fetchPerson';
import { updateUserInfo } from '../../../services/usercenter/updateUserInfo';
import { phoneEncryption } from '../../../utils/util';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    personInfo: {
      avatarUrl: '',
      nickName: '',
      gender: '',
      phoneNumber: '',
    },
    originalUserInfo: null, // 保存原始用户信息用于比较
    showUnbindConfirm: false,
    pickerOptions: [
      {
        name: '男',
        code: '1',
      },
      {
        name: '女',
        code: '2',
      },
    ],
    typeVisible: false,
    genderMap: ['', '男', '女'],
  },
  onLoad() {
    this.init();
  },
  
  onShow() {
    // 页面显示时检查用户信息是否有更新
    this.checkUserInfoUpdate();
  },
  init() {
    console.log('[init] 开始初始化个人信息页面');
    // 从全局获取用户信息
    const app = getApp();
    console.log('[init] app:', app);
    console.log('[init] app.globalData:', app.globalData);
    console.log('[init] app.globalData.userInfo:', app.globalData.userInfo);
    
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    console.log('[init] 获取到的用户信息:', userInfo);
    
    if (userInfo) {
      console.log('[init] 设置用户信息到页面:', userInfo);
      const personInfo = {
        avatarUrl: userInfo.avatar || 'http://tmp/j7Lzt6rRFF03aee2ac14977047342291b43da5a4dfae.jpg',
        nickName: userInfo.nickname || '',
        gender: userInfo.gender || '',
        phoneNumber: userInfo.phone_number || '',
      };
      
      this.setData({
        personInfo,
        originalUserInfo: userInfo, // 保存原始用户信息
      });
    } else {
      console.log('[init] 没有用户信息');
    }
    
    this.fetchData();
  },
  fetchData() {
    fetchPerson().then((personInfo) => {
      this.setData({
        personInfo,
        'personInfo.phoneNumber': phoneEncryption(personInfo.phoneNumber),
      });
    });
  },
  onClickCell({ currentTarget }) {
    const { dataset } = currentTarget;
    const { nickName } = this.data.personInfo;

    switch (dataset.type) {
      case 'gender':
        this.setData({
          typeVisible: true,
        });
        break;
      case 'name':
        wx.navigateTo({
          url: `/pages/usercenter/name-edit/index?name=${nickName}`,
        });
        break;
      case 'avatarUrl':
        this.toModifyAvatar();
        break;
      default: {
        break;
      }
    }
  },
  onClose() {
    this.setData({
      typeVisible: false,
    });
  },
  onConfirm(e) {
    const { value } = e.detail;
    this.setData(
      {
        typeVisible: false,
        'personInfo.gender': value,
      },
      () => {
        // 更新用户信息
        this.updateUserInfoToServer();
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '设置成功',
          theme: 'success',
        });
      },
    );
  },
  async toModifyAvatar() {
    try {
      const tempFilePath = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            const { path, size } = res.tempFiles[0];
            if (size <= 10485760) {
              resolve(path);
            } else {
              reject({ errMsg: '图片大小超出限制，请重新上传' });
            }
          },
          fail: (err) => reject(err),
        });
      });
      
      console.log('[toModifyAvatar] 选择的图片路径:', tempFilePath);
      
      // 直接使用updateUserInfo更新头像
      const { originalUserInfo } = this.data;
      if (!originalUserInfo) {
        throw new Error('用户信息获取失败');
      }
      
      const updateData = {
        user_id: originalUserInfo.user_id,
        phone_number: originalUserInfo.phone_number || '',
        avatar: tempFilePath, // 使用临时文件路径
        nickname: originalUserInfo.nickname || '',
        address: originalUserInfo.address || '',
        gender: originalUserInfo.gender || 0,
      };
      
      console.log('[toModifyAvatar] 准备更新头像数据:', updateData);
      
      const result = await updateUserInfo(updateData);
      
      if (result.code === 200) {
        console.log('[toModifyAvatar] 头像更新成功');
        
        // 更新页面显示
        this.setData({
          'personInfo.avatarUrl': tempFilePath,
        });
        
        // 更新全局用户信息
        const app = getApp();
        const updatedUserInfo = {
          ...originalUserInfo,
          avatar: tempFilePath,
        };
        
        app.globalData.userInfo = updatedUserInfo;
        wx.setStorageSync('userInfo', updatedUserInfo);
        
        // 更新原始用户信息
        this.setData({
          originalUserInfo: updatedUserInfo,
        });
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '头像更新成功',
          theme: 'success',
        });
      } else {
        throw new Error(result.msg || '更新失败');
      }
      
    } catch (error) {
      if (error.errMsg === 'chooseImage:fail cancel') return;
      console.error('[toModifyAvatar] 修改头像失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.message || '修改头像出错了',
        theme: 'error',
      });
    }
  },
  
  /**
   * 检查用户信息更新
   */
  checkUserInfoUpdate() {
    const app = getApp();
    const currentUserInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    
    if (currentUserInfo && this.data.originalUserInfo) {
      // 检查是否有更新
      const hasUpdate = 
        currentUserInfo.nickname !== this.data.originalUserInfo.nickname ||
        currentUserInfo.avatar !== this.data.originalUserInfo.avatar ||
        currentUserInfo.gender !== this.data.originalUserInfo.gender;
      
      if (hasUpdate) {
        console.log('[checkUserInfoUpdate] 检测到用户信息更新，重新初始化');
        this.init();
      }
    }
  },
  
  /**
   * 更新用户信息到服务器
   */
  async updateUserInfoToServer() {
    const { personInfo, originalUserInfo } = this.data;
    
    if (!originalUserInfo) {
      console.log('[updateUserInfoToServer] 没有原始用户信息，跳过更新');
      return;
    }
    
    // 检查是否有信息变更
    const hasChanges = 
      personInfo.avatarUrl !== originalUserInfo.avatar ||
      personInfo.nickName !== originalUserInfo.nickname ||
      personInfo.gender !== originalUserInfo.gender;
    
    if (!hasChanges) {
      console.log('[updateUserInfoToServer] 没有信息变更，跳过更新');
      return;
    }
    
    console.log('[updateUserInfoToServer] 检测到信息变更，开始更新');
    
    try {
      const updateData = {
        user_id: originalUserInfo.user_id,
        phone_number: originalUserInfo.phone_number || '',
        avatar: personInfo.avatarUrl,
        nickname: personInfo.nickName,
        address: originalUserInfo.address || '',
        gender: parseInt(personInfo.gender) || 0,
      };
      
      console.log('[updateUserInfoToServer] 准备更新的数据:', updateData);
      console.log('[updateUserInfoToServer] 原始用户信息:', originalUserInfo);
      console.log('[updateUserInfoToServer] 当前页面信息:', personInfo);
      
      const result = await updateUserInfo(updateData);
      
      if (result.code === 200) {
        console.log('[updateUserInfoToServer] 用户信息更新成功');
        
        // 更新全局用户信息
        const app = getApp();
        const updatedUserInfo = {
          ...originalUserInfo,
          avatar: personInfo.avatarUrl,
          nickname: personInfo.nickName,
          gender: parseInt(personInfo.gender) || 0,
        };
        
        app.globalData.userInfo = updatedUserInfo;
        wx.setStorageSync('userInfo', updatedUserInfo);
        
        // 更新原始用户信息
        this.setData({
          originalUserInfo: updatedUserInfo,
        });
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '用户信息更新成功',
          theme: 'success',
        });
      } else {
        throw new Error(result.msg || '更新失败');
      }
    } catch (error) {
      console.error('[updateUserInfoToServer] 更新用户信息失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.message || '更新用户信息失败',
        theme: 'error',
      });
    }
  },
});
