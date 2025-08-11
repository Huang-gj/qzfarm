<template>
	<div class="sales-analysis-container layout-pd">
		<!-- 页面标题 -->
		<div class="page-header mb15">
			<h2>销售额分析</h2>
			<p>查看农场销售总额的详细统计和趋势分析</p>
		</div>

		<!-- 时间段选择按钮 -->
		<div class="time-selector mb15">
			<el-card class="time-selector-card">
				<div class="time-buttons">
					<el-button 
						:type="state.activeTimeType === 'year' ? 'primary' : 'default'"
						@click="handleTimeTypeChange('year')"
						size="large"
					>
						年总结
					</el-button>
					<el-button 
						:type="state.activeTimeType === 'month' ? 'primary' : 'default'"
						@click="handleTimeTypeChange('month')"
						size="large"
					>
						月总结
					</el-button>
					<el-button 
						:type="state.activeTimeType === 'week' ? 'primary' : 'default'"
						@click="handleTimeTypeChange('week')"
						size="large"
					>
						周总结
					</el-button>
				</div>
				<div class="time-info">
					<span class="time-label">当前查看：</span>
					<el-select 
						v-model="state.selectedTime" 
						@change="handleTimeSelectionChange"
						style="width: 200px"
						placeholder="请选择时间"
					>
						<el-option
							v-for="option in state.timeOptions"
							:key="option.value"
							:label="option.label"
							:value="option.value"
						/>
					</el-select>
				</div>
			</el-card>
		</div>

		<!-- 数据概览卡片 -->
		<el-row :gutter="15" class="overview-cards mb15">
			<el-col :xs="24" :sm="12" :md="12" :xl="12">
				<el-card class="overview-card">
					<div class="card-content">
						<div class="card-icon" style="background: var(--next-color-success-lighter)">
							<i class="fa fa-dollar" style="color: var(--el-color-success)"></i>
						</div>
						<div class="card-info">
							<div class="card-value">¥{{ state.overview.totalSales.toFixed(2) }}</div>
							<div class="card-label">总销售额</div>
						</div>
					</div>
				</el-card>
			</el-col>
			<el-col :xs="24" :sm="12" :md="12" :xl="12">
				<el-card class="overview-card">
					<div class="card-content">
						<div class="card-icon" style="background: var(--next-color-primary-lighter)">
							<i class="fa fa-dollar" style="color: var(--el-color-primary); font-size: 1.5em;"></i>
						</div>
						<div class="card-info">
							<div class="card-value">¥{{ state.overview.avgDailySales.toFixed(2) }}</div>
							<div class="card-label">日均销售额</div>
						</div>
					</div>
				</el-card>
			</el-col>
		</el-row>
		
		<el-row :gutter="15" class="overview-cards mb15">
			<el-col :xs="24" :sm="12" :md="12" :xl="12">
				<el-card class="overview-card">
					<div class="card-content">
						<div class="card-icon" style="background: var(--next-color-warning-lighter)">
							<i class="fa fa-dollar" style="color: var(--el-color-warning)"></i>
						</div>
						<div class="card-info">
							<div class="card-value">¥{{ state.overview.goodSales.toFixed(2) }}</div>
							<div class="card-label">农产品销售额</div>
						</div>
					</div>
				</el-card>
			</el-col>
			<el-col :xs="24" :sm="12" :md="12" :xl="12">
				<el-card class="overview-card">
					<div class="card-content">
						<div class="card-icon" style="background: var(--next-color-danger-lighter)">
							<i class="fa fa-dollar" style="color: var(--el-color-danger)"></i>
						</div>
						<div class="card-info">
							<div class="card-value">¥{{ state.overview.landSales.toFixed(2) }}</div>
							<div class="card-label">土地租赁销售额</div>
						</div>
					</div>
				</el-card>
			</el-col>
		</el-row>

		<!-- 图表 -->
		<el-row class="mb15">
			<el-col :span="24">
				<el-card class="chart-card">
					<template #header>
						<div class="card-header">
							<span>销售额趋势图表</span>
						</div>
					</template>
					<div ref="chartRef" class="chart-container"></div>
				</el-card>
			</el-col>
		</el-row>

		<!-- 数据表格 -->
		<el-row>
			<el-col :span="24">
				<el-card class="table-card">
					<template #header>
						<div class="card-header">
							<span>详细数据列表</span>
						</div>
					</template>
					<el-table
						:data="state.tableData"
						v-loading="state.loading"
						style="width: 100%"
						max-height="320"
					>
						<el-table-column prop="stat_date" label="日期" width="100" />
						<el-table-column prop="good_sale_count" label="农产品销售额" align="center">
							<template #default="scope">
								¥{{ scope.row.good_sale_count.toFixed(2) }}
							</template>
						</el-table-column>
						<el-table-column prop="land_sale_count" label="土地销售额" align="center">
							<template #default="scope">
								¥{{ scope.row.land_sale_count.toFixed(2) }}
							</template>
						</el-table-column>
						<el-table-column label="总销售额" align="center">
							<template #default="scope">
								¥{{ (scope.row.good_sale_count + scope.row.land_sale_count).toFixed(2) }}
							</template>
						</el-table-column>
					</el-table>
					
					<!-- 分页 -->
					<div class="pagination-container">
						<el-pagination
							v-model:current-page="state.pagination.page"
							v-model:page-size="state.pagination.size"
							:page-sizes="[10, 20, 50, 100]"
							:total="state.pagination.total"
							layout="total, sizes, prev, pager, next, jumper"
							@size-change="handleSizeChange"
							@current-change="handleCurrentChange"
						/>
					</div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script setup lang="ts" name="salesAnalysis">
