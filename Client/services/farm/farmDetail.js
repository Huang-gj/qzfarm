// 农场详情相关API服务

const { post } = require('../_utils/request');

/**
 * 获取农场详情
 * @param {number} farmId - 农场ID
 * @returns {Promise<Object>} 农场详情数据
 */
async function getFarmDetail(farmId) {
  console.log('[getFarmDetail] ===== 开始获取农场详情数据 =====');
  console.log('[getFarmDetail] 输入参数 - farmId:', farmId, '类型:', typeof farmId);
  
  // 确保farmId是数字类型
  const numericFarmId = parseInt(farmId);
  if (isNaN(numericFarmId)) {
    console.error('[getFarmDetail] farmId转换失败:', farmId);
    return {
      success: false,
      data: null,
      message: '无效的农场ID'
    };
  }
  
  console.log('[getFarmDetail] 转换后的farmId:', numericFarmId, '类型:', typeof numericFarmId);
  
  try {
    console.log('[getFarmDetail] 准备发送POST请求到: http://8.133.19.244:8889/commodity/GetFarm');
    console.log('[getFarmDetail] 请求数据:', { farm_id: numericFarmId });
    
    const response = await post('/commodity/GetFarm', {
      farm_id: numericFarmId
    });
    
    console.log('[getFarmDetail] ===== API响应详情 =====');
    console.log('[getFarmDetail] 响应状态码:', response?.code);
    console.log('[getFarmDetail] 响应消息:', response?.msg);
    console.log('[getFarmDetail] 响应数据类型:', typeof response?.farm);
    console.log('[getFarmDetail] 完整响应:', JSON.stringify(response, null, 2));
    
    // 检查响应状态
    if (response && response.code === 200) {
      const farmData = response.farm || {};
      console.log('[getFarmDetail] ===== 成功获取农场详情数据 =====');
      console.log('[getFarmDetail] 农场信息:', {
        id: farmData.farm_id,
        name: farmData.farm_name,
        status: farmData.status,
        address: farmData.address,
        phone: farmData.contact_phone,
        logoUrl: farmData.logo_url,
        imageCount: farmData.image_urls?.length || 0
      });
      
      return {
        success: true,
        data: farmData,
        message: response.msg || '获取成功'
      };
    } else {
      console.error('[getFarmDetail] ===== 服务器返回错误 =====');
      console.error('[getFarmDetail] 错误码:', response?.code);
      console.error('[getFarmDetail] 错误信息:', response?.msg);
      return {
        success: false,
        data: null,
        message: response?.msg || '获取农场详情失败'
      };
    }
  } catch (error) {
    console.error('[getFarmDetail] ===== 网络请求异常 =====');
    console.error('[getFarmDetail] 错误类型:', error.constructor.name);
    console.error('[getFarmDetail] 错误信息:', error.message);
    console.error('[getFarmDetail] 错误详情:', error);
    return {
      success: false,
      data: null,
      message: error.message || '网络请求失败'
    };
  }
}

module.exports = {
  getFarmDetail
};