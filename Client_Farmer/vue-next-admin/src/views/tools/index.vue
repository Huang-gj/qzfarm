<template>
	<div class="layout-pd">
		<el-card shadow="hover" header="农场绑定">
			<el-form :model="farmForm" label-width="120px" size="default" class="farm-form">
				<!-- 农场名称 -->
				<el-form-item label="农场名称：">
					<el-input 
						v-model="farmForm.farm_name" 
						placeholder="请输入农场名称" 
						:disabled="isFormDisabled"
						clearable
					></el-input>
				</el-form-item>

				<!-- 农场描述 -->
				<el-form-item label="农场描述：">
					<el-input 
						v-model="farmForm.description" 
						type="textarea" 
						:rows="3"
						placeholder="请输入农场描述" 
						:disabled="isFormDisabled"
						clearable
					></el-input>
				</el-form-item>

				<!-- 农场地址 -->
				<el-form-item label="农场地址：">
					<el-input 
						v-model="farmForm.address" 
						placeholder="请输入农场地址" 
						:disabled="isFormDisabled"
						clearable
					></el-input>
				</el-form-item>

				<!-- 联系电话 -->
				<el-form-item label="联系电话：">
					<el-input 
						v-model="farmForm.contact_phone" 
						placeholder="请输入联系电话" 
						:disabled="isFormDisabled"
						clearable
					></el-input>
				</el-form-item>

				<!-- Logo URL -->
				<el-form-item label="Logo URL：">
					<el-input 
						v-model="farmForm.logo_url" 
						placeholder="请输入Logo图片地址" 
						:disabled="isFormDisabled"
						clearable
					></el-input>
				</el-form-item>

				<!-- 农场图片URLs -->
				<el-form-item label="农场图片：">
					<div class="image-urls-container">
						<div 
							v-for="(url, index) in imageUrlsArray" 
							:key="index" 
							class="image-url-item"
						>
							<el-input 
								v-model="imageUrlsArray[index]" 
								:placeholder="`农场图片${index + 1}地址`" 
								:disabled="isFormDisabled"
								clearable
							>
								<template #append v-if="!isFormDisabled">
									<el-button 
										@click="removeImageUrl(index)" 
										type="danger" 
										:icon="ElIconDelete"
									>删除</el-button>
								</template>
						</el-input>
					</div>
						<el-button 
							v-if="!isFormDisabled && imageUrlsArray.length < 5" 
							@click="addImageUrl" 
							type="primary" 
							plain
							class="mt10"
						>
							<el-icon><ele-Plus /></el-icon>
							添加图片地址
						</el-button>
					</div>
				</el-form-item>

				<!-- 操作按钮 -->
				<el-form-item>
					<div class="button-container">
						<template v-if="!isFarmBound">
							<el-button 
								type="primary" 
								@click="handleBindFarm" 
								:loading="loading"
								:disabled="!isFormValid"
							>
								<el-icon><ele-Connection /></el-icon>
								确认绑定
							</el-button>
						</template>
						<template v-else>
							<div class="bound-actions">
								<el-tag type="success" size="large" class="mr10">
									<el-icon><ele-SuccessFilled /></el-icon>
									农场已绑定
								</el-tag>
								<el-button 
									:type="isEditMode ? 'primary' : 'warning'" 
									@click="handleEditFarm" 
									:loading="loading"
									:disabled="isEditMode && !isFormValid"
								>
									<el-icon>
										<ele-Edit v-if="!isEditMode" />
										<ele-Check v-else />
									</el-icon>
									{{ isEditMode ? '保存修改' : '修改农场信息' }}
								</el-button>
								<el-button 
									v-if="isEditMode"
									type="info" 
									@click="handleCancelEdit"
									:disabled="loading"
									class="ml10"
								>
									<el-icon><ele-Close /></el-icon>
									取消修改
								</el-button>
								<el-button 
									v-if="!isEditMode"
									type="danger" 
									@click="handleUnbindFarm"
									:loading="loading"
								>
									<el-icon><ele-Delete /></el-icon>
									解绑农场
								</el-button>
								<el-button 
									v-if="!isEditMode"
									type="warning" 
									@click="handleToggleOperation"
									:loading="loading"
								>
									<el-icon>
										<ele-VideoPause v-if="!isSuspended" />
										<ele-VideoPlay v-else />
									</el-icon>
									{{ isSuspended ? '开始运营' : '暂停运营' }}
								</el-button>
							</div>
						</template>
					</div>
				</el-form-item>
			</el-form>

			<!-- 农场状态提示 -->
			<el-alert
				v-if="statusMessage"
				:title="statusMessage"
				:type="statusType"
				:closable="false"
				class="mt20"
			/>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="tools">
