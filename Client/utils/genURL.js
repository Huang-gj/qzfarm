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
  
  // 如果是字符串，尝试多种解析方式
  if (typeof imageUrls === 'string') {
    // 移除首尾空格
    imageUrls = imageUrls.trim();
    
    // 如果是空字符串，返回默认图片
    if (!imageUrls) {
      return ['https://via.placeholder.com/300x300?text=暂无图片'];
    }
    
    // 首先尝试解析为JSON数组
    try {
      const parsed = JSON.parse(imageUrls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // JSON解析失败，继续尝试其他方式
    }
    
    // 尝试按逗号分隔处理（支持逗号分隔的URL字符串）
    if (imageUrls.includes(',')) {
      const urlArray = imageUrls.split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0);
      
      if (urlArray.length > 0) {
        return urlArray;
      }
    }
    
    // 如果包含有效的URL内容（包含http或https），当作单个URL处理
    if (imageUrls.includes('http')) {
      return [imageUrls];
    }
    
    // 其他情况返回默认图片
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