<template>
	<div class="land-add-container layout-pd">
		<el-card shadow="hover">
			<div class="mb15">新增土地资源</div>
			<el-form ref="formRef" label-width="110px">
				<el-card class="mb15" shadow="never">
					<el-form-item label="土地名称">
						<el-input v-model="formData.land_name" placeholder="请输入" clearable />
					</el-form-item>
					<el-form-item label="标签">
						<el-input v-model="formData.land_tag" placeholder="" clearable />
					</el-form-item>
					<el-form-item label="面积">
						<el-input v-model="formData.area" placeholder="请输入面积" clearable />
					</el-form-item>
					<el-form-item label="价格">
						<el-input-number v-model="formData.price" :min="0" :precision="2" :step="0.1" />
					</el-form-item>
					<el-form-item label="上架状态">
						<el-switch v-model="formData.sale_status" :active-value="0" :inactive-value="1" />
					</el-form-item>
					<el-form-item label="租赁截止">
						<el-date-picker v-model="formData.sale_time" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择租赁截止时间" style="width: 100%" />
					</el-form-item>
					<el-form-item label="土地图片">
						<el-upload
							list-type="picture-card"
							:limit="9"
							:auto-upload="false"
							:file-list="formData.fileList"
							:on-change="onUploadChange"
							:on-remove="onUploadRemove"
						>
							<el-icon><ele-Plus /></el-icon>
							<template #file="{ file }">
								<el-image :src="file.url" fit="cover" style="width:100%;height:100%" />
							</template>
						</el-upload>
					</el-form-item>
					<el-form-item label="详情">
						<el-input v-model="formData.detail" type="textarea" :rows="4" placeholder="请输入详情" />
					</el-form-item>
				</el-card>
			</el-form>
			<div class="mt15">
				<el-button type="primary" :loading="submitting" @click="onSubmit">提交</el-button>
				<el-button @click="resetForm">重置</el-button>
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadUserFile, UploadFile } from 'element-plus';
import { addProduct, type AddProductRequest, type AddProductResponse } from '/@/api/product';
import { Session } from '/@/utils/storage';
import { useUserInfoStore } from '/@/stores/userInfo';
import { testFileUpload } from '/@/api/test';

const userInfoStore = useUserInfoStore();

const formRef = ref();
const submitting = ref(false);

// 单个土地表单数据
const formData = reactive({
	land_name: '',
	land_tag: '',
	area: '',
	price: 0,
	sale_status: 0, // 默认上架
	sale_time: '',
	detail: '',
	fileList: [] as UploadUserFile[]
});

const resetForm = () => {
	formData.land_name = '';
	formData.land_tag = '';
	formData.area = '';
	formData.price = 0;
	formData.sale_status = 0;
	formData.sale_time = '';
	formData.detail = '';
	formData.fileList = [];
};

const getFarmId = (): number | null => {
	const cached: any = Session.get('farmInfo');
	if (cached) return cached.farm_id || cached.FarmID || cached.farmId || null;
	const user: any = userInfoStore.getUserInfo;
	return user?.farm_id || user?.FarmID || user?.farmId || null;
};

// 上传文件到后端的新接口
const uploadFilesToBackend = async (farmId: number, landId: number, fileList: UploadUserFile[]) => {
	const uploadPromises: Promise<void>[] = [];
	
	for (const fileItem of fileList) {
		if (fileItem.raw) {
			const uploadPromise = testFileUpload(fileItem.raw, farmId, -1, landId)
				.then(response => {
					console.log(`文件 ${fileItem.name} 上传成功:`, response);
				})
				.catch(error => {
					console.error(`文件 ${fileItem.name} 上传失败:`, error);
					throw new Error(`文件 ${fileItem.name} 上传失败`);
				});
			uploadPromises.push(uploadPromise);
		}
	}
	
	// 等待所有文件上传完成
	await Promise.all(uploadPromises);
};

const onUploadChange = (file: UploadFile, fileList: UploadUserFile[]) => {
	formData.fileList = fileList;
	// 不再转换为base64，文件将通过新的上传接口直接传输
};

const onUploadRemove = (_file: UploadFile, fileList: UploadUserFile[]) => {
	formData.fileList = fileList;
	// 不再需要同步images数组，因为文件直接通过新接口上传
};

const validateForm = (): boolean => {
	if (!formData.land_name?.trim()) { 
		ElMessage.error('请填写土地名称'); 
		return false; 
	}
	if (!formData.area?.trim()) { 
		ElMessage.error('请填写面积'); 
		return false; 
	}
	if (formData.price === null || formData.price === undefined) { 
		ElMessage.error('请填写价格'); 
		return false; 
	}
	return true;
};

const onSubmit = async () => {
	if (!validateForm()) return;
	const farmId = getFarmId();
	if (!farmId) {
		ElMessage.error('未找到农场信息，请先绑定农场');
		return;
	}
	const payload: AddProductRequest = {
		product_type: 2,
		farm_id: Number(farmId),
		land: {
            id: 0,
            del_state: 0,
            del_time: '',
            create_time: '',
            land_id: 0,
            farm_id: Number(farmId),
			land_name: formData.land_name,
			land_tag: formData.land_tag,
			area: formData.area,
			price: formData.price,
			sale_status: formData.sale_status,
			sale_time: formData.sale_time || '',
			detail: formData.detail,
			image_urls: [], // 传空数组，文件将通过第二个接口上传
		} as any,
		// 兼容后端校验：传入一个默认 Good 对象
		good: {
			id: 0,
			del_state: 0,
			del_time: '',
			create_time: '',
			good_id: 0,
			good_tag: '',
			good_name: '',
			farm_id: Number(farmId),
			image_urls: [],
			price: 0,
			units: '',
			repertory: 0,
			detail: '',
		} as any,
	};
	try {
		submitting.value = true;
		console.log('第一步：创建土地记录...', payload);
		const resp: AddProductResponse = await addProduct(payload);
		console.log('第一步成功，获取到的响应:', resp);
		
		if (resp.code === 200 || resp.Code === 200) {
			// 检查是否有land_id返回
			if (resp.land_id) {
				console.log('第二步：上传土地图片，land_id:', resp.land_id);
				
				try {
					// 上传文件
					if (formData.fileList && formData.fileList.length > 0) {
						console.log('上传土地图片...');
						await uploadFilesToBackend(farmId, resp.land_id, formData.fileList);
					}
					
					ElMessage.success('土地创建并上传图片成功！');
				} catch (uploadError) {
					console.error('文件上传失败:', uploadError);
					ElMessage.warning('土地创建成功，但部分图片上传失败');
				}
			} else {
				console.warn('未获取到land_id，跳过文件上传');
				ElMessage.success(resp.msg || resp.Msg || '新增成功');
			}
			
			resetForm();
		} else {
			ElMessage.error(resp.msg || resp.Msg || '新增失败');
		}
	} catch (e) {
		console.error('新增失败:', e);
		ElMessage.error('新增失败');
	} finally {
		submitting.value = false;
	}
};
</script>

<style scoped lang="scss">
.land-add-container {
	.el-card { max-width: 900px; }
}
</style> 