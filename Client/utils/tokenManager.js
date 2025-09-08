/**
 * Token管理工具
 * 提供token的统一管理和检查功能
 */

const { checkTokenStatus, logout } = require('../services/_utils/request');

/**
 * 应用启动时检查token状态
 */
function checkTokenOnAppLaunch() {
  const status = checkTokenStatus();
  
  console.log('[TokenManager] 应用启动token检查:', status);
  
  if (!status.isValid) {
    console.log('[TokenManager] Token无效（但保留token数据）');
    return false;
  }
  
  if (status.needRefresh) {
    console.log('[TokenManager] Token需要刷新');
    // 这里可以调用刷新token的接口
    // refreshToken();
  }
  
  return true;
}

/**
 * 页面显示时检查token状态
 * @param {string} pagePath - 页面路径，用于判断是否需要登录
 */
function checkTokenOnPageShow(pagePath) {
  // 无需登录的页面列表
  const publicPages = [
    '/pages/login/login',
    '/pages/register/register',
    '/pages/home/index',
    '/pages/goods/list/index',
    '/pages/goods/details/index',
    '/pages/land/list/index',
    '/pages/land/details/index',
    '/pages/activity-detail/index',
    '/pages/promotion-detail/index'
  ];
  
  // 如果是公开页面，不需要检查token
  if (publicPages.includes(pagePath)) {
    return true;
  }
  
  const status = checkTokenStatus();
  
  if (!status.isValid) {
    console.log(`[TokenManager] 页面${pagePath}需要登录，token无效，跳转登录页`);
    wx.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 1500
    });
    
    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }, 1500);
    
    return false;
  }
  
  return true;
}

/**
 * 检查当前token是否即将过期（用于主动提醒用户）
 * @returns {boolean} - 是否即将过期（剩余时间少于30分钟）
 */
function isTokenExpiringsSoon() {
  const status = checkTokenStatus();
  
  if (!status.isValid) {
    return false;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const expireTime = parseInt(status.data.accessExpire);
  const remainingTime = expireTime - currentTime;
  
  // 剩余时间少于30分钟
  return remainingTime < 30 * 60;
}

/**
 * 显示token即将过期的提醒
 */
function showTokenExpiryWarning() {
  wx.showModal({
    title: '登录提醒',
    content: '您的登录状态即将过期，是否现在重新登录？',
    confirmText: '重新登录',
    cancelText: '稍后再说',
    success: (res) => {
      if (res.confirm) {
        logout();
      }
    }
  });
}

/**
 * 定期检查token状态（可在app.js中调用）
 */
function startTokenCheck() {
  // 每5分钟检查一次token状态
  setInterval(() => {
    const status = checkTokenStatus();
    
    if (!status.isValid) {
      console.log('[TokenManager] 定期检查发现token无效');
      return;
    }
    
    if (isTokenExpiringsSoon()) {
      console.log('[TokenManager] Token即将过期，显示提醒');
      showTokenExpiryWarning();
    }
  }, 5 * 60 * 1000); // 5分钟
}

module.exports = {
  checkTokenOnAppLaunch,
  checkTokenOnPageShow,
  isTokenExpiringsSoon,
  showTokenExpiryWarning,
  startTokenCheck
};