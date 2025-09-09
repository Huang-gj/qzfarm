// 通用请求工具函数

// 防止重复跳转登录的标志
let isRedirectingToLogin = false;

/**
 * 检查token是否过期
 * @param {Object} tokenData - token数据
 * @returns {boolean} - 是否过期
 */
function isTokenExpired(tokenData) {
  if (!tokenData || !tokenData.accessToken || !tokenData.accessExpire) {
    return true;
  }
  
  // 获取当前时间戳（秒）
  const currentTime = Math.floor(Date.now() / 1000);
  
  // 检查是否过期（提前5分钟判断过期，避免边界情况）
  const expireTime = parseInt(tokenData.accessExpire);
  const bufferTime = 5 * 60; // 5分钟缓冲
  
  return currentTime >= (expireTime - bufferTime);
}

/**
 * 跳转到登录页（不清除token）
 */
function redirectToLogin() {
  if (isRedirectingToLogin) {
    return; // 防止重复跳转
  }
  
  isRedirectingToLogin = true;
  
  console.log('[Token过期] 跳转到登录页（保留token数据）');
  
  // 显示提示信息
  wx.showToast({
    title: '登录已过期，请重新登录',
    icon: 'none',
    duration: 2000
  });
  
  // 延迟跳转，确保toast显示
  setTimeout(() => {
    wx.reLaunch({
      url: '/pages/login/login',
      success: () => {
        isRedirectingToLogin = false;
      },
      fail: () => {
        isRedirectingToLogin = false;
      }
    });
  }, 1000);
}

/**
 * 处理响应，检查是否有token过期相关的错误
 * @param {Object} response - 响应数据
 * @param {number} statusCode - HTTP状态码
 */
function handleTokenExpiry(response, statusCode) {
  // 检查401未授权状态码
  if (statusCode === 401) {
    redirectToLogin();
    return true;
  }
  
  // 检查响应中的错误码（根据后端API设计调整）
  if (response && (
    response.code === 401 || 
    response.code === 403 ||
    response.message === 'token expired' ||
    response.message === 'token invalid' ||
    response.msg === 'token过期' ||
    response.msg === 'token无效'
  )) {
    redirectToLogin();
    return true;
  }
  
  return false;
}

/**
 * 通用请求函数
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求URL
 * @param {string} options.method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 请求头
 * @param {number} options.timeout - 超时时间
 * @returns {Promise} 请求结果
 */
function request(options = {}) {
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const tokenData = wx.getStorageSync('token');
    
    // 检查token是否过期
    if (tokenData && isTokenExpired(tokenData)) {
      console.log('[Token检查] Token已过期，跳转到登录页');
      redirectToLogin();
      reject(new Error('Token已过期，请重新登录'));
      return;
    }
    
    let headers = {
      'Content-Type': 'application/json',
      ...options.header
    };

    // 如果有token且请求头中没有Authorization，才添加
    if (tokenData && tokenData.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }

    // 构建完整的URL - 开发阶段写死后端地址
    const baseUrl = 'http://8.133.19.244:8889'; // 生产环境服务器地址
    const url = options.url.startsWith('http') ? options.url : `${baseUrl}${options.url}`;

    console.log('[request] ===== 发送网络请求 =====');
    console.log('[request] 完整URL:', url);
    console.log('[request] 请求方法:', options.method || 'GET');
    console.log('[request] 请求数据:', JSON.stringify(options.data || {}, null, 2));
    console.log('[request] 请求头:', JSON.stringify(headers, null, 2));
    console.log('[request] 超时时间:', options.timeout || 10000);
    
    wx.request({
      url: url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      timeout: options.timeout || 10000,
      success: (res) => {
        console.log('[request] ===== 网络请求成功 =====');
        console.log('[request] HTTP状态码:', res.statusCode);
        console.log('[request] 响应头:', res.header);
        console.log('[request] 响应数据类型:', typeof res.data);
        console.log('[request] 响应数据:', JSON.stringify(res.data, null, 2));

        // 首先检查token是否过期
        if (handleTokenExpiry(res.data, res.statusCode)) {
          reject(new Error('Token已过期，请重新登录'));
          return;
        }

        // 检查响应状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          // 处理HTTP错误
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('[request] ===== 网络请求失败 =====');
        console.error('[request] 错误类型:', typeof err);
        console.error('[request] 错误码:', err.errno);
        console.error('[request] 错误信息:', err.errMsg);
        console.error('[request] 完整错误:', JSON.stringify(err, null, 2));
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

/**
 * GET请求
 * @param {string} url - 请求URL
 * @param {Object} params - 查询参数
 * @param {Object} options - 其他选项
 * @returns {Promise}
 */
function get(url, params = {}, options = {}) {
  // 将参数转换为查询字符串
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return request({
    url: fullUrl,
    method: 'GET',
    ...options
  });
}

/**
 * POST请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} options - 其他选项
 * @returns {Promise}
 */
function post(url, data = {}, options = {}) {
  return request({
    url: url,
    method: 'POST',
    data: data,
    ...options
  });
}

/**
 * PUT请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} options - 其他选项
 * @returns {Promise}
 */
function put(url, data = {}, options = {}) {
  return request({
    url: url,
    method: 'PUT',
    data: data,
    ...options
  });
}

/**
 * DELETE请求
 * @param {string} url - 请求URL
 * @param {Object} options - 其他选项
 * @returns {Promise}
 */
function del(url, options = {}) {
  return request({
    url: url,
    method: 'DELETE',
    ...options
  });
}

/**
 * 手动检查token状态
 * @returns {Object} - { isValid: boolean, needRefresh: boolean, data: Object }
 */
function checkTokenStatus() {
  const tokenData = wx.getStorageSync('token');
  
  if (!tokenData || !tokenData.accessToken) {
    return {
      isValid: false,
      needRefresh: false,
      data: null
    };
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const expireTime = parseInt(tokenData.accessExpire);
  const refreshAfter = parseInt(tokenData.refreshAfter);
  
  // 如果已经过期
  if (currentTime >= expireTime) {
    return {
      isValid: false,
      needRefresh: false,
      data: tokenData
    };
  }
  
  // 如果需要刷新（在refreshAfter时间之后）
  if (refreshAfter && currentTime >= refreshAfter) {
    return {
      isValid: true,
      needRefresh: true,
      data: tokenData
    };
  }
  
  // token有效且不需要刷新
  return {
    isValid: true,
    needRefresh: false,
    data: tokenData
  };
}

/**
 * 手动清除token并跳转登录（对外接口）
 */
function logout() {
  console.log('[Logout] 手动登出，清除token数据');
  
  // 手动登出时才清除token
  wx.removeStorageSync('token');
  
  redirectToLogin();
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  checkTokenStatus,
  logout,
  isTokenExpired
}; 