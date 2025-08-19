import request from '/@/utils/request';

// 测试请求接口
export interface TestRequest {
	farm_id: number;
	good_id: number;
	land_id: number;
}

// 测试响应接口
export interface TestResponse {
	code: number;
	msg: string;
}

/**
 * 测试文件上传接口
 * @param file 要上传的文件
 * @param farmId 农场ID（从内存中获取）
 * @param goodId 商品ID（固定为10000）
 * @param landId 土地ID（固定为-1）
 * @returns Promise<TestResponse>
 */
export function testFileUpload(
	file: File, 
	farmId: number, 
	goodId: number = 10000, 
	landId: number = -1
): Promise<TestResponse> {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('farm_id', farmId.toString());
	formData.append('good_id', goodId.toString());
	formData.append('land_id', landId.toString());
	
	// 添加调试信息
	console.log('testFileUpload - 发送请求:', {
		url: '/api/test',
		method: 'post',
		data: formData,
		file: file.name,
		farm_id: farmId,
		good_id: goodId,
		land_id: landId
	});
	
	// 调试FormData内容
	console.log('FormData entries:');
	for (let pair of formData.entries()) {
		console.log(pair[0] + ': ' + pair[1]);
	}
	
	return request({
		url: '/api/test',
		method: 'post',
		data: formData,
		// FormData会在request.ts中被特殊处理，自动设置正确的Content-Type
		timeout: 30000, // 30秒超时
	});
} 