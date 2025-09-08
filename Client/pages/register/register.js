// register.js
Page({
  data: {

    PhoneNumber: '',
    NickName: '',
    password: '',
    confirmPassword: ''
  },


  onInputPhoneNumber(e) {
    this.setData({
      PhoneNumber: e.detail.value
    });
  },
  onInputNickName(e) {
    this.setData({
      NickName: e.detail.value
    });
  },
  onInputPassword(e) {
    this.setData({
      password: e.detail.value
    });
  },

  onInputConfirmPassword(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  handleRegister() {
    const {

      PhoneNumber,
      NickName,
      password,
      confirmPassword
    } = this.data;

    // 表单验证
    if (!PhoneNumber || !NickName || !password || !confirmPassword) {
      wx.showToast({
        title: '请填写所有字段',
        icon: 'none'
      });
      return;
    }

    // 密码一致性验证
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      });
      return;
    }

    // 密码强度验证
    if (password.length < 6) {
      wx.showToast({
        title: '密码长度至少为6位',
        icon: 'none'
      });
      return;
    }

    // 手机号验证
    const phonePattern = /^1[3-9]\d{9}$/;
    if (!phonePattern.test(PhoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    // 显示加载中
    wx.showLoading({
      title: '注册中...',
    });

    // 调用后端注册接口
    wx.request({
      url: 'http://8.133.19.244:8893/user/userRegister',
      method: 'POST',

      data: {

        password: password,
        phone_number: PhoneNumber,
        nickname: NickName
      },
      success: (res) => {
        wx.hideLoading();
        console.log(NickName, PhoneNumber)
        if (res.code === 200) {
          wx.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 1500
          });


          // 简化跳转逻辑，使用单一setTimeout
          setTimeout(() => {
            // 首先尝试使用reLaunch直接跳转到登录页
            wx.reLaunch({
              url: '/pages/login/login',
              complete: (res) => {
                if (res.data.msg !== 'reLaunch:ok') {
                  console.error('跳转失败，尝试使用其他方式', res);
                  // 退出到登录页
                  wx.navigateBack({
                    delta: 999, // 返回最开始的页面
                    complete: () => {
                      wx.navigateTo({
                        url: '/pages/login/login'
                      });
                    }
                  });
                }
              }
            });
          }, 1500);
        } else {

          wx.showToast({

            title: res.data.msg || '注册失败',
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

  navigateToLogin() {
    wx.navigateBack({
      delta: 1
    });
  }
})