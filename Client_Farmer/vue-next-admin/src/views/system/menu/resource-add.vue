<template>
	<div class="product-add-container layout-pd">
		<el-card shadow="hover">
			<div class="mb15">新增农产品资源（支持批量）</div>
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
					<el-form-item label="商品名称">
						<el-input v-model="it.good_name" placeholder="请输入" clearable />
					</el-form-item>
					<el-form-item label="标签">
						<el-input v-model="it.good_tag" placeholder="如：时令/有机/特价" clearable />
					</el-form-item>
					<el-form-item label="价格">
						<el-input-number v-model="it.price" :min="0" :precision="2" :step="0.1" />
					</el-form-item>
					<el-form-item label="单位">
						<el-input v-model="it.units" placeholder="个/斤/千克等" clearable />
					</el-form-item>
					<el-form-item label="库存">
						<el-input-number v-model="it.repertory" :min="0" :step="1" />
					</el-form-item>
					<el-form-item label="商品图片">
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
				<el-empty v-if="items.length === 0" description="请点击上方“添加一项”" />
				<el-form-item>
					<el-button type="primary" :loading="submitting" @click="onSubmit" :disabled="items.length === 0">提交</el-button>
					<el-button @click="resetToOne" :disabled="items.length === 0">重置为一项</el-button>
				</el-form-item>
			</el-form>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="productResourceAdd">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadUserFile, UploadFile } from 'element-plus';
import { addProduct, type AddProductRequest } from '/@/api/product';
import { Session } from '/@/utils/storage';
import { useUserInfoStore } from '/@/stores/userInfo';

const userInfoStore = useUserInfoStore();

const formRef = ref();
const submitting = ref(false);

interface ProductItem {
	_key: string;
	good_name: string;
	good_tag: string;
	price: number;
	units: string;
	repertory: number;
	detail: string;
	fileList: UploadUserFile[];
	images: string[]; // base64或URL字符串
}

const newItem = (): ProductItem => ({
	_key: Math.random().toString(36).slice(2),
	good_name: '',
	good_tag: '',
	price: 0,
	units: '',
	repertory: 0,
	detail: '',
	fileList: [],
	images: [],
});

const items = reactive<ProductItem[]>([newItem()]);

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
		if (!it.good_name?.trim()) { ElMessage.error(`第 ${i + 1} 项：请填写商品名称`); return false; }
		if (it.price === null || it.price === undefined) { ElMessage.error(`第 ${i + 1} 项：请填写价格`); return false; }
		if (!it.units?.trim()) { ElMessage.error(`第 ${i + 1} 项：请填写单位`); return false; }
		if (it.repertory === null || it.repertory === undefined) { ElMessage.error(`第 ${i + 1} 项：请填写库存`); return false; }
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
		product_type: 1,
		farm_id: Number(farmId),
		good: items.map((it) => ({
            id: 0,
            del_state: 0,
            del_time: '',
            create_time: '',
            good_id: 0,
            farm_id: Number(farmId),
			good_name: it.good_name,
			good_tag: it.good_tag,
			price: it.price,
			units: it.units,
			repertory: it.repertory,
			detail: it.detail,
			image_urls: JSON.stringify(it.images),
		}) as any),
		// 兼容后端校验：传入一个默认 Land 对象
		land: [
			{
				id: 0,
				del_state: 0,
				del_time: '',
				create_time: '',
				land_id: 0,
				farm_id: Number(farmId),
				land_name: '',
				land_tag: '',
				area: '',
				image_urls: '',
				price: 0,
				detail: '',
				sale_status: 0,
				sale_time: '',
			} as any,
		] as any,
	};
	try {
		submitting.value = true;
		const resp: any = await addProduct(payload);
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
.product-add-container {
	.el-card { max-width: 900px; }
	.card-header { display: flex; justify-content: space-between; align-items: center; }
}
</style> 