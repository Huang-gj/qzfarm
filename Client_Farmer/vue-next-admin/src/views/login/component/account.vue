<template>
	<el-form size="large" class="login-content-form">
		<el-form-item class="login-animation1">
			<el-input text placeholder="请输入手机号" v-model="state.ruleForm.userName" clearable autocomplete="off">
				<template #prefix>
					<el-icon class="el-input__icon"><ele-User /></el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation2">
			<el-input
				:type="state.isShowPassword ? 'text' : 'password'"
				:placeholder="$t('message.account.accountPlaceholder2')"
				v-model="state.ruleForm.password"
				autocomplete="off"
			>
				<template #prefix>
					<el-icon class="el-input__icon"><ele-Unlock /></el-icon>
				</template>
				<template #suffix>
					<i
						class="iconfont el-input__icon login-content-password"
						:class="state.isShowPassword ? 'icon-yincangmima' : 'icon-xianshimima'"
						@click="state.isShowPassword = !state.isShowPassword"
					>
					</i>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation3">
			<el-col :span="15">
				<el-input
					text
					maxlength="4"
					:placeholder="$t('message.account.accountPlaceholder3')"
					v-model="state.ruleForm.code"
					clearable
					autocomplete="off"
				>
					<template #prefix>
						<el-icon class="el-input__icon"><ele-Position /></el-icon>
					</template>
				</el-input>
			</el-col>
			<el-col :span="1"></el-col>
			<el-col :span="8">
				<el-button class="login-content-code" v-waves @click="refreshCode">{{ state.verificationCode }}</el-button>
			</el-col>
		</el-form-item>
		<el-form-item class="login-animation4">
			<el-button type="primary" class="login-content-submit" round v-waves @click="onSignIn" :loading="state.loading.signIn">
				<span>{{ $t('message.account.accountBtnText') }}</span>
			</el-button>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts" name="loginAccount">
import { reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useUserInfoStore, useUserInfo } from '/@/stores/userInfo';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { Session } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import { login } from '/@/api/auth';
import { getFarm, type GetFarmRequest } from '/@/api/farm';

// 定义变量内容
const { t } = useI18n();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const userInfoStore = useUserInfoStore();
const userInfo = useUserInfo();
const route = useRoute();
const router = useRouter();
const state = reactive({
	isShowPassword: false,
	ruleForm: {
		userName: '', // 改为手机号输入
		password: '',
		code: '1234',
	},
	verificationCode: '1234',
	loading: {
		signIn: false,
	},
});

// 时间获取
const currentTime = computed(() => {
	return formatAxis(new Date());
});

// 生成随机验证码
const generateRandomCode = () => {
	return Math.floor(1000 + Math.random() * 9000).toString();
};

// 刷新验证码
const refreshCode = () => {
	state.verificationCode = generateRandomCode();
	state.ruleForm.code = ''; // 清空输入框
};

// 检查农场绑定状态
const checkFarmBinding = async () => {
	try {
		const userInfo = userInfoStore.getUserInfo;
		if (!userInfo || !userInfo.admin_id) {
			console.error('用户信息不完整，跳过农场绑定检查');
			return;
		}

		const params: GetFarmRequest = {
			admin_id: userInfo.admin_id
		};

		console.log('登录后检查农场绑定状态...'); // 调试日志
		const response = await getFarm(params);
		console.log('农场绑定检查响应:', response.code, response.msg || response.Msg); // 调试日志

		if (response.code === 200) {
			// 用户已绑定农场，保存农场信息到缓存
			const farmData = response.farm || response.Farm;
			Session.set('farmInfo', farmData);
			console.log('用户已绑定农场，农场信息已保存到缓存'); // 调试日志
		} else if (response.code === 10001) {
			// 用户尚未绑定农场，在登录完成后跳转到农场绑定页面
			console.log('用户尚未绑定农场，将跳转到绑定页面'); // 调试日志
			// 延迟跳转，确保登录流程完成
			setTimeout(() => {
				router.push('/tools');
				ElMessage.warning('检测到您尚未绑定农场，请先完成农场绑定！');
			}, 1000);
		} else {
			console.error('检查农场绑定状态失败:', response.msg || response.Msg);
		}
	} catch (error: any) {
		console.error('检查农场绑定状态异常:', error.message || error);
		// 农场绑定检查失败不影响登录流程，只记录错误
	}
};

