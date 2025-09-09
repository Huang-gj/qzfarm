// 引入分类API服务
console.log('[category.js] 开始导入分类API服务...');
const categoryService = require('../services/category/category');
console.log('[category.js] categoryService导入结果:', categoryService);
console.log('[category.js] categoryService类型:', typeof categoryService);
console.log('[category.js] categoryService的方法:', Object.keys(categoryService || {}));

const { getGoodsCategory, getLandCategory } = categoryService;
console.log('[category.js] getGoodsCategory提取结果:', typeof getGoodsCategory);
console.log('[category.js] getLandCategory提取结果:', typeof getLandCategory);

export async function getCategoryList() {
  console.log('[getCategoryList] ========== 开始获取分类数据 ==========');
  
  try {
    // 检查分类API服务是否正确导入
    console.log('[getCategoryList] 检查API服务导入:');
    console.log('[getCategoryList] getGoodsCategory类型:', typeof getGoodsCategory);
    console.log('[getCategoryList] getLandCategory类型:', typeof getLandCategory);
    
    if (typeof getGoodsCategory !== 'function' || typeof getLandCategory !== 'function') {
      throw new Error('分类API服务导入失败');
    }
    
    console.log('[getCategoryList] 开始并行获取农产品和土地分类数据...');
    
    // 并行获取农产品和土地分类数据
    const [goodsResult, landResult] = await Promise.all([
      getGoodsCategory(),
      getLandCategory()
    ]);
    
    console.log('[getCategoryList] ===== 农产品分类结果 =====');
    console.log('[getCategoryList] 农产品成功:', goodsResult?.success);
    console.log('[getCategoryList] 农产品数据长度:', goodsResult?.data?.length);
    console.log('[getCategoryList] 农产品完整结果:', JSON.stringify(goodsResult, null, 2));
    
    console.log('[getCategoryList] ===== 土地分类结果 =====');
    console.log('[getCategoryList] 土地成功:', landResult?.success);
    console.log('[getCategoryList] 土地数据长度:', landResult?.data?.length);
    console.log('[getCategoryList] 土地完整结果:', JSON.stringify(landResult, null, 2));
    
    // 处理农产品分类数据（放在第一位，对应界面上的第一个标签）
    let goodsCategories = [];
    console.log('[getCategoryList] ===== 处理农产品分类数据 =====');
    if (goodsResult.success && goodsResult.data && goodsResult.data.length > 0) {
      console.log('[getCategoryList] 农产品分类原始数据:', goodsResult.data);
      goodsCategories = goodsResult.data.map((item, index) => {
        const processed = {
          groupId: `110${index + 1}`, // 农产品分类groupId以110开头（第一个位置）
          name: item.name,
          thumbnail: item.image_url || 'https://via.placeholder.com/100x100?text=' + encodeURIComponent(item.name)
        };
        console.log(`[getCategoryList] 农产品分类${index + 1}处理结果:`, processed);
        return processed;
      });
    } else {
      console.log('[getCategoryList] 农产品分类数据为空或获取失败');
    }
    console.log('[getCategoryList] 最终农产品分类数组:', goodsCategories);
    
    // 处理土地分类数据（放在第二位，对应界面上的第二个标签）
    let landCategories = [];
    console.log('[getCategoryList] ===== 处理土地分类数据 =====');
    if (landResult.success && landResult.data && landResult.data.length > 0) {
      console.log('[getCategoryList] 土地分类原始数据:', landResult.data);
      landCategories = landResult.data.map((item, index) => {
        const processed = {
          groupId: `210${index + 1}`, // 土地分类groupId以210开头（第二个位置）
          name: item.name,
          thumbnail: item.image_url || 'https://via.placeholder.com/100x100?text=' + encodeURIComponent(item.name)
        };
        console.log(`[getCategoryList] 土地分类${index + 1}处理结果:`, processed);
        return processed;
      });
    } else {
      console.log('[getCategoryList] 土地分类数据为空或获取失败');
    }
    console.log('[getCategoryList] 最终土地分类数组:', landCategories);
    // 构建返回的分类数据结构（农产品在第一位，土地在第二位）
    console.log('[getCategoryList] ===== 构建最终数据结构 =====');
    const finalResult = [{
      groupId: '1000', // 一级分类：农产品（第一个位置）
      name: '农产品',
      thumbnail: 'https://via.placeholder.com/100x100?text=农产品',
      children: [{
        groupId: '1100', // 二级分类：农产品
        name: '农产品',
        thumbnail: 'https://via.placeholder.com/100x100?text=农产品',
        children: goodsCategories, // 使用从API获取的农产品分类数据（groupId以110开头）
      }],
    },
    {
      groupId: '2000', // 一级分类：土地（第二个位置）
      name: '土地',
      thumbnail: 'https://via.placeholder.com/100x100?text=土地',
      children: [{
        groupId: '2100', // 二级分类：土地
        name: '土地',
        thumbnail: 'https://via.placeholder.com/100x100?text=土地',
        children: landCategories, // 使用从API获取的土地分类数据（groupId以210开头）
      }],
    }];
    
    console.log('[getCategoryList] 最终返回数据结构:');
    console.log('[getCategoryList] 土地分类数量:', landCategories.length);
    console.log('[getCategoryList] 农产品分类数量:', goodsCategories.length);
    console.log('[getCategoryList] 完整数据结构:', JSON.stringify(finalResult, null, 2));
    console.log('[getCategoryList] ========== 分类数据获取完成 ==========');
    
    return finalResult;
  } catch (error) {
    console.error('[getCategoryList] 获取分类列表失败:', error);
    // 返回默认的基础分类数据作为兜底（农产品在第一位，土地在第二位）
    return [{
      groupId: '1000', // 农产品（第一个位置）
      name: '农产品',
      thumbnail: 'https://via.placeholder.com/100x100?text=农产品',
      children: [{
        groupId: '1100',
        name: '农产品',
        thumbnail: 'https://via.placeholder.com/100x100?text=农产品',
        children: [{
            groupId: '1101', // 农产品分类以110开头
            name: '橘子',
            thumbnail: 'https://via.placeholder.com/100x100?text=橘子'
          },
          {
            groupId: '1102',
            name: '西瓜',
            thumbnail: 'https://via.placeholder.com/100x100?text=西瓜'
          }
        ],
      }],
    },
    {
      groupId: '2000', // 土地（第二个位置）
      name: '土地',
      thumbnail: 'https://via.placeholder.com/100x100?text=土地',
      children: [{
        groupId: '2100',
        name: '土地',
        thumbnail: 'https://via.placeholder.com/100x100?text=土地',
        children: [{
            groupId: '2101', // 土地分类以210开头
            name: '池塘',
            thumbnail: 'https://via.placeholder.com/100x100?text=池塘'
          },
          {
            groupId: '2102',
            name: '果树',
            thumbnail: 'https://via.placeholder.com/100x100?text=果树'
          }
        ],
      }],
    }];
  }
}