import { reactive, computed, onMounted, ref } from 'vue';
import { ElMessage, ElIcon, ElMessageBox } from 'element-plus';
import { Delete as ElIconDelete, Plus as ElIconPlus, Connection as ElIconConnection, SuccessFilled as ElIconSuccessFilled, Edit as ElIconEdit, Check as ElIconCheck, Close as ElIconClose, VideoPause as ElIconVideoPause, VideoPlay as ElIconVideoPlay } from '@element-plus/icons-vue';
import { getFarm, bindFarm, updateFarmInfo, type Farm, type GetFarmRequest, type BindFarmRequest, type UpdateFarmInfoRequest } from '/@/api/farm';
import { useUserInfoStore } from '/@/stores/userInfo';
import { Session } from '/@/utils/storage';

// 获取用户信息store
const userInfoStore = useUserInfoStore();

// 状态管理
const isFarmBound = ref(false);
const isEditMode = ref(false); // 新增：编辑模式状态
const isSuspended = ref(false); // 新增：暂停运营状态
const loading = ref(false);
const statusMessage = ref('');
const statusType = ref<'success' | 'warning' | 'error'>('warning');

// 农场表单数据
const farmForm = reactive<Farm>({
	farm_id: 0,
	farm_name: '',
	description: '',
	address: '',
	logo_url: '',
	image_urls: '', // 改为string类型，对应后端[]byte
	contact_phone: '',
	// 移除status字段，因为后端Farm结构体中没有这个字段
});

// 添加单独的status状态管理
const farmStatus = ref(0); // 0: 正常运营, 1: 暂停运营

// 用于前端显示的图片URL数组
const imageUrlsArray = ref<string[]>(['']);

// 计算表单是否禁用
const isFormDisabled = computed(() => {
	// 如果农场已绑定且不在编辑模式，则禁用表单
	return isFarmBound.value && !isEditMode.value;
});

// 计算表单是否有效
const isFormValid = computed(() => {
	return farmForm.farm_name && 
		   farmForm.address && 
		   farmForm.contact_phone && 
		   farmForm.description;
});

// 添加图片URL输入框
const addImageUrl = () => {
	if (imageUrlsArray.value.length < 5) {
		imageUrlsArray.value.push('');
	}
};

// 移除图片URL输入框
const removeImageUrl = (index: number) => {
	if (imageUrlsArray.value.length > 1) {
		imageUrlsArray.value.splice(index, 1);
	}
};

// 测试不同的image_urls值
const testImageUrls = () => {
	console.log('=== 测试不同的image_urls值 ===');
	
	// 测试1: 空字符串
	console.log('测试1 - 空字符串:', '');
	
	// 测试2: null
	console.log('测试2 - null:', null);
	
	// 测试3: 空数组的JSON
	console.log('测试3 - 空数组JSON:', JSON.stringify([]));
	
	// 测试4: 包含URL的数组JSON
	console.log('测试4 - URL数组JSON:', JSON.stringify(['http://example.com/image.jpg']));
	
	// 测试5: Base64编码的空字符串
	console.log('测试5 - Base64编码空字符串:', btoa(''));
	
	// 测试6: Base64编码的空数组JSON
	console.log('测试6 - Base64编码空数组JSON:', btoa(JSON.stringify([])));
	
	console.log('=== 测试结束 ===');
};