import { reactive, ref, onMounted, nextTick, watch } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { useUserInfoStore } from '/@/stores/userInfo';
import { Session } from '/@/utils/storage';
import { getSaleSummary, type SaleSummaryRequest, type SaleData } from '/@/api/farm';

// 获取用户信息
const userInfoStore = useUserInfoStore();
const chartRef = ref<HTMLElement>();

// 状态管理
const state = reactive({
	activeTimeType: 'year' as 'year' | 'month' | 'week',
	selectedTime: '',
	timeOptions: [] as Array<{value: string, label: string}>,
	loading: false,
	overview: {
		totalSales: 0,
		avgDailySales: 0,
		goodSales: 0,
		landSales: 0,
		ordersGrowth: '',
		salesGrowth: '',
		avgGrowth: '',
		daysGrowth: '',
	},
	tableData: [] as SaleData[],
	allData: [] as SaleData[],
	pagination: {
		page: 1,
		size: 20,
		total: 0,
	},
	chart: null as any,
});

// 获取农场ID
const getFarmId = (): number => {
	const userInfo = userInfoStore.getUserInfo;
	const cachedFarmInfo = Session.get('farmInfo');
	
	let farmId = 0;
	if (cachedFarmInfo?.farm_id) {
		farmId = cachedFarmInfo.farm_id;
	} else if (userInfo?.farm_id) {
		farmId = userInfo.farm_id;
	}
	
	return farmId;
};

// 计算环比增长率
const calculateGrowthRate = (current: number, previous: number): string => {
	if (previous === 0) {
		if (current > 0) {
			return '环比增长率：<span style="color: #F56C6C;">+∞%</span>';
		} else {
			return '环比增长率：<span style="color: #909399;">0%</span>';
		}
	}
	
	const growthRate = ((current / previous) - 1) * 100;
	const formattedRate = Math.abs(growthRate).toFixed(1);
	
	if (growthRate > 0) {
		return `环比增长率：<span style="color: #F56C6C;">+${formattedRate}%</span>`;
	} else if (growthRate < 0) {
		return `环比增长率：<span style="color: #67C23A;">-${formattedRate}%</span>`;
	} else {
		return '环比增长率：<span style="color: #909399;">0%</span>';
	}
};

