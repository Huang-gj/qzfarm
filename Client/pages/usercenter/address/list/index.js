/* eslint-disable no-param-reassign */
import {
  fetchDeliveryAddressList
} from '../../../../services/address/fetchAddress';
import Toast from 'tdesign-miniprogram/toast/index';
import {
  resolveAddress,
  rejectAddress
} from './util';
import {
  getAddressPromise
} from '../edit/util';

Page({
  data: {
    addressList: [],
    deleteID: '',
    showDeleteConfirm: false,
    isOrderSure: false,
  },

  /** 选择模式 */
  selectMode: false,
  /** 是否已经选择地址，不置为true的话页面离开时会触发取消选择行为 */
  hasSelect: false,

  onLoad(query) {
    const {
      selectMode = '', isOrderSure = '', id = ''
    } = query;
    this.setData({
      isOrderSure: !!isOrderSure,
      id,
    });
    this.selectMode = !!selectMode;
    this.init();
  },

  init() {
    this.getAddressList();
  },
  onUnload() {
    if (this.selectMode && !this.hasSelect) {
      rejectAddress();
    }
  },

  // 从本地存储获取地址列表
  getAddressListFromStorage() {
    try {
      const addressList = wx.getStorageSync('userAddressList') || [];
      return addressList;
    } catch (error) {
      console.error('获取本地地址列表失败:', error);
      return [];
    }
  },

  // 保存地址列表到本地存储
  saveAddressListToStorage(addressList) {
    try {
      wx.setStorageSync('userAddressList', addressList);
    } catch (error) {
      console.error('保存地址列表失败:', error);
    }
  },

  getAddressList() {
    const {
      id
    } = this.data;

    // 从本地存储获取地址列表
    let addressList = this.getAddressListFromStorage();

    // 确保addressList是数组
    if (!Array.isArray(addressList)) {
      addressList = [];
    }

    // 如果有数据，则使用本地存储的数据
    if (addressList.length > 0) {
      addressList.forEach((address) => {
        if (address.id === id) {
          address.checked = true;
        }
      });
      this.setData({
        addressList
      });
    } else {
      // 如果没有数据，设置空数组
      this.setData({
        addressList: []
      });
    }
  },

  // 选择默认地址
  selectDefaultAddress(e) {
    const {
      id,
      address
    } = e.currentTarget.dataset;

    // 更新本地状态
    const addressList = this.data.addressList.map(item => ({
      ...item,
      isDefault: item.id === id ? 1 : 0
    }));

    this.setData({
      addressList
    });

    // 保存到本地存储
    this.saveAddressListToStorage(addressList);

    // 向后端发送请求
    this.updateUserAddress(address);
  },

  // 更新用户地址信息
  updateUserAddress(address) {
    // 从app.globalData获取用户信息
    const app = getApp();
    const globalUserInfo = app.globalData.userInfo || {};

    const userInfo = {
      user_id: globalUserInfo.user_id || 0,
      phone_number: globalUserInfo.phone_number || '',
      avatar: globalUserInfo.avatar || '',
      nickname: globalUserInfo.nickname || '',
      address: address.address,
      gender: globalUserInfo.gender || 0
    };

    const requestData = {
      user_info: userInfo
    };

    console.log('发送的用户信息:', userInfo);

    wx.request({
      url: 'http://8.133.19.244:8893/api/uploadUserInfo',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token') || ''}`
      },
      data: requestData,
      success: (res) => {
        console.log('更新地址响应:', res.data);
        if (res.data.code === 200) {
          // 更新全局用户信息
          app.globalData.userInfo.address = address.address;

          Toast({
            context: this,
            selector: '#t-toast',
            message: '默认地址设置成功',
            theme: 'success',
            duration: 1000,
          });
        } else {
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.data.msg || '设置失败',
            icon: '',
            duration: 1000,
          });
        }
      },
      fail: (err) => {
        console.error('更新地址失败:', err);
        Toast({
          context: this,
          selector: '#t-toast',
          message: '网络错误，请稍后重试',
          icon: '',
          duration: 1000,
        });
      }
    });
  },

  confirmDeleteHandle({
    detail
  }) {
    const {
      id
    } = detail || {};
    if (id !== undefined) {
      this.setData({
        deleteID: id,
        showDeleteConfirm: true
      });
      Toast({
        context: this,
        selector: '#t-toast',
        message: '地址删除成功',
        theme: 'success',
        duration: 1000,
      });
    } else {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '需要组件库发新版才能拿到地址ID',
        icon: '',
        duration: 1000,
      });
    }
  },
  deleteAddressHandle(e) {
    const {
      id
    } = e.currentTarget.dataset;
    const newAddressList = this.data.addressList.filter((address) => address.id !== id);
    this.setData({
      addressList: newAddressList,
      deleteID: '',
      showDeleteConfirm: false,
    });

    // 保存到本地存储
    this.saveAddressListToStorage(newAddressList);
  },
  editAddressHandle({
    detail
  }) {
    this.waitForNewAddress();

    const {
      id
    } = detail || {};
    wx.navigateTo({
      url: `/pages/usercenter/address/edit/index?id=${id}`
    });
  },
  selectHandle({
    detail
  }) {
    if (this.selectMode) {
      this.hasSelect = true;
      resolveAddress(detail);
      wx.navigateBack({
        delta: 1
      });
    } else {
      this.editAddressHandle({
        detail
      });
    }
  },
  createHandle() {
    this.waitForNewAddress();
    wx.navigateTo({
      url: '/pages/usercenter/address/edit/index'
    });
  },

  waitForNewAddress() {
    getAddressPromise()
      .then((newAddress) => {
        let addressList = [...this.data.addressList];

        newAddress.phoneNumber = newAddress.phone;
        newAddress.address = `${newAddress.provinceName}${newAddress.cityName}${newAddress.districtName}${newAddress.detailAddress}`;
        newAddress.tag = newAddress.addressTag;

        if (!newAddress.addressId) {
          newAddress.id = `${Date.now()}`; // 使用时间戳作为唯一ID
          newAddress.addressId = `${Date.now()}`;

          if (newAddress.isDefault === 1) {
            addressList = addressList.map((address) => {
              address.isDefault = 0;
              return address;
            });
          } else {
            newAddress.isDefault = 0;
          }

          addressList.push(newAddress);
        } else {
          addressList = addressList.map((address) => {
            if (address.addressId === newAddress.addressId) {
              return newAddress;
            }
            return address;
          });
        }

        addressList.sort((prevAddress, nextAddress) => {
          if (prevAddress.isDefault && !nextAddress.isDefault) {
            return -1;
          }
          if (!prevAddress.isDefault && nextAddress.isDefault) {
            return 1;
          }
          return 0;
        });

        this.setData({
          addressList: addressList,
        });

        // 保存到本地存储
        this.saveAddressListToStorage(addressList);
      })
      .catch((e) => {
        if (e.message !== 'cancel') {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '地址编辑发生错误',
            icon: '',
            duration: 1000,
          });
        }
      });
  },
});