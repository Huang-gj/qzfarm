import Cookies from 'js-cookie';

/**
 * 检查token是否过期
 * @returns {boolean} true表示已过期，false表示未过期
 */
export const isTokenExpired = (): boolean => {
	const accessExpire = sessionStorage.getItem('accessExpire');
	if (!accessExpire) {
		return true; // 没有过期时间信息，认为已过期
	}
	
	const expireTime = parseInt(accessExpire);
	const currentTime = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
	
	return currentTime >= expireTime; // 当前时间大于等于过期时间则认为已过期
};

/**
 * window.localStorage 浏览器永久缓存
 * @method set 设置永久缓存
 * @method get 获取永久缓存
 * @method remove 移除永久缓存
 * @method clear 移除全部永久缓存
 */
export const Local = {
	// 查看 v2.4.3版本更新日志
	setKey(key: string) {
		// @ts-ignore
		return `${__NEXT_NAME__}:${key}`;
	},
	// 设置永久缓存
	set<T>(key: string, val: T) {
		window.localStorage.setItem(Local.setKey(key), JSON.stringify(val));
	},
	// 获取永久缓存
	get(key: string) {
		let json = <string>window.localStorage.getItem(Local.setKey(key));
		return JSON.parse(json);
	},
	// 移除永久缓存
	remove(key: string) {
		window.localStorage.removeItem(Local.setKey(key));
	},
	// 移除全部永久缓存
	clear() {
		window.localStorage.clear();
	},
};

/**
 * window.sessionStorage 浏览器临时缓存
 * @method set 设置临时缓存
 * @method get 获取临时缓存
 * @method remove 移除临时缓存
 * @method clear 移除全部临时缓存
 */
export const Session = {
	// 设置临时缓存
	set<T>(key: string, val: T) {
		if (key === 'token') return Cookies.set(key, val);
		window.sessionStorage.setItem(Local.setKey(key), JSON.stringify(val));
	},
	// 获取临时缓存
	get(key: string) {
		if (key === 'token') return Cookies.get(key);
		let json = <string>window.sessionStorage.getItem(Local.setKey(key));
		return JSON.parse(json);
	},
	// 移除临时缓存
	remove(key: string) {
		if (key === 'token') return Cookies.remove(key);
		window.sessionStorage.removeItem(Local.setKey(key));
	},
	// 移除全部临时缓存
	clear() {
		Cookies.remove('token');
		window.sessionStorage.clear();
	},
};
