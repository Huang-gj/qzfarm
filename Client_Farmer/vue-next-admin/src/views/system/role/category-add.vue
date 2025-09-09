<template>
	<div class="category-add-container layout-pd">
		<el-card shadow="hover">
			<div class="mb15">新增土地类目</div>
			<el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
				<el-card class="mb15" shadow="never">
					<el-form-item label="类目名称" prop="name">
						<el-input 
							v-model="formData.name" 
							placeholder="请输入类目名称" 
							clearable 
							maxlength="50"
							show-word-limit
						/>
					</el-form-item>
					<el-form-item label="类目描述">
						<el-input 
							v-model="formData.description" 
							type="textarea" 
							:rows="3"
							placeholder="请输入类目描述（可选）"
							maxlength="200"
							show-word-limit
						/>
					</el-form-item>
					<el-form-item label="类目图片">
						<el-upload
							ref="imageUploadRef"
							:file-list="imageFileList"
							:auto-upload="false"
							:limit="1"
							list-type="picture-card"
							:on-change="handleImageChange"
							:on-remove="handleImageRemove"
							:before-upload="handleImageBeforeUpload"
							accept="image/*"
							:class="['category-image-upload', { 'hide-upload': imageFileList.length > 0 }]"
						>
							<el-icon v-if="imageFileList.length === 0"><ele-Plus /></el-icon>
							<template #tip>
								<div class="el-upload__tip">只能上传一张类目图片，jpg/png文件，且不超过5MB</div>
							</template>
						</el-upload>
					</el-form-item>
				</el-card>
			</el-form>
			<div class="mt15">
				<el-button type="primary" :loading="submitting" @click="onSubmit">
					<el-icon><ele-Plus /></el-icon>
					新增类目
				</el-button>
				<el-button @click="resetForm">重置</el-button>
				<el-button type="info" @click="goBack">返回</el-button>
			</div>
		</el-card>

		<!-- 已有类目列表 -->
		<el-card shadow="hover" class="mt15">
			<div class="mb15">已有土地类目</div>
			<el-table :data="categoryList" v-loading="loading" style="width: 100%" border stripe>
				<el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
				<el-table-column label="类目图片" width="100" align="center">
					<template #default="scope">
						<el-image
							v-if="scope.row.image_url"
							:src="scope.row.image_url"
							fit="cover"
							style="width: 50px; height: 50px; border-radius: 4px;"
							:preview-src-list="[scope.row.image_url]"
						/>
						<el-text v-else type="info" size="small">暂无图片</el-text>
					</template>
				</el-table-column>
				<el-table-column prop="name" label="类目名称" min-width="120" show-overflow-tooltip></el-table-column>
				<el-table-column prop="text" label="类目描述" min-width="160" show-overflow-tooltip>
					<template #default="scope">
						<span v-if="scope.row.text">{{ scope.row.text }}</span>
						<el-text v-else type="info" size="small">暂无描述</el-text>
					</template>
				</el-table-column>
				<el-table-column prop="category_id" label="类目ID" width="100" align="center"></el-table-column>
			</el-table>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="landCategoryAdd">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadUserFile, UploadFile } from 'element-plus';
import { useRouter } from 'vue-router';
import { addCategory, getCategory, addCategoryPic, type AddCategoryRequest, type Category } from '/@/api/category';

const router = useRouter();

const formRef = ref();
const submitting = ref(false);
const loading = ref(false);
const categoryList = ref<Category[]>([]);

// 图片上传相关
const imageUploadRef = ref();
const imageFileList = ref<UploadUserFile[]>([]);
const imageFile = ref<File | null>(null);

// 表单数据
const formData = reactive({
	name: '',
	description: ''
});

// 表单验证规则
const rules = {
	name: [
		{ required: true, message: '请输入类目名称', trigger: 'blur' },
		{ min: 1, max: 50, message: '类目名称长度在1到50个字符', trigger: 'blur' }
	]
};