// 专门的FarmID获取工具函数
const getFarmId = (): number => {
	console.log('=== getFarmId工具函数执行 ===');
	
	// 1. 优先从当前farmForm获取
	if (farmForm.farm_id && farmForm.farm_id !== 0) {
		console.log('从farmForm获取farm_id:', farmForm.farm_id);
		return farmForm.farm_id;
	}
	
	// 2. 从缓存获取
	const cachedFarmInfo = Session.get('farmInfo');
	if (cachedFarmInfo) {
		const farmId = cachedFarmInfo.farm_id || cachedFarmInfo.FarmID || cachedFarmInfo.farmId || cachedFarmInfo.id || cachedFarmInfo.ID;
		if (farmId && farmId !== 0) {
			console.log('从缓存获取farm_id:', farmId);
			// 同步到farmForm
			farmForm.farm_id = farmId;
			return farmId;
		}
	}
	
	// 3. 从userInfo获取
	const userInfo = userInfoStore.getUserInfo;
	if (userInfo) {
		const farmId = userInfo.farm_id || userInfo.FarmID || userInfo.farmId;
		if (farmId && farmId !== 0) {
			console.log('从userInfo获取farm_id:', farmId);
			// 同步到farmForm
			farmForm.farm_id = farmId;
			return farmId;
		}
	}
	
	console.error('无法获取有效的farm_id');
	return 0;
};

// 获取农场信息
const fetchFarmInfo = async () => {
	try {
		loading.value = true;
		statusMessage.value = '正在获取农场信息...';
		statusType.value = 'info';

		const userInfo = userInfoStore.getUserInfo;
		if (!userInfo || !userInfo.admin_id) {
			throw new Error('用户信息不完整');
		}

		const params: GetFarmRequest = {
			admin_id: userInfo.admin_id
		};

		const response = await getFarm(params);
		console.log('获取农场信息响应:', response.code, response.msg || response.Msg); // 调试日志
		
		if (response.code === 200) {
			const farmData = response.farm || response.Farm;
			console.log('=== FarmID调试 - 后端响应数据检查 ===');
			console.log('19. 后端原始农场数据:', farmData);
			
			// 详细检查所有可能的farm_id字段
			console.log('20. farmData.farm_id:', farmData.farm_id);
			console.log('21. farmData.FarmID:', farmData.FarmID);
			console.log('22. farmData.farmId:', farmData.farmId);
			console.log('23. farmData.id:', farmData.id);
			console.log('24. farmData.ID:', farmData.ID);
			
			// 多层次fallback获取farm_id
			let extractedFarmId = farmData.farm_id || farmData.FarmID || farmData.farmId || farmData.id || farmData.ID;
			console.log('25. 从后端提取到的farm_id:', extractedFarmId);
			console.log('26. farm_id类型:', typeof extractedFarmId);
			
			if (!extractedFarmId || extractedFarmId === 0) {
				console.error('27. 警告：从后端获取的farm_id无效！');
				ElMessage.error('获取到的农场ID无效，请联系管理员');
				return;
			}
			
			// 确保farm_id正确赋值
			farmForm.farm_id = extractedFarmId;
			farmForm.farm_name = farmData.farm_name || farmData.FarmName || '';
			farmForm.description = farmData.description || farmData.Description || '';
			farmForm.address = farmData.address || farmData.Address || '';
			farmForm.logo_url = farmData.logo_url || farmData.LogoURL || '';
			farmForm.contact_phone = farmData.contact_phone || farmData.ContactPhone || '';
			
			// 单独管理status
			farmStatus.value = farmData.status || farmData.Status || 0;
			
			console.log('28. 从后端设置后的farm_id:', farmForm.farm_id);
			console.log('29. 从后端设置后的farmStatus:', farmStatus.value);
			
			// 处理图片URL：后端返回的是字符串，需要转换为数组供前端使用
			if (farmData.image_urls || farmData.ImageURLs) {
				const imageUrlsData = farmData.image_urls || farmData.ImageURLs;
				try {
					// 尝试解析JSON字符串
					const parsedUrls = JSON.parse(imageUrlsData);
					imageUrlsArray.value = Array.isArray(parsedUrls) ? parsedUrls : [imageUrlsData];
				} catch {
					// 如果不是JSON，按逗号分割或作为单个URL
					imageUrlsArray.value = imageUrlsData.includes(',') 
						? imageUrlsData.split(',').filter(url => url.trim())
						: [imageUrlsData];
				}
			} else {
				imageUrlsArray.value = [''];
			}
			
			// 确保至少有一个空输入框
			if (imageUrlsArray.value.length === 0) {
				imageUrlsArray.value = [''];
			}
			
			isFarmBound.value = true;
			isSuspended.value = farmStatus.value === 1; // 检查是否为暂停状态
			statusMessage.value = isSuspended.value ? '农场当前为暂停运营状态' : '农场信息加载成功！';
			statusType.value = isSuspended.value ? 'warning' : 'success';
			
			// 保存到缓存时确保包含正确的farm_id
			const cacheData = { 
				farm_id: farmForm.farm_id,  // 确保farm_id在缓存中
				FarmID: farmForm.farm_id,   // 同时保存大写版本以兼容
				farm_name: farmForm.farm_name,
				description: farmForm.description,
				address: farmForm.address,
				logo_url: farmForm.logo_url,
				image_urls: farmForm.image_urls,
				contact_phone: farmForm.contact_phone,
				status: farmStatus.value 
			};
			console.log('30. 保存到缓存的数据:', cacheData);
			Session.set('farmInfo', cacheData);
			console.log('=== FarmID调试 - 后端处理结束 ===');
			ElMessage.success('农场信息获取成功');
		} else if (response.code === 10001) {
			isFarmBound.value = false;
			isSuspended.value = false;
			statusMessage.value = '您尚未绑定农场，请填写农场信息进行绑定。';
			statusType.value = 'warning';
		} else {
			throw new Error(response.msg || response.Msg || '获取农场信息失败');
		}
	} catch (error: any) {
		console.error('获取农场信息失败:', error.message || error); // 调试日志
		isFarmBound.value = false;
		statusMessage.value = '获取农场信息失败，请检查网络连接或联系管理员。';
		statusType.value = 'error';
		ElMessage.error(error.message || '获取农场信息失败');
	} finally {
		loading.value = false;
	}
};

