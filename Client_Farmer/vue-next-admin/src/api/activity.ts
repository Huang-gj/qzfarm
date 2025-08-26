import request from '/@/utils/request';

// 活动数据类型定义
export interface Activity {
	activity_id?: number;
	farm_id: number;
	main_pic: string;
	image_urls: string[] | string; // 支持数组或JSON字符串
	title: string;
	text: string;
	start_time: string;
	end_time: string;
}

// 获取主图片请求/响应类型
export interface GetMainPicRequest {
	farm_id: number;
}

export interface GetMainPicResponse {
	code: number;
	msg: string;
	activity_ids: number[];
	main_pics: string[];
	title: string[];
}

// 获取活动详情请求/响应类型
export interface GetActivityDetailRequest {
	activity_id: number;
}

export interface GetActivityDetailResponse {
	code: number;
	msg: string;
	activities: Activity;
}

// 添加活动请求/响应类型
export interface AddActivityRequest {
	activity: Activity;
}

export interface AddActivityResponse {
	activity_id: number;
	code: number;
	msg: string;
}

// 添加图片请求/响应类型
export interface AddPicRequest {
	farm_id: number;
	activity_id: number;
}

export interface AddPicResponse {
	code: number;
	msg: string;
}

/**
 * 获取农场活动主图片列表
 * @param farmId 农场ID
 * @returns Promise<GetMainPicResponse>
 */
export function getMainPic(farmId: number): Promise<GetMainPicResponse> {
	return request({
		url: '/api/GetMainPic',
		method: 'post',
		data: {
			farm_id: farmId,
		},
	});
}

/**
 * 获取活动详情
 * @param activityId 活动ID
 * @returns Promise<GetActivityDetailResponse>
 */
export function getActivityDetail(activityId: number): Promise<GetActivityDetailResponse> {
	return request({
		url: '/api/GetActivityDetail',
		method: 'post',
		data: {
			activity_id: activityId,
		},
	});
}

/**
 * 添加新活动
 * @param activity 活动数据
 * @returns Promise<AddActivityResponse>
 */
export function addActivity(activity: Activity): Promise<AddActivityResponse> {
	return request({
		url: '/api/AddActivity',
		method: 'post',
		data: {
			activity,
		},
	});
}

/**
 * 为活动添加图片
 * @param farmId 农场ID
 * @param activityId 活动ID
 * @param files 图片文件数组
 * @returns Promise<AddPicResponse>
 */
export function addActivityPic(farmId: number, activityId: number, files: File[]): Promise<AddPicResponse> {
	const formData = new FormData();
	formData.append('farm_id', farmId.toString());
	formData.append('activity_id', activityId.toString());
	
	// 添加图片文件
	files.forEach((file) => {
		formData.append('images', file);
	});
	
	return request({
		url: '/api/AddPic',
		method: 'post',
		data: formData,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		timeout: 60000, // 60秒超时
	});
}

/**
 * 为活动添加单个图片文件
 * @param farmId 农场ID
 * @param activityId 活动ID
 * @param file 单个图片文件
 * @returns Promise<AddPicResponse>
 */
export function addActivitySinglePic(farmId: number, activityId: number, file: File): Promise<AddPicResponse> {
	const formData = new FormData();
	formData.append('farm_id', farmId.toString());
	formData.append('activity_id', activityId.toString());
	
	// 添加单个图片文件
	formData.append('images', file);
	
	return request({
		url: '/api/AddPic',
		method: 'post',
		data: formData,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		timeout: 60000, // 60秒超时
	});
}