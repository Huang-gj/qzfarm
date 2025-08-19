<template>
	<div class="personal-container">
		<div class="personal layout-pd">
			<div class="personal-content">
				<el-row>
					<el-col :xs="24" :sm="16">
					<el-card shadow="hover" header="个人信息">
						<div class="personal-user">
							<div class="personal-user-left">
								<div class="h100 personal-user-left-upload">
									<el-upload
										class="avatar-uploader"
										:show-file-list="false"
										:on-change="onAvatarChange"
										:before-upload="beforeAvatarUpload"
										:auto-upload="false"
										accept="image/*"
									>
										<img :src="state.avatarPreview || userInfo.avatar || 'https://img2.baidu.com/it/u=1978192862,2048448374&fm=253&fmt=auto&app=138&f=JPEG?w=504&h=500'" />
										<div class="avatar-upload-overlay">
											<el-icon class="avatar-upload-icon"><ele-Camera /></el-icon>
											<div class="avatar-upload-text">更换头像</div>
										</div>
									</el-upload>
								</div>
							</div>
							<div class="personal-user-right">
								<el-row>
									<el-col :span="24" class="personal-title mb18">{{ currentTime }}，{{ userInfo.nickname || '智云农庄用户' }}，欢迎使用智慧农业管理系统！</el-col>
									<el-col :span="24">
										<el-row>
											<el-col :xs="24" :sm="8" class="personal-item mb6">
												<div class="personal-item-label">管理员ID：</div>
												<div class="personal-item-value">{{ userInfo.admin_id || '未知' }}</div>
											</el-col>
											<el-col :xs="24" :sm="16" class="personal-item mb6">
												<div class="personal-item-label">身份：</div>
												<div class="personal-item-value">超级管理</div>
											</el-col>
										</el-row>
									</el-col>
									<el-col :span="24">
										<el-row>
											<el-col :xs="24" :sm="8" class="personal-item mb6">
												<div class="personal-item-label">昵称：</div>
												<div class="personal-item-value">{{ userInfo.nickname || '未设置' }}</div>
											</el-col>
											<el-col :xs="24" :sm="16" class="personal-item mb6">
												<div class="personal-item-label">手机号：</div>
												<div class="personal-item-value">{{ userInfo.phone_number || '未设置' }}</div>
											</el-col>
										</el-row>
									</el-col>
									<el-col :span="24">
										<el-row>
											<el-col :xs="24" :sm="24" class="personal-item mb6">
												<div class="personal-item-label">邮箱：</div>
												<div class="personal-item-value">{{ userInfo.qq_email || '未设置' }}</div>
											</el-col>
										</el-row>
									</el-col>
								</el-row>
							</div>
						</div>
					</el-card>
				</el-col>

				<el-col :xs="24" :sm="8" class="pl15 personal-info">
					<el-card shadow="hover">
						<template #header>
							<span>消息通知</span>
						</template>
						<div class="personal-info-box">
							<ul class="personal-info-ul">
								<li v-for="(v, k) in state.newsInfoList" :key="k" class="personal-info-li">
									<a :href="v.link" target="_block" class="personal-info-li-title">{{ v.title }}</a>
								</li>
							</ul>
						</div>
					</el-card>
				</el-col>

				<el-col :span="24">
					<el-card shadow="hover" class="mt15 personal-edit" header="更新信息">
						<div class="personal-edit-title">基本信息</div>
						<el-form :model="state.personalForm" size="default" label-width="40px" class="mt35 mb35">
							<el-row :gutter="35">
								<el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" class="mb20">
									<el-form-item label="ID">
										<el-input v-model="state.personalForm.admin_id" placeholder="ID" disabled></el-input>
									</el-form-item>
								</el-col>
								<el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" class="mb20">
									<el-form-item label="昵称">
										<el-input v-model="state.personalForm.nickname" placeholder="请输入昵称" clearable></el-input>
									</el-form-item>
								</el-col>
								<el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" class="mb20">
									<el-form-item label="手机">
										<el-input v-model="state.personalForm.phone_number" placeholder="手机号" disabled></el-input>
									</el-form-item>
								</el-col>
								<el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" class="mb20">
									<el-form-item label="邮箱">
										<el-input v-model="state.personalForm.qq_email" placeholder="请输入邮箱" clearable></el-input>
									</el-form-item>
								</el-col>
								<el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" class="mb20">
									<el-form-item label="头像">
										<el-input v-model="state.personalForm.avatar" placeholder="点击左侧头像进行更换" disabled></el-input>
									</el-form-item>
								</el-col>
								<el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4" class="mb20">
									<el-form-item label="身份">
										<el-input v-model="state.personalForm.role" placeholder="超级管理" disabled></el-input>
									</el-form-item>
								</el-col>
								<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
									<el-form-item>
										<el-button type="primary" @click="handleUpdatePersonalInfo" :loading="updateLoading.value">
											<el-icon>
												<ele-Position />
											</el-icon>
											{{ state.avatarFile ? '更新个人信息和头像' : '更新个人信息' }}
										</el-button>
										<div v-if="state.avatarFile" class="mt5" style="font-size: 12px; color: var(--el-color-warning);">
											已选择新头像，点击按钮将同时更新头像和个人信息
										</div>
									</el-form-item>
								</el-col>
							</el-row>
						</el-form>
						<div class="personal-edit-title mb15">账号安全</div>
						<div class="personal-edit-safe-box">
							<div class="personal-edit-safe-item">
								<div class="personal-edit-safe-item-left">
									<div class="personal-edit-safe-item-left-label">账户密码</div>
									<div class="personal-edit-safe-item-left-value">已设置</div>
								</div>
								<div class="personal-edit-safe-item-right">
									<el-button text type="primary" @click="showPasswordDialog">立即修改</el-button>
								</div>
							</div>
						</div>
						<div class="personal-edit-safe-box">
							<div class="personal-edit-safe-item">
								<div class="personal-edit-safe-item-left">
									<div class="personal-edit-safe-item-left-label">密保手机</div>
									<div class="personal-edit-safe-item-left-value">已绑定手机：{{ formatPhoneNumber(userInfo.phone_number) }}</div>
								</div>
								<div class="personal-edit-safe-item-right">
									<el-button text type="primary" @click="showPhoneDialog">立即修改</el-button>
								</div>
							</div>
						</div>
					</el-card>
				</el-col>
			</el-row>
			</div>
		</div>
		<!-- 修改密码对话框 -->
		<el-dialog v-model="dialogState.passwordDialogVisible" title="修改密码" width="400px" :close-on-click-modal="false">
			<el-form :model="passwordForm" label-width="100px">
				<el-form-item label="原密码">
					<el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password></el-input>
				</el-form-item>
				<el-form-item label="新密码">
					<el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password></el-input>
				</el-form-item>
				<el-form-item label="确认密码">
					<el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogState.passwordDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="handleUpdatePassword" :loading="updateLoading.value">确认修改</el-button>
				</span>
			</template>
		</el-dialog>
		<!-- 修改手机号对话框 -->
		<el-dialog v-model="dialogState.phoneDialogVisible" title="修改手机号" width="400px" :close-on-click-modal="false">
			<el-form :model="phoneForm" label-width="100px">
				<el-form-item label="新手机号">
					<el-input v-model="phoneForm.newPhoneNumber" placeholder="请输入新手机号"></el-input>
				</el-form-item>
				<el-form-item label="密码">
					<el-input v-model="phoneForm.password" type="password" placeholder="请输入密码" show-password></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogState.phoneDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="handleUpdatePhoneNumber" :loading="updateLoading.value">确认修改</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="personal">