// 绑定农场
const handleBindFarm = async () => {
	if (!isFormValid.value) {
		ElMessage.warning('请填写完整的农场信息');
		return;
	}

	try {
		loading.value = true;
		
		const userInfo = userInfoStore.getUserInfo;
		if (!userInfo || !userInfo.admin_id) {
			ElMessage.error('用户信息不完整，无法绑定农场');
			return;
		}

		// 将图片URL数组转换为字符串（JSON格式）
		const filteredImageUrls = imageUrlsArray.value.filter(url => url.trim() !== '');
		const imageUrlsString = JSON.stringify(filteredImageUrls);

		const params: BindFarmRequest = {
			admin_id: userInfo.admin_id,
			bind_farm: {
				farm_name: farmForm.farm_name,
				description: farmForm.description,
				address: farmForm.address,
				logo_url: farmForm.logo_url,
				image_urls: imageUrlsString, // 转换为字符串
				contact_phone: farmForm.contact_phone,
				status: 0, // 绑定时设置为0
			}
		};

		const response = await bindFarm(params);
		console.log('绑定农场响应:', response.code, response.msg || response.Msg);

		const isSuccess = response.code === 200 || response.Code === 200 || 
			(response.msg && response.msg.includes('成功')) || 
			(response.Msg && response.Msg.includes('成功'));

		if (isSuccess) {
			ElMessage.success('农场绑定成功！');
			statusMessage.value = '农场绑定成功！正在刷新数据...';
			statusType.value = 'success';
			
			// 重新获取农场信息
			setTimeout(() => {
				fetchFarmInfo();
			}, 1000);
		} else {
			const errorMsg = response.msg || response.Msg || '绑定农场失败';
			throw new Error(errorMsg);
		}
	} catch (error: any) {
		console.error('绑定农场失败:', error);
		ElMessage.error(error.message || '绑定农场失败');
		statusMessage.value = '绑定农场失败，请重试';
		statusType.value = 'error';
	} finally {
		loading.value = false;
	}
};

// 修改农场信息
const handleEditFarm = async () => {
	if (isEditMode.value) {
		// 如果在编辑模式，执行保存操作
		await handleSaveFarmChanges();
	} else {
		// 如果不在编辑模式，进入编辑模式
		isEditMode.value = true;
		statusMessage.value = '现在可以修改农场信息，修改完成后请点击保存';
		statusType.value = 'warning';
	}
};

