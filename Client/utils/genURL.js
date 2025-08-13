export function genPicURL(fileID) {
  return new Promise((resolve, reject) => {


    // 添加超时机制
    const timeout = setTimeout(() => {
      console.error('[genPicURL] 请求超时');
      reject(new Error('请求超时'));
    }, 10000); // 10秒超时

    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        clearTimeout(timeout);


        if (res.fileList && res.fileList.length > 0) {
          const fileInfo = res.fileList[0];


          // 检查所有可能的URL属性
          const tempFileURL = fileInfo.tempFileURL || fileInfo.url || fileInfo.fileURL;

          if (tempFileURL) {

            resolve(tempFileURL);
          } else {
            console.error('[genPicURL] 文件信息中没有找到URL属性:', fileInfo);
            console.error('[genPicURL] 文件信息的所有属性:', Object.keys(fileInfo));
            reject(new Error('文件信息中没有找到URL属性'));
          }
        } else {
          console.error('[genPicURL] fileList为空或不存在');
          reject(new Error('fileList为空或不存在'));
        }
      },
      fail: error => {
        clearTimeout(timeout);
        console.error('[genPicURL] 云存储请求失败:', error);
        reject(error);
      }
    });
  });
}