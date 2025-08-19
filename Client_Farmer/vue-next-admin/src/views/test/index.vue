<template>
	<div class="layout-pd">
		<el-card shadow="hover" header="文件上传测试">
			<div class="test-container">
				<!-- 文件选择区域 -->
				<div class="upload-section">
					<el-upload
						ref="uploadRef"
						class="upload-demo"
						:auto-upload="false"
						:on-change="handleFileChange"
						:show-file-list="true"
						:limit="1"
						:on-exceed="handleExceed"
						drag
					>
						<el-icon class="el-icon--upload">
							<upload-filled />
						</el-icon>
						<div class="el-upload__text">
							将文件拖到此处，或<em>点击上传</em>
						</div>
						<template #tip>
							<div class="el-upload__tip">
								支持任意格式文件，单次只能选择一个文件
							</div>
						</template>
					</el-upload>
				</div>

				<!-- 上传控制区域 -->
				<div class="control-section">
					<el-form :model="testForm" label-width="100px" size="default">
						<el-form-item label="农场ID：">
							<el-input 
								:value="currentFarmIdStatus.id" 
								placeholder="从内存中获取的农场ID"
								disabled
								style="width: 200px;"
							/>
							<el-tag 
								:type="currentFarmIdStatus.valid ? 'success' : 'danger'"
								style="margin-left: 10px;"
							>
								{{ currentFarmIdStatus.source }}
							</el-tag>
						</el-form-item>
						<el-form-item label="商品ID：">
							<el-input 
								v-model="testForm.good_id" 
								placeholder="商品ID（固定为10000）"
								disabled
								style="width: 200px;"
							/>
						</el-form-item>
						<el-form-item label="土地ID：">
							<el-input 
								v-model="testForm.land_id" 
								placeholder="土地ID（固定为-1）"
								disabled
								style="width: 200px;"
							/>
						</el-form-item>
						<el-form-item label="Token状态：">
							<el-tag :type="tokenStatus.exists ? 'success' : 'danger'">
								{{ tokenStatus.exists ? '已登录' : '未登录' }}
							</el-tag>
							<span style="margin-left: 10px; font-size: 12px; color: #666;">
								{{ tokenStatus.exists ? `Token: ${tokenStatus.token?.substring(0, 20)}...` : '请先登录获取Token' }}
							</span>
						</el-form-item>
					</el-form>

					<div class="button-group">
						<el-button 
							type="primary" 
							:loading="uploading"
							:disabled="!selectedFile"
							@click="handleUpload"
						>
							{{ uploading ? '上传中...' : '开始上传' }}
						</el-button>
						<el-button @click="handleReset">重置</el-button>
					</div>
				</div>

				<!-- 结果显示区域 -->
				<div class="result-section" v-if="uploadResult">
					<el-alert
						:title="uploadResult.success ? '上传成功' : '上传失败'"
						:type="uploadResult.success ? 'success' : 'error'"
						:description="uploadResult.message"
						show-icon
						:closable="false"
					/>
					
					<div class="result-details" v-if="uploadResult.response">
						<h4>响应详情：</h4>
						<pre>{{ JSON.stringify(uploadResult.response, null, 2) }}</pre>
					</div>
				</div>
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="test">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import type { UploadInstance, UploadRawFile, UploadFile } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { testFileUpload, type TestResponse } from '/@/api/test';
import { Session } from '/@/utils/storage';
import { useUserInfoStore } from '/@/stores/userInfo';

// 响应式数据
const uploadRef = ref<UploadInstance>();
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const userInfoStore = useUserInfoStore();

// 表单数据
const testForm = reactive({
	farm_id: 0, // 从用户信息中获取
	good_id: 10000, // 固定为10000
	land_id: -1 // 固定为-1
});

// Token状态
const tokenStatus = computed(() => {
	const token = Session.get('token');
	return {
		exists: !!token,
		token: token
	};
});

// 上传结果
const uploadResult = ref<{
	success: boolean;
	message: string;
	response?: TestResponse;
} | null>(null);

// 文件选择处理
const handleFileChange = (file: UploadFile) => {
	if (file.raw) {
		selectedFile.value = file.raw;
		uploadResult.value = null; // 清除之前的结果
		ElMessage.success(`已选择文件：${file.name}`);
	}
};

// 文件数量超限处理
const handleExceed = () => {
	ElMessage.warning('只能选择一个文件');
};