// 保存农场修改
const handleSaveFarmChanges = async () => {
	if (!isFormValid.value) {
		ElMessage.warning('请填写完整的农场信息');
		return;
	}

	console.log('保存修改 - 当前farmForm:', farmForm);
	console.log('保存修改 - farm_id:', farmForm.farm_id);
	console.log('保存修改 - imageUrlsArray:', imageUrlsArray.value);

	// 使用工具函数获取farm_id
	const farmId = getFarmId();
	if (!farmId || farmId === 0) {
		ElMessage.error('农场ID无效，请刷新页面重试或联系管理员');
		return;
	}
	
	console.log('=== 操作前最终确认 ===');
	console.log('最终使用的farm_id:', farmId);
	console.log('操作类型: 保存农场修改');

	try {
		loading.value = true;
		
		const userInfo = userInfoStore.getUserInfo;
		if (!userInfo || !userInfo.admin_id) {
			ElMessage.error('用户信息不完整，无法修改农场');
			return;
		}

		// 处理图片URL：如果数组为空或只有空字符串，发送空字符串
		const filteredImageUrls = imageUrlsArray.value.filter(url => url.trim() !== '');
		const imageUrlsString = filteredImageUrls.length > 0 ? JSON.stringify(filteredImageUrls) : '';

		// 临时解决方案：如果直接修改失败，可以尝试以下方法
		// 1. 检查后端updateFarmInfo在del=0时的处理逻辑
		// 2. 或者考虑将修改操作拆分为删除+重新绑定的方式
		
		const params: UpdateFarmInfoRequest = {
			del: 0,  // 默认值，不删除
			status: -1,  // 修改信息时status设置为-1
			farm: {
				farm_id: farmId, // 使用确定的farmId
				farm_name: farmForm.farm_name,
				description: farmForm.description,
				address: farmForm.address,
				logo_url: farmForm.logo_url,
				image_urls: '', // 暂时强制设置为空字符串测试
				contact_phone: farmForm.contact_phone
				// 移除status字段，因为后端Farm结构体中没有这个字段
			}
		};

		console.log('修改农场请求参数:', JSON.stringify(params, null, 2));

		const response = await updateFarmInfo(params);
		console.log('修改农场响应:', response.code, response.msg);

		if (response.code === 200) {
			ElMessage.success('农场信息修改成功！');
			statusMessage.value = '农场信息修改成功！';
			statusType.value = 'success';
			
			// 退出编辑模式
			isEditMode.value = false;
			
			// 更新缓存中的农场信息
			const updatedFarmData = {
				...farmForm,
				image_urls: imageUrlsString
			};
			Session.set('farmInfo', updatedFarmData);
			
		} else {
			const errorMsg = response.msg || '修改农场失败';
			throw new Error(errorMsg);
		}
	} catch (error: any) {
		console.error('修改农场失败:', error);
		ElMessage.error(error.message || '修改农场失败');
		statusMessage.value = '修改农场失败，请重试';
		statusType.value = 'error';
	} finally {
		loading.value = false;
	}
};

// 取消编辑
const handleCancelEdit = () => {
	// 退出编辑模式
	isEditMode.value = false;
	
	// 重新加载农场信息，恢复到未修改前的状态
	loadFarmInfoFromCache();
	
	statusMessage.value = '已取消修改，农场信息已恢复';
	statusType.value = 'warning';
	
	ElMessage.info('已取消修改');
};