// 生成时间选项
const generateTimeOptions = (type: 'year' | 'month' | 'week') => {
	const now = new Date();
	const currentYear = now.getFullYear();
	const options: Array<{value: string, label: string}> = [];

	switch (type) {
		case 'year':
			const startYear = 2025;
			for (let year = startYear; year <= currentYear; year++) {
				options.push({
					value: year.toString(),
					label: `${year}年`
				});
			}
			break;
		case 'month':
			for (let month = 1; month <= 12; month++) {
				const monthStr = month.toString().padStart(2, '0');
				options.push({
					value: `${currentYear}-${monthStr}`,
					label: `${currentYear}年${month}月`
				});
			}
			break;
		case 'week':
			const startOfYear = new Date(currentYear, 0, 1);
			let currentDate = new Date(startOfYear);
			
			while (currentDate.getDay() !== 1) {
				currentDate.setDate(currentDate.getDate() - 1);
			}
			
			let weekNum = 1;
			const maxWeeks = 52;
			
			while (weekNum <= maxWeeks) {
				const weekStart = new Date(currentDate);
				const weekEnd = new Date(currentDate);
				weekEnd.setDate(weekStart.getDate() + 6);
				
				if (weekEnd.getFullYear() > currentYear) {
					break;
				}
				
				const startStr = `${weekStart.getFullYear()}-${(weekStart.getMonth() + 1).toString().padStart(2, '0')}-${weekStart.getDate().toString().padStart(2, '0')}`;
				const endStr = `${weekEnd.getFullYear()}-${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}-${weekEnd.getDate().toString().padStart(2, '0')}`;
				
				options.push({
					value: `${startStr}|${endStr}`,
					label: `${weekStart.getMonth() + 1}月${weekStart.getDate()}日-${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日（第${weekNum}周）`
				});
				
				currentDate.setDate(currentDate.getDate() + 7);
				weekNum++;
			}
			break;
	}

	return options;
};

// 获取时间范围
const getTimeRange = (type: 'year' | 'month' | 'week', selectedValue: string) => {
	let startDate: string = '';
	let endDate: string = '';

	try {
		switch (type) {
			case 'year':
				const year = parseInt(selectedValue);
				if (isNaN(year)) {
					throw new Error('年份格式无效');
				}
				startDate = `${year}-01-01`;
				endDate = `${year}-12-31`;
				break;
			case 'month':
				const [yearStr, monthStr] = selectedValue.split('-');
				const yearNum = parseInt(yearStr);
				const monthNum = parseInt(monthStr);
				
				if (isNaN(yearNum) || isNaN(monthNum)) {
					throw new Error('月份格式无效');
				}
				
				startDate = `${yearNum}-${monthStr}-01`;
				const lastDay = new Date(yearNum, monthNum, 0).getDate();
				endDate = `${yearNum}-${monthStr}-${lastDay.toString().padStart(2, '0')}`;
				break;
			case 'week':
				if (!selectedValue || !selectedValue.includes('|')) {
					throw new Error('周格式无效');
				}
				const [weekStart, weekEnd] = selectedValue.split('|');
				if (!weekStart || !weekEnd) {
					throw new Error('周日期范围无效');
				}
				startDate = weekStart;
				endDate = weekEnd;
				break;
			default:
				throw new Error('未知的时间类型');
		}
	} catch (error) {
		console.error('时间范围计算错误:', error);
		const now = new Date();
		const year = now.getFullYear();
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const day = now.getDate().toString().padStart(2, '0');
		startDate = `${year}-${month}-${day}`;
		endDate = `${year}-${month}-${day}`;
	}

	return { startDate, endDate };
};

