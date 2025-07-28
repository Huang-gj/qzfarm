import {
  getAllLandsApi
} from '../../model/landsApi';
import { genPicURL } from '../../utils/genURL';

/** 获取土地列表 */
async function fetchLandsListFromApi(pageIndex = 1, pageSize = 20) {
  console.log('[fetchLandsListFromApi] 开始获取土地列表, 页码:', pageIndex, '每页数量:', pageSize);

  try {
    // 调用API获取所有土地数据
    const response = await getAllLandsApi({
      user_id: 0
    }); // 暂时使用默认用户ID

    console.log('[fetchLandsListFromApi] API响应:', response);
    console.log('[fetchLandsListFromApi] response.lands_list:', response.lands_list);
    console.log('[fetchLandsListFromApi] response.lands_list类型:', typeof response.lands_list);

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

    console.log('[fetchLandsListFromApi] 分页后的土地数据:', paginatedLands);
    console.log('[fetchLandsListFromApi] 分页数据长度:', paginatedLands.length);

    // 处理土地列表数据，转换为前端需要的格式
    const landsList = await Promise.all(paginatedLands.map(async (item, index) => {
      console.log(`[fetchLandsListFromApi] 处理第${index}个土地项:`, item);
      // 转换图片URL
      let thumbUrl = '';
      console.log(`[fetchLandsListFromApi] 第${index}个土地项的image_urls:`, item.image_urls);
      
      if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
        try {
          thumbUrl = await genPicURL(item.image_urls[0]);
          console.log('[fetchLandsListFromApi] 图片URL转换成功:', {
            original: item.image_urls[0],
            converted: thumbUrl
          });
        } catch (error) {
          console.error('[fetchLandsListFromApi] 图片URL转换失败:', error);
          thumbUrl = item.image_urls[0]; // 转换失败时使用原始URL
        }
      } else {
        console.log(`[fetchLandsListFromApi] 第${index}个土地项没有图片或图片格式不正确`);
      }

      // 基于 sale_status 字段计算可用状态
      const saleStatus = item.sale_status || 0;
      const hasArea = saleStatus === 0; // 0-出售中 1-已被租赁
      const isSoldOut = saleStatus === 1; // 已被租赁
      
      console.log(`[fetchLandsListFromApi] 第${index}个土地项的租赁状态:`, {
        sale_status: saleStatus,
        hasArea: hasArea,
        isSoldOut: isSoldOut
      });
      
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
      
      // 打印每一个土地信息
      console.log(`[fetchLandsListFromApi] 第${index}个土地项处理完成:`, processedItem);

      return processedItem;
    }));

    console.log('[fetchLandsListFromApi] 所有土地项处理完成，最终结果:', landsList);
    console.log('[fetchLandsListFromApi] 成功处理土地列表, 数量:', landsList.length);
    return landsList;
  } catch (error) {
    console.error('[fetchLandsListFromApi] 处理失败:', error);
    // 出错时返回空数组，避免应用崩溃
    return [];
  }
}

/** 获取土地列表 */
export function fetchLandsList(pageIndex = 1, pageSize = 20) {
  console.log('[fetchLandsList] 开始调用, 页码:', pageIndex, '每页数量:', pageSize);

  // 直接使用API获取数据
  console.log('[fetchLandsList] 使用真实 API');
  return fetchLandsListFromApi(pageIndex, pageSize);
} 