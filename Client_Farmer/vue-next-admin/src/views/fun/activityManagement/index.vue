<template>
	<div class="activity-management-container layout-padding">
		<div class="activity-management-padding layout-padding-auto layout-padding-view">
			<!-- 头部操作区 -->
			<div class="activity-management-header mb15">
				<el-button type="primary" size="default" @click="openAddActivity">
					<el-icon>
						<ele-Plus />
					</el-icon>
					添加活动
				</el-button>
				<el-button type="success" size="default" @click="handleRefresh" class="ml10">
					<el-icon>
						<ele-Refresh />
					</el-icon>
					刷新
				</el-button>
			</div>

			<!-- 活动列表 -->
			<div v-loading="loading" class="activity-grid">
				<div 
					v-for="(item, index) in activityList" 
					:key="index"
					class="activity-card"
					@click="viewActivityDetail(item, index)"
				>
					<div class="activity-image">
						<el-image
							:src="item.main_pic"
							fit="cover"
							lazy
							:preview-disabled="true"
						>
							<template #error>
								<div class="image-slot">
									<el-icon><ele-Picture /></el-icon>
								</div>
							</template>
						</el-image>
					</div>
					<div class="activity-info">
						<h3 class="activity-title">{{ item.title }}</h3>
						<p class="activity-desc">点击查看详情</p>
					</div>
				</div>
				
				<!-- 空状态 -->
				<div v-if="!loading && activityList.length === 0" class="empty-state">
					<el-empty description="暂无活动数据">
						<el-button type="primary" @click="openAddActivity">添加第一个活动</el-button>
					</el-empty>
				</div>
			</div>
		</div>

		<!-- 活动详情弹窗 -->
		<el-dialog 
			v-model="detailDialogVisible" 
			title="活动详情" 
			width="800px" 
			destroy-on-close
		>
			<div v-if="currentActivity" class="activity-detail">
				<div class="detail-header">
					<h2>{{ currentActivity.title }}</h2>
					<div class="time-info">
						<p><strong>开始时间：</strong>{{ formatTime(currentActivity.start_time) }}</p>
						<p><strong>结束时间：</strong>{{ formatTime(currentActivity.end_time) }}</p>
					</div>
				</div>
				
				<div class="detail-images" v-if="currentActivity.image_urls && currentActivity.image_urls.length > 0">
					<h3>活动图片</h3>
					<div class="image-grid">
						<el-image
							v-for="(url, index) in currentActivity.image_urls"
							:key="index"
							:src="url"
							:preview-src-list="currentActivity.image_urls"
							:initial-index="index"
							fit="cover"
							class="detail-image"
						>
							<template #error>
								<div class="image-slot">
									<el-icon><ele-Picture /></el-icon>
								</div>
							</template>
						</el-image>
					</div>
				</div>
				
				<div class="detail-content">
					<h3>活动详情</h3>
					<div class="content-text">{{ currentActivity.text }}</div>
				</div>
			</div>
		</el-dialog>

		<!-- 添加活动弹窗 -->
		<el-dialog 
			v-model="addDialogVisible" 
			title="添加活动" 
			width="700px" 
			destroy-on-close
		>
			<el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
				<el-form-item label="活动标题" prop="title">
					<el-input v-model="addForm.title" placeholder="请输入活动标题" />
				</el-form-item>
				
				<el-form-item label="主图片" prop="main_pic">
					<el-upload
						ref="mainPicUploadRef"
						:file-list="mainPicFileList"
						:auto-upload="false"
						:limit="1"
						list-type="picture-card"
						:on-change="handleMainPicChange"
						:on-remove="handleMainPicRemove"
						accept="image/*"
					>
						<el-icon><ele-Plus /></el-icon>
						<template #tip>
							<div class="el-upload__tip">只能上传一张主图片，jpg/png文件，且不超过10MB</div>
						</template>
					</el-upload>
				</el-form-item>
				
				<el-form-item label="详情图片">
					<el-upload
						ref="detailPicsUploadRef"
						:file-list="detailPicsFileList"
						:auto-upload="false"
						:limit="9"
						list-type="picture-card"
						:on-change="handleDetailPicsChange"
						:on-remove="handleDetailPicsRemove"
						accept="image/*"
						multiple
					>
						<el-icon><ele-Plus /></el-icon>
						<template #tip>
							<div class="el-upload__tip">可上传多张详情图片，最多9张，jpg/png文件，且不超过10MB</div>
						</template>
					</el-upload>
				</el-form-item>
				
				<el-form-item label="开始时间" prop="start_time">
					<el-date-picker
						v-model="addForm.start_time"
						type="datetime"
						placeholder="选择开始时间"
						style="width: 100%"
						format="YYYY-MM-DD HH:mm:ss"
						value-format="YYYY-MM-DD HH:mm:ss"
					/>
				</el-form-item>
				
				<el-form-item label="结束时间" prop="end_time">
					<el-date-picker
						v-model="addForm.end_time"
						type="datetime"
						placeholder="选择结束时间"
						style="width: 100%"
						format="YYYY-MM-DD HH:mm:ss"
						value-format="YYYY-MM-DD HH:mm:ss"
					/>
				</el-form-item>
				
				<el-form-item label="活动详情" prop="text">
					<el-input
						v-model="addForm.text"
						type="textarea"
						:rows="6"
						placeholder="请输入活动详情"
					/>
				</el-form-item>
			</el-form>
			
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="addDialogVisible = false">取消</el-button>
					<el-button type="primary" :loading="submitLoading" @click="handleAddActivity">
						确定
					</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus';
