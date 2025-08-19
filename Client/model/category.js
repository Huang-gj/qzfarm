export async function getCategoryList() {
  try {
    // 直接使用阿里云OSS的图片URL，不需要异步转换
    const urls = [
      // 土地分类图片
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/lands_image_url/土地.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/lands_image_url/池塘.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/lands_image_url/果树.jpg',
      
      // 农产品分类图片
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/橘子.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/西瓜.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/梨.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/柚子.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/樱桃.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/香蕉.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/桃子.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/葡萄.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/苹果.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/芒果.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/火龙果.jpg'
    ];
    return [{
      groupId: '1000', // 一级分类用千位
      name: '土地',
      thumbnail: 'https://via.placeholder.com/100x100?text=土地',
      children: [{
        groupId: '1100', // 二级分类用百位
        name: '土地',
        thumbnail: 'https://via.placeholder.com/100x100?text=土地',
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
      thumbnail: 'https://via.placeholder.com/100x100?text=农产品',
      children: [{
        groupId: '2100',
        name: '农产品',
        thumbnail: 'https://via.placeholder.com/100x100?text=农产品',
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
    // 返回使用阿里云OSS URL的默认数据
    return [{
      groupId: '1000',
      name: '土地',
      thumbnail: 'https://via.placeholder.com/100x100?text=土地',
      children: [{
        groupId: '1100',
        name: '土地',
        thumbnail: 'https://via.placeholder.com/100x100?text=土地',
        children: [{
            groupId: '1101',
            name: '土地',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/lands_image_url/土地.jpg'
          },
          {
            groupId: '1102',
            name: '池塘',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/lands_image_url/池塘.jpg'
          },
          {
            groupId: '1103',
            name: '果树',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/lands_image_url/果树.jpg'
          }
        ],
      }],
    },
    {
      groupId: '2000',
      name: '农产品',
      thumbnail: 'https://via.placeholder.com/100x100?text=农产品',
      children: [{
        groupId: '2100',
        name: '农产品',
        thumbnail: 'https://via.placeholder.com/100x100?text=农产品',
        children: [{
            groupId: '2101',
            name: '橘子',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/橘子.jpg'
          },
          {
            groupId: '2102',
            name: '西瓜',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/西瓜.jpg'
          },
          {
            groupId: '2103',
            name: '梨',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/梨.jpg'
          },
          {
            groupId: '2104',
            name: '柚子',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/柚子.jpg'
          },
          {
            groupId: '2105',
            name: '樱桃',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/樱桃.jpg'
          },
          {
            groupId: '2106',
            name: '香蕉',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/香蕉.jpg'
          },
          {
            groupId: '2107',
            name: '桃子',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/桃子.jpg'
          },
          {
            groupId: '2108',
            name: '葡萄',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/葡萄.jpg'
          },
          {
            groupId: '2109',
            name: '苹果',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/苹果.jpg'
          },
          {
            groupId: '2110',
            name: '芒果',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/芒果.jpg'
          },
          {
            groupId: '2111',
            name: '火龙果',
            thumbnail: 'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/火龙果.jpg'
          }
        ],
      }],
    }
  ];
  }
}