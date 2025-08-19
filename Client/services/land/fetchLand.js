import { config } from '../../config/index';
import { getLandById } from '../../model/landsApi';
import { genPicURL, processImageUrls } from '../../utils/genURL';

/** 获取土地详情 */
function mockFetchLand(landId) {
  const { delay } = require('../_utils/delay');
  // 暂时注释掉mock数据，直接使用真实API
  // const { getLand } = require('../../model/land');
  // return delay().then(() => getLand(landId));
  return delay().then(() => null); // 返回null，让真实API处理
}

/** 获取土地详情 */
export async function fetchLand(landId) {
  // 暂时强制使用真实API，等mock数据准备好后再启用
  // if (config.useMock) {
  //   return mockFetchLand(landId);
  // }
  
  try {
    // 使用真实API获取土地详情
    const land = await getLandById(landId);
    
    if (!land) {
      console.error('[fetchLand] 未找到土地，landId:', landId);
      return null;
    }
    

    
    // 转换图片URL
    let primaryImageUrl = '';
    let imagesUrls = [];
    
    if (Array.isArray(land.image_urls) && land.image_urls.length > 0) {
      try {
        // 转换所有图片URL
        imagesUrls = await Promise.all(land.image_urls.map(async (url) => {
          try {
            return await genPicURL(url);
          } catch (error) {
            console.error('[fetchLand] 图片URL转换失败:', error);
            return url; // 转换失败时使用原始URL
          }
        }));
        
        primaryImageUrl = imagesUrls[0];
      } catch (error) {
        console.error('[fetchLand] 图片URL转换失败:', error);
        imagesUrls = land.image_urls;
        primaryImageUrl = land.image_urls[0];
      }
    }
    
    // 基于 sale_status 字段计算可用状态
    const saleStatus = land.sale_status || 0;
    const hasArea = saleStatus === 0; // 0-出售中 1-已被租赁
    const isSoldOut = saleStatus === 1; // 已被租赁
    
    // 将土地数据转换为商品详情页面兼容的格式
    const convertedLand = {
      // 原有渲染需要的字段
      land_id: land.land_id,
      land_name: land.land_name,
      title: land.land_name, // 兼容商品详情页面的title字段
      primaryImage: primaryImageUrl,
      images: imagesUrls,
      price: land.price,
      minSalePrice: land.price,
      maxSalePrice: land.price,
      minLinePrice: land.price,
      maxLinePrice: land.price,
      areaQuantity: land.area,
      soldNum: 0, // 新模型没有销量字段，设为0
      isPutOnSale: land.del_state === 0 ? 1 : 0,
      available: land.del_state === 0 ? 1 : 0,
      
      // 可用状态字段
      isAvailable: hasArea,
      soldout: isSoldOut,
      maxRentQuantity: 1, // 最大可租数量（土地通常按块租）
      
      // 规格信息
      specList: [{
        specId: 'area',
        title: '面积',
        specValueList: [{
          specValueId: 'area_value',
          specValue: land.area || '0亩'
        }]
      }],
      
      // 标签信息
      spuTagList: land.land_tag ? [{
        id: 'tag_001',
        title: land.land_tag,
        image: null
      }] : [],
      
      // 描述信息
      desc: land.detail ? [land.detail] : [],
      
      // 新模型字段 - 保留所有原始数据
      id: land.id,
      del_state: land.del_state,
      del_time: land.del_time,
      create_time: land.create_time,
      land_id: land.land_id,
      land_name: land.land_name,
      land_tag: land.land_tag,
      farm_id: land.farm_id,
      image_urls: land.image_urls,
      area: land.area,
      detail: land.detail,
      sale_status: land.sale_status,
      sale_time: land.sale_time
    };
    
    return convertedLand;
    
  } catch (error) {
    console.error('[fetchLand] 获取土地详情失败:', error);
    throw error;
  }
}

// 获取单个土地的基本信息 