import { getMainPic, getActivityDetail, addActivity, type Activity } from '/@/api/activity';
import { uploadActivityPic, uploadActivityMainPic } from '/@/api/test';
import { useUserInfo } from '/@/stores/userInfo';
import { Session } from '/@/utils/storage';

// 获取用户信息
const userInfo = useUserInfo();

// 获取农场ID的函数
const getFarmId = (): number | null => {
	// 1. 从缓存获取
	const cachedFarmInfo: any = Session.get('farmInfo');
	if (cachedFarmInfo) {
		const farmId = cachedFarmInfo.farm_id || cachedFarmInfo.FarmID || cachedFarmInfo.farmId || cachedFarmInfo.id || cachedFarmInfo.ID;
		if (farmId && farmId !== 0) {
			return farmId;
		}
	}
	
	// 2. 从userInfo获取
	const user: any = userInfo.getUserInfo;
	if (user) {
		const farmId = user.farm_id || user.FarmID || user.farmId;
		if (farmId && farmId !== 0) {
			return farmId;
		}
	}
	
	return null;
};

// 响应式数据
const loading = ref(false);
const activityList = ref<{ main_pic: string; title: string; activity_id?: number }[]>([]);
const detailDialogVisible = ref(false);
const addDialogVisible = ref(false);
const currentActivity = ref<Activity | null>(null);
const submitLoading = ref(false);

// 添加活动表单
const addFormRef = ref<FormInstance>();
const addForm = reactive({
	title: '',
	main_pic: '',
	start_time: '',
	end_time: '',
	text: '',
});

// 表单验证规则
const addRules: FormRules = {
	title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
	start_time: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
	end_time: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
	text: [{ required: true, message: '请输入活动详情', trigger: 'blur' }],
};

// 文件上传相关
const mainPicUploadRef = ref();
const detailPicsUploadRef = ref();
const mainPicFileList = ref<UploadFile[]>([]);
const detailPicsFileList = ref<UploadFile[]>([]);
const mainPicFile = ref<File | null>(null);
const detailPicFiles = ref<File[]>([]);

// 时间格式化函数
const formatTime = (timeStr: string) => {
	if (!timeStr) return '-';
	return new Date(timeStr).toLocaleString('zh-CN');
};

