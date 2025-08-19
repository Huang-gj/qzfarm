import {
  cdnBase
} from '../config/index';
import {
  genPicURL
} from '../utils/genURL'
const imgPrefix = cdnBase;

const defaultDesc = [`${imgPrefix}/goods/details-1.png`];

// 声明一个变量用于存储转换后的URL
let cachedUrls = null;

// 异步函数用于获取所有所需的图片URL
function getImageUrls() {
  // 如果已经缓存了URLs，直接返回
  if (cachedUrls) {
    return cachedUrls;
  }

  try {
    // 直接使用阿里云OSS图片URL
    cachedUrls = [
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/橘子.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/西瓜.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/梨.jpg',
      'https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/橘子.jpg'
    ];

    return cachedUrls;
  } catch (error) {
    console.error('[getImageUrls] 错误:', error);
    // 出错时返回默认值，避免整个应用崩溃
    return ['https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/images/goods_image_url/橘子.jpg'];
  }
}

// 商品模板数据，使用函数替代常量以便异步获取图片
export async function getAllGoods() {
  console.log('[getAllGoods] 开始获取所有商品数据');

  try {
    // 获取图片URL
    const urls = getImageUrls();
    console.log('[getAllGoods] 获取图片URL成功');

    // 返回商品数据（确保包含梨）
    const goods = [{
        saasId: '88888888',
        storeId: '1000',
        good_id: '0',
        title: '超级大橘子',
        primaryImage: urls[0],
        images: [
          urls[0],
          urls[0]
        ],
        video: null,
        available: 1,
        minSalePrice: 29800,
        minLinePrice: 29800,
        maxSalePrice: 29800,
        maxLinePrice: 40000,
        spuStockQuantity: 510,
        soldNum: 1020,
        isPutOnSale: 1,
        categoryIds: [
          '127880527393854975',
          '127880527393854976',
          '127880537778953984',
          '2000',
          '2100',
          '2101'
        ],
        specList: [{
            specId: '10011',
            title: '单位',
            specValueList: [{
              specValueId: '10012',
              specId: null,
              saasId: null,
              specValue: '斤',
              image: null,
            }, ],
          },



        ],
        skuList: [{
            skuId: '135676631',
            skuImage: urls[0],
            specInfo: [{
                specId: '10011',
                specTitle: null,
                specValueId: '10012',
                specValue: null,
              },
              {
                specId: '10013',
                specTitle: null,
                specValueId: '11014',
                specValue: null,
              },
            ],
            priceInfo: [{
                priceType: 1,
                price: '29800',
                priceTypeName: null
              },
              {
                priceType: 2,
                price: '40000',
                priceTypeName: null
              },
            ],
            stockInfo: {
              stockQuantity: 175,
              safeStockQuantity: 0,
              soldQuantity: 0,
            },
            weight: {
              value: null,
              unit: 'KG'
            },
            volume: null,
            profitPrice: null,
          },
          {
            skuId: '135676632',
            skuImage: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
            specInfo: [{
                specId: '10011',
                specTitle: null,
                specValueId: '10012',
                specValue: null,
              },
              {
                specId: '10013',
                specTitle: null,
                specValueId: '11013',
                specValue: null,
              },
            ],
            priceInfo: [{
                priceType: 1,
                price: '29800',
                priceTypeName: null
              },
              {
                priceType: 2,
                price: '40000',
                priceTypeName: null
              },
            ],
            stockInfo: {
              stockQuantity: 158,
              safeStockQuantity: 0,
              soldQuantity: 0,
            },
            weight: {
              value: null,
              unit: 'KG'
            },
            volume: null,
            profitPrice: null,
          },
          {
            skuId: '135681631',
            skuImage: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
            specInfo: [{
                specId: '10011',
                specTitle: null,
                specValueId: '10012',
                specValue: null,
              },
              {
                specId: '10013',
                specTitle: null,
                specValueId: '10014',
                specValue: null,
              },
            ],
            priceInfo: [{
                priceType: 1,
                price: '29800',
                priceTypeName: null
              },
              {
                priceType: 2,
                price: '40000',
                priceTypeName: null
              },
            ],
            stockInfo: {
              stockQuantity: 177,
              safeStockQuantity: 0,
              soldQuantity: 0,
            },
            weight: {
              value: null,
              unit: 'KG'
            },
            volume: null,
            profitPrice: null,
          },
        ],
        spuTagList: [{
          id: '13001',
          title: '限时抢购',
          image: null
        }],
        limitInfo: [{
          text: '限购5斤',
        }, ],
        desc: [
          'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09c.png',
          'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09d.png',
        ],
        etitle: '',
      },
      {
        saasId: '88888888',
        storeId: '1000',
        good_id: '135686666',
        title: '橘子2',
        primaryImage: urls[3],
        images: [
          urls[3],
          urls[3]
        ],
        video: null,
        available: 1,
        minSalePrice: 100,
        minLinePrice: 1001,
        maxSalePrice: 100,
        maxLinePrice: 1001,
        spuStockQuantity: 510,
        soldNum: 1020,
        isPutOnSale: 1,
        categoryIds: [
          '127880527393854975',
          '127880527393854976',
          '127880537778953984',
          '2000',
          '2100',
          '2101'
        ],
        specList: [{
            specId: '10011',
            title: '颜色',
            specValueList: [{
              specValueId: '10012',
              specId: null,
              saasId: null,
              specValue: '米色荷叶边',
              image: null,
            }, ],
          },
          {
            specId: '10013',
            title: '尺码',
            specValueList: [{
                specValueId: '11014',
                specId: null,
                saasId: null,
                specValue: 'S',
                image: null,
              },
              {
                specValueId: '10014',
                specId: null,
                saasId: null,
                specValue: 'M',
                image: null,
              },
              {
                specValueId: '11013',
                specId: null,
                saasId: null,
                specValue: 'L',
                image: null,
              },
            ],
          },
        ],
        skuList: [{
            skuId: '135676631',
            skuImage: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
            specInfo: [{
                specId: '10011',
                specTitle: null,
                specValueId: '10012',
                specValue: null,
              },
              {
                specId: '10013',
                specTitle: null,
                specValueId: '11014',
                specValue: null,
              },
            ],
            priceInfo: [{
                priceType: 1,
                price: '29800',
                priceTypeName: null
              },
              {
                priceType: 2,
                price: '40000',
                priceTypeName: null
              },
            ],
            stockInfo: {
              stockQuantity: 175,
              safeStockQuantity: 0,
              soldQuantity: 0,
            },
            weight: {
              value: null,
              unit: 'KG'
            },
            volume: null,
            profitPrice: null,
          },
          {
            skuId: '135676632',
            skuImage: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
            specInfo: [{
                specId: '10011',
                specTitle: null,
                specValueId: '10012',
                specValue: null,
              },
              {
                specId: '10013',
                specTitle: null,
                specValueId: '11013',
                specValue: null,
              },
            ],
            priceInfo: [{
                priceType: 1,
                price: '29800',
                priceTypeName: null
              },
              {
                priceType: 2,
                price: '40000',
                priceTypeName: null
              },
            ],
            stockInfo: {
              stockQuantity: 158,
              safeStockQuantity: 0,
              soldQuantity: 0,
            },
            weight: {
              value: null,
              unit: 'KG'
            },
            volume: null,
            profitPrice: null,
          },
          {
            skuId: '135681631',
            skuImage: 'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09a.png',
            specInfo: [{
                specId: '10011',
                specTitle: null,
                specValueId: '10012',
                specValue: null,
              },
              {
                specId: '10013',
                specTitle: null,
                specValueId: '10014',
                specValue: null,
              },
            ],
            priceInfo: [{
                priceType: 1,
                price: '29800',
                priceTypeName: null
              },
              {
                priceType: 2,
                price: '40000',
                priceTypeName: null
              },
            ],
            stockInfo: {
              stockQuantity: 177,
              safeStockQuantity: 0,
              soldQuantity: 0,
            },
            weight: {
              value: null,
              unit: 'KG'
            },
            volume: null,
            profitPrice: null,
          },
        ],
        spuTagList: [{
          id: '13001',
          title: '限时抢购',
          image: null
        }],
        limitInfo: [{
          text: '限购5斤',
        }, ],
        desc: [
          'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09c.png',
          'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-09d.png',
        ],
        etitle: '',
      },
      {
        saasId: '88888888',
        storeId: '1000',
        good_id: '135686633',
        title: '西瓜',
        primaryImage: urls[1],
        minSalePrice: '25900',
        minLinePrice: '31900',
        maxSalePrice: '26900',
        maxLinePrice: '31900',
        isSoldOut: false,
        images: [
          urls[1],

        ],
        groupIdList: ['15029', '14023'],
        categoryIds: [
          '127880527393854975',
          '127880527393854977',
          '127880526789875961',
          '2000',
          '2100',
          '2102'
        ],
        spuTagList: [{
          id: null,
          title: '夏日清凉',
          image: null,
        }],
        skuList: [{
          skuId: '135686634',
          skuImage: null,
          specInfo: [{
              specId: '10000',
              specTitle: null,
              specValueId: '10001',
              specValue: '白色',
            },
            {
              specId: '10002',
              specTitle: null,
              specValueId: '10003',
              specValue: 'M',
            },
          ],
          priceInfo: [{
              priceType: 1,
              price: '25900',
              priceTypeName: '销售价格',
            },
            {
              priceType: 2,
              price: '31900',
              priceTypeName: '划线价格',
            },
          ],
          stockInfo: {
            stockQuantity: 10,
            safeStockQuantity: 0,
            soldQuantity: 0,
          },
          weight: null,
          volume: null,
          profitPrice: null,
        }],
        isAvailable: 1,
        spuStockQuantity: 371,
        soldNum: 1032,
        isPutOnSale: 1,
        desc: [
          'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-08c.png',
          'https://cdn-we-retail.ym.tencent.com/tsr/goods/nz-08d.png',
        ],
        etitle: '',
      },
      {
        saasId: '88888888',
        storeId: '1000',
        good_id: '135681624',
        title: '梨',
        primaryImage: urls[2],
        images: [
          urls[2],

        ],
        video: null,
        available: 1,
        minSalePrice: '19900',
        minLinePrice: '19900',
        maxSalePrice: '29900',
        maxLinePrice: '29900',
        spuStockQuantity: 10,
        soldNum: 102,
        isPutOnSale: 1,
        categoryIds: [
          '127880527393854975',
          '127880527393854977',
          '127880526789875961',
          '2000',
          '2100',
          '2103'
        ],
        specList: [{
            specId: '127904180600844800',
            title: '颜色',
            specValueList: [{
              specValueId: '127904180768617216',
              specId: null,
              saasId: null,
              specValue: '奶黄色',
              image: null,
            }],
          },
          {
            specId: '127904861604820480',
            title: '数量',
            specValueList: [{
                specValueId: '127904862175246592',
                specId: null,
                saasId: null,
                specValue: '三件套',
                image: null,
              },
              {
                specValueId: '127904862007474176',
                specId: null,
                saasId: null,
                specValue: '六件套',
                image: null,
              },
              {
                specValueId: '127904861755815680',
                specId: null,
                saasId: null,
                specValue: '八件套',
                image: null,
              },
            ],
          },
        ],
        skuList: [{
          skuId: '135676625',
          skuImage: null,
          specInfo: [{
              specId: '127904180600844800',
              specTitle: null,
              specValueId: '127904180768617216',
              specValue: null,
            },
            {
              specId: '127904861604820480',
              specTitle: null,
              specValueId: '127904862175246592',
              specValue: null,
            },
          ],
          priceInfo: [{
              priceType: 1,
              price: '19900',
              priceTypeName: null
            },
            {
              priceType: 2,
              price: '29900',
              priceTypeName: null
            },
          ],
          stockInfo: {
            stockQuantity: 10,
            safeStockQuantity: 10,
            soldQuantity: 0,
          },
          weight: {
            value: null,
            unit: 'KG'
          },
          volume: null,
          profitPrice: null,
        }],
        spuTagList: [{
          id: '19011',
          title: '爽梨',
          image: null
        }],
        limitInfo: [{
          text: '限购5斤',
        }, ],
        desc: [
          'https://cdn-we-retail.ym.tencent.com/tsr/goods/gh-2c.png',
          'https://cdn-we-retail.ym.tencent.com/tsr/goods/gh-2d.png',
        ],
        etitle: '',
      }
    ];

    console.log('[getAllGoods] 商品数据准备完成, 共有商品:', goods.length);
    // 打印所有商品标题，帮助调试
    console.log('[getAllGoods] 商品列表:', goods.map(g => g.title));
    return goods;
  } catch (error) {
    console.error('[getAllGoods] 错误:', error);
    throw error;
  }
}

/**
 * 获取指定ID的商品
 * @param {string} id 商品ID
 * @param {number} [available] 库存, 默认1
 */
export async function genGood(id, available = 1) {
  try {
    const allGoods = await getAllGoods();
    console.log('[genGood] 获取到所有商品');

    // 检查id并打印，帮助调试
    console.log(`[genGood] 请求商品ID: ${id}`);

    const specID = ['135681624', '135686633'];
    if (specID.indexOf(id) > -1) {
      console.log('[genGood] 匹配到特定ID商品');
      const goodItem = allGoods.filter((good) => good.good_id === id)[0];
      return goodItem;
    }

    // 根据id返回对应的商品
    // 确保id在有效范围内
    const validIndex = Math.min(id, allGoods.length - 1);
    const item = allGoods[validIndex];
    console.log(`[genGood] 返回商品: ${item.title}, ID: ${id}`);

    return {
      ...item,
      good_id: `${id}`,
      available: available,
      desc: item?.desc || defaultDesc,
      images: item?.images || [item?.primaryImage],
    };
  } catch (error) {
    console.error('[genGood] 错误:', error);
    throw error;
  }
}