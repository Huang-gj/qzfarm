import request from '/@/utils/request';

/**
 * 测试文件上传接口
 * @param file 文件对象
 * @param farmId 农场ID
 * @param goodId 商品ID（当资源类型为商品时使用）
 * @param landId 土地ID（当资源类型为土地时使用）
 * @returns Promise<any>
 */
export function testFileUpload(file: File, farmId: number, goodId: number, landId: number): Promise<any> {
	const formData = new FormData();
	formData.append('farm_id', farmId.toString());
	
	if (goodId > 0) {
		formData.append('good_id', goodId.toString());
	}
	if (landId > 0) {
		formData.append('land_id', landId.toString());
	}
	
	// 添加文件，后端期望字段名为"file"
	formData.append('file', file);
	
	return request({
		url: '/api/test',
		method: 'post',
		data: formData,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		timeout: 60000, // 60秒超时
	});
}

/**
 * 活动详情图片上传接口
 * @param file 文件对象
 * @param farmId 农场ID
 * @param activityId 活动ID
 * @returns Promise<any>
 */
export function uploadActivityPic(file: File, farmId: number, activityId: number): Promise<any> {
	console.log('uploadActivityPic函数调用 - farmId:', farmId, 'activityId:', activityId, 'file:', file.name);
	
	const formData = new FormData();
	formData.append('farm_id', farmId.toString());
	formData.append('activity_id', activityId.toString());
	
	// 添加文件，后端期望字段名为"file"
	formData.append('file', file);
	
	console.log('AddPic FormData内容:');
	for (let pair of formData.entries()) {
		console.log(pair[0] + ': ' + pair[1]);
	}
	
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
 * 活动主图片上传接口
 * @param file 文件对象
 * @param farmId 农场ID
 * @param activityId 活动ID
 * @returns Promise<any>
 */
export function uploadActivityMainPic(file: File, farmId: number, activityId: number): Promise<any> {
	console.log('uploadActivityMainPic函数调用 - farmId:', farmId, 'activityId:', activityId, 'file:', file.name);
	
	const formData = new FormData();
	formData.append('farm_id', farmId.toString());
	formData.append('activity_id', activityId.toString());
	
	// 添加文件，后端期望字段名为"file"
	formData.append('file', file);
	
	console.log('AddMainPic FormData内容:');
	for (let pair of formData.entries()) {
		console.log(pair[0] + ': ' + pair[1]);
	}
	
	return request({
		url: '/api/AddMainPic',
		method: 'post',
		data: formData,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		timeout: 60000, // 60秒超时
	});
}