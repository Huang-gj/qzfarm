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
    genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/categrory/研学.jpg')
  ])
  return [{
      groupId: '24948',
      name: '菜地',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '249481',
        name: '菜地',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
            groupId: '249480',
            name: '菜地',
            thumbnail: urls[0],
          },
          {
            groupId: '249480',
            name: '池塘',
            thumbnail: urls[1],
          },
          {
            groupId: '249480',
            name: '果树',
            thumbnail: urls[2],
          },

        ],
      }, ],
    },
    {
      groupId: '24948',
      name: '瓜果',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '249481',
        name: '瓜果',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
            groupId: '249480',
            name: '橘子',
            thumbnail: urls[3],
          },

        ],
      }, ],
    },
    {
      groupId: '24948',
      name: '蔬菜',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '249481',
        name: '蔬菜',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
            groupId: '249480',
            name: '四季豆',
            thumbnail: urls[4],
          },

        ],
      }, ],
    },
    {
      groupId: '24948',
      name: '线下活动',
      thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
      children: [{
        groupId: '249481',
        name: '线下活动',
        thumbnail: 'https://cdn-we-retail.ym.tencent.com/miniapp/category/category-default.png',
        children: [{
            groupId: '249480',
            name: '研学',
            thumbnail: urls[5],
          },

        ],
      }, ],
    },
  ];
}