// 登录
const onSignIn = async () => {
	// 验证验证码
	if (state.ruleForm.code !== state.verificationCode) {
		ElMessage.error('验证码错误，请重新输入');
		return;
	}
	
	// 验证输入
	if (!state.ruleForm.userName || !state.ruleForm.password) {
		ElMessage.error('请输入手机号和密码');
		return;
	}
	
	state.loading.signIn = true;
	
	try {
		// 调用登录API
		const loginData = {
			phone_number: state.ruleForm.userName,
			password: state.ruleForm.password,
		};
		
		console.log('发送登录请求数据:', loginData); // 添加调试日志
		const response = await login(loginData);
		
		if (response.code === 200) {
			// 登录成功，保存用户信息
			userInfoStore.setLoginInfo(response);
			
			// 更新兼容的用户信息
			await userInfo.setUserInfos();
			
	// 存储 token 到浏览器缓存
			Session.set('token', response.accessToken);
			console.log('保存的token:', response.accessToken);
			console.log('验证token是否保存成功:', Session.get('token'));
			
			// 获取农场信息
			await checkFarmBinding();
			
			// 根据路由配置决定使用前端还是后端控制路由
	if (!themeConfig.value.isRequestRoutes) {
				// 前端控制路由
				await initFrontEndControlRoutes();
				signInSuccess(false); // 直接传入false，表示有权限
			} else {
				// 后端控制路由
				await initBackEndControlRoutes();
				signInSuccess(false); // 直接传入false，表示有权限
			}
	} else {
			// 登录失败
			ElMessage.error(response.msg || '登录失败');
			state.loading.signIn = false;
		}
	} catch (error) {
		console.error('登录请求失败:', error);
		ElMessage.error('网络错误，请稍后重试');
		state.loading.signIn = false;
	}
};

// 登录成功后的跳转
const signInSuccess = (isNoPower: boolean | undefined) => {
	if (isNoPower) {
		ElMessage.warning('抱歉，您没有登录权限');
		sessionStorage.clear();
		userInfoStore.clearUserInfo();
		// 清除兼容的用户信息
		userInfo.userInfos = {
			userName: '',
			photo: '',
			time: 0,
			roles: [],
			authBtnList: [],
		};
	} else {
		// 初始化登录成功时间问候语
		let currentTimeInfo = currentTime.value;
		// 登录成功，跳到转首页
		// 如果是复制粘贴的路径，非首页/登录页，那么登录成功后重定向到对应的路径中
		if (route.query?.redirect) {
			router.push({
				path: <string>route.query?.redirect,
				query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
			});
		} else {
				console.log('准备跳转到首页');
			router.push('/');
		}
		// 登录成功提示
		const signInText = t('message.signInText');
		ElMessage.success(`${currentTimeInfo}，${signInText}`);
			// 移除loading启动，让主布局组件处理
			// NextLoading.start();
	}
	state.loading.signIn = false;
};
</script>

<style scoped lang="scss">
.login-content-form {
	margin-top: 20px;
	@for $i from 1 through 4 {
		.login-animation#{$i} {
			opacity: 0;
			animation-name: error-num;
			animation-duration: 0.5s;
			animation-fill-mode: forwards;
			animation-delay: calc($i/10) + s;
		}
	}
	.login-content-password {
		display: inline-block;
		width: 20px;
		cursor: pointer;
		&:hover {
			color: #909399;
		}
	}
	.login-content-code {
		width: 100%;
		padding: 0;
		font-weight: bold;
		letter-spacing: 5px;
	}
	.login-content-submit {
		width: 100%;
		letter-spacing: 2px;
		font-weight: 300;
		margin-top: 15px;
	}
}
</style>
