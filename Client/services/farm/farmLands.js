// 农场土地相关 API 接口调用

import { post } from '../_utils/request';
import { getFirstImageUrl } from '../../utils/genURL';

/**
 * 根据农场ID获取土地列表
 * @param {number} farmId - 农场ID
 * @returns {Promise<Object>} 响应数据
 */
export async function getFarmLands(farmId) {
  console.log('[getFarmLands] ===== 开始获取农场土地数据 =====');
  console.log('[getFarmLands] 农场ID:', farmId);
  
  try {
    // 确保 farmId 是数字
    const numericFarmId = parseInt(farmId);
    if (isNaN(numericFarmId)) {
      throw new Error('农场ID必须是有效的数字');
    }
    
    console.log('[getFarmLands] 准备发送POST请求到: http://8.133.19.244:8889/commodity/getLandsByFarmID');
    console.log('[getFarmLands] 请求参数:', { farm_id: numericFarmId });
    
    const response = await post('/commodity/getLandsByFarmID', {
      farm_id: numericFarmId
    });
    
    console.log('[getFarmLands] API响应:', response);
    
    if (response.code === 200) {
      console.log('[getFarmLands] 获取农场土地成功');
      
      // 处理土地数据
      const landsList = response.lands_list || [];
      console.log('[getFarmLands] 原始土地数据:', landsList);
      
      // 转换为前端需要的格式
      const processedLands = landsList.map((item, index) => {
        // 处理图片URL
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
      
      console.log('[getFarmLands] 处理后的土地数据:', processedLands);
      
      return {
        success: true,
        data: processedLands,
        message: response.msg || '获取成功'
      };
    } else {
      console.error('[getFarmLands] API返回错误:', response.msg);
      return {
        success: false,
        data: [],
        message: response.msg || '获取农场土地失败'
      };
    }
  } catch (error) {
    console.error('[getFarmLands] 请求失败:', error);
    return {
      success: false,
      data: [],
      message: error.message || '网络请求失败'
    };
  }
}