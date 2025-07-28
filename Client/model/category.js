import {
  genPicURL
} from '../utils/genURL'
export async function getCategoryList() {
  try {
    // 使用 Promise.allSettled 而不是 Promise.all，这样即使某些图片获取失败也不会影响其他图片
    const urlPromises = [
      // 土地分类图片 - 来自第二张图片 (category/lands/)
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/lands/土地1.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/lands/池塘.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/lands/果树.jpg'),
      
      // 农产品分类图片 - 来自第一张图片 (category/goods/)
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/橘子.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/西瓜.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/梨.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/柚子.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/樱桃.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/香蕉.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/桃子.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/葡萄.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/苹果.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/芒果.jpg'),
      genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/goods/火龙果.jpg')
    ];
    
    const results = await Promise.allSettled(urlPromises);
    const urls = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`[getCategoryList] 图片 ${index} 获取失败:`, result.reason);
        // 返回默认图片URL
        return 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png';
      }
    });
    return [{
      groupId: '1000', // 一级分类用千位
      name: '土地',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '1100', // 二级分类用百位
        name: '土地',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
            groupId: '1101',
            name: '土地',
            thumbnail: urls[0]
          }, // 三级分类用个位
          {
            groupId: '1102',
            name: '池塘',
            thumbnail: urls[1]
          },
          {
            groupId: '1103',
            name: '果树',
            thumbnail: urls[2]
          }
        ],
      }],
    },
    {
      groupId: '2000',
      name: '农产品',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '2100',
        name: '农产品',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
            groupId: '2101',
            name: '橘子',
            thumbnail: urls[3]
          },
          {
            groupId: '2102',
            name: '西瓜',
            thumbnail: urls[4]
          },
          {
            groupId: '2103',
            name: '梨',
            thumbnail: urls[5]
          },
          {
            groupId: '2104',
            name: '柚子',
            thumbnail: urls[6]
          },
          {
            groupId: '2105',
            name: '樱桃',
            thumbnail: urls[7]
          },
          {
            groupId: '2106',
            name: '香蕉',
            thumbnail: urls[8]
          },
          {
            groupId: '2107',
            name: '桃子',
            thumbnail: urls[9]
          },
          {
            groupId: '2108',
            name: '葡萄',
            thumbnail: urls[10]
          },
          {
            groupId: '2109',
            name: '苹果',
            thumbnail: urls[11]
          },
          {
            groupId: '2110',
            name: '芒果',
            thumbnail: urls[12]
          },
          {
            groupId: '2111',
            name: '火龙果',
            thumbnail: urls[13]
          }
        ],
      }],
    },
   
    
  ];
  } catch (error) {
    console.error('[getCategoryList] 获取分类列表失败:', error);
    // 返回默认数据
    return [{
      groupId: '1000',
      name: '土地',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '1100',
        name: '土地',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
            groupId: '1101',
            name: '土地',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '1102',
            name: '池塘',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '1103',
            name: '果树',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          }
        ],
      }],
    },
    {
      groupId: '2000',
      name: '农产品',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '2100',
        name: '农产品',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
            groupId: '2101',
            name: '橘子',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '2102',
            name: '西瓜',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '2103',
            name: '梨',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '2104',
            name: '柚子',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '2105',
            name: '樱桃',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '2106',
            name: '香蕉',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '2107',
            name: '桃子',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '2108',
            name: '葡萄',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '2109',
            name: '苹果',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '2110',
            name: '芒果',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          },
          {
            groupId: '2111',
            name: '火龙果',
            thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png'
          }
        ],
      }],
    }
  ];
  }
}