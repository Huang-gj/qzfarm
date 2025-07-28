export function genPicURL(fileID) {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
          resolve(res.fileList[0].tempFileURL);
        } else {
          console.error('[genPicURL] 返回数据格式错误或URL为空:', res);
          reject(new Error('返回数据格式错误或URL为空'));
        }
      },
      fail: error => {
        console.error('[genPicURL] 获取失败:', error);
        reject(error);
      }
    });
  });
}