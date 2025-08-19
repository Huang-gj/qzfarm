// 修改：直接返回传入的URL，因为数据库中已经存储完整的URL链接
export function genPicURL(url) {
  return new Promise((resolve, reject) => {
    // 如果传入的是空值，返回默认图片
    if (!url) {
      resolve('https://via.placeholder.com/300x300?text=暂无图片');
      return;
    }
    
    // 如果是字符串，直接返回
    if (typeof url === 'string') {
      resolve(url);
      return;
    }
    
    // 如果是数组，返回第一个元素
    if (Array.isArray(url) && url.length > 0) {
      resolve(url[0]);
      return;
    }
    
    // 其他情况返回默认图片
    resolve('https://via.placeholder.com/300x300?text=暂无图片');
  });
}

// 新增：处理图片数组，用于轮播显示
export function processImageUrls(imageUrls) {
  // 如果是空值，返回默认图片数组
  if (!imageUrls) {
    return ['https://via.placeholder.com/300x300?text=暂无图片'];
  }
  
  // 如果已经是数组，直接返回
  if (Array.isArray(imageUrls)) {
    return imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/300x300?text=暂无图片'];
  }
  
  // 如果是字符串，尝试解析为JSON数组
  if (typeof imageUrls === 'string') {
    try {
      const parsed = JSON.parse(imageUrls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // 如果解析失败，当作单个URL处理
      return [imageUrls];
    }
    // 如果是空字符串或解析后为空数组
    return ['https://via.placeholder.com/300x300?text=暂无图片'];
  }
  
  // 其他情况返回默认图片
  return ['https://via.placeholder.com/300x300?text=暂无图片'];
}

// 新增：获取第一张图片URL，用于首页、订单等只显示一张图片的场景
export function getFirstImageUrl(imageUrls) {
  const urlArray = processImageUrls(imageUrls);
  return urlArray[0];
}