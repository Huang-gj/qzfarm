import { defineStore } from 'pinia';
import Cookies from 'js-cookie';

// 用户信息接口
export interface UserInfo {
	admin_id: number;
	phone_number: string;
	avatar: string;
	nickname: string;
	qq_email: string;
	gender: number;
	farm_id: number;
}

// 登录响应接口
export interface LoginResponse {
	code: number;
	msg: string;
	admin: UserInfo;
	accessToken: string;
	accessExpire: number;
	refreshAfter: number;
}

// 兼容原有的用户信息接口
export interface UserInfosState {
	userInfos: {
		userName: string;
		photo: string;
		time: number;
		roles: Array<string>;
		authBtnList: Array<string>;
	};
}

// 保持向后兼容的useUserInfo
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		userInfos: {
			userName: '',
			photo: '',
			time: 0,
			roles: [],
			authBtnList: [],
		},
	}),
	actions: {
		async setUserInfos() {
			// 存储用户信息到浏览器缓存
			const userInfoStr = sessionStorage.getItem('userInfo');
			if (userInfoStr) {
				const userInfo = JSON.parse(userInfoStr);
				this.userInfos = {
					userName: userInfo.nickname || userInfo.phone_number,
					photo: userInfo.avatar || '',
					time: new Date().getTime(),
					roles: ['admin', 'common'], // 给予所有权限
					authBtnList: ['btn.add', 'btn.del', 'btn.edit', 'btn.link'],
				};
			} else {
				// 所有用户都有完整权限
				const userName = Cookies.get('userName') || 'admin';
				this.userInfos = {
						userName: userName,
					photo: userName === 'admin' 
								? 'https://img2.baidu.com/it/u=1978192862,2048448374&fm=253&fmt=auto&app=138&f=JPEG?w=504&h=500'
								: 'https://img2.baidu.com/it/u=2370931438,70387529&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
						time: new Date().getTime(),
					roles: ['admin', 'common'], // 给予所有权限
					authBtnList: ['btn.add', 'btn.del', 'btn.edit', 'btn.link'],
				};
			}
		},
	},
});

// 新的用户信息store
export const useUserInfoStore = defineStore('userInfoStore', {
	state: (): {
		userInfo: UserInfo | null;
		accessToken: string;
		accessExpire: number;
		refreshAfter: number;
	} => ({
		userInfo: null,
		accessToken: '',
		accessExpire: 0,
		refreshAfter: 0,
	}),
	getters: {
		// 获取用户信息
		getUserInfo: (state) => state.userInfo,
		// 获取token
		getAccessToken: (state) => state.accessToken,
		// 检查是否已登录
		isLoggedIn: (state) => !!state.accessToken && !!state.userInfo,
	},
	actions: {
		// 设置登录信息
		setLoginInfo(loginResponse: LoginResponse) {
			this.userInfo = loginResponse.admin;
			this.accessToken = loginResponse.accessToken;
			this.accessExpire = loginResponse.accessExpire;
			this.refreshAfter = loginResponse.refreshAfter;
			
			// 保存到本地存储
			sessionStorage.setItem('userInfo', JSON.stringify(loginResponse.admin));
			sessionStorage.setItem('accessToken', loginResponse.accessToken);
			sessionStorage.setItem('accessExpire', loginResponse.accessExpire.toString());
			sessionStorage.setItem('refreshAfter', loginResponse.refreshAfter.toString());
		},
		
		// 从本地存储恢复用户信息
		restoreUserInfo() {
			const userInfoStr = sessionStorage.getItem('userInfo');
			const accessToken = sessionStorage.getItem('accessToken');
			const accessExpire = sessionStorage.getItem('accessExpire');
			const refreshAfter = sessionStorage.getItem('refreshAfter');
			
			if (userInfoStr && accessToken) {
				this.userInfo = JSON.parse(userInfoStr);
				this.accessToken = accessToken;
				this.accessExpire = parseInt(accessExpire || '0');
				this.refreshAfter = parseInt(refreshAfter || '0');
			}
		},
		
		// 清除用户信息
		clearUserInfo() {
			this.userInfo = null;
			this.accessToken = '';
			this.accessExpire = 0;
			this.refreshAfter = 0;
			
			// 清除本地存储
			sessionStorage.removeItem('userInfo');
			sessionStorage.removeItem('accessToken');
			sessionStorage.removeItem('accessExpire');
			sessionStorage.removeItem('refreshAfter');
		},
		
		// 更新用户信息
		updateUserInfo(admin: UserInfo) {
			this.userInfo = admin;
			// 更新本地存储
			sessionStorage.setItem('userInfo', JSON.stringify(admin));
		},
	},
});
