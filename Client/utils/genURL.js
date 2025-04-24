export function genPicURL(fileID) {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        resolve(res.fileList[0].tempFileURL); // 只取一个 URL 返回
      },
      fail: reject
    });
  });
}