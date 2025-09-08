/* eslint-disable no-param-reassign */
import { config } from '../../config/index';
const { post } = require('../_utils/request');
import { genPicURL, getFirstImageUrl } from '../../utils/genURL';

function pickFirstImage(raw) {
  if (!raw) return '';
  let candidate = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[')) {
      try {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr) && arr.length > 0) {
          candidate = arr[0];
        }
      } catch (e) {
        candidate = trimmed;
      }
    } else if (trimmed.includes(',')) {
      candidate = trimmed.split(',')[0];
    } else {
      candidate = trimmed;
    }
  } else if (Array.isArray(raw) && raw.length > 0) {
    candidate = raw[0];
  }
  return candidate || '';
}

function resolveImageURL(raw) {
  // 使用新的getFirstImageUrl函数
  return getFirstImageUrl(raw);
}

/** 后端检索接口 */
export async function getSearchResult(params) {
  const keyword = params.keyword || params.keywords || '';
  const reqBody = { keyword };

  const resp = await post('http://8.133.19.244:8889/commodity/searchProduct', reqBody);
  const goods = Array.isArray(resp?.goods) ? resp.goods : [];
  const lands = Array.isArray(resp?.lands) ? resp.lands : [];

  const mappedGoods = goods.map((g) => {
    const img = resolveImageURL(g.ImageUrls || g.image_urls);
    return {
      good_id: g.GoodId ?? g.good_id ?? g.id,
      title: g.Title ?? g.title,
      price: parseFloat(g.Price ?? g.price ?? 0),
      originPrice: parseFloat(g.Price ?? g.price ?? 0),
      primaryImage: img,
      thumb: img,
      farm_id: g.FarmId ?? g.farm_id,
      units: g.Units ?? g.units ?? '个',
      repertory: g.Repertory ?? g.repertory ?? 0,
      detail: g.Detail ?? g.detail ?? '',
      spuTagList: [],
    };
  });

  const mappedLands = lands.map((l) => {
    const img = resolveImageURL(l.ImageUrls || l.image_urls);
    return {
      good_id: l.LandId ?? l.land_id ?? l.id,
      title: l.LandName ?? l.land_name ?? '土地',
      price: parseFloat(l.Price ?? l.price ?? 0),
      originPrice: parseFloat(l.Price ?? l.price ?? 0),
      primaryImage: img,
      thumb: img,
      farm_id: l.FarmId ?? l.farm_id,
      units: '个月',
      repertory: 1,
      detail: l.Detail ?? l.detail ?? '',
      spuTagList: [],
      isLand: true,
    };
  });

  const spuList = [...mappedGoods, ...mappedLands];
  return {
    spuList,
    totalCount: spuList.length,
  };
}