// 获取销售数据
const fetchSalesData = async () => {
	try {
		state.loading = true;
		const farmId = getFarmId();
		
		if (!farmId) {
			ElMessage.error('未找到农场信息，请先绑定农场');
			return;
		}

		if (!state.selectedTime) {
			ElMessage.error('请选择查看时间');
			return;
		}

		const timeRange = getTimeRange(state.activeTimeType, state.selectedTime);

		if (!timeRange.startDate || !timeRange.endDate) {
			ElMessage.error('时间范围计算错误，请重新选择');
			return;
		}

		const params: SaleSummaryRequest = {
			farm_id: farmId,
			start_date: timeRange.startDate,
			end_date: timeRange.endDate,
		};

		const response = await getSaleSummary(params);

			if (response.code === 200) {
		const prevData = state.allData; // Store previous data before updating
		state.allData = response.sale_data || [];
		updateOverview(prevData); // Pass previous data for growth rate calculation
		updateTableData();
		updateChart();
	} else {
		ElMessage.error(`获取数据失败: ${response.msg}`);
	}
	} catch (error) {
		console.error('获取销售数据失败:', error);
		ElMessage.error('获取数据失败，请稍后重试');
	} finally {
		state.loading = false;
	}
};

// 更新概览数据（销售额相关）
const updateOverview = (prevData: SaleData[] = []) => {
	const currentData = state.allData;
	
	state.overview.goodSales = currentData.reduce((sum, item) => sum + item.good_sale_count, 0);
	state.overview.landSales = currentData.reduce((sum, item) => sum + item.land_sale_count, 0);
	state.overview.totalSales = state.overview.goodSales + state.overview.landSales;
	state.overview.avgDailySales = currentData.length > 0 ? state.overview.totalSales / currentData.length : 0;

	// 计算环比
	if (prevData.length > 0) {
		const prevGoodSales = prevData.reduce((sum, item) => sum + item.good_sale_count, 0);
		const prevLandSales = prevData.reduce((sum, item) => sum + item.land_sale_count, 0);
		const prevTotalSales = prevGoodSales + prevLandSales;
		const prevAvgDailySales = prevData.length > 0 ? prevTotalSales / prevData.length : 0;

		state.overview.ordersGrowth = calculateGrowthRate(state.overview.totalSales, prevTotalSales);
		state.overview.salesGrowth = calculateGrowthRate(state.overview.avgDailySales, prevAvgDailySales);
		state.overview.avgGrowth = calculateGrowthRate(state.overview.goodSales, prevGoodSales);
		state.overview.daysGrowth = calculateGrowthRate(state.overview.landSales, prevLandSales);
	} else {
		state.overview.ordersGrowth = '环比增长率：<span style="color: #909399;">N/A</span>';
		state.overview.salesGrowth = '环比增长率：<span style="color: #909399;">N/A</span>';
		state.overview.avgGrowth = '环比增长率：<span style="color: #909399;">N/A</span>';
		state.overview.daysGrowth = '环比增长率：<span style="color: #909399;">N/A</span>';
	}
};

// 更新表格数据
const updateTableData = () => {
	const start = (state.pagination.page - 1) * state.pagination.size;
	const end = start + state.pagination.size;
	
	state.tableData = state.allData.slice(start, end);
	state.pagination.total = state.allData.length;
};

// 初始化图表
const initChart = () => {
	if (!chartRef.value) return;
	
	state.chart = echarts.init(chartRef.value);
	updateChart();
};

// 更新图表（销售额相关）
const updateChart = () => {
	if (!state.chart) return;

	const dates = state.allData.map(item => item.stat_date);
	const goodSales = state.allData.map(item => item.good_sale_count);
	const landSales = state.allData.map(item => item.land_sale_count);
	const totalSales = state.allData.map(item => item.good_sale_count + item.land_sale_count);

	const option = {
		title: {
			text: '销售额趋势分析',
			left: 'center',
			textStyle: {
				fontSize: 16,
			},
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
			},
		},
		legend: {
			data: ['农产品销售额', '土地销售额', '总销售额'],
			top: 30,
		},
		grid: {
			top: 70,
			left: 50,
			right: 50,
			bottom: 50,
		},
		xAxis: {
			type: 'category',
			data: dates,
			axisLabel: {
				rotate: 45,
				fontSize: 10,
			},
		},
		yAxis: {
			type: 'value',
			name: '销售额',
			axisLabel: {
				formatter: '¥{value}',
			},
		},
		series: [
			{
				name: '农产品销售额',
				type: 'bar',
				data: goodSales,
				itemStyle: {
					color: '#67C23A',
				},
			},
			{
				name: '土地销售额',
				type: 'bar',
				data: landSales,
				itemStyle: {
					color: '#E6A23C',
				},
			},
			{
				name: '总销售额',
				type: 'line',
				data: totalSales,
				smooth: true,
				itemStyle: {
					color: '#409EFF',
				},
				lineStyle: {
					color: '#409EFF',
				},
			},
		],
	};

	state.chart.setOption(option);
};

