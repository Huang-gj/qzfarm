import { fetchPerson } from '../../../services/usercenter/fetchPerson';
import { updateUserInfo } from '../../../services/usercenter/updateUserInfo';
import { updateAvatar } from '../../../services/usercenter/updateAvatar';
import { fetchUserInfo } from '../../../services/usercenter/fetchUserInfo';
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
    
    // 如果用户信息为空，重新初始化（这可能发生在头像更新后）
    const app = getApp();
    if (!app.globalData.userInfo) {
      console.log('[onShow] 用户信息为空，重新初始化');
      this.init();
    }
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
        avatarUrl: userInfo.avatar || 'https://via.placeholder.com/100x100?text=默认头像',
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
            if (size <= 10485760) { // 10MB限制
              resolve(path);
            } else {
              reject({ errMsg: '图片大小超出限制，请重新上传' });
            }
          },
          fail: (err) => reject(err),
        });
      });
      
      console.log('[toModifyAvatar] 选择的图片路径:', tempFilePath);
      
      const { originalUserInfo } = this.data;
      if (!originalUserInfo) {
        throw new Error('用户信息获取失败');
      }
      
      // 使用新的文件上传API更新头像
      console.log('[toModifyAvatar] 开始上传头像文件');
      const result = await updateAvatar(tempFilePath, originalUserInfo.user_id);
      
      if (result.code === 200) {
        console.log('[toModifyAvatar] 头像上传成功');
        
        // 头像上传成功，从服务器获取最新的用户信息
        try {
          console.log('[toModifyAvatar] 获取最新用户信息...');
          const latestUserInfo = await fetchUserInfo(originalUserInfo.user_id);
          
          if (latestUserInfo && latestUserInfo.code === 200 && latestUserInfo.user_info) {
            const serverUserInfo = latestUserInfo.user_info;
            console.log('[toModifyAvatar] 从服务器获取到最新用户信息:', serverUserInfo);
            
            // 更新页面显示
            this.setData({
              'personInfo.avatarUrl': serverUserInfo.avatar || 'https://via.placeholder.com/100x100?text=默认头像',
            });
            
            // 更新全局用户信息
            const app = getApp();
            const updatedUserInfo = {
              ...originalUserInfo,
              avatar: serverUserInfo.avatar,
              nickname: serverUserInfo.nickname,
              gender: serverUserInfo.gender,
              phone_number: serverUserInfo.phone_number,
              address: serverUserInfo.address,
            };
            
            app.globalData.userInfo = updatedUserInfo;
            wx.setStorageSync('userInfo', updatedUserInfo);
            
            // 更新原始用户信息
            this.setData({
              originalUserInfo: updatedUserInfo,
            });
            
            // 显示成功提示并询问是否退出重登录
            wx.showModal({
              title: '头像更新成功',
              content: '头像已成功更新到服务器！为了确保所有页面显示最新头像，建议退出账号重新登录。是否现在退出登录？',
              confirmText: '退出登录',
              cancelText: '稍后再说',
              success: (res) => {
                if (res.confirm) {
                  console.log('[toModifyAvatar] 用户选择退出登录');
                  this.handleLogout();
                } else {
                  console.log('[toModifyAvatar] 用户选择稍后退出');
                  Toast({
                    context: this,
                    selector: '#t-toast',
                    message: '头像更新成功',
                    theme: 'success',
                  });
                }
              }
            });
            
          } else {
            throw new Error('获取最新用户信息失败');
          }
        } catch (fetchError) {
          console.error('[toModifyAvatar] 获取最新用户信息失败:', fetchError);
          
          // 如果获取最新信息失败，也提供退出重登录的选项
          wx.showModal({
            title: '头像更新成功',
            content: '头像已成功更新到服务器！但获取最新信息时出现问题，建议退出账号重新登录以确保显示最新头像。是否现在退出登录？',
            confirmText: '退出登录',
            cancelText: '稍后再说',
            success: (res) => {
              if (res.confirm) {
                console.log('[toModifyAvatar] 用户选择退出登录（获取信息失败情况）');
                this.handleLogout();
              } else {
                console.log('[toModifyAvatar] 用户选择稍后退出（获取信息失败情况）');
                Toast({
                  context: this,
                  selector: '#t-toast',
                  message: '头像更新成功，建议重新登录',
                  theme: 'success',
                });
              }
            }
          });
        }
      } else {
        throw new Error(result.msg || '头像上传失败');
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
   * 退出登录方法
   */
  handleLogout() {
    console.log('[handleLogout] 开始退出登录流程');
    
    // 清除本地存储的用户信息和登录态
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');

    // 更新全局状态
    const app = getApp();
    app.globalData.isLoggedIn = false;
    app.globalData.userInfo = null;

    // 显示退出成功提示
    wx.showToast({
      title: '已退出登录',
      icon: 'success',
      duration: 2000
    });

    // 延迟跳转到登录页面，让用户看到成功提示
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }, 2000);
  },
  
  /**
   * 更新用户信息到服务器（不包括头像）
   */
  async updateUserInfoToServer() {
    const { personInfo, originalUserInfo } = this.data;
    
    if (!originalUserInfo) {
      console.log('[updateUserInfoToServer] 没有原始用户信息，跳过更新');
      return;
    }
    
    // 检查是否有信息变更（排除头像，头像通过专门的接口更新）
    const hasChanges = 
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
        avatar: originalUserInfo.avatar || '', // 保持原有头像不变
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