import { reactive, computed, onMounted, onUnmounted } from 'vue';
import { formatAxis } from '/@/utils/formatTime';
import { newsInfoList } from './mock';
import { ElMessage } from 'element-plus';
import { useUserInfoStore } from '/@/stores/userInfo';
import { updateAdmin, getAdminInfo, updatePass, updatePhoneNumber, updateAvatar } from '/@/api/auth';
import { Session } from '/@/utils/storage';
import type { UploadProps, UploadFile } from 'element-plus';

// 获取用户信息store
const userInfoStore = useUserInfoStore();

// 定义变量内容
const state = reactive<PersonalState>({
	newsInfoList,
	recommendList: [], // 添加缺失的字段
	personalForm: {
		admin_id: '',
		nickname: '',
		phone_number: '',
		qq_email: '',
		avatar: '',
		role: '超级管理',
	},
	avatarFile: null as File | null, // 存储选择的头像文件
	avatarPreview: '', // 头像预览URL
});

// 更新状态
const updateLoading = reactive({
	value: false,
});

// 对话框状态
const dialogState = reactive({
	passwordDialogVisible: false,
	phoneDialogVisible: false,
});

// 修改密码表单
const passwordForm = reactive({
	oldPassword: '',
	newPassword: '',
	confirmPassword: '',
});