// 获取活动列表
const fetchActivityList = async () => {
	try {
		loading.value = true;
		const farmId = getFarmId();
		if (!farmId) {
			ElMessage.error('未找到农场信息，请先绑定农场');
			return;
		}
		
		const response = await getMainPic(farmId);
		console.log('GetMainPic接口响应:', response);
		
		if (response.code === 0 || response.code === 200) {
			// 组装活动列表数据
			const activityIds = response.activity_ids || [];
			const mainPics = response.main_pics || [];
			const titles = response.title || [];
			
			console.log('activity_ids数组:', activityIds);
			console.log('main_pics数组:', mainPics);
			console.log('title数组:', titles);
			
			// 确保所有数组长度一致，只处理有有效activity_id的项目
			const validItems = [];
			for (let index = 0; index < activityIds.length; index++) {
				if (activityIds[index] && mainPics[index]) {
					validItems.push({
						main_pic: mainPics[index],
						title: titles[index] || `活动 ${index + 1}`,
						activity_id: activityIds[index] // 只使用后端返回的正确activity_id
					});
				}
			}
			activityList.value = validItems;
			
			console.log('处理后的activityList:', activityList.value);
		} else {
			ElMessage.error(response.msg || '获取活动列表失败');
		}
	} catch (error) {
		console.error('获取活动列表失败:', error);
		ElMessage.error('获取活动列表失败');
	} finally {
		loading.value = false;
	}
};

// 查看活动详情
const viewActivityDetail = async (item: any, index: number) => {
	try {
		// 确保使用从GetMainPic接口获取的正确activity_id
		const activityId = item.activity_id;
		if (!activityId) {
			ElMessage.error('无效的活动ID');
			console.error('activity_id不存在:', item);
			return;
		}
		
		console.log('查看活动详情，使用activity_id:', activityId, 'item:', item);
		const response = await getActivityDetail(activityId);
		if (response.code === 0 || response.code === 200) {
			currentActivity.value = response.activities;
			detailDialogVisible.value = true;
		} else {
			ElMessage.error(response.msg || '获取活动详情失败');
		}
	} catch (error) {
		console.error('获取活动详情失败:', error);
		ElMessage.error('获取活动详情失败');
	}
};

// 刷新数据
const handleRefresh = () => {
	fetchActivityList();
};

// 打开添加活动弹窗
const openAddActivity = () => {
	addDialogVisible.value = true;
	resetAddForm();
};

// 重置添加表单
const resetAddForm = () => {
	addFormRef.value?.resetFields();
	mainPicFileList.value = [];
	detailPicsFileList.value = [];
	mainPicFile.value = null;
	detailPicFiles.value = [];
	Object.assign(addForm, {
		title: '',
		main_pic: '',
		start_time: '',
		end_time: '',
		text: '',
	});
};

// 主图片上传处理
const handleMainPicChange = (file: UploadFile) => {
	if (file.raw) {
		mainPicFile.value = file.raw;
		addForm.main_pic = file.name;
	}
};

const handleMainPicRemove = () => {
	mainPicFile.value = null;
	addForm.main_pic = '';
};

// 详情图片上传处理
const handleDetailPicsChange = (file: UploadFile, fileList: UploadFile[]) => {
	detailPicFiles.value = fileList.map(f => f.raw).filter(Boolean) as File[];
};

const handleDetailPicsRemove = (file: UploadFile, fileList: UploadFile[]) => {
	detailPicFiles.value = fileList.map(f => f.raw).filter(Boolean) as File[];
};

