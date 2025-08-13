/* eslint-disable no-param-reassign */
import { config } from '../../config/index';
const { post } = require('../_utils/request');
import { genPicURL } from '../../utils/genURL';

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

async function resolveImageURL(raw) {
  const first = pickFirstImage(raw);
  if (!first) return '';
  if (typeof first === 'string' && first.startsWith('cloud://')) {
    try {
      const url = await genPicURL(first);
      return url || first;
    } catch (e) {
      console.error('[fetchSearchResult] genPicURL失败，使用原始fileID:', first, e);
      return first;
    }
  }
  return first;
}

/** 后端检索接口 */
export async function getSearchResult(params) {
  const keyword = params.keyword || params.keywords || '';
  const reqBody = { keyword };

  const resp = await post('/api/searchProduct', reqBody);
  const goods = Array.isArray(resp?.goods) ? resp.goods : [];
  const lands = Array.isArray(resp?.lands) ? resp.lands : [];

  const mappedGoods = await Promise.all(
    goods.map(async (g) => {
      const img = await resolveImageURL(g.ImageUrls || g.image_urls);
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
    })
  );

  const mappedLands = await Promise.all(
    lands.map(async (l) => {
      const img = await resolveImageURL(l.ImageUrls || l.image_urls);
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
    })
  );

  const spuList = [...mappedGoods, ...mappedLands];
  return {
    spuList,
    totalCount: spuList.length,
  };
}
