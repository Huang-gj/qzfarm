import { config } from '../../config/index';
import { getGoodById } from '../../model/goodsApi';
import { genPicURL } from '../../utils/genURL';

/** 获取商品列表 */
async function fetchGoodFromApi(goodId = 0) {
  console.log('[fetchGoodFromApi] 开始获取商品，goodId:', goodId);
  
  try {
    // 使用新的API获取商品数据
    const good = await getGoodById(goodId, 0); // 使用默认用户ID 0
    
    if (good) {
      console.log('[fetchGoodFromApi] 成功获取商品数据:', good.title);
      console.log('[fetchGoodFromApi] 原始商品数据:', good);
      console.log('[fetchGoodFromApi] 库存信息:', {
        repertory: good.repertory,
        repertory_type: typeof good.repertory,
        stockQuantity: stockQuantity
      });
      console.log('[fetchGoodFromApi] 图片数据:', {
        image_urls: good.image_urls,
        image_urls_type: typeof good.image_urls,
        image_urls_length: Array.isArray(good.image_urls) ? good.image_urls.length : 'not array'
      });
      
      // 转换图片URL
      let primaryImageUrl = '';
      let imagesUrls = [];
      
      if (Array.isArray(good.image_urls) && good.image_urls.length > 0) {
        try {
          // 转换所有图片URL
          imagesUrls = await Promise.all(good.image_urls.map(async (url) => {
            try {
              return await genPicURL(url);
            } catch (error) {
              console.error('[fetchGoodFromApi] 图片URL转换失败:', error);
              return url; // 转换失败时使用原始URL
            }
          }));
          
          primaryImageUrl = imagesUrls[0];
          
          console.log('[fetchGoodFromApi] 图片URL转换成功:', {
            original: good.image_urls,
            converted: imagesUrls
          });
        } catch (error) {
          console.error('[fetchGoodFromApi] 图片URL转换失败:', error);
          imagesUrls = good.image_urls;
          primaryImageUrl = good.image_urls[0];
        }
      }
      
      // 基于 repertory 字段计算库存状态
      const stockQuantity = good.repertory || 0;
      const hasStock = stockQuantity > 0;
      const isSoldOut = stockQuantity <= 0;
      
      // 将新数据格式转换为原有格式，保持兼容性
      const convertedGood = {
        // 原有渲染需要的字段
        good_id: good.good_id,
        title: good.title,
        primaryImage: primaryImageUrl,
        images: imagesUrls,
        price: good.price,
        minSalePrice: good.price,
        maxSalePrice: good.price,
        minLinePrice: good.price,
        maxLinePrice: good.price,
        spuStockQuantity: stockQuantity,
        soldNum: 0, // 新模型没有销量字段，设为0
        isPutOnSale: good.del_state === 0 ? 1 : 0,
        available: good.del_state === 0 ? 1 : 0,
        
        // 库存状态字段
        isStock: hasStock,
        soldout: isSoldOut,
        maxPurchaseQuantity: stockQuantity,
        
        // 规格信息
        specList: [{
          specId: 'units',
          title: '单位',
          specValueList: [{
            specValueId: 'units_value',
            specValue: good.units || '个'
          }]
        }],
        
        // 标签信息
        spuTagList: good.good_tag ? [{
          id: 'tag_001',
          title: good.good_tag,
          image: null
        }] : [],
        
        // 描述信息
        desc: good.detail ? [good.detail] : [],
        
        // 新模型字段 - 保留所有原始数据
        id: good.id,
        del_state: good.del_state,
        del_time: good.del_time,
        create_time: good.create_time,
        good_id: good.good_id,
        good_tag: good.good_tag,
        farm_id: good.farm_id,
        image_urls: good.image_urls,
        units: good.units,
        repertory: good.repertory,
        detail: good.detail
      };
      
      console.log('[fetchGoodFromApi] 转换后的图片数据:', {
        images: convertedGood.images,
        images_length: convertedGood.images.length,
        primaryImage: convertedGood.primaryImage
      });
      
      return convertedGood;
    } else {
      console.log('[fetchGoodFromApi] 未找到商品，goodId:', goodId);
      return null;
    }
  } catch (error) {
    console.error('[fetchGoodFromApi] 获取商品数据失败:', error);
    throw error;
  }
}

/** 获取商品列表 */
export function fetchGood(goodId = 0) {
  console.log('[fetchGood] 开始调用, goodId:', goodId);
  
  // 直接使用API获取数据
  console.log('[fetchGood] 使用真实 API');
  return fetchGoodFromApi(goodId);
}

// 获取单个商品的基本信息
