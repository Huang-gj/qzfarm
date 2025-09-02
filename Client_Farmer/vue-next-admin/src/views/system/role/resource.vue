<template>
	<div class="system-land-resource-container layout-padding">
		<div class="system-land-resource-padding layout-padding-auto layout-padding-view">
			<div class="system-land-resource-search mb15">
				<el-input 
					v-model="searchForm.landId" 
					size="default" 
					placeholder="请输入土地ID" 
					style="max-width: 180px"
					clearable
				>
					<template #prepend>土地ID</template>
				</el-input>
				<el-input 
					v-model="searchForm.landName" 
					size="default" 
					placeholder="请输入土地名称" 
					style="max-width: 220px"
					class="ml10"
					clearable
				>
					<template #prepend>土地名称</template>
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
				<el-table-column prop="land_id" label="土地ID" width="120" align="center">
					<template #default="scope">
						<el-link type="primary">{{ scope.row.land_id }}</el-link>
					</template>
				</el-table-column>
				<el-table-column label="土地图片" width="100" align="center">
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
				<el-table-column prop="land_name" label="土地名称" min-width="150" show-overflow-tooltip></el-table-column>
				<el-table-column prop="land_tag" label="标签" width="140" align="center">
					<template #default="scope">
						<el-tag v-if="scope.row.land_tag" type="info">{{ scope.row.land_tag }}</el-tag>
						<span v-else>-</span>
					</template>
				</el-table-column>
				<el-table-column prop="area" label="面积" width="120" align="center"></el-table-column>
				<el-table-column prop="price" label="价格" width="120" align="center"></el-table-column>
				<el-table-column prop="sale_status" label="上架状态" width="100" align="center">
					<template #default="scope">
						<el-tag :type="scope.row.sale_status === 0 ? 'success' : 'info'">{{ scope.row.sale_status === 0 ? '上架' : '下架' }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="租赁时间剩余" width="220" align="center">
					<template #default="scope">
						{{ formatRemainingTime(scope.row.sale_time) }}
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="创建时间" width="160" align="center">
					<template #default="scope">
						{{ formatTime(scope.row.create_time) }}
					</template>
				</el-table-column>
				<el-table-column prop="detail" label="土地详情" min-width="180" show-overflow-tooltip></el-table-column>
				<el-table-column label="操作" width="160" align="center">
					<template #default="scope">
						<el-button type="primary" link @click="openEdit(scope.row)">修改</el-button>
						<el-divider direction="vertical" />
						<el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<el-dialog v-model="editDialogVisible" title="修改土地资源" width="640px" destroy-on-close>
				<el-form :model="editForm" label-width="100px">
					<el-form-item label="土地名称"><el-input v-model="editForm.land_name" /></el-form-item>
					<el-form-item label="标签"><el-input v-model="editForm.land_tag" /></el-form-item>
					<el-form-item label="面积"><el-input v-model="editForm.area" /></el-form-item>
					<el-form-item label="价格"><el-input-number v-model="editForm.price" :min="0" :precision="2" :step="0.1" /></el-form-item>
					<el-form-item label="上架状态"><el-switch v-model="editForm.sale_status" :active-value="0" :inactive-value="1" /></el-form-item>
					<el-form-item label="租赁截止"><el-date-picker v-model="editForm.sale_time" type="datetime" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
					<el-form-item label="土地图片">
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
					<el-form-item label="详情"><el-input v-model="editForm.detail" type="textarea" :rows="4" /></el-form-item>
				</el-form>
				<template #footer>
					<el-button @click="editDialogVisible = false">取消</el-button>
					<el-button type="primary" :loading="editSubmitting" @click="submitEdit">保存</el-button>
				</template>
			</el-dialog>
 			
 			<!-- 分页 -->
 			<div class="system-land-resource-pagination mt15">
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
 		</div>
 	</div>
</template>

<script setup lang="ts" name="landResource">
import { reactive, onMounted, computed, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { UploadUserFile, UploadFile } from 'element-plus';
import { getProduct, updateProduct, delProduct, type Land, type GetProductRequest, type UpdateProductRequest } from '/@/api/product';
import { testFileUpload } from '/@/api/test';
import { useUserInfoStore } from '/@/stores/userInfo';
import { Session } from '/@/utils/storage';
import ImageCarousel from '/@/components/imageCarousel/index.vue';

const userInfoStore = useUserInfoStore();

const loading = ref(false);
const editDialogVisible = ref(false);
const editSubmitting = ref(false);

const editForm = reactive<any>({
  id: 0,
  land_id: 0,
  land_name: '',
  land_tag: '',
  area: '',
  price: 0,
  sale_status: 0,
  sale_time: '',
  detail: '',
  image_urls: '',
});
const editFileList = ref<UploadUserFile[]>([]);
const editImages = ref<string[]>([]);

const searchForm = reactive({
	landId: '',
	landName: '',
});

const pagination = reactive({
	currentPage: 1,
	pageSize: 20,
	total: 0,
});

const tableData = ref<Land[]>([]);

const filteredTableData = computed(() => {
	let data = tableData.value;
	if (searchForm.landId) {
		data = data.filter(item => item.land_id?.toString().includes(searchForm.landId));
	}
	if (searchForm.landName) {
		data = data.filter(item => (item.land_name || '').includes(searchForm.landName));
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

// 上传文件到后端的接口（参考新增页面的成功实现）
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

const fetchLands = async () => {
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
		const params: GetProductRequest = { product_type: 2, farm_id: Number(farmId) };
		console.log('土地资源管理-请求参数:', params);
		const resp: any = await getProduct(params);
		console.log('土地资源管理-接口响应:', resp);
		if ((resp.code === 200 || resp.Code === 200) && (resp.land || resp.Land)) {
			const rawList: any[] = (resp.land as any) || resp.Land || [];
			console.log('土地资源管理-原始列表首条键名:', rawList?.[0] ? Object.keys(rawList[0]) : []);
			console.log('土地资源管理-原始列表首条(CreateTime?):', rawList?.[0]?.CreateTime, 'create_time:', rawList?.[0]?.create_time, 'createTime:', rawList?.[0]?.createTime);
			tableData.value = rawList.map((it: any) => ({
				...it,
				create_time: it.create_time || it.CreateTime || it.createTime || '',
				land_tag: it.land_tag || it.LandTag || it.landTag || '',
			}));
			console.log('土地资源管理-资源数据(归一化后):', tableData.value);
			ElMessage.success('土地资源加载成功');
		} else {
			ElMessage.error(resp.msg || resp.Msg || '获取土地资源失败');
		}
	} catch (e) {
		console.error('获取土地资源失败:', e);
		ElMessage.error('获取土地资源失败');
	} finally {
		loading.value = false;
	}
};

const formatTime = (timeStr: string) => {
	if (!timeStr) return '';
	const d = parseToDate(timeStr);
	return d ? d.toLocaleString('zh-CN') : timeStr;
};

const parseToDate = (val: any): Date | null => {
	if (val === null || val === undefined) return null;
	if (typeof val === 'number') {
		const ms = val > 1e12 ? val : val * 1000;
		const d = new Date(ms);
		return isNaN(d.getTime()) ? null : d;
	}
	if (typeof val === 'string') {
		const s = val.trim();
		if (!s) return null;
		const num = Number(s);
		if (!isNaN(num)) {
			const ms = num > 1e12 ? num : num * 1000;
			const d = new Date(ms);
			return isNaN(d.getTime()) ? null : d;
		}
		const normalized = s.replace(/-/g, '/').replace('T', ' ').replace(/Z$/i, '');
		const d = new Date(normalized);
		return isNaN(d.getTime()) ? null : d;
	}
	return null;
};

const formatRemainingTime = (saleTime: any) => {
	const end = parseToDate(saleTime);
	if (!end) return '租赁时间剩余：0天0小时0分钟';
	let diffMs = end.getTime() - Date.now();
	if (diffMs <= 0) return '租赁时间剩余：0天0小时0分钟';
	const totalMinutes = Math.floor(diffMs / 60000);
	const days = Math.floor(totalMinutes / (60 * 24));
	const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
	const minutes = totalMinutes % 60;
	return `租赁时间剩余：${days}天${hours}小时${minutes}分钟`;
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
  editForm.land_id = row.land_id ?? row.LandID ?? 0;
  editForm.land_name = row.land_name ?? row.LandName ?? '';
  editForm.land_tag = row.land_tag ?? row.LandTag ?? '';
  editForm.area = row.area ?? '';
  editForm.price = row.price ?? 0;
  editForm.sale_status = row.sale_status ?? 0;
  editForm.sale_time = row.sale_time ?? '';
  editForm.detail = row.detail ?? '';
  editForm.image_urls = row.image_urls ?? '';
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
  
  try {
    editSubmitting.value = true;
    
    // 第一步：调用更新土地接口，image_urls传空数组
    console.log('第一步：更新土地信息...');
    const payload: UpdateProductRequest = {
      farm_id: Number(farmId),
      product_type: 2,
      good_id: 0, // 更新土地时农产品ID为0
      land_id: editForm.land_id || 0, // 使用实际的土地ID
      land: {
        id: editForm.id,
        land_id: editForm.land_id,
        land_name: editForm.land_name,
        land_tag: editForm.land_tag,
        area: editForm.area,
        price: editForm.price,
        sale_status: editForm.sale_status,
        sale_time: editForm.sale_time,
        detail: editForm.detail,
        image_urls: [], // 传空数组，图片将通过第二个接口上传
        del_state: 0,
        del_time: '',
        create_time: '',
        farm_id: Number(farmId),
      } as any,
      // 为兼容后端校验，传入带默认值的 Good 对象
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
    
    const resp: any = await updateProduct(payload);
    if (resp.code === 200 || resp.Code === 200) {
      console.log('第一步成功，准备上传图片...');
      
      // 第二步：上传图片文件（参考新增页面的成功实现）
      if (editFileList.value && editFileList.value.length > 0) {
        console.log('第二步：上传土地图片，land_id:', editForm.land_id);
        
        try {
          await uploadFilesToBackend(Number(farmId), editForm.land_id || 0, editFileList.value);
          ElMessage.success('土地信息修改并上传图片成功！');
        } catch (uploadError) {
          console.error('图片上传失败:', uploadError);
          ElMessage.warning('土地信息修改成功，但部分图片上传失败');
        }
      } else {
        ElMessage.success(resp.msg || resp.Msg || '修改成功');
      }
      
      editDialogVisible.value = false;
      fetchLands();
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
const handleRefresh = () => { searchForm.landId = ''; searchForm.landName = ''; pagination.currentPage = 1; fetchLands(); };
const handleSizeChange = (size: number) => { pagination.pageSize = size; pagination.currentPage = 1; };
const handleCurrentChange = (page: number) => { pagination.currentPage = page; };

const handleDelete = async (row: any) => {
  const farmId = getFarmId();
  if (!farmId) { ElMessage.error('未找到农场信息，请先绑定农场'); return; }
  try {
    await ElMessageBox.confirm('确定删除该土地资源吗？', '提示', { type: 'warning' });
  } catch { return; }
  try {
    const resp: any = await delProduct({
      farm_id: Number(farmId),
      product_type: 2,
      good_id: 0,
      land_id: row.land_id ?? row.LandID ?? 0,
    });
    if (resp.code === 200 || resp.Code === 200) {
      ElMessage.success(resp.msg || resp.Msg || '删除成功');
      fetchLands();
    } else {
      ElMessage.error(resp.msg || resp.Msg || '删除失败');
    }
  } catch (e) {
    console.error('删除失败:', e);
    ElMessage.error('删除失败');
  }
};

onMounted(() => { fetchLands(); });
</script>

<style scoped lang="scss">
.system-land-resource-container {
	.system-land-resource-search {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
	}
	.system-land-resource-pagination { display: flex; justify-content: flex-end; }
	.image-slot { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; background: #f5f7fa; color: #909399; }
}
</style> 