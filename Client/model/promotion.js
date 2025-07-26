import { getGoodsList } from './goods';
//生成促销活动（Promotion）数据，主要包括商品列表、促销横幅（banner）图片、活动时间等信息
export function getPromotion(baseID = 0, length = 10) {
  return {
    list: getGoodsList(baseID, length).map((item) => {
      return {
        good_id: item.good_id,
        thumb: item.primaryImage,
        title: item.title,
        price: item.minSalePrice,
        originPrice: item.maxLinePrice,
        tags: item.spuTagList.map((tag) => ({ title: tag.title })),
      };
    }),
    banner:
      'https://cdn-we-retail.ym.tencent.com/tsr/promotion/banner-promotion.png',
    time: 1000 * 60 * 60 * 20,
    showBannerDesc: true,
    statusTag: 'running',
  };
}
