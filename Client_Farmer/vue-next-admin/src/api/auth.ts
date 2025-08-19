import axios from 'axios';

// 创建axios实例
const api = axios.create({
	baseURL: '/api', // 使用相对路径，配合代理使用
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// 请求拦截器
api.interceptors.request.use(
	(config) => {
		// 添加token等认证信息
		const token = sessionStorage.getItem('accessToken');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		
		// 特殊处理FormData类型的请求
		if (config.data instanceof FormData) {
			// 删除默认的Content-Type，让浏览器自动设置(包含boundary)
			delete config.headers!['Content-Type'];
			console.log('auth.ts - 检测到FormData，已删除Content-Type让浏览器自动设置');
		}
		
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 响应拦截器
api.interceptors.response.use(
	(response) => {
		return response.data;
	},
	(error) => {
		console.error('API请求错误:', error);
		return Promise.reject(error);
	}
);

// 登录接口类型定义
export interface LoginRequest {
	phone_number: string;
	password: string;
}

export interface Admin {
	admin_id: number;
	phone_number: string;
	avatar: string;
	nickname: string;
	qq_email: string;
	gender: number;
	farm_id: number;
}

export interface LoginResponse {
	code: number;
	msg: string;
	admin: Admin;
	accessToken: string;
	accessExpire: number;
	refreshAfter: number;
}

// 更新用户信息接口类型定义
export interface UpdateAdminRequest {
	admin_id: number;
	nickname: string;
	qq_email: string;
	gender: number;
}

export interface UpdateAdminResponse {
	code: number;
	msg: string;
}

// 获取用户信息接口类型定义
export interface GetAdminInfoRequest {
	admin_id: number;
}

export interface GetAdminInfoResponse {
	code: number;
	msg: string;
	admin: Admin;
}

// 登录API
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
	return api.post('/userLogin', data);
};

// 更新用户信息API
export const updateAdmin = async (data: UpdateAdminRequest): Promise<UpdateAdminResponse> => {
	return api.post('/updateAdmin', data);
};

// 修改密码接口类型定义
export interface UpdatePassRequest {
	admin_id: number;
	password: string;
}

export interface UpdatePassResponse {
	code: number;
	msg: string;
}

// 修改手机号接口类型定义
export interface UpdatePhoneNumberRequest {
	admin_id: number;
	phone_number: string;
	password: string;
}

export interface UpdatePhoneNumberResponse {
	code: number;
	msg: string;
}

// 获取用户信息API
export const getAdminInfo = async (data: GetAdminInfoRequest): Promise<GetAdminInfoResponse> => {
	return api.post('/getAdminInfo', data);
};

// 修改密码API
export const updatePass = async (data: UpdatePassRequest): Promise<UpdatePassResponse> => {
	return api.post('/updatePass', data);
};

// 修改手机号API
export const updatePhoneNumber = async (data: UpdatePhoneNumberRequest): Promise<UpdatePhoneNumberResponse> => {
	return api.post('/updatePhoneNumber', data);
};

// 更新头像接口类型定义
export interface UpdateAvatarRequest {
	admin_id: number;
}

export interface UpdateAvatarResponse {
	code: number;
	msg: string;
}

// 更新头像API - 使用文件上传
export const updateAvatar = async (file: File, adminId: number): Promise<UpdateAvatarResponse> => {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('admin_id', adminId.toString());
	
	// 使用现有的api实例，通过Vite代理访问7777端口
	return api.post('/updateAvatar', formData);
};

export default api; 