// 添加活动
const handleAddActivity = async () => {
	if (!addFormRef.value) return;
	
	try {
		await addFormRef.value.validate();
		
		if (!mainPicFile.value) {
			ElMessage.error('请上传主图片');
			return;
		}
		
		const farmId = getFarmId();
		if (!farmId) {
			ElMessage.error('未找到农场信息，请先绑定农场');
			return;
		}
		
		// 确保farmId是数字类型
		const farmIdNumber = Number(farmId);
		console.log('farmId原始值:', farmId, '转换后:', farmIdNumber);
		
		submitLoading.value = true;
		
		// 构造活动数据
		const activityData: Activity = {
			activity_id: 0, // 由后端自动生成，前端传0
			farm_id: farmIdNumber,
			main_pic: '', // 第一个接口不传图片，传空字符串
			image_urls: JSON.stringify([]), // 确保存储为有效的JSON字符串 "[]"
			title: addForm.title,
			text: addForm.text,
			start_time: addForm.start_time,
			end_time: addForm.end_time,
		};
		
		// 先调用AddActivity接口
		console.log('调用AddActivity接口，参数:', activityData);
		const addResponse = await addActivity(activityData);
		console.log('AddActivity接口响应:', addResponse);
		
		if (addResponse.code === 0 || addResponse.code === 200) {
			const activityId = addResponse.activity_id;
			console.log('获取到的activity_id:', activityId);
			
			// 分别上传主图片和详情图片
			try {
				// 1. 上传主图片（如果有）
				if (mainPicFile.value) {
					console.log('开始上传主图片:', mainPicFile.value.name);
					await uploadActivityMainPic(mainPicFile.value, farmIdNumber, activityId);
					console.log('主图片上传成功');
				}
				
				// 2. 上传详情图片（如果有）
				if (detailPicFiles.value.length > 0) {
					console.log('开始上传详情图片，共', detailPicFiles.value.length, '个文件');
					for (const file of detailPicFiles.value) {
						console.log(`上传详情图片: ${file.name}`);
						await uploadActivityPic(file, farmIdNumber, activityId);
						console.log(`详情图片 ${file.name} 上传成功`);
					}
				}
			} catch (uploadError) {
				console.error('图片上传失败:', uploadError);
				ElMessage.warning('活动创建成功，但部分图片上传失败');
			}
			
			ElMessage.success('添加活动成功');
			addDialogVisible.value = false;
			fetchActivityList(); // 刷新列表
		} else {
			ElMessage.error(addResponse.msg || '添加活动失败');
		}
	} catch (error) {
		console.error('添加活动失败:', error);
		ElMessage.error('添加活动失败');
	} finally {
		submitLoading.value = false;
	}
};

// 组件挂载时获取数据
onMounted(() => {
	fetchActivityList();
});
</script>

<style scoped lang="scss">
.activity-management-container {
	height: 100%;
	
	.activity-management-header {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
	}
	
	.activity-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
		
		.activity-card {
			background: #fff;
			border-radius: 8px;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			overflow: hidden;
			cursor: pointer;
			transition: all 0.3s ease;
			
			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
			}
			
			.activity-image {
				height: 200px;
				
				:deep(.el-image) {
					width: 100%;
					height: 100%;
					
					img {
						width: 100%;
						height: 100%;
						object-fit: cover;
					}
				}
				
				.image-slot {
					display: flex;
					justify-content: center;
					align-items: center;
					width: 100%;
					height: 100%;
					background: var(--el-fill-color-light);
					color: var(--el-text-color-secondary);
					font-size: 30px;
				}
			}
			
			.activity-info {
				padding: 16px;
				
				.activity-title {
					margin: 0 0 8px 0;
					font-size: 16px;
					font-weight: 600;
					color: var(--el-text-color-primary);
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				
				.activity-desc {
					margin: 0;
					font-size: 14px;
					color: var(--el-text-color-secondary);
				}
			}
		}
		
		.empty-state {
			grid-column: 1 / -1;
			text-align: center;
			padding: 60px 20px;
		}
	}
}

.activity-detail {
	.detail-header {
		margin-bottom: 20px;
		
		h2 {
			margin: 0 0 10px 0;
			color: var(--el-text-color-primary);
		}
		
		.time-info {
			color: var(--el-text-color-secondary);
			font-size: 14px;
			
			p {
				margin: 5px 0;
			}
		}
	}
	
	.detail-images {
		margin-bottom: 20px;
		
		h3 {
			margin: 0 0 15px 0;
			color: var(--el-text-color-primary);
			font-size: 16px;
		}
		
		.image-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: 10px;
			
			.detail-image {
				width: 120px;
				height: 120px;
				border-radius: 6px;
				overflow: hidden;
				
				:deep(img) {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}
		}
	}
	
	.detail-content {
		h3 {
			margin: 0 0 15px 0;
			color: var(--el-text-color-primary);
			font-size: 16px;
		}
		
		.content-text {
			line-height: 1.6;
			color: var(--el-text-color-regular);
			white-space: pre-wrap;
		}
	}
}

:deep(.el-upload--picture-card) {
	width: 80px;
	height: 80px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
	width: 80px;
	height: 80px;
}
</style>