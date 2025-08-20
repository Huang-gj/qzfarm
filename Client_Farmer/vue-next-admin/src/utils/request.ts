import axios, { AxiosInstance } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Session } from '/@/utils/storage';
import qs from 'qs';

// 配置新建一个 axios 实例
const service: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 50000,
	headers: { 'Content-Type': 'application/json' },
	paramsSerializer: {
		serialize(params) {
			return qs.stringify(params, { allowDots: true });
		},
	},
});

// 添加请求拦截器
service.interceptors.request.use(
	(config) => {
		// 在发送请求之前做些什么 token
		if (Session.get('token')) {
			config.headers!['Authorization'] = `${Session.get('token')}`;
		}
		
		// 特殊处理FormData类型的请求
		if (config.data instanceof FormData) {
			// 删除默认的Content-Type，让浏览器自动设置(包含boundary)
			delete config.headers!['Content-Type'];
			console.log('request.ts - 检测到FormData，已删除Content-Type让浏览器自动设置');
		}
		
		// 添加请求调试信息（仅针对农场相关API）
		if (config.url?.includes('/api/updateFarmInfo') || config.url?.includes('/api/bindFarm')) {
			console.log('request.ts - 发送请求:', {
				url: config.url,
				method: config.method,
				data: config.data,
				dataType: config.data?.constructor?.name,
				headers: config.headers,
				token: Session.get('token') ? '已设置' : '未设置'
			});
			
			// 如果是FormData，打印其内容
			if (config.data instanceof FormData) {
				console.log('request.ts - FormData 内容:');
				for (let pair of config.data.entries()) {
					console.log(`  ${pair[0]}: ${pair[1]}`);
				}
			}
		}
		
		return config;
	},
	(error) => {
		// 对请求错误做些什么
		console.error('request.ts - 请求错误:', error);
		return Promise.reject(error);
	}
);

// 添加响应拦截器
service.interceptors.response.use(
	(response) => {
		// 对响应数据做点什么
		const res = response.data;
		console.log('request.ts - 原始响应:', response); // 调试日志
		console.log('request.ts - 响应数据:', res); // 调试日志
		
		// 对于农场相关API，我们需要返回完整的响应数据，让业务逻辑处理不同的状态码
		if (res.code === 401 || res.code === 4001) {
			// `token` 过期或者账号已在别处登录
			Session.clear(); // 清除浏览器全部临时缓存
			window.location.href = '/'; // 去登录页
			ElMessageBox.alert('你已被登出，请重新登录', '提示', {})
				.then(() => {})
				.catch(() => {});
			return Promise.reject(new Error('登录过期'));
		} else {
			// 返回完整的响应数据，让业务代码处理状态码
			return res;
		}
	},
	(error) => {
		// 对响应错误做点什么
		console.error('request.ts - 响应错误:', error);
		console.error('request.ts - 错误响应数据:', error.response?.data);
		console.error('request.ts - 错误状态码:', error.response?.status);
		
		if (error.response?.status === 400) {
			console.error('request.ts - 400错误详情:', {
				url: error.config?.url,
				method: error.config?.method,
				data: error.config?.data,
				response: error.response?.data
			});
			ElMessage.error(`请求参数错误 (400): ${error.response?.data?.message || error.response?.data?.msg || '请检查请求参数'}`);
		} else if (error.message.indexOf('timeout') != -1) {
			ElMessage.error('网络超时');
		} else if (error.message == 'Network Error') {
			ElMessage.error('网络连接错误');
		} else {
			if (error.response?.data) ElMessage.error(error.response.statusText);
			else ElMessage.error('接口路径找不到');
		}
		return Promise.reject(error);
	}
);

// 导出 axios 实例
export default service;