// 从缓存中加载农场信息
const loadFarmInfoFromCache = () => {
	try {
		const cachedFarmInfo = Session.get('farmInfo');
		console.log('=== FarmID调试 - 缓存数据检查 ===');
		console.log('1. 原始缓存数据:', cachedFarmInfo);
		console.log('2. 缓存数据类型:', typeof cachedFarmInfo);
		console.log('3. 缓存是否为null/undefined:', cachedFarmInfo == null);
		
		if (cachedFarmInfo) {
			// 从缓存中获取到农场信息，说明用户已绑定农场
			const farmData = cachedFarmInfo;
			
			// 详细检查所有可能的farm_id字段
			console.log('4. farmData.farm_id:', farmData.farm_id);
			console.log('5. farmData.FarmID:', farmData.FarmID);
			console.log('6. farmData.farmId:', farmData.farmId);
			console.log('7. farmData.id:', farmData.id);
			console.log('8. farmData.ID:', farmData.ID);
			
			// 多层次fallback获取farm_id
			let extractedFarmId = farmData.farm_id || farmData.FarmID || farmData.farmId || farmData.id || farmData.ID;
			console.log('9. 提取到的farm_id:', extractedFarmId);
			console.log('10. farm_id类型:', typeof extractedFarmId);
			
			// 如果还是没有找到，尝试从其他来源获取
			if (!extractedFarmId || extractedFarmId === 0) {
				console.log('11. 从缓存未找到有效farm_id，尝试从userInfo获取');
				const userInfo = userInfoStore.getUserInfo;
				console.log('12. userInfo:', userInfo);
				console.log('13. userInfo.farm_id:', userInfo?.farm_id);
				console.log('14. userInfo.FarmID:', userInfo?.FarmID);
				
				extractedFarmId = userInfo?.farm_id || userInfo?.FarmID || 0;
				console.log('15. 从userInfo提取的farm_id:', extractedFarmId);
			}
			
			// 如果还是没有，尝试重新从后端获取
			if (!extractedFarmId || extractedFarmId === 0) {
				console.log('16. 仍未找到有效farm_id，重新从后端获取');
				fetchFarmInfo();
				return;
			}
			
			// 确保farm_id正确赋值
			farmForm.farm_id = extractedFarmId;
			farmForm.farm_name = farmData.farm_name || farmData.FarmName || '';
			farmForm.description = farmData.description || farmData.Description || '';
			farmForm.address = farmData.address || farmData.Address || '';
			farmForm.logo_url = farmData.logo_url || farmData.LogoURL || '';
			farmForm.contact_phone = farmData.contact_phone || farmData.ContactPhone || '';
			
			// 单独管理status
			farmStatus.value = farmData.status || farmData.Status || 0;
			
			console.log('17. 最终设置的farm_id:', farmForm.farm_id);
			console.log('18. 最终设置的farmStatus:', farmStatus.value);
			console.log('=== FarmID调试结束 ===');
			
			// 处理图片URL：后端返回的是字符串，需要转换为数组供前端使用
			if (farmData.image_urls || farmData.ImageURLs) {
				const imageUrlsData = farmData.image_urls || farmData.ImageURLs;
				try {
					// 尝试解析JSON字符串
					const parsedUrls = JSON.parse(imageUrlsData);
					imageUrlsArray.value = Array.isArray(parsedUrls) ? parsedUrls : [imageUrlsData];
				} catch {
					// 如果不是JSON，按逗号分割或作为单个URL
					imageUrlsArray.value = imageUrlsData.includes(',') 
						? imageUrlsData.split(',').filter(url => url.trim())
						: [imageUrlsData];
				}
			} else {
				imageUrlsArray.value = [''];
			}
			
			// 确保至少有一个空输入框
			if (imageUrlsArray.value.length === 0) {
				imageUrlsArray.value = [''];
			}
			
			isFarmBound.value = true;
			isSuspended.value = farmStatus.value === 1; // 检查是否为暂停状态
			statusMessage.value = isSuspended.value ? '农场当前为暂停运营状态' : '农场信息加载成功！';
			statusType.value = isSuspended.value ? 'warning' : 'success';
		} else {
			// 缓存中没有农场信息，尝试从后端获取
			console.log('缓存中没有农场信息，尝试从后端获取');
			fetchFarmInfo();
		}
	} catch (error) {
		console.error('从缓存加载农场信息失败:', error);
		// 加载失败，尝试从后端获取
		fetchFarmInfo();
	}
};

