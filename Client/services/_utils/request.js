// 通用请求工具函数

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
    let headers = {
      'Content-Type': 'application/json',
      ...options.header
    };

    // 如果有token且请求头中没有Authorization，才添加
    if (tokenData && tokenData.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }

    // 构建完整的URL - 开发阶段写死后端地址
    const baseUrl = 'http://localhost:8891'; // 开发阶段写死
    const url = options.url.startsWith('http') ? options.url : `${baseUrl}${options.url}`;

    console.log('[request] 发送请求:', {
      url: url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers
    });
    
    wx.request({
      url: url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      timeout: options.timeout || 10000,
      success: (res) => {

        // 检查响应状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          // 处理HTTP错误
          reject(new Error(`HTTP ${res.statusCode}: ${res.data?.msg || '请求失败'}`));
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
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

module.exports = {
  request,
  get,
  post,
  put,
  del
}; 