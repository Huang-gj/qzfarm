// login.js
const app = getApp();

Page({
  data: {
    user_passwd: '',
    PhoneNumber: '',
    currentForm: 'login' // 'login' or 'forgot'
  },

  onLoad: function () {

    // 如果已经登录，则直接跳转到首页
    if (app.globalData.isLoggedIn) {

      wx.switchTab({
        url: '/pages/home/home'
      });
    }
  },

  onInputUsername(e) {
    this.setData({
      phone_number: e.detail.value
    });
  },

  onInputPassword(e) {
    this.setData({
      user_passwd: e.detail.value
    });
  },

  onInputPhoneNumber(e) {
    this.setData({
      PhoneNumber: e.detail.value
    });
  },

  handleLogin() {
    const {
      phone_number,
      user_passwd
    } = this.data;

    if (!phone_number || !user_passwd) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    // 显示加载中
    wx.showLoading({
      title: '登录中...',
    });

    // 调用后端登录接口
    wx.request({
      url: 'http://127.0.0.1:8893/api/userLogin',
      method: 'POST',
      data: {
        phone_number: phone_number,
        password: user_passwd
      },
      success: (res) => {
        wx.hideLoading();

        if (res.data.code === 200) {

          // 保存用户信息和token
          wx.setStorageSync('token', {
            accessToken: res.data.accessToken,
            accessExpire: res.data.accessExpire,
            refreshAfter: res.data.refreshAfter,

          });


          // 更新全局状态
          console.log('[handleLogin] 登录成功，设置全局数据');
          console.log('[handleLogin] 原始响应数据:', res.data);
          console.log('[handleLogin] 用户信息:', res.data.user_info);

          app.globalData.isLoggedIn = true;
          const userInfo = {
            user_id: res.data.user_info.user_id,
            phone_number: res.data.user_info.phone_number,
            nickname: res.data.user_info.nickname,
            avatar: res.data.user_info.avatar || 'https://via.placeholder.com/100x100?text=默认头像',
            address: res.data.user_info.address,
            gender: res.data.user_info.gender
          };

          app.globalData.userInfo = userInfo;

          // 保存到本地存储
          wx.setStorageSync('userInfo', userInfo);

          console.log('[handleLogin] 设置后的全局数据:', app.globalData);
          console.log('[handleLogin] 保存到本地存储:', userInfo);

          // 显示成功提示后跳转
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
          });

          // 简化跳转逻辑
          setTimeout(() => {

            wx.switchTab({
              url: '/pages/home/home',
              fail: (err) => {
                console.error('switchTab失败:', err);
                // 如果switchTab失败，尝试reLaunch
                wx.reLaunch({
                  url: '/pages/home/home',
                  fail: (err2) => {
                    console.error('reLaunch也失败:', err2);
                    // 如果连reLaunch也失败，可能需要检查页面路径是否正确
                    wx.showModal({
                      title: '跳转失败',
                      content: '无法跳转到首页，请检查应用配置',
                      showCancel: false
                    });
                  }
                });
              }
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.msg || '登录失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  handleResetPassword() {
    const {
      PhoneNumber
    } = this.data;

    if (!PhoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '发送中...',
    });

    // 模拟发送重置密码邮件
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '重置链接已发送',
        icon: 'success',
        duration: 2000
      });

      // 返回登录表单
      setTimeout(() => {
        this.showLoginForm();
      }, 2000);
    }, 1500);
  },

  showLoginForm() {
    this.setData({
      currentForm: 'login'
    });
  },

  showForgotForm() {
    this.setData({
      currentForm: 'forgot'
    });
  },

  navigateToRegister() {
    wx.navigateTo({
      url: '/pages/register/register',
    });
  },
})