// 解绑农场
const handleUnbindFarm = async () => {
	if (loading.value) {
		return;
	}

	// 检查farm_id是否有效
	if (!farmForm.farm_id || farmForm.farm_id === 0) {
		console.error('=== FarmID错误调试 ===');
		console.error('farm_id无效:', farmForm.farm_id);
		console.error('当前farmForm完整数据:', farmForm);
		console.error('当前缓存数据:', Session.get('farmInfo'));
		console.error('当前userInfo:', userInfoStore.getUserInfo);
		console.error('=== 尝试重新加载农场信息 ===');
		
		// 尝试重新从缓存加载
		loadFarmInfoFromCache();
		
		// 如果重新加载后还是无效，则提示错误
		if (!farmForm.farm_id || farmForm.farm_id === 0) {
			ElMessage.error('农场ID无效，请刷新页面重试或联系管理员');
			return;
		}
	}
	
	console.log('=== 操作前最终确认 ===');
	console.log('最终使用的farm_id:', farmForm.farm_id);
	console.log('操作类型: 解绑农场');

	try {
		loading.value = true;
		statusMessage.value = '正在解绑农场...';
		statusType.value = 'warning';

		// 处理图片URL：如果数组为空或只有空字符串，发送空字符串
		const filteredImageUrls = imageUrlsArray.value.filter(url => url.trim() !== '');
		const imageUrlsString = filteredImageUrls.length > 0 ? JSON.stringify(filteredImageUrls) : '';

		const params: UpdateFarmInfoRequest = {
			del: 1,  // 解绑操作
			status: -1,  // 解绑时status设置为-1
			farm: {
				farm_id: farmForm.farm_id,
				farm_name: farmForm.farm_name,
				description: farmForm.description,
				address: farmForm.address,
				logo_url: farmForm.logo_url,
				image_urls: '', // 暂时强制设置为空字符串测试
				contact_phone: farmForm.contact_phone
				// 移除status字段，因为后端Farm结构体中没有这个字段
			}
		};

		console.log('解绑农场请求参数:', JSON.stringify(params, null, 2));

		const response = await updateFarmInfo(params);
		console.log('解绑农场响应:', response.code, response.msg);

		if (response.code === 200) {
			ElMessage.success('农场解绑成功！');
			statusMessage.value = '农场解绑成功！页面将重新加载...';
			statusType.value = 'success';
			
			// 重置状态
			isFarmBound.value = false;
			isEditMode.value = false;
			farmStatus.value = 0; // 重置status状态
			
			// 清空表单数据
			Object.assign(farmForm, {
				farm_id: 0,
				farm_name: '',
				description: '',
				address: '',
				logo_url: '',
				image_urls: '',
				contact_phone: '',
				// 不再包含status字段
			});
			
			// 清空图片URL数组
			imageUrlsArray.value = [''];
			
			// 清空缓存
			Session.remove('farmInfo');
			
			// 延迟刷新页面
			setTimeout(() => {
				location.reload();
			}, 2000);

		} else {
			const errorMsg = response.msg || '解绑农场失败';
			throw new Error(errorMsg);
		}
	} catch (error: any) {
		console.error('解绑农场失败:', error);
		ElMessage.error(error.message || '解绑农场失败');
		statusMessage.value = '解绑农场失败，请重试';
		statusType.value = 'error';
	} finally {
		loading.value = false;
	}
};

