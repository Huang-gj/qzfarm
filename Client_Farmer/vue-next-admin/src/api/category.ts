import request from '/@/utils/request';

// 类目类型定义
export interface Category {
    category_id: number;    // 对应后端CategoryID
    name: string;          // 对应后端Name
    category_type: number; // 对应后端CategoryType，1=农产品类目，2=土地类目
    text: string;          // 对应后端Text，类目描述/备注
    image_url: string;     // 对应后端ImageUrl，类目图片
}

// 新增类目请求参数
export interface AddCategoryRequest {
    category: Category;    // 对应后端Category（JSON标签是小写category）
}

// 新增类目响应
export interface AddCategoryResponse {
    category_id?: number; // 对应后端CategoryID（小写）
    code?: number;        // 对应后端Code（小写）
    msg?: string;         // 对应后端Msg（小写）
    CategoryID?: number;  // 对应后端CategoryID（大写）
    Code?: number;        // 对应后端Code（大写）
    Msg?: string;         // 对应后端Msg（大写）
}

// 获取类目请求参数
export interface GetCategoryRequest {
    categoryType: number; // 对应后端CategoryType，1=农产品类目，2=土地类目
}

// 获取类目响应
export interface GetCategoryResponse {
    category: Category[]; // 对应后端category
    code: number;         // 对应后端code
    msg: string;          // 对应后端msg
}

/**
 * 新增类目
 * @param params 新增类目请求参数
 * @returns Promise<AddCategoryResponse>
 */
export function addCategory(params: AddCategoryRequest): Promise<AddCategoryResponse> {
    return request({
        url: '/api/AddCategory',
        method: 'post',
        data: params,
    });
}

/**
 * 获取类目列表
 * @param params 获取类目请求参数
 * @returns Promise<GetCategoryResponse>
 */
export function getCategory(params: GetCategoryRequest): Promise<GetCategoryResponse> {
    return request({
        url: '/api/GetCategory',
        method: 'post',
        data: params,
    });
}

// 新增类目图片请求参数
export interface AddCategoryPicRequest {
    category_id: number;  // 对应后端CategoryID
}

// 新增类目图片响应
export interface AddCategoryPicResponse {
    code: number;         // 对应后端Code
    msg: string;          // 对应后端Msg
}

/**
 * 为类目添加图片
 * @param file 图片文件
 * @param categoryId 类目ID
 * @returns Promise<AddCategoryPicResponse>
 */
export function addCategoryPic(file: File, categoryId: number): Promise<AddCategoryPicResponse> {
    console.log('addCategoryPic函数调用 - categoryId:', categoryId, 'file:', file.name);
    
    const formData = new FormData();
    formData.append('category_id', categoryId.toString());
    formData.append('file', file);
    
    console.log('AddCategoryPic FormData内容:');
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }
    
    return request({
        url: '/api/AddCategoryPic',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60秒超时
    });
}