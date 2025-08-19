import {
  mockIp,
  mockReqId
} from '../utils/mock';
import {
  genPicURL
} from '../utils/genURL'

export async function genCartGroupData() {
  // 首先尝试从本地存储获取购物车数据
  const cartData = wx.getStorageSync('cart_data');

  // 如果本地有购物车数据，直接返回
  if (cartData) {
    return {
      data: cartData,
      code: 'Success',
      msg: null,
      requestId: mockReqId(),
      clientIp: mockIp(),
      rt: 269,
      success: true,
    };
  }

  // // 如果本地没有数据，则生成mock数据
  // const urls = await Promise.all([
  //   genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/products/橘子.jpg'),
  //   genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/products/西瓜.jpg'),
  //   genPicURL('cloud://cloud1-2gorklioe3299acb.636c-cloud1-2gorklioe3299acb-1349055645/products/梨.jpg')
  // ])
  // const resp = {
  //   data: {
  //     isNotEmpty: true,
  //     storeGoods: [{
  //       storeId: '1000',
  //       storeName: '云Mall深圳旗舰店',
  //       storeStatus: 1,
  //       totalDiscountSalePrice: '9990',
  //       promotionGoodsList: [{
  //           title: '满减满折回归',
  //           promotionCode: 'MERCHANT',
  //           promotionSubCode: 'MYJ',
  //           promotionId: '159174555838121985',
  //           tagText: ['满100元减99.9元'],
  //           promotionStatus: 3,
  //           tag: '满减',
  //           description: '满100元减99.9元,已减99.9元',
  //           doorSillRemain: null,
  //           isNeedAddOnShop: 0,
  //           goodsPromotionList: [{
  //               uid: '88888888205468',
  //               saasId: '88888888',
  //               storeId: '1000',
  //               good_id: '18',
  //               skuId: '135681631',
  //               isSelected: 1,
  //               thumb: urls[0],
  //               title: '橘子',
  //               primaryImage: urls[0],
  //               quantity: 1,
  //               stockStatus: true,
  //               stockQuantity: 177,
  //               price: '29800',
  //               originPrice: '40000',
  //               tagPrice: null,
  //               titlePrefixTags: null,
  //               roomId: null,
  //               specInfo: [{
  //                   specTitle: '颜色',
  //                   specValue: '米色荷叶边',
  //                 },
  //                 {
  //                   specTitle: '尺码',
  //                   specValue: 'M',
  //                 },
  //               ],
  //               joinCartTime: '2020-06-29T07:55:27.000+0000',
  //               available: 1,
  //               putOnSale: 1,
  //               etitle: null,
  //             },

  //             {
  //               uid: '88888888205468',
  //               saasId: '88888888',
  //               storeId: '1000',
  //               good_id: '7',
  //               skuId: '135681625',
  //               isSelected: 1,
  //               thumb: urls[2],
  //               title: '梨',
  //               primaryImage: urls[2],
  //               quantity: 1,
  //               stockStatus: true,
  //               stockQuantity: 0,
  //               price: '29900',
  //               originPrice: '29900',
  //               tagPrice: null,
  //               titlePrefixTags: null,
  //               roomId: null,
  //               specInfo: [{
  //                   specTitle: '颜色',
  //                   specValue: '奶黄色',
  //                 },
  //                 {
  //                   specTitle: '数量',
  //                   specValue: '六件套',
  //                 },
  //               ],
  //               joinCartTime: '2020-06-29T07:55:00.000+0000',
  //               available: 1,
  //               putOnSale: 1,
  //               etitle: null,
  //             },
  //           ],
  //           lastJoinTime: '2020-06-29T07:55:40.000+0000',
  //         },

  //       ],
  //       lastJoinTime: '2020-06-29T07:55:40.000+0000',
  //       postageFreePromotionVo: {
  //         title: null,
  //         promotionCode: null,
  //         promotionSubCode: null,
  //         promotionId: null,
  //         tagText: null,
  //         promotionStatus: null,
  //         tag: null,
  //         description: null,
  //         doorSillRemain: null,
  //         isNeedAddOnShop: 0,
  //       },
  //     }, ],
  //     invalidGoodItems: [{
  //       uid: '88888888205468',
  //       saasId: '88888888',
  //       storeId: '1000',
  //       good_id: '1',
  //       skuId: '135691631',
  //       isSelected: 1,
  //       thumb: urls[1],
  //       title: '西瓜',
  //       primaryImage: urls[1],
  //       quantity: 8,
  //       stockStatus: true,
  //       stockQuantity: 177,
  //       price: '26900',
  //       originPrice: '31900',
  //       tagPrice: null,
  //       tagText: null,
  //       roomId: null,
  //       specInfo: [{
  //           specTitle: '颜色',
  //           specValue: '白色',
  //         },
  //         {
  //           specTitle: '尺码',
  //           specValue: 'S',
  //         },
  //       ],
  //       joinCartTime: '2020-04-28T04:03:59.000+0000',
  //       available: 1,
  //       putOnSale: 1,
  //       etitle: null,
  //     }, ],
  //     isAllSelected: false,
  //     selectedGoodsCount: 16,
  //     totalAmount: '179997',
  //     totalDiscountAmount: '110000',
  //   },
  //   code: 'Success',
  //   msg: null,
  //   requestId: mockReqId(),
  //   clientIp: mockIp(),
  //   rt: 269,
  //   success: true,
  // };
  // return resp;
}