import request from '/@/utils/request';

// 上传单张图片
export interface UploadImageResponse {
	code: number;
	msg: string;
	url: string; // 返回的图片访问URL
}

// 批量上传图片
export interface BatchUploadResponse {
	code: number;
	msg: string;
	urls: string[]; // 返回的图片URL数组
}

/**
 * 上传单张图片
 * @param file 图片文件
 * @param folder 存储文件夹（可选）
 * @returns Promise<UploadImageResponse>
 */
export function uploadImage(file: File, folder?: string): Promise<UploadImageResponse> {
	const formData = new FormData();
	formData.append('image', file);
	if (folder) {
		formData.append('folder', folder);
	}
	
	return request({
		url: '/api/upload/image',
		method: 'post',
		data: formData,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		timeout: 30000, // 30秒超时
	});
}

/**
 * 批量上传图片
 * @param files 图片文件数组
 * @param folder 存储文件夹（可选）
 * @returns Promise<BatchUploadResponse>
 */
export function batchUploadImages(files: File[], folder?: string): Promise<BatchUploadResponse> {
	const formData = new FormData();
	
	// 添加所有文件
	files.forEach((file, index) => {
		formData.append(`images`, file); // 使用同一个字段名，后端可以接收数组
	});
	
	if (folder) {
		formData.append('folder', folder);
	}
	
	return request({
		url: '/api/upload/batch',
		method: 'post',
		data: formData,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
		timeout: 60000, // 60秒超时（批量上传需要更长时间）
	});
}

/**
 * 上传头像
 * @param file 头像文件
 * @returns Promise<UploadImageResponse>
 */
export function uploadAvatar(file: File): Promise<UploadImageResponse> {
	return uploadImage(file, 'avatars');
}

/**
 * 上传商品图片
 * @param files 商品图片文件数组
 * @returns Promise<BatchUploadResponse>
 */
export function uploadProductImages(files: File[]): Promise<BatchUploadResponse> {
	return batchUploadImages(files, 'products');
}

/**
 * 验证图片文件
 * @param file 文件对象
 * @param maxSize 最大大小（MB），默认10MB
 * @returns 验证结果
 */
export function validateImageFile(file: File, maxSize: number = 10): { valid: boolean; message?: string } {
	// 检查文件类型
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
	if (!allowedTypes.includes(file.type)) {
		return {
			valid: false,
			message: '只支持 JPG、PNG、GIF、WebP 格式的图片'
		};
	}
	
	// 检查文件大小
	const maxSizeBytes = maxSize * 1024 * 1024;
	if (file.size > maxSizeBytes) {
		return {
			valid: false,
			message: `图片大小不能超过 ${maxSize}MB`
		};
	}
	
	return { valid: true };
}

/**
 * 压缩图片（可选功能）
 * @param file 原始图片文件
 * @param quality 压缩质量 0-1
 * @param maxWidth 最大宽度
 * @returns Promise<File>
 */
export function compressImage(file: File, quality: number = 0.8, maxWidth: number = 1920): Promise<File> {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		const img = new Image();
		
		img.onload = () => {
			// 计算新尺寸
			let { width, height } = img;
			if (width > maxWidth) {
				height = (height * maxWidth) / width;
				width = maxWidth;
			}
			
			canvas.width = width;
			canvas.height = height;
			
			// 绘制压缩后的图片
			ctx?.drawImage(img, 0, 0, width, height);
			
			canvas.toBlob(
				(blob) => {
					if (blob) {
						const compressedFile = new File([blob], file.name, {
							type: file.type,
							lastModified: Date.now(),
						});
						resolve(compressedFile);
					} else {
						reject(new Error('图片压缩失败'));
					}
				},
				file.type,
				quality
			);
		};
		
		img.onerror = () => reject(new Error('图片加载失败'));
		img.src = URL.createObjectURL(file);
	});
} 