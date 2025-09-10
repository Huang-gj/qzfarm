// 分类相关API服务

const { post } = require('../_utils/request');

/**
 * 获取分类列表
 * @param {number} categoryType - 分类类型: 1=农产品分类, 2=土地分类
 * @returns {Promise<Object>} 分类数据
 */
async function getCategory(categoryType) {
  console.log('[getCategory] ===== 开始获取分类数据 =====');
  console.log('[getCategory] 输入参数 - categoryType:', categoryType, '类型:', typeof categoryType);
  
  try {
    console.log('[getCategory] 准备发送POST请求到: /commodity/GetCategory');
    console.log('[getCategory] 请求数据:', { categoryType: categoryType });
    
    const response = await post('/commodity/GetCategory', {
      categoryType: categoryType
    });
    
    console.log('[getCategory] ===== API响应详情 =====');
    console.log('[getCategory] 响应状态码:', response?.code);
    console.log('[getCategory] 响应消息:', response?.msg);
    console.log('[getCategory] 响应数据类型:', typeof response?.category);
    console.log('[getCategory] 响应数据长度:', response?.category?.length);
    console.log('[getCategory] 完整响应:', JSON.stringify(response, null, 2));
    
    // 检查响应状态
    if (response && response.code === 200) {
      const categoryData = response.category || [];
      console.log('[getCategory] ===== 成功获取分类数据 =====');
      console.log('[getCategory] 分类数量:', categoryData.length);
      categoryData.forEach((item, index) => {
        console.log(`[getCategory] 分类${index + 1}:`, {
          id: item.category_id,
          name: item.name,
          type: item.category_type,
          image: item.image_url
        });
      });
      
      return {
        success: true,
        data: categoryData,
        message: response.msg || '获取成功'
      };
    } else {
      console.error('[getCategory] ===== 服务器返回错误 =====');
      console.error('[getCategory] 错误码:', response?.code);
      console.error('[getCategory] 错误信息:', response?.msg);
      return {
        success: false,
        data: [],
        message: response?.msg || '获取分类失败'
      };
    }
  } catch (error) {
    console.error('[getCategory] ===== 网络请求异常 =====');
    console.error('[getCategory] 错误类型:', error.constructor.name);
    console.error('[getCategory] 错误信息:', error.message);
    console.error('[getCategory] 错误详情:', error);
    return {
      success: false,
      data: [],
      message: error.message || '网络请求失败'
    };
  }
}

/**
 * 获取农产品分类
 * @returns {Promise<Object>} 农产品分类数据
 */
async function getGoodsCategory() {
  return await getCategory(1);
}

/**
 * 获取土地分类
 * @returns {Promise<Object>} 土地分类数据
 */
async function getLandCategory() {
  return await getCategory(2);
}

/**
 * 获取农场分类
 * @returns {Promise<Object>} 农场分类数据
 */
async function getFarmCategory() {
  console.log('[getFarmCategory] ===== 开始获取农场分类数据 =====');
  
  try {
    console.log('[getFarmCategory] 准备发送POST请求到: /commodity/GetFarmCat');
    
    const response = await post('/commodity/GetFarmCat', {});
    
    console.log('[getFarmCategory] ===== API响应详情 =====');
    console.log('[getFarmCategory] 响应状态码:', response?.code);
    console.log('[getFarmCategory] 响应消息:', response?.msg);
    console.log('[getFarmCategory] 响应数据类型:', typeof response?.farm_cat);
    console.log('[getFarmCategory] 响应数据长度:', response?.farm_cat?.length);
    console.log('[getFarmCategory] 完整响应:', JSON.stringify(response, null, 2));
    
    // 检查响应状态
    if (response && response.code === 200) {
      const farmData = response.farm_cat || [];
      console.log('[getFarmCategory] ===== 成功获取农场分类数据 =====');
      console.log('[getFarmCategory] 农场数量:', farmData.length);
      farmData.forEach((item, index) => {
        console.log(`[getFarmCategory] 农场${index + 1}:`, {
          id: item.farm_id,
          name: item.farm_name,
          logo: item.logo_url
        });
      });
      
      return {
        success: true,
        data: farmData,
        message: response.msg || '获取成功'
      };
    } else {
      console.error('[getFarmCategory] ===== 服务器返回错误 =====');
      console.error('[getFarmCategory] 错误码:', response?.code);
      console.error('[getFarmCategory] 错误信息:', response?.msg);
      return {
        success: false,
        data: [],
        message: response?.msg || '获取农场分类失败'
      };
    }
  } catch (error) {
    console.error('[getFarmCategory] ===== 网络请求异常 =====');
    console.error('[getFarmCategory] 错误类型:', error.constructor.name);
    console.error('[getFarmCategory] 错误信息:', error.message);
    console.error('[getFarmCategory] 错误详情:', error);
    return {
      success: false,
      data: [],
      message: error.message || '网络请求失败'
    };
  }
}

module.exports = {
  getCategory,
  getGoodsCategory,
  getLandCategory,
  getFarmCategory
};