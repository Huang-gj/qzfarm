// 农场农产品相关 API 接口调用

import { post } from '../_utils/request';
import { getFirstImageUrl } from '../../utils/genURL';

/**
 * 根据农场ID获取农产品列表
 * @param {number} farmId - 农场ID
 * @returns {Promise<Object>} 响应数据
 */
export async function getFarmGoods(farmId) {
  console.log('[getFarmGoods] ===== 开始获取农场农产品数据 =====');
  console.log('[getFarmGoods] 农场ID:', farmId);
  
  try {
    // 确保 farmId 是数字
    const numericFarmId = parseInt(farmId);
    if (isNaN(numericFarmId)) {
      throw new Error('农场ID必须是有效的数字');
    }
    
    console.log('[getFarmGoods] 准备发送POST请求到: http://8.133.19.244:8889/commodity/getGoodsByFarmID');
    console.log('[getFarmGoods] 请求参数:', { farm_id: numericFarmId });
    
    const response = await post('/commodity/getGoodsByFarmID', {
      farm_id: numericFarmId
    });
    
    console.log('[getFarmGoods] API响应:', response);
    
    if (response.code === 200) {
      console.log('[getFarmGoods] 获取农场农产品成功');
      
      // 处理商品数据
      const goodsList = response.goods_list || [];
      console.log('[getFarmGoods] 原始商品数据:', goodsList);
      
      // 转换为前端需要的格式
      const processedGoods = goodsList.map((item, index) => {
        // 处理图片URL
        const thumbUrl = getFirstImageUrl(item.image_urls);
        
        // 基于 repertory 字段计算库存状态
        const stockQuantity = item.repertory || 0;
        const hasStock = stockQuantity > 0;
        const isSoldOut = stockQuantity <= 0;
        
        const processedItem = {
          // 原有渲染需要的字段
          thumb: thumbUrl,
          title: item.title,
          price: item.price,
          originPrice: item.price, // 暂时使用相同价格作为原价
          tags: item.good_tag ? [item.good_tag] : [], // 将good_tag作为标签
          
          // 库存相关字段
          spuId: item.good_id, // 使用 good_id 作为 spuId
          spuStockQuantity: stockQuantity, // 库存数量
          isStock: hasStock, // 是否有库存
          soldout: isSoldOut, // 是否售罄
          maxPurchaseQuantity: stockQuantity, // 最大可购买数量
          
          // 新模型字段 - 添加到原有结构中
          id: item.id,
          del_state: item.del_state,
          del_time: item.del_time,
          create_time: item.create_time,
          good_id: item.good_id,
          good_tag: item.good_tag,
          farm_id: item.farm_id,
          units: item.units,
          repertory: item.repertory,
          detail: item.detail,
          
          // 为了兼容原有specList结构，将units添加到specList中
          specList: [{
            specId: 'units',
            title: '单位',
            specValueList: [{
              specValueId: 'units_value',
              specValue: item.units || '个'
            }]
          }]
        };

        return processedItem;
      });
      
      console.log('[getFarmGoods] 处理后的商品数据:', processedGoods);
      
      return {
        success: true,
        data: processedGoods,
        message: response.msg || '获取成功'
      };
    } else {
      console.error('[getFarmGoods] API返回错误:', response.msg);
      return {
        success: false,
        data: [],
        message: response.msg || '获取农场农产品失败'
      };
    }
  } catch (error) {
    console.error('[getFarmGoods] 请求失败:', error);
    return {
      success: false,
      data: [],
      message: error.message || '网络请求失败'
    };
  }
}