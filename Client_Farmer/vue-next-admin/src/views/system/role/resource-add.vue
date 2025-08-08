<template>
	<div class="land-add-container layout-pd">
		<el-card shadow="hover">
			<div class="mb15">新增土地资源（支持批量）</div>
			<div class="mb10">
				<el-button type="primary" @click="addItem">添加一项</el-button>
				<el-button type="warning" @click="clearAll" :disabled="items.length === 0">清空全部</el-button>
			</div>
			<el-form ref="formRef" label-width="110px">
				<el-card v-for="(it, idx) in items" :key="it._key" class="mb15" shadow="never">
					<template #header>
						<div class="card-header">
							<span>第 {{ idx + 1 }} 项</span>
							<el-button type="danger" size="small" @click="removeItem(idx)" plain>删除</el-button>
						</div>
					</template>
					<el-form-item label="土地名称">
						<el-input v-model="it.land_name" placeholder="请输入" clearable />
					</el-form-item>
					<el-form-item label="标签">
						<el-input v-model="it.land_tag" placeholder="如：肥沃/灌溉/山地" clearable />
					</el-form-item>
					<el-form-item label="面积">
						<el-input v-model="it.area" placeholder="请输入面积" clearable />
					</el-form-item>
					<el-form-item label="价格">
						<el-input-number v-model="it.price" :min="0" :precision="2" :step="0.1" />
					</el-form-item>
					<el-form-item label="上架状态">
						<el-switch v-model="it.sale_status" :active-value="0" :inactive-value="1" />
					</el-form-item>
					<el-form-item label="租赁截止">
						<el-date-picker v-model="it.sale_time" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择租赁截止时间" style="width: 100%" />
					</el-form-item>
					<el-form-item label="土地图片">
						<el-upload
							list-type="picture-card"
							:limit="9"
							:auto-upload="false"
							:file-list="it.fileList"
							:on-change="(file, fileList) => onUploadChange(idx, file, fileList)"
							:on-remove="(file, fileList) => onUploadRemove(idx, file, fileList)"
						>
							<el-icon><ele-Plus /></el-icon>
							<template #file="{ file }">
								<el-image :src="file.url" fit="cover" style="width:100%;height:100%" />
							</template>
						</el-upload>
					</el-form-item>
					<el-form-item label="详情">
						<el-input v-model="it.detail" type="textarea" :rows="4" placeholder="请输入详情" />
					</el-form-item>
				</el-card>
				<el-empty v-if="items.length === 0" description="请点击上方'添加一项'" />
				<el-form-item>
					<el-button type="primary" :loading="submitting" @click="onSubmit" :disabled="items.length === 0">提交</el-button>
					<el-button @click="resetToOne" :disabled="items.length === 0">重置为一项</el-button>
				</el-form-item>
			</el-form>
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadUserFile, UploadFile } from 'element-plus';
import { addProduct, type AddProductRequest } from '/@/api/product';
import { Session } from '/@/utils/storage';
import { useUserInfoStore } from '/@/stores/userInfo';

const userInfoStore = useUserInfoStore();

const formRef = ref();
const submitting = ref(false);

interface LandItem {
	_key: string;
	land_name: string;
	land_tag: string;
	area: string;
	price: number;
	sale_status: number;
	sale_time: string;
	detail: string;
	fileList: UploadUserFile[];
	images: string[]; // base64或URL字符串
}

const newItem = (): LandItem => ({
	_key: Math.random().toString(36).slice(2),
	land_name: '',
	land_tag: '',
	area: '',
	price: 0,
	sale_status: 0, // 默认上架
	sale_time: '',
	detail: '',
	fileList: [],
	images: [],
});

const items = reactive<LandItem[]>([newItem()]);

const addItem = () => { items.push(newItem()); };
const removeItem = (idx: number) => { items.splice(idx, 1); };
const clearAll = () => { items.splice(0, items.length); };
const resetToOne = () => { items.splice(0, items.length, newItem()); };

const getFarmId = (): number | null => {
	const cached: any = Session.get('farmInfo');
	if (cached) return cached.farm_id || cached.FarmID || cached.farmId || null;
	const user: any = userInfoStore.getUserInfo;
	return user?.farm_id || user?.FarmID || user?.farmId || null;
};

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = () => resolve(String(reader.result));
	reader.onerror = reject;
	reader.readAsDataURL(file);
});

const onUploadChange = async (idx: number, file: UploadFile, fileList: UploadUserFile[]) => {
	const target = items[idx];
	target.fileList = fileList;
	if (file.raw) {
		const b64 = await fileToBase64(file.raw);
		target.images.push(b64);
	}
};

const onUploadRemove = (idx: number, _file: UploadFile, fileList: UploadUserFile[]) => {
	const target = items[idx];
	target.fileList = fileList;
	// 同步 images 与 fileList（以 url 匹配简单处理）
	const urls = new Set((fileList || []).map(f => f.url).filter(Boolean) as string[]);
	target.images = target.images.filter(img => urls.has(img) || img.startsWith('data:'));
};

const validateItems = (): boolean => {
	for (let i = 0; i < items.length; i++) {
		const it = items[i];
		if (!it.land_name?.trim()) { ElMessage.error(`第 ${i + 1} 项：请填写土地名称`); return false; }
		if (!it.area?.trim()) { ElMessage.error(`第 ${i + 1} 项：请填写面积`); return false; }
		if (it.price === null || it.price === undefined) { ElMessage.error(`第 ${i + 1} 项：请填写价格`); return false; }
	}
	return true;
};

const onSubmit = async () => {
	if (!validateItems()) return;
	const farmId = getFarmId();
	if (!farmId) {
		ElMessage.error('未找到农场信息，请先绑定农场');
		return;
	}
	const payload: AddProductRequest = {
		product_type: 2,
		farm_id: Number(farmId),
		land: items.map((it) => ({
            id: 0,
            del_state: 0,
            del_time: '',
            create_time: '',
            land_id: 0,
            farm_id: Number(farmId),
			land_name: it.land_name,
			land_tag: it.land_tag,
			area: it.area,
			price: it.price,
			sale_status: it.sale_status,
			sale_time: it.sale_time || '',
			detail: it.detail,
			image_urls: JSON.stringify(it.images),
		}) as any),
		// 兼容后端校验：传入一个默认 Good 对象
		good: [
			{
				id: 0,
				del_state: 0,
				del_time: '',
				create_time: '',
				good_id: 0,
				good_tag: '',
				good_name: '',
				farm_id: Number(farmId),
				image_urls: '',
				price: 0,
				units: '',
				repertory: 0,
				detail: '',
			} as any,
		] as any,
	};
	try {
		submitting.value = true;
		console.log('新增土地-提交数据:', payload);
		const resp: any = await addProduct(payload);
		console.log('新增土地-响应:', resp);
		if (resp.code === 200 || resp.Code === 200) {
			ElMessage.success(resp.msg || resp.Msg || '新增成功');
			resetToOne();
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
	.card-header { display: flex; justify-content: space-between; align-items: center; }
}
</style> 