// 修改手机号表单
const phoneForm = reactive({
	newPhoneNumber: '',
	password: '',
});

// 获取用户信息
const userInfo = computed(() => {
	const info = userInfoStore.getUserInfo || {
		admin_id: 0,
		phone_number: '',
		avatar: '',
		nickname: '',
		qq_email: '',
		gender: 0,
		farm_id: 0,
	};
	return info;
});

// 当前时间提示语
const currentTime = computed(() => {
	return formatAxis(new Date());
});



// 初始化表单数据
const initFormData = () => {
	if (userInfo.value) {
		state.personalForm = {
			admin_id: userInfo.value.admin_id?.toString() || '',
			nickname: userInfo.value.nickname || '',
			phone_number: userInfo.value.phone_number || '',
			qq_email: userInfo.value.qq_email || '',
			avatar: userInfo.value.avatar || '', // 提示用户如何更换头像
			role: '超级管理',
		};
		// 清除头像选择状态
		state.avatarFile = null;
		state.avatarPreview = '';
	}
};

// 组件挂载时初始化数据
onMounted(() => {
	initFormData();
});

// 组件卸载时清理状态
onUnmounted(() => {
	// 清理对话框状态
	dialogState.passwordDialogVisible = false;
	dialogState.phoneDialogVisible = false;
	
	// 清理表单状态
	passwordForm.oldPassword = '';
	passwordForm.newPassword = '';
	passwordForm.confirmPassword = '';
	phoneForm.newPhoneNumber = '';
	phoneForm.password = '';
	
	// 清理加载状态
	updateLoading.value = false;
});



// 格式化手机号码（隐藏中间4位）
const formatPhoneNumber = (phoneNumber: string): string => {
	if (!phoneNumber || phoneNumber.length !== 11) {
		return '未设置';
	}
	return phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};







// 更新个人信息
const handleUpdatePersonalInfo = async () => {
	try {
		updateLoading.value = true;
		
		// 获取当前用户信息作为默认值
		const currentUserInfo = userInfo.value;
		
		// 如果有选择的头像文件，先上传头像
		if (state.avatarFile) {
			try {
				// 调用头像上传API
				const avatarResponse = await updateAvatar(state.avatarFile, currentUserInfo.admin_id);
				
				if (avatarResponse.code === 200) {
					ElMessage.success('头像更新成功');
					// 清除头像文件和预览
					state.avatarFile = null;
					state.avatarPreview = '';
				} else {
					ElMessage.error(avatarResponse.msg || '头像上传失败');
					return; // 头像上传失败就不继续更新其他信息
				}
			} catch (error) {
				console.error('头像上传失败:', error);
				ElMessage.error('头像上传失败，请重试');
				return;
			}
		}
		
		// 准备更新数据，如果表单为空则使用缓存中的值（手机号不允许修改）
		const updateData = {
			admin_id: parseInt(state.personalForm.admin_id) || currentUserInfo.admin_id,
			nickname: state.personalForm.nickname || currentUserInfo.nickname || '',
			qq_email: state.personalForm.qq_email || currentUserInfo.qq_email || '',
			gender: currentUserInfo.gender || 0,
		};
		
		// 调用更新接口
		const response = await updateAdmin(updateData);
		
		if (response.code === 200) {
			ElMessage.success('个人信息更新成功');
			
			// 获取最新的用户信息
			const adminInfoResponse = await getAdminInfo({ admin_id: updateData.admin_id });
			
			if (adminInfoResponse.code === 200) {
				// 更新缓存中的用户信息
				userInfoStore.updateUserInfo(adminInfoResponse.admin);
				
				// 重新初始化表单数据
				initFormData();
				
				ElMessage.success('用户信息已刷新');
			} else {
				ElMessage.error('获取最新用户信息失败');
			}
		} else {
			ElMessage.error(response.msg || '更新失败');
		}
	} catch (error) {
		console.error('更新个人信息失败:', error);
		ElMessage.error('更新个人信息失败，请重试');
	} finally {
		updateLoading.value = false;
	}
};

// 显示修改密码对话框
const showPasswordDialog = () => {
	dialogState.passwordDialogVisible = true;
	// 清空表单
	passwordForm.oldPassword = '';
	passwordForm.newPassword = '';
	passwordForm.confirmPassword = '';
};

