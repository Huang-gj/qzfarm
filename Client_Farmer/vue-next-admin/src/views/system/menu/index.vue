<template>
	<div class="system-order-container layout-pd">
		<el-card shadow="hover">
			<div class="system-order-search mb15">
				<el-input 
					v-model="searchForm.orderId" 
					size="default" 
					placeholder="请输入订单ID" 
					style="max-width: 160px"
					clearable
				>
					<template #prepend>订单ID</template>
				</el-input>
				<el-input 
					v-model="searchForm.userId" 
					size="default" 
					placeholder="请输入用户ID" 
					style="max-width: 160px"
					class="ml10"
					clearable
				>
					<template #prepend>用户ID</template>
				</el-input>
				<el-select 
					v-model="searchForm.orderStatus" 
					placeholder="订单状态" 
					style="max-width: 150px" 
					class="ml10"
					clearable
				>
					<el-option label="全部" value=""></el-option>
					<el-option label="待付款" value="待付款"></el-option>
					<el-option label="待发货" value="待发货"></el-option>
					<el-option label="已发货" value="已发货"></el-option>
					<el-option label="已完成" value="已完成"></el-option>
					<el-option label="已取消" value="已取消"></el-option>
				</el-select>
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
				<el-table-column prop="good_order_id" label="订单ID" width="120" align="center">
					<template #default="scope">
						<el-link type="primary">{{ scope.row.good_order_id }}</el-link>
					</template>
				</el-table-column>
				<el-table-column label="商品图片" width="100" align="center">
					<template #default="scope">
						<el-image
							:src="getFirstImage(scope.row.image_urls)"
							:preview-src-list="getImageList(scope.row.image_urls)"
							fit="cover"
							style="width: 50px; height: 50px; border-radius: 4px;"
							:hide-on-click-modal="true"
						>
							<template #error>
								<div class="image-slot">
									<el-icon><ele-Picture /></el-icon>
								</div>
							</template>
						</el-image>
					</template>
				</el-table-column>
				<el-table-column prop="detail" label="订单详情" min-width="150" show-overflow-tooltip></el-table-column>
				<el-table-column label="价格信息" width="120" align="center">
					<template #default="scope">
						<div>
							<div class="price-amount">¥{{ scope.row.price }}</div>
							<div class="price-unit">{{ scope.row.count }}{{ scope.row.units }}</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="user_address" label="用户地址" min-width="120" show-overflow-tooltip></el-table-column>
				<el-table-column prop="farm_address" label="农场地址" min-width="120" show-overflow-tooltip></el-table-column>
				<el-table-column prop="order_status" label="订单状态" width="100" align="center">
					<template #default="scope">
						<el-tag 
							:type="getStatusType(scope.row.order_status)" 
							size="small"
						>
							{{ scope.row.order_status }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="create_time" label="创建时间" width="160" align="center">
					<template #default="scope">
						{{ formatTime(scope.row.create_time) }}
					</template>
				</el-table-column>
				<el-table-column label="操作" width="120" align="center" fixed="right">
					<template #default="scope">
						<el-button 
							size="small" 
							type="primary" 
							link
							@click="handleViewDetail(scope.row)"
						>
							详情
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			
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

		<!-- 订单详情对话框 -->
		<el-dialog v-model="dialogVisible" title="订单详情" width="600px" :close-on-click-modal="false">
			<div v-if="currentOrder" class="order-detail">
				<el-descriptions :column="2" border>
					<el-descriptions-item label="订单ID">{{ currentOrder.good_order_id }}</el-descriptions-item>
					<el-descriptions-item label="订单状态">
						<el-tag :type="getStatusType(currentOrder.order_status)">{{ currentOrder.order_status }}</el-tag>
					</el-descriptions-item>
					<el-descriptions-item label="商品ID">{{ currentOrder.good_id }}</el-descriptions-item>
					<el-descriptions-item label="农场ID">{{ currentOrder.farm_id }}</el-descriptions-item>
					<el-descriptions-item label="用户ID">{{ currentOrder.user_id }}</el-descriptions-item>
					<el-descriptions-item label="价格">¥{{ currentOrder.price }}</el-descriptions-item>
					<el-descriptions-item label="数量">{{ currentOrder.count }}{{ currentOrder.units }}</el-descriptions-item>
					<el-descriptions-item label="创建时间">{{ formatTime(currentOrder.create_time) }}</el-descriptions-item>
					<el-descriptions-item label="用户地址" :span="2">{{ currentOrder.user_address }}</el-descriptions-item>
					<el-descriptions-item label="农场地址" :span="2">{{ currentOrder.farm_address }}</el-descriptions-item>
					<el-descriptions-item label="订单详情" :span="2">{{ currentOrder.detail }}</el-descriptions-item>
				</el-descriptions>
				
				<!-- 商品图片 -->
				<div class="mt15" v-if="currentOrder.image_urls">
					<h4>商品图片</h4>
					<div class="image-gallery">
						<el-image
							v-for="(img, index) in getImageList(currentOrder.image_urls)"
							:key="index"
							:src="img"
							:preview-src-list="getImageList(currentOrder.image_urls)"
							fit="cover"
							style="width: 80px; height: 80px; margin-right: 10px; border-radius: 4px;"
						>
							<template #error>
								<div class="image-slot">
									<el-icon><ele-Picture /></el-icon>
								</div>
							</template>
						</el-image>
					</div>
				</div>
			</div>
			<template #footer>
				<el-button @click="dialogVisible = false">关闭</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemMenu">
import { reactive, onMounted, computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getGoodOrder, type GoodOrder, type GetGoodOrderRequest } from '/@/api/order';
import { useUserInfoStore } from '/@/stores/userInfo';
import { Session } from '/@/utils/storage';

// 获取用户信息store
const userInfoStore = useUserInfoStore();

// 响应式数据
const loading = ref(false);
const dialogVisible = ref(false);
const currentOrder = ref<GoodOrder | null>(null);

// 搜索表单
const searchForm = reactive({
	orderId: '',
	userId: '',
	orderStatus: '',
});

// 分页信息
const pagination = reactive({
	currentPage: 1,
	pageSize: 20,
	total: 0,
});

// 表格数据
const tableData = ref<GoodOrder[]>([]);

// 过滤后的表格数据
const filteredTableData = computed(() => {
	let data = tableData.value;
	
	// 关键词搜索
	if (searchForm.orderId) {
		data = data.filter(item => item.good_order_id.toString().includes(searchForm.orderId));
	}
	if (searchForm.userId) {
		data = data.filter(item => item.user_id.toString().includes(searchForm.userId));
	}
	
	// 状态筛选
	if (searchForm.orderStatus) {
		data = data.filter(item => item.order_status === searchForm.orderStatus);
	}
	
	// 更新总数
	pagination.total = data.length;
	
	// 分页
	const start = (pagination.currentPage - 1) * pagination.pageSize;
	const end = start + pagination.pageSize;
	return data.slice(start, end);
});

// 获取农产品订单数据
const fetchGoodOrders = async () => {
	try {
		loading.value = true;
		
		// 优先从缓存中获取农场信息
		let farmId = null;
		const cachedFarmInfo = Session.get('farmInfo');
		console.log('缓存中的农场信息:', cachedFarmInfo); // 调试日志
		
		if (cachedFarmInfo && (cachedFarmInfo.farm_id || cachedFarmInfo.FarmID)) {
			farmId = cachedFarmInfo.farm_id || cachedFarmInfo.FarmID;
			console.log('从缓存获取farmId:', farmId); // 调试日志
		} else {
			// 如果缓存中没有农场信息，从用户信息中获取farm_id
			const userInfo = userInfoStore.getUserInfo;
			console.log('用户信息:', userInfo); // 调试日志
			
			if (userInfo && userInfo.farm_id) {
				farmId = userInfo.farm_id;
				console.log('从用户信息获取farmId:', farmId); // 调试日志
			}
		}

		if (!farmId) {
			ElMessage.error('未找到农场信息，请先绑定农场');
			return;
		}

		const params: GetGoodOrderRequest = {
			farm_id: farmId
		};

		console.log('最终使用的farm_id:', farmId); // 调试日志
		console.log('发送农产品订单请求参数:', JSON.stringify(params)); // 调试日志
		console.log('请求URL: /api/getGoodOrder'); // 调试日志
		const response = await getGoodOrder(params);
		console.log('农产品订单响应:', response); // 调试日志

		if (response.code === 200 || response.Code === 200) {
			tableData.value = response.good_order || response.Good_order || [];
			ElMessage.success('农产品订单加载成功');
		} else {
			ElMessage.error(response.msg || response.Msg || '获取农产品订单失败');
		}
	} catch (error: any) {
		console.error('获取农产品订单失败:', error);
		ElMessage.error('获取农产品订单失败');
	} finally {
		loading.value = false;
	}
};

// 格式化时间
const formatTime = (timeStr: string) => {
	if (!timeStr) return '';
	try {
		return new Date(timeStr).toLocaleString('zh-CN');
	} catch {
		return timeStr;
	}
};

// 获取状态类型
const getStatusType = (status: string) => {
	switch (status) {
		case '待付款': return 'warning';
		case '待发货': return 'info';
		case '已发货': return 'primary';
		case '已完成': return 'success';
		case '已取消': return 'danger';
		default: return 'info';
	}
};

// 获取第一张图片
const getFirstImage = (imageUrls: string) => {
	const images = getImageList(imageUrls);
	return images.length > 0 ? images[0] : '';
};

// 解析图片列表
const getImageList = (imageUrls: string) => {
	if (!imageUrls) return [];
	try {
		// 尝试解析JSON
		return JSON.parse(imageUrls);
	} catch {
		// 如果不是JSON，按逗号分隔
		return imageUrls.split(',').filter(url => url.trim());
	}
};

// 搜索
const handleSearch = () => {
	pagination.currentPage = 1;
};

// 刷新
const handleRefresh = () => {
	searchForm.orderId = '';
	searchForm.userId = '';
	searchForm.orderStatus = '';
	pagination.currentPage = 1;
	fetchGoodOrders();
};

// 查看详情
const handleViewDetail = (row: GoodOrder) => {
	currentOrder.value = row;
	dialogVisible.value = true;
};

// 分页大小改变
const handleSizeChange = (size: number) => {
	pagination.pageSize = size;
	pagination.currentPage = 1;
};

// 当前页改变
const handleCurrentChange = (page: number) => {
	pagination.currentPage = page;
};

// 组件挂载时获取数据
onMounted(() => {
	fetchGoodOrders();
});
</script>

<style scoped lang="scss">
.system-order-container {
	.system-order-search {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
	}
	
	.system-order-pagination {
		display: flex;
		justify-content: flex-end;
	}
	
	.price-amount {
		font-weight: bold;
		color: #e74c3c;
	}
	
	.price-unit {
		font-size: 12px;
		color: #666;
	}
	
	.image-slot {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		background: #f5f7fa;
		color: #909399;
	}
	
	.order-detail {
		.image-gallery {
			display: flex;
			flex-wrap: wrap;
			gap: 10px;
		}
	}
}
</style>
