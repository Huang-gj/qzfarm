import request from '/@/utils/request';

// 农产品订单类型定义
export interface GoodOrder {
    id: number;
    del_state: number; // 0-正常 1-删除
    del_time: string; // 删除时间
    create_time: string; // 创建时间
    good_order_id: number; // 分布式唯一ID
    image_urls: string; // 图片信息（JSON字符串或逗号分隔）
    good_id: number; // 关联商品ID
    farm_id: number; // 商品所属农场ID
    user_id: number; // 关联用户ID
    user_address: string; // 用户所在地址
    farm_address: string; // 农场所在地址
    price: number; // 价格
    units: string; // 单位（个/斤/千克等）
    count: number; // 购买数量
    detail: string; // 订单详情
    order_status: string;
}

// 土地订单类型定义
export interface LandOrder {
    id: number; // 主键ID
    del_state: number; // 0-正常 1-删除
    del_time: string; // 删除时间
    create_time: string; // 创建时间
    land_order_id: number; // 分布式唯一ID
    image_urls: string; // 图片信息
    land_id: number; // 关联土地ID
    farm_id: number; // 所属农场ID
    user_id: number; // 用户ID
    farm_address: string; // 农场地址
    price: number; // 租赁价格
    count: number; // 租赁时长
    detail: string; // 订单详情
    order_status: string;
}

// 获取农产品订单请求参数
export interface GetGoodOrderRequest {
    farm_id: number;
}

// 获取农产品订单响应
export interface GetGoodOrderResponse {
    code: number;
    msg: string;
    good_order: GoodOrder[];
}

// 获取土地订单请求参数
export interface GetLandOrderRequest {
    farm_id: number;
}

// 获取土地订单响应
export interface GetLandOrderResponse {
    code: number;
    msg: string;
    land_order: LandOrder[];
}

/**
 * 获取农产品订单
 * @param params 
 * @returns 
 */
export function getGoodOrder(params: GetGoodOrderRequest) {
    return request({
        url: '/api/getGoodOrder',
        method: 'post',
        data: params,
    });
}

/**
 * 获取土地订单
 * @param params 
 * @returns 
 */
export function getLandOrder(params: GetLandOrderRequest) {
    return request({
        url: '/api/getLandOrder',
        method: 'post',
        data: params,
    });
} 