// 显示修改手机号对话框
const showPhoneDialog = () => {
	dialogState.phoneDialogVisible = true;
	// 清空表单
	phoneForm.newPhoneNumber = '';
	phoneForm.password = '';
};

// 处理修改密码
const handleUpdatePassword = async () => {
	try {
		// 验证表单
		if (!passwordForm.oldPassword) {
			ElMessage.error('请输入原密码');
			return;
		}
		if (!passwordForm.newPassword) {
			ElMessage.error('请输入新密码');
			return;
		}
		if (!passwordForm.confirmPassword) {
			ElMessage.error('请确认新密码');
			return;
		}
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			ElMessage.error('两次输入的密码不一致');
			return;
		}
		
		updateLoading.value = true;
		
		// 调用修改密码API
		const response = await updatePass({
			admin_id: userInfo.value.admin_id,
			password: passwordForm.newPassword,
		});
		
		if (response.code === 200) {
			ElMessage.success('密码修改成功，请重新登录');
			dialogState.passwordDialogVisible = false;
			// 退出登录
			userInfoStore.clearUserInfo();
			// 清除token
			Session.clear();
			// 跳转到登录页
			window.location.href = '/login';
		} else {
			ElMessage.error(response.msg || '密码修改失败');
		}
	} catch (error) {
		console.error('修改密码失败:', error);
		ElMessage.error('修改密码失败，请重试');
	} finally {
		updateLoading.value = false;
	}
};

// 处理修改手机号
const handleUpdatePhoneNumber = async () => {
	try {
		// 验证表单
		if (!phoneForm.newPhoneNumber) {
			ElMessage.error('请输入新手机号');
			return;
		}
		if (!phoneForm.password) {
			ElMessage.error('请输入密码');
			return;
		}
		// 验证手机号格式
		if (!/^1[3-9]\d{9}$/.test(phoneForm.newPhoneNumber)) {
			ElMessage.error('请输入正确的手机号格式');
			return;
		}
		
		updateLoading.value = true;
		
		// 调用修改手机号API
		const response = await updatePhoneNumber({
			admin_id: userInfo.value.admin_id,
			phone_number: phoneForm.newPhoneNumber,
			password: phoneForm.password,
		});
		
		if (response.code === 200) {
			ElMessage.success('手机号修改成功，请重新登录');
			dialogState.phoneDialogVisible = false;
			// 退出登录
			userInfoStore.clearUserInfo();
			// 清除token
			Session.clear();
			// 跳转到登录页
			window.location.href = '/login';
		} else {
			ElMessage.error(response.msg || '手机号修改失败');
		}
	} catch (error) {
		console.error('修改手机号失败:', error);
		ElMessage.error('修改手机号失败，请重试');
	} finally {
		updateLoading.value = false;
	}
};

// 头像上传前的验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
	// 检查文件类型
	const isImage = rawFile.type.startsWith('image/');
	if (!isImage) {
		ElMessage.error('只能上传图片文件!');
		return false;
	}
	
	// 检查文件大小（限制为5MB）
	const isLt5M = rawFile.size / 1024 / 1024 < 5;
	if (!isLt5M) {
		ElMessage.error('图片大小不能超过 5MB!');
		return false;
	}
	
	return true;
};

// 头像文件选择变化时的处理
const onAvatarChange: UploadProps['onChange'] = (uploadFile: UploadFile) => {
	if (!uploadFile.raw) {
		return;
	}
	
	// 验证文件
	const isValid = beforeAvatarUpload(uploadFile.raw);
	if (!isValid) {
		return;
	}
	
	// 存储选择的文件
	state.avatarFile = uploadFile.raw;
	
	// 创建预览URL
	const reader = new FileReader();
	reader.onload = (e) => {
		state.avatarPreview = e.target?.result as string;
	};
	reader.readAsDataURL(uploadFile.raw);
	
	ElMessage.success('头像已选择，点击"更新个人信息"按钮完成更新');
};
</script>

