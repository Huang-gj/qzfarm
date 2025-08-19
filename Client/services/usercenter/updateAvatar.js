/**
 * 更新用户头像 - 使用文件上传
 * @param {string} filePath - 图片文件路径
 * @param {number} userId - 用户ID
 * @returns {Promise} 更新结果
 */
export function updateAvatar(filePath, userId) {
  console.log('[updateAvatar] 开始上传头像:', { filePath, userId });

  return new Promise((resolve, reject) => {
    // 获取存储的token
    const tokenData = wx.getStorageSync('token');
    let headers = {};

    // 添加认证头
    if (tokenData && tokenData.accessToken) {
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    }

    console.log('[updateAvatar] 请求头:', headers);

    wx.uploadFile({
      url: 'http://localhost:8893/api/updateAvatar', // 使用8893端口的头像上传接口
      filePath: filePath,
      name: 'file', // 后端接收文件的字段名
      formData: {
        'user_id': userId.toString() // 在表单中传递user_id
      },
      header: headers,
      success: (res) => {
        console.log('[updateAvatar] 上传响应:', res);
        
        try {
          const data = JSON.parse(res.data);
          console.log('[updateAvatar] 解析后的响应数据:', data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data?.msg || '上传失败'}`));
          }
        } catch (error) {
          console.error('[updateAvatar] 解析响应数据失败:', error);
          reject(new Error('服务器响应格式错误'));
        }
      },
      fail: (err) => {
        console.error('[updateAvatar] 上传失败:', err);
        reject(new Error(err.errMsg || '头像上传失败'));
      }
    });
  });
} 