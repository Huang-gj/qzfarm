import {
  getAllLandsApi
} from '../../model/landsApi';
import { genPicURL, processImageUrls, getFirstImageUrl } from '../../utils/genURL';

/** 获取土地列表 */
async function fetchLandsListFromApi(pageIndex = 1, pageSize = 20) {
  try {
    // 调用API获取所有土地数据
    const response = await getAllLandsApi({
      user_id: 0
    }); // 暂时使用默认用户ID

    // 确保lands_list是数组
    if (!response || !response.lands_list) {
      console.error('[fetchLandsListFromApi] response或lands_list为空:', response);
      return [];
    }

    if (!Array.isArray(response.lands_list)) {
      console.error('[fetchLandsListFromApi] 获取的数据不是数组:', typeof response.lands_list);
      return [];
    }

    // 处理分页 - 确保pageIndex从1开始
    const safePageIndex = Math.max(1, pageIndex); // 确保页码至少为1
    const startIndex = (safePageIndex - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedLands = response.lands_list.slice(startIndex, endIndex);

    // 处理土地列表数据，转换为前端需要的格式
    const landsList = paginatedLands.map((item, index) => {
      // 处理图片URL：现在数据库存储的是完整URL，直接使用
      const thumbUrl = getFirstImageUrl(item.image_urls);

      // 基于 sale_status 字段计算可用状态
      const saleStatus = item.sale_status || 0;
      const hasArea = saleStatus === 0; // 0-出售中 1-已被租赁
      const isSoldOut = saleStatus === 1; // 已被租赁
      
      const processedItem = {
        // 原有渲染需要的字段
        thumb: thumbUrl,
        title: item.land_name, // 使用 land_name 作为标题
        price: item.price,
        originPrice: item.price, // 暂时使用相同价格作为原价
        tags: item.land_tag ? [item.land_tag] : [], // 将land_tag作为标签
        
        // 租赁状态相关字段
        landId: item.land_id, // 使用 land_id 作为 landId
        areaQuantity: item.area, // 面积数量
        isAvailable: hasArea, // 是否可用
        soldout: isSoldOut, // 是否已租完
        maxRentQuantity: 1, // 最大可租数量（土地通常按块租）
        
        // 新模型字段 - 添加到原有结构中
        id: item.id,
        del_state: item.del_state,
        del_time: item.del_time,
        create_time: item.create_time,
        land_id: item.land_id,
        land_name: item.land_name,
        land_tag: item.land_tag,
        farm_id: item.farm_id,
        area: item.area,
        detail: item.detail,
        sale_status: item.sale_status,
        sale_time: item.sale_time,
        
        // 为了兼容原有specList结构，将area作为单位
        specList: [{
          specId: 'area',
          title: '面积',
          specValueList: [{
            specValueId: 'area_value',
            specValue: item.area || '0亩'
          }]
        }]
      };

      return processedItem;
    });

    return landsList;
  } catch (error) {
    console.error('[fetchLandsListFromApi] 处理失败:', error);
    // 出错时返回空数组，避免应用崩溃
    return [];
  }
}

/** 获取土地列表 */
export function fetchLandsList(pageIndex = 1, pageSize = 20) {
  // 直接使用API获取数据
  return fetchLandsListFromApi(pageIndex, pageSize);
} 