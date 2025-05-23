import {
  genPicURL
} from '../utils/genURL'
export async function getCategoryList() {
  const urls = await Promise.all([
    genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/菜地.jpg'),
    genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/池塘.jpg'),
    genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/果树.jpg'),
    genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/橘子.jpg'),
    genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/四季豆.jpg'),
    genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/研学.jpg'),
    genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/products/西瓜.jpg'),
    genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/products/梨.jpg')
  ])
  return [{
      groupId: '1000', // 一级分类用千位
      name: '菜地',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '1100', // 二级分类用百位
        name: '菜地',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
            groupId: '1101',
            name: '菜地',
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
      name: '瓜果',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '2100',
        name: '瓜果',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
            groupId: '2101',
            name: '橘子',
            thumbnail: urls[3]
          },
          {
            groupId: '2102',
            name: '西瓜',
            thumbnail: urls[6]
          },
          {
            groupId: '2103',
            name: '梨',
            thumbnail: urls[7]
          }
        ],
      }],
    },
    {
      groupId: '3000',
      name: '蔬菜',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '3100',
        name: '蔬菜',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
          groupId: '3101',
          name: '四季豆',
          thumbnail: urls[4]
        }],
      }],
    },
    {
      groupId: '4000',
      name: '线下活动',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '4100',
        name: '线下活动',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
          groupId: '4101',
          name: '研学',
          thumbnail: urls[5]
        }],
      }],
    },
  ];
}