<style scoped lang="scss">
@import '../../theme/mixins/index.scss';
.personal {
	.personal-user {
		height: 130px;
		display: flex;
		align-items: center;
		.personal-user-left {
			width: 100px;
			height: 100px;
			border-radius: 3px;
			:deep(.el-upload) {
				height: 100%;
			}
			.personal-user-left-upload {
				img {
					width: 100%;
					height: 100%;
					border-radius: 3px;
					object-fit: cover;
				}
				&:hover {
					img {
						animation: logoAnimation 0.3s ease-in-out;
					}
				}
			}
		}
		.personal-user-right {
			flex: 1;
			padding: 0 15px;
			.personal-title {
				font-size: 18px;
				@include text-ellipsis(1);
			}
			.personal-item {
				display: flex;
				align-items: center;
				font-size: 13px;
				.personal-item-label {
					color: var(--el-text-color-secondary);
					@include text-ellipsis(1);
				}
				.personal-item-value {
					@include text-ellipsis(1);
				}
			}
		}
	}
	.personal-info {
		.personal-info-box {
			height: 130px;
			overflow-y: auto;
			overflow-x: hidden;
			padding-right: 5px;
			
			/* 自定义滚动条样式 */
			&::-webkit-scrollbar {
				width: 6px;
			}
			
			&::-webkit-scrollbar-track {
				background: var(--el-border-color-lighter);
				border-radius: 3px;
			}
			
			&::-webkit-scrollbar-thumb {
				background: var(--el-border-color-dark);
				border-radius: 3px;
				
				&:hover {
					background: var(--el-color-primary);
				}
			}
			
			.personal-info-ul {
				list-style: none;
				margin: 0;
				padding: 0;
				
				.personal-info-li {
					font-size: 13px;
					padding-bottom: 10px;
					margin-right: 5px;
					
					.personal-info-li-title {
						display: inline-block;
						@include text-ellipsis(1);
						color: var(--el-text-color-secondary);
						text-decoration: none;
						line-height: 1.4;
					}
					
					& a:hover {
						color: var(--el-color-primary);
						cursor: pointer;
					}
				}
			}
		}
	}
	.personal-recommend-row {
		.personal-recommend-col {
			.personal-recommend {
				position: relative;
				height: 100px;
				border-radius: 3px;
				overflow: hidden;
				cursor: pointer;
				&:hover {
					i {
						right: 0px !important;
						bottom: 0px !important;
						transition: all ease 0.3s;
					}
				}
				i {
					position: absolute;
					right: -10px;
					bottom: -10px;
					font-size: 70px;
					transform: rotate(-30deg);
					transition: all ease 0.3s;
				}
				.personal-recommend-auto {
					padding: 15px;
					position: absolute;
					left: 0;
					top: 5%;
					color: var(--next-color-white);
					.personal-recommend-msg {
						font-size: 12px;
						margin-top: 10px;
					}
				}
			}
		}
	}
	.personal-edit {
		.personal-edit-title {
			position: relative;
			padding-left: 10px;
			color: var(--el-text-color-regular);
			&::after {
				content: '';
				width: 2px;
				height: 10px;
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				background: var(--el-color-primary);
			}
		}
		.personal-edit-safe-box {
			border-bottom: 1px solid var(--el-border-color-light, #ebeef5);
			padding: 15px 0;
			.personal-edit-safe-item {
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: space-between;
				.personal-edit-safe-item-left {
					flex: 1;
					overflow: hidden;
					.personal-edit-safe-item-left-label {
						color: var(--el-text-color-regular);
						margin-bottom: 5px;
					}
					.personal-edit-safe-item-left-value {
						color: var(--el-text-color-secondary);
						@include text-ellipsis(1);
						margin-right: 15px;
					}
				}
			}
			&:last-of-type {
				padding-bottom: 0;
				border-bottom: none;
			}
		}
	}
	.avatar-uploader {
		position: relative;
		width: 100%;
		height: 100%;
		
		:deep(.el-upload) {
			width: 100%;
			height: 100%;
			border-radius: 3px;
			cursor: pointer;
			position: relative;
			overflow: hidden;
			transition: var(--el-transition-duration-fast);
			
			&:hover {
				.avatar-upload-overlay {
					opacity: 1;
				}
			}
		}
		
		img {
			width: 100%;
			height: 100%;
			border-radius: 3px;
			object-fit: cover;
		}
		
		.avatar-upload-overlay {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.6);
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			opacity: 0;
			transition: opacity 0.3s ease;
			
			.avatar-upload-icon {
				font-size: 24px;
				color: white;
				margin-bottom: 8px;
			}
			
			.avatar-upload-text {
				color: white;
				font-size: 12px;
			}
		}
	}
	
	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 100px;
		height: 100px;
		text-align: center;
		line-height: 100px;
	}
	
	.avatar {
		width: 100px;
		height: 100px;
		display: block;
		border-radius: 6px;
	}
}
</style>