// 时间类型切换
const handleTimeTypeChange = (type: 'year' | 'month' | 'week') => {
	state.activeTimeType = type;
	state.timeOptions = generateTimeOptions(type);
	
	if (state.timeOptions.length > 0) {
		state.selectedTime = state.timeOptions[0].value;
	}
	
	state.pagination.page = 1;
	fetchSalesData();
};

// 时间选择改变
const handleTimeSelectionChange = () => {
	state.pagination.page = 1;
	fetchSalesData();
};

// 分页处理
const handleSizeChange = (size: number) => {
	state.pagination.size = size;
	state.pagination.page = 1;
	updateTableData();
};

const handleCurrentChange = (page: number) => {
	state.pagination.page = page;
	updateTableData();
};

// 监听数据变化更新表格
watch(() => state.allData, () => {
	updateTableData();
});

// 页面加载
onMounted(() => {
	state.timeOptions = generateTimeOptions(state.activeTimeType);
	if (state.timeOptions.length > 0) {
		state.selectedTime = state.timeOptions[0].value;
	}
	
	nextTick(() => {
		initChart();
		fetchSalesData();
	});
});
</script>

<style scoped lang="scss">
.sales-analysis-container {
	.page-header {
		text-align: center;
		h2 {
			margin: 0;
			color: var(--el-text-color-primary);
			font-size: 24px;
		}
		p {
			margin: 10px 0 0 0;
			color: var(--el-text-color-regular);
			font-size: 14px;
		}
	}

	.time-selector-card {
		.time-buttons {
			display: flex;
			justify-content: center;
			gap: 15px;
			margin-bottom: 15px;
		}
		.time-info {
			text-align: center;
			.time-label {
				color: var(--el-text-color-regular);
				font-size: 14px;
			}
		}
	}

	.overview-cards {
		.overview-card {
			height: 120px;
			.card-content {
				display: flex;
				align-items: center;
				height: 80px;
				.card-icon {
					width: 60px;
					height: 60px;
					min-width: 60px;
					min-height: 60px;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 15px;
					flex-shrink: 0;
					i {
						font-size: 24px;
					}
				}
				.card-info {
					flex: 1;
					.card-value {
						font-size: 24px;
						font-weight: bold;
						color: var(--el-text-color-primary);
						line-height: 1;
					}
					.card-label {
						font-size: 14px;
						color: var(--el-text-color-regular);
						margin-top: 5px;
					}
				}
			}
		}
	}

	.chart-card, .table-card {
		height: 500px;
		.card-header {
			font-weight: bold;
			font-size: 16px;
		}
		.chart-container {
			height: 400px;
			width: 100%;
		}
	}

	.table-card {
		height: 500px;
		display: flex;
		flex-direction: column;
		:deep(.el-card__header) {
			flex-shrink: 0;
			padding: 18px 20px;
		}
		:deep(.el-card__body) {
			flex: 1;
			display: flex;
			flex-direction: column;
			padding: 0 20px 10px 20px;
			overflow: hidden;
		}
		:deep(.el-table) {
			flex: 1;
			min-height: 0;
		}
	}

	.pagination-container {
		display: flex;
		justify-content: center;
		margin-top: 15px;
		padding: 10px 0;
		flex-shrink: 0;
	}
}
</style> 