import request from '/@/utils/request';

// 农场类型定义
export interface Farm {
    farm_id: number;    // 对应后端FarmID
    farm_name: string;  // 对应后端FarmName
    description: string; // 对应后端Description
    address: string;    // 对应后端Address
    logo_url: string;   // 对应后端LogoURL
    image_urls: string; // 对应后端ImageURLs，注意：后端是[]byte，前端传string
    contact_phone: string; // 对应后端ContactPhone
    // 注意：后端Farm结构体中没有Status字段，所以这里移除
}

// 获取农场信息请求参数
export interface GetFarmRequest {
    admin_id: number;   // 对应后端AdminID
}

// 获取农场信息响应
export interface GetFarmResponse {
    code: number;       // 对应后端Code
    msg: string;        // 对应后端Msg
    farm?: Farm;        // 对应后端Farm
    Farm?: Farm;        // 兼容大写
    Msg?: string;       // 兼容大写
}

// 绑定农场信息
export interface BindFarm {
    farm_name: string;   // 对应后端FarmName
    description: string; // 对应后端Description
    address: string;     // 对应后端Address
    logo_url: string;    // 对应后端LogoURL
    image_urls: string;  // 对应后端ImageURLs，注意：后端是[]byte，前端传string
    contact_phone: string; // 对应后端ContactPhone
}

// 绑定农场请求参数
export interface BindFarmRequest {
    admin_id: number;    // 对应后端AdminID
    bind_farm: BindFarm; // 对应后端BindFarm
}

// 绑定农场响应
export interface BindFarmResponse {
    code: number;        // 对应后端Code
    msg: string;         // 对应后端Msg
    farm_id?: number;    // 新增：后端返回的农场ID
    Code?: number;       // 兼容大写
    Msg?: string;        // 兼容大写
    FarmID?: number;     // 兼容大写
}

// 更新农场信息相关接口
export interface UpdateFarmInfoRequest {
    del: number;         // 对应后端Del
    status: number;      // 对应后端Status
    farm: Farm;          // 对应后端Farm
}

export interface UpdateFarmInfoResponse {
    code: number;        // 对应后端Code
    msg: string;         // 对应后端Msg
}

/**
 * 获取农场信息
 * @param params 
 * @returns 
 */
export function getFarm(params: GetFarmRequest) {
    return request({
        url: '/api/getFarm',
        method: 'post',
        data: params,
    });
}

/**
 * 绑定农场信息
 * @param params 
 * @returns 
 */
export function bindFarm(params: BindFarmRequest) {
    return request({
        url: '/api/bindFarm',
        method: 'post',
        data: params,
    });
}

/**
 * 更新农场信息接口
 * @param params 
 * @returns 
 */
export function updateFarmInfo(params: UpdateFarmInfoRequest) {
    return request({ url: '/api/updateFarmInfo', method: 'post', data: params });
} 

// 获取农场总数据
export interface GetTotalDataRequest {
    farm_id: number;
}

export interface GetTotalDataResponse {
    code: number;
    msg: string;
    good_order_count: number;
    sale_order_count: number;
    good_sale_count: number;
    land_sale_count: number;
    sys_use_count: number;
}

export function getTotalData(params: GetTotalDataRequest): Promise<GetTotalDataResponse> {
    return request.post('/api/getTotalData', params);
} 

// 销售数据接口
export interface SaleData {
    farm_id: number;
    stat_date: string;
    good_order_count: number;
    land_order_count: number;
    good_sale_count: number;
    land_sale_count: number;
    sys_use_count: number;
}

// 获取一年销售趋势数据
export interface GetLastOneYearSaleDataRequest {
    farm_id: number;
}

export interface GetLastOneYearSaleDataResponse {
    code: number;
    msg: string;
    one_year_sale_data: SaleData[];
}

export function getLastOneYearSaleData(params: GetLastOneYearSaleDataRequest): Promise<GetLastOneYearSaleDataResponse> {
    return request.post('/api/getLastOneYearSaleData', params);
} 

// 销售总结相关接口
export interface SaleSummaryRequest {
    farm_id: number;
    start_date: string; // 格式: YYYY-MM-DD
    end_date: string;   // 格式: YYYY-MM-DD
}

export interface SaleSummaryResponse {
    code: number;
    msg: string;
    sale_data: SaleData[];
}

export function getSaleSummary(params: SaleSummaryRequest): Promise<SaleSummaryResponse> {
    return request.post('/api/saleSummary', params);
}

// 添加农场图片请求/响应类型
export interface AddFarmPicRequest {
    farm_id: number;
}

export interface AddFarmPicResponse {
    code: number;
    msg: string;
}

// 添加农场主图片请求/响应类型
export interface AddFarmMainPicRequest {
    farm_id: number;
}

export interface AddFarmMainPicResponse {
    code: number;
    msg: string;
}

/**
 * 为农场添加图片
 * @param file 图片文件
 * @param farmId 农场ID
 * @returns Promise<AddFarmPicResponse>
 */
export function addFarmPic(file: File, farmId: number): Promise<AddFarmPicResponse> {
    console.log('addFarmPic函数调用 - farmId:', farmId, 'file:', file.name);
    
    const formData = new FormData();
    formData.append('farm_id', farmId.toString());
    formData.append('file', file);
    
    console.log('AddFarmPic FormData内容:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }
    
    return request({
        url: '/api/AddFarmPicInfo',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60秒超时
    });
}

/**
 * 为农场添加主图片(Logo)
 * @param file 图片文件
 * @param farmId 农场ID
 * @returns Promise<AddFarmMainPicResponse>
 */
export function addFarmMainPic(file: File, farmId: number): Promise<AddFarmMainPicResponse> {
    console.log('addFarmMainPic函数调用 - farmId:', farmId, 'file:', file.name);
    
    const formData = new FormData();
    formData.append('farm_id', farmId.toString());
    formData.append('file', file); // 与活动上传保持一致的字段名
    
    console.log('AddFarmMainPic FormData内容:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }
    
    return request({
        url: '/api/AddFarmMainPic',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60秒超时
    });
} 