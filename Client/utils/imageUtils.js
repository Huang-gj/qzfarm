/**
 * 图片工具函数
 */

/**
 * 从多个图片URL中提取第一个URL
 * @param {string} imageUrls - 图片URL字符串，多个URL用逗号分隔
 * @returns {string} 第一个图片URL，如果没有则返回空字符串
 */
export function getFirstImageUrl(imageUrls) {
  if (!imageUrls || typeof imageUrls !== 'string') {
    return '';
  }
  
  // 按逗号分割，取第一个
  const urls = imageUrls.split(',');
  return urls[0] ? urls[0].trim() : '';
}

/**
 * 处理商品图片URL，确保只返回第一个图片
 * @param {string} primaryImage - 主图片URL
 * @param {string} thumb - 缩略图URL
 * @returns {string} 处理后的图片URL
 */
export function processGoodsImage(primaryImage, thumb) {
  // 优先使用primaryImage
  if (primaryImage) {
    return getFirstImageUrl(primaryImage);
  }
  
  // 如果没有primaryImage，使用thumb
  if (thumb) {
    return getFirstImageUrl(thumb);
  }
  
  return '';
} 