// 文件上传处理
const handleUpload = async () => {
	if (!selectedFile.value) {
		ElMessage.warning('请先选择文件');
		return;
	}

	// 检查token状态
	if (!tokenStatus.value.exists) {
		ElMessage.error('请先登录获取访问令牌');
		return;
	}

	// 重新获取最新的农场ID
	const currentFarmId = getFarmId();
	if (!currentFarmId || currentFarmId <= 0) {
		ElMessage.error('请先绑定农场，获取有效的农场ID');
		return;
	}
	
	console.log('上传前最终确认的farm_id:', currentFarmId);

	try {
		uploading.value = true;
		uploadResult.value = null;

		console.log('开始上传文件，当前token状态:', tokenStatus.value.exists);
		const response = await testFileUpload(selectedFile.value, currentFarmId, testForm.good_id, testForm.land_id);
		
		uploadResult.value = {
			success: true,
			message: '文件上传成功！',
			response: response
		};

		ElMessage.success('文件上传成功！');
	} catch (error: any) {
		console.error('上传失败:', error);
		
		uploadResult.value = {
			success: false,
			message: error.message || '上传失败，请检查网络连接和后端服务',
			response: error.response?.data
		};

		ElMessage.error('文件上传失败！');
	} finally {
		uploading.value = false;
	}
};

// 重置处理
const handleReset = () => {
	uploadRef.value?.clearFiles();
	selectedFile.value = null;
	uploadResult.value = null;
	ElMessage.info('已重置');
};

// 专门的FarmID获取工具函数（参考tools模块）
const getFarmId = (): number => {
	console.log('=== getFarmId工具函数执行 ===');
	
	// 1. 优先从当前testForm获取
	if (testForm.farm_id && testForm.farm_id !== 0) {
		console.log('从testForm获取farm_id:', testForm.farm_id);
		return testForm.farm_id;
	}
	
	// 2. 从缓存获取
	const cachedFarmInfo = Session.get('farmInfo');
	if (cachedFarmInfo) {
		const farmId = cachedFarmInfo.farm_id || cachedFarmInfo.FarmID || cachedFarmInfo.farmId || cachedFarmInfo.id || cachedFarmInfo.ID;
		if (farmId && farmId !== 0) {
			console.log('从缓存获取farm_id:', farmId);
			// 同步到testForm
			testForm.farm_id = farmId;
			return farmId;
		}
	}
	
	// 3. 从userInfo获取（使用getter）
	const userInfo = userInfoStore.getUserInfo;
	if (userInfo) {
		const farmId = userInfo.farm_id; // UserInfo接口只有farm_id字段
		if (farmId && farmId !== 0) {
			console.log('从userInfo获取farm_id:', farmId);
			// 同步到testForm
			testForm.farm_id = farmId;
			return farmId;
		}
	}
	
	// 4. 从sessionStorage直接获取
	const userInfoStr = sessionStorage.getItem('userInfo');
	if (userInfoStr) {
		try {
			const storedUserInfo = JSON.parse(userInfoStr);
			const farmId = storedUserInfo.farm_id || storedUserInfo.FarmID || storedUserInfo.farmId;
			if (farmId && farmId !== 0) {
				console.log('从sessionStorage获取farm_id:', farmId);
				testForm.farm_id = farmId;
				return farmId;
			}
		} catch (e) {
			console.error('解析sessionStorage userInfo失败:', e);
		}
	}
	
	console.error('无法获取有效的farm_id');
	return 0;
};

// 初始化用户信息
const initUserInfo = () => {
	console.log('initUserInfo - 开始初始化农场ID');
	
	// 先恢复用户信息到store
	userInfoStore.restoreUserInfo();
	
	// 使用专门的getFarmId函数
	const farmId = getFarmId();
	
	if (!farmId || farmId <= 0) {
		ElMessage.warning('未找到农场ID，请先登录并绑定农场');
	}
	
	console.log('initUserInfo - 最终farm_id:', testForm.farm_id);
};

// 计算当前农场ID状态
const currentFarmIdStatus = computed(() => {
	const farmId = getFarmId();
	return {
		id: farmId,
		valid: farmId > 0,
		source: farmId > 0 ? '已获取' : '未获取'
	};
});

// 组件挂载时初始化
onMounted(() => {
	initUserInfo();
	// 每次组件显示时重新获取农场ID
	nextTick(() => {
		getFarmId();
	});
});
</script>

<style scoped lang="scss">
.test-container {
	padding: 20px;
}

.upload-section {
	margin-bottom: 30px;
	
	.upload-demo {
		.el-upload-dragger {
			width: 360px;
		}
	}
}

.control-section {
	margin-bottom: 30px;
	
	.button-group {
		margin-top: 20px;
		
		.el-button {
			margin-right: 10px;
		}
	}
}

.result-section {
	margin-top: 20px;
	
	.result-details {
		margin-top: 15px;
		
		h4 {
			margin-bottom: 10px;
			color: #409EFF;
		}
		
		pre {
			background-color: #f5f7fa;
			border: 1px solid #e4e7ed;
			border-radius: 4px;
			padding: 15px;
			max-height: 300px;
			overflow: auto;
			font-size: 12px;
			line-height: 1.5;
		}
	}
}
</style> 