// 重置表单
const resetForm = () => {
	formData.name = '';
	formData.description = '';
	imageFileList.value = [];
	imageFile.value = null;
	if (formRef.value) {
		formRef.value.resetFields();
	}
};

// 图片上传处理
const handleImageChange = (file: UploadFile) => {
	if (file.raw) {
		imageFile.value = file.raw;
		console.log('选择的图片文件:', file.name);
	}
};

const handleImageRemove = () => {
	imageFile.value = null;
	console.log('移除图片文件');
};

const handleImageBeforeUpload = (file: File) => {
	const isImage = file.type.startsWith('image/');
	const isLt5M = file.size / 1024 / 1024 < 5;

	if (!isImage) {
		ElMessage.error('只能上传图片文件!');
		return false;
	}
	if (!isLt5M) {
		ElMessage.error('图片大小不能超过 5MB!');
		return false;
	}
	return true;
};

// 返回上级页面
const goBack = () => {
	router.back();
};


// 获取已有类目列表
const fetchCategoryList = async () => {
	try {
		loading.value = true;
		const response = await getCategory({ categoryType: 2 }); // 2表示土地类目
		
		if (response.code === 200) {
			categoryList.value = response.category || [];
		} else {
			ElMessage.warning(response.msg || '获取类目列表失败');
		}
	} catch (error: any) {
		console.error('获取类目列表失败:', error);
		ElMessage.error('获取类目列表失败，请稍后重试');
	} finally {
		loading.value = false;
	}
};

// 提交表单
const onSubmit = async () => {
	if (!formRef.value) return;
	
	// 表单验证
	const valid = await formRef.value.validate().catch(() => false);
	if (!valid) return;

	try {
		submitting.value = true;

		// 步骤1：先创建类目基本信息（不包含图片）
		const params: AddCategoryRequest = {
			category: {
				category_id: 0, // 后端自动生成，前端传0
				name: formData.name.trim(),
				category_type: 2, // 2表示土地类目
				text: formData.description.trim(), // 类目描述
				image_url: '' // 初始为空，待上传后更新
			}
		};

		console.log('新增土地类目请求参数:', params);

		const response = await addCategory(params);
		console.log('新增土地类目响应:', response);

		const responseCode = response.code || response.Code;
		const responseMsg = response.msg || response.Msg;
		const categoryId = response.category_id || response.CategoryID;
		
		if (responseCode === 200) {
			// 步骤2：如果有图片，则上传图片
			try {
				if (imageFile.value && categoryId) {
					console.log('开始上传类目图片，类目ID:', categoryId);
					await addCategoryPic(imageFile.value, categoryId);
					console.log('类目图片上传成功');
				}
			} catch (uploadError) {
				console.error('图片上传失败:', uploadError);
				ElMessage.warning('类目创建成功，但图片上传失败');
			}

			ElMessage.success('土地类目新增成功！');
			resetForm();
			// 重新获取类目列表
			await fetchCategoryList();
		} else {
			const errorMsg = responseMsg || '新增土地类目失败';
			ElMessage.error(errorMsg);
		}
	} catch (error: any) {
		console.error('新增土地类目失败:', error);
		ElMessage.error(error.message || '新增土地类目失败，请稍后重试');
	} finally {
		submitting.value = false;
	}
};

// 页面加载时获取类目列表
onMounted(() => {
	fetchCategoryList();
});
</script>

<style scoped lang="scss">
.category-add-container {
	.el-card {
		margin-bottom: 0;
	}
	
	.mt15 {
		margin-top: 15px;
	}
	
	.mb15 {
		margin-bottom: 15px;
		font-size: 16px;
		font-weight: bold;
		color: #303133;
	}
}

// 图片上传样式
.category-image-upload {
	:deep(.el-upload--picture-card) {
		width: 120px;
		height: 120px;
	}
	
	:deep(.el-upload-list--picture-card .el-upload-list__item) {
		width: 120px;
		height: 120px;
	}
	
	&.hide-upload {
		:deep(.el-upload--picture-card) {
			display: none;
		}
	}
}
</style>