// 切换运营状态
const handleToggleOperation = async () => {
	if (loading.value) {
		return;
	}

	// 检查farm_id是否有效
	if (!farmForm.farm_id || farmForm.farm_id === 0) {
		console.error('=== FarmID错误调试 ===');
		console.error('farm_id无效:', farmForm.farm_id);
		console.error('当前farmForm完整数据:', farmForm);
		console.error('当前缓存数据:', Session.get('farmInfo'));
		console.error('当前userInfo:', userInfoStore.getUserInfo);
		console.error('=== 尝试重新加载农场信息 ===');
		
		// 尝试重新从缓存加载
		loadFarmInfoFromCache();
		
		// 如果重新加载后还是无效，则提示错误
		if (!farmForm.farm_id || farmForm.farm_id === 0) {
			ElMessage.error('农场ID无效，请刷新页面重试或联系管理员');
			return;
		}
	}
	
	console.log('=== 操作前最终确认 ===');
	console.log('最终使用的farm_id:', farmForm.farm_id);
	console.log('操作类型: 切换运营状态');

	try {
		loading.value = true;
		statusMessage.value = '正在切换运营状态...';
		statusType.value = 'warning';

		const newStatus = isSuspended.value ? 0 : 1; // 要切换到的新状态
		
		// 详细调试图片URL处理
		console.log('调试 - imageUrlsArray.value:', imageUrlsArray.value);
		console.log('调试 - imageUrlsArray.value类型:', typeof imageUrlsArray.value);
		console.log('调试 - imageUrlsArray.value是否为数组:', Array.isArray(imageUrlsArray.value));
		
		// 处理图片URL：如果数组为空或只有空字符串，发送空字符串
		const filteredImageUrls = imageUrlsArray.value.filter(url => url.trim() !== '');
		console.log('调试 - filteredImageUrls:', filteredImageUrls);
		
		const imageUrlsString = filteredImageUrls.length > 0 ? JSON.stringify(filteredImageUrls) : '';
		console.log('调试 - 最终的imageUrlsString:', imageUrlsString);
		console.log('调试 - imageUrlsString类型:', typeof imageUrlsString);
		
		const params: UpdateFarmInfoRequest = {
			del: 0, // 不删除
			status: newStatus, // 切换状态
			farm: {
				farm_id: farmForm.farm_id,
				farm_name: farmForm.farm_name,
				description: farmForm.description,
				address: farmForm.address,
				logo_url: farmForm.logo_url,
				image_urls: '', // 暂时强制设置为空字符串测试
				contact_phone: farmForm.contact_phone
				// 移除status字段，因为后端Farm结构体中没有这个字段
			}
		};

		console.log('切换运营状态请求参数:', JSON.stringify(params, null, 2));

		const response = await updateFarmInfo(params);
		console.log('切换运营状态响应:', response.code, response.msg);

		if (response.code === 200) {
			ElMessage.success('农场运营状态切换成功！');
			
			// 更新状态
			isSuspended.value = !isSuspended.value;
			farmStatus.value = isSuspended.value ? 1 : 0; // 更新单独的status状态
			statusMessage.value = `农场已${isSuspended.value ? '暂停' : '恢复'}运营`;
			statusType.value = isSuspended.value ? 'warning' : 'success';
			
			// 退出编辑模式
			isEditMode.value = false;
			
			// 更新缓存状态
			const updatedFarmData = {
				...farmForm,
				status: farmStatus.value
			};
			Session.set('farmInfo', updatedFarmData);

		} else {
			const errorMsg = response.msg || '切换运营状态失败';
			throw new Error(errorMsg);
		}
	} catch (error: any) {
		console.error('切换运营状态失败:', error);
		ElMessage.error(error.message || '切换运营状态失败');
		statusMessage.value = '切换运营状态失败，请重试';
		statusType.value = 'error';
	} finally {
		loading.value = false;
	}
};

// 测试农场修改API
const testUpdateFarm = async () => {
	console.log('=== 开始测试农场修改API ===');
	
	const farmId = getFarmId();
	if (!farmId) {
		console.error('无法获取farm_id');
		return;
	}
	
	// 创建一个最简单的测试请求
	const testParams = {
		del: 0,
		status: -1,  // 测试修改时status设置为-1
		farm: {
			farm_id: farmId,
			farm_name: "测试农场名称",
			description: "测试描述",
			address: "测试地址",
			logo_url: "",
			image_urls: "",
			contact_phone: "123456789"
		}
	};
	
	console.log('测试请求参数:', testParams);
	
	try {
		const response = await updateFarmInfo(testParams);
		console.log('测试响应:', response);
		ElMessage.success('测试成功！');
	} catch (error) {
		console.error('测试失败:', error);
		ElMessage.error('测试失败！');
	}
};

// 组件挂载时从缓存获取农场信息
onMounted(() => {
	loadFarmInfoFromCache();
});
</script>

<style scoped lang="scss">
.farm-form {
	max-width: 800px;
	
	.image-urls-container {
		width: 100%;
		
		.image-url-item {
			margin-bottom: 10px;
			
			&:last-child {
				margin-bottom: 0;
			}
		}
	}
	
	.button-container {
		display: flex;
		align-items: center;
		gap: 12px;
		
		.bound-actions {
			display: flex;
			align-items: center;
			gap: 10px;
			flex-wrap: wrap;
			
			.el-tag {
				margin-bottom: 5px;
			}
			
			.el-button {
				margin-bottom: 5px;
			}
		}
	}
}

.mt10 {
	margin-top: 10px;
}

.mt20 {
	margin-top: 20px;
}
</style>
