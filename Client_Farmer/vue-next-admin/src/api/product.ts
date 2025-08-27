import request from '/@/utils/request';

export interface Good {
  id: number;
  del_state: number;
  del_time: string;
  create_time: string;
  good_id: number;
  good_name: string;
  // 新增：商品标签
  good_tag?: string;
  farm_id: number;
  image_urls: string[] | string; // 后端为[]string，前端支持数组或JSON字符串
  price: number;
  units: string;
  repertory: number;
  detail: string; // 后端为[]byte，前端按字符串处理（可能为base64）
}

export interface Land {
  id: number;
  del_state: number;
  del_time: string;
  create_time: string;
  land_id: number;
  farm_id: number;
  land_name: string;
  // 新增：土地标签
  land_tag?: string;
  area: string;
  image_urls: string[] | string; // 后端为[]string，前端支持数组或JSON字符串
  price: number;
  detail: string; // 后端为[]byte
  sale_status: number;
  sale_time: string;
}

export interface GetProductRequest {
  product_type: number; // 1=Good, 2=Land
  farm_id: number;
}

export interface GetProductResponse {
  good?: Good[];
  land?: Land[];
  Code?: number;
  code?: number;
  Msg?: string;
  msg?: string;
}

// 新增资源
export type GoodPayload = Partial<Good>;
export type LandPayload = Partial<Land>;

export interface AddProductRequest {
  product_type: number; // 1=Good, 2=Land
  farm_id: number;
  good_id: number; // 农产品ID，添加农产品时为0，添加土地时为0
  land_id: number; // 土地ID，添加土地时为0，添加农产品时为0
  good?: GoodPayload;
  land?: LandPayload;
}

export interface AddProductResponse {
  good_id?: number;
  land_id?: number;
  code?: number;
  Code?: number;
  msg?: string;
  Msg?: string;
}

// 修改资源
export interface UpdateProductRequest {
  farm_id: number;
  product_type: number; // 1=Good, 2=Land
  good_id: number; // 农产品ID，更新农产品时使用实际ID，更新土地时为0
  land_id: number; // 土地ID，更新土地时使用实际ID，更新农产品时为0
  good?: GoodPayload;
  land?: LandPayload;
}

export interface UpdateProductResponse {
  code?: number;
  Code?: number;
  msg?: string;
  Msg?: string;
}

// 删除资源
export interface DelProductRequest {
  farm_id: number;
  product_type: number; // 1=Good, 2=Land
  good_id: number;
  land_id: number;
}

export interface DelProductResponse {
  code?: number;
  Code?: number;
  msg?: string;
  Msg?: string;
}

export function getProduct(data: GetProductRequest) {
  return request({
    url: '/api/getProduct',
    method: 'post',
    data,
  }) as Promise<GetProductResponse>;
}

export function addProduct(data: AddProductRequest) {
  return request({
    url: '/api/addProduct',
    method: 'post',
    data,
  }) as Promise<AddProductResponse>;
}

export function updateProduct(data: UpdateProductRequest) {
  return request({
    url: '/api/updateProduct',
    method: 'post',
    data,
  }) as Promise<UpdateProductResponse>;
}

export function delProduct(data: DelProductRequest) {
  return request({
    url: '/api/delProduct',
    method: 'post',
    data,
  }) as Promise<DelProductResponse>;
} 