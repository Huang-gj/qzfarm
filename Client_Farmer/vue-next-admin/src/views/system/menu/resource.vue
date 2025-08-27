<template>
	<div class="system-order-container layout-pd">
		<el-card shadow="hover">
			<div class="system-order-search mb15">
				<el-input 
					v-model="searchForm.goodId" 
					size="default" 
					placeholder="请输入商品ID" 
					style="max-width: 180px"
					clearable
				>
					<template #prepend>商品ID</template>
				</el-input>
				<el-input 
					v-model="searchForm.goodName" 
					size="default" 
					placeholder="请输入商品名称" 
					style="max-width: 220px"
					class="ml10"
					clearable
				>
					<template #prepend>商品名称</template>
				</el-input>
				<el-button size="default" type="primary" class="ml10" @click="handleSearch">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="handleRefresh">
					<el-icon>
						<ele-Refresh />
					</el-icon>
					刷新
				</el-button>
			</div>
			<el-table
				:data="filteredTableData"
				v-loading="loading"
				style="width: 100%"
				border
				stripe
			>
				<el-table-column type="index" label="序号" width="60" align="center"></el-table-column>
				<el-table-column prop="good_id" label="商品ID" width="120" align="center">
					<template #default="scope">
						<el-link type="primary">{{ scope.row.good_id }}</el-link>
					</template>
				</el-table-column>
				<el-table-column label="商品图片" width="100" align="center">
					<template #default="scope">
						<ImageCarousel
							:images="scope.row.image_urls"
							width="50px"
							height="50px"
							:show-controls="true"
							:show-indicators="false"
							:show-thumbnails="false"
							:show-preview="true"
							border-radius="4px"
						/>
					</template>
				</el-table-column>
				<el-table-column prop="good_name" label="商品名称" min-width="150" show-overflow-tooltip></el-table-column>
				<el-table-column prop="good_tag" label="标签" width="140" align="center">
					<template #default="scope">
						<el-tag v-if="scope.row.good_tag" type="info">{{ scope.row.good_tag }}</el-tag>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column label="价格/单位" width="140" align="center">
					<template #default="scope">
						<div>
							<div class="price-amount">¥{{ scope.row.price }}</div>
							<div class="price-unit">{{ scope.row.units }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="repertory" label="库存" width="100" align="center"></el-table-column>
				<el-table-column prop="create_time" label="创建时间" width="160" align="center">
					<template #default="scope">
						{{ formatTime(scope.row.create_time) }}
					</template>
				</el-table-column>
				<el-table-column prop="detail" label="商品详情" min-width="180" show-overflow-tooltip></el-table-column>
				<el-table-column label="操作" width="160" align="center">
					<template #default="scope">
						<el-button type="primary" link @click="openEdit(scope.row)">修改</el-button>
						<el-divider direction="vertical" />
						<el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<el-dialog v-model="editDialogVisible" title="修改农产品资源" width="640px" destroy-on-close>
				<el-form :model="editForm" label-width="100px">
					<el-form-item label="商品名称">
						<el-input v-model="editForm.good_name" />
					</el-form-item>
					<el-form-item label="标签">
						<el-input v-model="editForm.good_tag" />
					</el-form-item>
					<el-form-item label="价格">
						<el-input-number v-model="editForm.price" :min="0" :precision="2" :step="0.1" />
					</el-form-item>
					<el-form-item label="单位">
						<el-input v-model="editForm.units" />
					</el-form-item>
					<el-form-item label="库存">
						<el-input-number v-model="editForm.repertory" :min="0" :step="1" />
					</el-form-item>
					<el-form-item label="商品图片">
						<el-upload
							list-type="picture-card"
							:limit="9"
							:auto-upload="false"
							:file-list="editFileList"
							:on-change="onEditUploadChange"
							:on-remove="onEditUploadRemove"
						>
							<el-icon><ele-Plus /></el-icon>
							<template #file="{ file }">
								<el-image :src="file.url" fit="cover" style="width:100%;height:100%" />
							</template>
						</el-upload>
					</el-form-item>
					<el-form-item label="详情">
						<el-input v-model="editForm.detail" type="textarea" :rows="4" />
					</el-form-item>
				</el-form>
				<template #footer>
					<el-button @click="editDialogVisible = false">取消</el-button>
					<el-button type="primary" :loading="editSubmitting" @click="submitEdit">保存</el-button>
				</template>
			</el-dialog>
			
			<!-- 分页 -->
			<div class="system-order-pagination mt15">
				<el-pagination
					v-model:current-page="pagination.currentPage"
					v-model:page-size="pagination.pageSize"
					:page-sizes="[10, 20, 50, 100]"
					:total="pagination.total"
					layout="total, sizes, prev, pager, next, jumper"
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
				/>
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="productResource">
import { reactive, onMounted, computed, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadUserFile, UploadFile } from 'element-plus';
import { getProduct, updateProduct, delProduct, type Good, type GetProductRequest, type UpdateProductRequest } from '/@/api/product';
import { useUserInfoStore } from '/@/stores/userInfo';
import { Session } from '/@/utils/storage';
import ImageCarousel from '/@/components/imageCarousel/index.vue';

const userInfoStore = useUserInfoStore();

const loading = ref(false);
const editDialogVisible = ref(false);
const editSubmitting = ref(false);

const editForm = reactive<any>({
  id: 0,
  good_id: 0,
  good_name: '',
  good_tag: '',
  price: 0,
  units: '',
  repertory: 0,
  detail: '',
  image_urls: '',
});
const editImageInput = ref('');
const editFileList = ref<UploadUserFile[]>([]);
const editImages = ref<string[]>([]);

const searchForm = reactive({
	goodId: '',
	goodName: '',
});

const pagination = reactive({
	currentPage: 1,
	pageSize: 20,
	total: 0,
});

const tableData = ref<Good[]>([]);

const filteredTableData = computed(() => {
	let data = tableData.value;
	if (searchForm.goodId) {
		data = data.filter(item => item.good_id?.toString().includes(searchForm.goodId));
	}
	if (searchForm.goodName) {
		data = data.filter(item => (item.good_name || '').includes(searchForm.goodName));
	}
	pagination.total = data.length;
	const start = (pagination.currentPage - 1) * pagination.pageSize;
	const end = start + pagination.pageSize;
	return data.slice(start, end);
});

const getFarmId = (): number | null => {
  const cached: any = Session.get('farmInfo');
  if (cached) return cached.farm_id || cached.FarmID || cached.farmId || null;
  const user: any = userInfoStore.getUserInfo;
  return user?.farm_id || user?.FarmID || user?.farmId || null;
};

const fetchGoods = async () => {
	try {
		loading.value = true;
		let farmId: number | null = null;
		const cachedFarmInfo: any = Session.get('farmInfo');
		if (cachedFarmInfo) {
			farmId = cachedFarmInfo.farm_id || cachedFarmInfo.FarmID || cachedFarmInfo.farmId;
		}
		if (!farmId) {
			const userInfo: any = userInfoStore.getUserInfo;
			farmId = userInfo?.farm_id || userInfo?.FarmID || userInfo?.farmId || null;
		}
		if (!farmId) {
			ElMessage.error('未找到农场信息，请先绑定农场');
			return;
		}
		const params: GetProductRequest = { product_type: 1, farm_id: Number(farmId) };
		console.log('农产品资源管理-请求参数:', params);
		const resp: any = await getProduct(params);
		console.log('农产品资源管理-接口响应:', resp);
		if ((resp.code === 200 || resp.Code === 200) && (resp.good || resp.Good)) {
			const rawList: any[] = (resp.good as any) || resp.Good || [];
			console.log('农产品资源管理-原始列表首条键名:', rawList?.[0] ? Object.keys(rawList[0]) : []);
			console.log('农产品资源管理-原始列表首条(CreateTime?):', rawList?.[0]?.CreateTime, 'create_time:', rawList?.[0]?.create_time, 'createTime:', rawList?.[0]?.createTime);
			tableData.value = rawList.map((it: any) => ({
				...it,
				create_time: it.create_time || it.CreateTime || it.createTime || '',
				good_tag: it.good_tag || it.GoodTag || it.goodTag || '',
			}));
			console.log('农产品资源管理-资源数据(归一化后):', tableData.value);
			ElMessage.success('农产品资源加载成功');
		} else {
			ElMessage.error(resp.msg || resp.Msg || '获取农产品资源失败');
		}
	} catch (e) {
		console.error('获取农产品资源失败:', e);
		ElMessage.error('获取农产品资源失败');
	} finally {
		loading.value = false;
	}
};

const formatTime = (timeStr: string) => {
	if (!timeStr) return '';
	try { return new Date(timeStr).toLocaleString('zh-CN'); } catch { return timeStr; }
};



const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const onEditUploadChange = async (file: UploadFile, fileList: UploadUserFile[]) => {
  editFileList.value = fileList;
  if (file.raw) {
    const b64 = await fileToBase64(file.raw);
    editImages.value.push(b64);
  }
};

const onEditUploadRemove = (_file: UploadFile, fileList: UploadUserFile[]) => {
  editFileList.value = fileList;
  const urls = new Set((fileList || []).map(f => f.url).filter(Boolean) as string[]);
  editImages.value = editImages.value.filter(img => urls.has(img) || img.startsWith('data:'));
};

const openEdit = (row: any) => {
  editForm.id = row.id ?? row.ID ?? 0;
  editForm.good_id = row.good_id ?? row.GoodID ?? 0;
  editForm.good_name = row.good_name ?? row.GoodName ?? '';
  editForm.good_tag = row.good_tag ?? row.GoodTag ?? '';
  editForm.price = row.price ?? 0;
  editForm.units = row.units ?? '';
  editForm.repertory = row.repertory ?? 0;
  editForm.detail = row.detail ?? '';
  editForm.image_urls = row.image_urls ?? '';
  // 初始化上传列表与预览
  try {
    const imgs: string[] = row.image_urls ? JSON.parse(row.image_urls) : [];
    editFileList.value = imgs.map((u, i) => ({ name: `img_${i}`, url: u } as UploadUserFile));
    editImages.value = imgs.slice();
  } catch {
    editFileList.value = [];
    editImages.value = [];
  }
  editDialogVisible.value = true;
};

const submitEdit = async () => {
  const farmId = getFarmId();
  if (!farmId) { ElMessage.error('未找到农场信息，请先绑定农场'); return; }
  const payload: UpdateProductRequest = {
    farm_id: Number(farmId),
    product_type: 1,
    good_id: editForm.good_id || 0, // 使用实际的农产品ID
    land_id: 0, // 更新农产品时土地ID为0
    good: {
      id: editForm.id,
      good_id: editForm.good_id,
      good_name: editForm.good_name,
      good_tag: editForm.good_tag,
      price: editForm.price,
      units: editForm.units,
      repertory: editForm.repertory,
      detail: editForm.detail,
      image_urls: JSON.stringify(editImages.value),
      del_state: 0,
      del_time: '',
      create_time: '',
      farm_id: Number(farmId),
    } as any,
    // 为兼容后端校验，传入带默认值的 Land 对象
    land: {
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
  };
  try {
    editSubmitting.value = true;
    const resp: any = await updateProduct(payload);
    if (resp.code === 200 || resp.Code === 200) {
      ElMessage.success(resp.msg || resp.Msg || '修改成功');
      editDialogVisible.value = false;
      fetchGoods();
    } else {
      ElMessage.error(resp.msg || resp.Msg || '修改失败');
    }
  } catch (e) {
    console.error('修改失败:', e);
    ElMessage.error('修改失败');
  } finally {
    editSubmitting.value = false;
  }
};

const handleSearch = () => { pagination.currentPage = 1; };
const handleRefresh = () => { searchForm.goodId = ''; searchForm.goodName = ''; pagination.currentPage = 1; fetchGoods(); };
const handleSizeChange = (size: number) => { pagination.pageSize = size; pagination.currentPage = 1; };
const handleCurrentChange = (page: number) => { pagination.currentPage = page; };

const handleDelete = async (row: any) => {
  const farmId = getFarmId();
  if (!farmId) { ElMessage.error('未找到农场信息，请先绑定农场'); return; }
  try {
    await ElMessageBox.confirm('确定删除该农产品吗？', '提示', { type: 'warning' });
  } catch { return; }
  try {
    const resp: any = await delProduct({
      farm_id: Number(farmId),
      product_type: 1,
      good_id: row.good_id ?? row.GoodID ?? 0,
      land_id: 0,
    });
    if (resp.code === 200 || resp.Code === 200) {
      ElMessage.success(resp.msg || resp.Msg || '删除成功');
      fetchGoods();
    } else {
      ElMessage.error(resp.msg || resp.Msg || '删除失败');
    }
  } catch (e) {
    console.error('删除失败:', e);
    ElMessage.error('删除失败');
  }
};

onMounted(() => { fetchGoods(); });
</script>

<style scoped lang="scss">
.system-order-container {
	.system-order-search {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
	}
	.system-order-pagination { display: flex; justify-content: flex-end; }
	.price-amount { font-weight: bold; color: #e74c3c; }
	.price-unit { font-size: 12px; color: #666; }
	.image-slot { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; background: #f5f7fa; color: #909399; }
}
</style> 