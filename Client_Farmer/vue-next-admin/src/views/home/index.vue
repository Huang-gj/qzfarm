<template>
	<div class="home-container layout-pd">
		<el-row :gutter="15" class="home-card-one mb15">
			<el-col
				:xs="24"
				:sm="12"
				:md="12"
				:lg="6"
				:xl="6"
				v-for="(v, k) in state.homeOne"
				:key="k"
				:class="{ 'home-media home-media-lg': k > 1, 'home-media-sm': k === 1 }"
			>
				<div 
					class="home-card-item flex home-card-clickable" 
					@click="handleCardClick(k)"
					:style="{ cursor: 'pointer' }"
				>
					<div class="flex-margin flex w100" :class="` home-one-animation${k}`">
						<div class="flex-auto">
							<span class="font30">{{ v.num1 }}</span>
							<div class="mt10">{{ v.num3 }}</div>
						</div>
						<div class="home-card-item-icon flex" :style="{ background: `var(${v.color2})` }">
							<i class="flex-margin font32" :class="v.num4" :style="{ color: `var(${v.color3})` }"></i>
						</div>
					</div>
					<!-- 跳转提示 -->
					<div class="card-overlay">
						<el-button type="primary" size="small" circle>
							<i class="fa fa-arrow-right"></i>
						</el-button>
					</div>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="15" class="home-card-two mb15">
			<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
				<div class="home-card-item">
					<div style="height: 100%" ref="homeLineRef"></div>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="15" class="home-card-three">
			<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
				<div class="home-card-item">
					<div class="home-card-item-title">农业物联网</div>
					<div class="home-monitor">
						<div class="flex-warp">
							<div class="flex-warp-item" v-for="(v, k) in state.homeThree" :key="k">
								<div class="flex-warp-item-box" :class="`home-animation${k}`">
									<div class="flex-margin">
										<i :class="v.icon" :style="{ color: v.iconColor }"></i>
										<span class="pl5">{{ v.label }}</span>
										<div class="mt10">{{ v.value }}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script setup lang="ts" name="home">
import { reactive, onMounted, ref, watch, nextTick, onActivated, markRaw } from 'vue';
import * as echarts from 'echarts';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useUserInfoStore } from '/@/stores/userInfo';
import { Session } from '/@/utils/storage';
import { getTotalData, type GetTotalDataRequest, getLastOneYearSaleData, type GetLastOneYearSaleDataRequest, type SaleData } from '/@/api/farm';
import { ElMessage } from 'element-plus';

// 定义变量内容
const homeLineRef = ref();
// const homePieRef = ref(); // 已删除
// const homeBarRef = ref(); // 已删除
const router = useRouter();
const storesTagsViewRoutes = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const userInfoStore = useUserInfoStore();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { isTagsViewCurrenFull } = storeToRefs(storesTagsViewRoutes);
const state = reactive({
	global: {
		homeChartOne: null,
		homeChartTwo: null,
		homeCharThree: null,
		dispose: [null, '', undefined],
	} as any,
	homeOne: [
		{
			num1: '0',
			num3: '农产品订单',
			num4: 'fa fa-shopping-cart',
			color2: '--next-color-primary-lighter',
			color3: '--el-color-primary',
		},
		{
			num1: '0',
			num3: '土地订单',
			num4: 'iconfont icon-ditu',
			color2: '--next-color-success-lighter',
			color3: '--el-color-success',
		},
		{
			num1: '0',
			num3: '销售总额',
			num4: 'fa fa-dollar',
			color2: '--next-color-warning-lighter',
			color3: '--el-color-warning',
		},
		{
			num1: '0',
			num3: '系统使用人数',
			num4: 'fa fa-users',
			color2: '--next-color-danger-lighter',
			color3: '--el-color-danger',
		},
	],
	homeThree: [
		{
			icon: 'iconfont icon-yangan',
			label: '温度监测',
			value: '25.6℃',
			iconColor: '#F72B3F',
		},
		{
			icon: 'iconfont icon-wendu',
			label: '湿度监测',
			value: '65%RH',
			iconColor: '#91BFF8',
		},
		{
			icon: 'iconfont icon-shidu',
			label: '土壤湿度',
			value: '78%',
			iconColor: '#88D565',
		},
		{
			icon: 'iconfont icon-shidu',
			label: '光照强度',
			value: '45kLux',
			iconColor: '#88D565',
		},
		{
			icon: 'iconfont icon-zaosheng',
			label: '风速',
			value: '3.2m/s',
			iconColor: '#FBD4A0',
		},
		{
			icon: 'iconfont icon-zaosheng',
			label: '降雨量',
			value: '0mm',
			iconColor: '#FBD4A0',
		},
		{
			icon: 'iconfont icon-zaosheng',
			label: 'pH值',
			value: '6.8',
			iconColor: '#FBD4A0',
		},
		{
			icon: 'iconfont icon-zaosheng',
			label: '氮含量',
			value: '120mg/kg',
			iconColor: '#FBD4A0',
		},
		{
			icon: 'iconfont icon-zaosheng',
			label: '磷含量',
			value: '85mg/kg',
			iconColor: '#FBD4A0',
		},
	],
	myCharts: [] as EmptyArrayType,
	charts: {
		theme: '',
		bgColor: '',
		color: '#303133',
	},
	// 销售趋势数据
	salesData: {
		months: [] as string[],
		goodSales: [] as number[],
		landSales: [] as number[],
	},
});

// 卡片点击处理函数
const handleCardClick = (index: number) => {
	console.log('点击卡片:', index);
	
	switch (index) {
		case 0: // 农产品订单
			router.push('/visualizing/visualizingLinkDemo1');
			break;
		case 1: // 土地订单
			router.push('/visualizing/visualizingLinkDemo2');
			break;
		case 2: // 销售总额
			router.push('/visualizing/salesAnalysis');
			break;
		case 3: // 系统使用人数
			router.push('/visualizing/userAnalysis');
			break;
		default:
			break;
	}
};

// 获取农场ID的工具函数
const getFarmId = (): number => {
	const userInfo = userInfoStore.getUserInfo;
	const cachedFarmInfo = Session.get('farmInfo');
	
	let farmId = 0;
	if (cachedFarmInfo?.farm_id) {
		farmId = cachedFarmInfo.farm_id;
	} else if (userInfo?.farm_id) {
		farmId = userInfo.farm_id;
	}
	
	console.log('获取农场ID:', farmId);
	return farmId;
};

// 获取农场总数据
const fetchTotalData = async () => {
	try {
		const farmId = getFarmId();
		if (!farmId) {
			console.warn('农场ID为空，无法获取总数据');
			return;
		}

		console.log('开始获取农场总数据，farm_id:', farmId);
		const params: GetTotalDataRequest = {
			farm_id: farmId,
		};

		const response = await getTotalData(params);
		console.log('农场总数据响应:', response);

		if (response.code === 200) {
			// 更新农产品订单数量
			state.homeOne[0].num1 = response.good_order_count.toString();
			
			// 更新土地订单数量  
			state.homeOne[1].num1 = response.sale_order_count.toString();
			
			// 更新销售总额 (农产品销售额 + 土地销售额)
			const totalSales = response.good_sale_count + response.land_sale_count;
			state.homeOne[2].num1 = totalSales.toFixed(2);
			
			// 更新系统使用人数
			state.homeOne[3].num1 = response.sys_use_count.toString();
			
			console.log('数据更新完成');
		} else {
			console.error('获取农场总数据失败:', response.msg || '未知错误');
			ElMessage.error(`获取农场数据失败: ${response.msg || '未知错误'}`);
		}
	} catch (error) {
		console.error('获取农场总数据异常:', error);
		ElMessage.error('获取农场数据失败，请稍后重试');
	}
};

// 获取一年销售趋势数据
const fetchSalesData = async () => {
	try {
		const farmId = getFarmId();
		if (!farmId) {
			console.warn('农场ID为空，无法获取销售趋势数据');
			return;
		}

		const params: GetLastOneYearSaleDataRequest = {
			farm_id: farmId,
		};

		const response = await getLastOneYearSaleData(params);

		if (response.code === 200 && response.one_year_sale_data) {
			// 处理数据格式化
			formatSalesData(response.one_year_sale_data);
		} else {
			console.error('获取销售趋势数据失败:', response.msg || '未知错误');
			ElMessage.error(`获取销售趋势数据失败: ${response.msg || '未知错误'}`);
		}
	} catch (error) {
		console.error('获取销售趋势数据异常:', error);
		ElMessage.error('获取销售趋势数据失败，请稍后重试');
	}
};

// 格式化销售数据用于图表显示
const formatSalesData = (salesData: SaleData[]) => {
	console.log('开始格式化销售数据，原始数据条数:', salesData.length);
	
	// 按月份聚合数据
	const monthlyData: { [key: string]: { good: number; land: number } } = {};
	
	salesData.forEach(item => {
		// 将日期格式转换为月份 (假设 stat_date 格式为 YYYY-MM-DD)
		const month = item.stat_date.substring(0, 7); // 获取 YYYY-MM
		
		if (!monthlyData[month]) {
			monthlyData[month] = { good: 0, land: 0 };
		}
		
		monthlyData[month].good += item.good_sale_count;
		monthlyData[month].land += item.land_sale_count;
	});
	
	console.log('按月聚合后的数据:', monthlyData);
	
	// 生成最近12个月的数据
	const months: string[] = [];
	const goodSales: number[] = [];
	const landSales: number[] = [];
	
	// 获取当前日期
	const now = new Date();
	
	// 生成最近12个月
	for (let i = 11; i >= 0; i--) {
		const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		const monthLabel = `${date.getMonth() + 1}月`;
		
		months.push(monthLabel);
		goodSales.push(monthlyData[monthKey]?.good || 0);
		landSales.push(monthlyData[monthKey]?.land || 0);
	}
	
	// 更新state中的数据
	state.salesData.months = months;
	state.salesData.goodSales = goodSales;
	state.salesData.landSales = landSales;
	
	console.log('格式化后的销售数据:', state.salesData);
	console.log('图表容器元素:', homeLineRef.value);
	
	// 重新初始化图表
	nextTick(() => {
		console.log('准备初始化图表...');
		initLineChart();
	});
};

// 折线图
const initLineChart = () => {
	console.log('initLineChart 开始执行');
	console.log('homeLineRef.value:', homeLineRef.value);
	console.log('当前销售数据:', state.salesData);
	
	if (!homeLineRef.value) {
		console.error('图表容器未找到，无法初始化图表');
		return;
	}
	
	// 检查容器尺寸
	const rect = homeLineRef.value.getBoundingClientRect();
	console.log('图表容器尺寸:', rect);
	
	if (rect.width === 0 || rect.height === 0) {
		console.warn('图表容器尺寸为0，延迟初始化');
		setTimeout(() => {
			initLineChart();
		}, 100);
		return;
	}
	
	// 销毁旧图表实例
	if (state.global.homeChartOne && !state.global.dispose.some((b: any) => b === state.global.homeChartOne)) {
		state.global.homeChartOne.dispose();
	}
	
	state.global.homeChartOne = markRaw(echarts.init(homeLineRef.value, state.charts.theme));
	
	console.log('图表实例创建成功:', state.global.homeChartOne);
	
	const option = {
		backgroundColor: state.charts.bgColor,
		title: {
			text: '销售额趋势',
			x: 'left',
			textStyle: { fontSize: '15', color: state.charts.color },
		},
		grid: { top: 70, right: 20, bottom: 30, left: 30 },
		tooltip: { trigger: 'axis' },
		legend: { data: ['农产品销售额', '土地销售额'], right: 0 },
		xAxis: {
			data: state.salesData.months.length > 0 ? state.salesData.months : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
		},
		yAxis: [
			{
				type: 'value',
				name: '价格',
				min: 0,
				minInterval: 100,
				interval: 200,
				boundaryGap: [0, '10%'],
				axisLabel: {
					formatter: function(value: number) {
						if (value >= 1000) {
							return (value / 1000).toFixed(1) + 'k';
						}
						return value.toString();
					}
				},
				splitLine: { show: true, lineStyle: { type: 'dashed', color: '#f5f5f5' } },
			},
		],
		series: [
			{
				name: '农产品销售额',
				type: 'line',
				symbolSize: 6,
				symbol: 'circle',
				smooth: true,
				data: state.salesData.goodSales.length > 0 ? state.salesData.goodSales : [0, 41.1, 30.4, 65.1, 53.3, 53.3, 53.3, 41.1, 30.4, 65.1, 53.3, 10],
				lineStyle: { color: '#fe9a8b' },
				itemStyle: { color: '#fe9a8b', borderColor: '#fe9a8b' },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#fe9a8bb3' },
						{ offset: 1, color: '#fe9a8b03' },
					]),
				},
			},
			{
				name: '土地销售额',
				type: 'line',
				symbolSize: 6,
				symbol: 'circle',
				smooth: true,
				data: state.salesData.landSales.length > 0 ? state.salesData.landSales : [0, 24.1, 7.2, 15.5, 42.4, 42.4, 42.4, 24.1, 7.2, 15.5, 42.4, 0],
				lineStyle: { color: '#9E87FF' },
				itemStyle: { color: '#9E87FF', borderColor: '#9E87FF' },
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#9E87FFb3' },
						{ offset: 1, color: '#9E87FF03' },
					]),
				},
				emphasis: {
					itemStyle: {
						color: {
							type: 'radial',
							x: 0.5,
							y: 0.5,
							r: 0.5,
							colorStops: [
								{ offset: 0, color: '#9E87FF' },
								{ offset: 0.4, color: '#9E87FF' },
								{ offset: 0.5, color: '#fff' },
								{ offset: 0.7, color: '#fff' },
								{ offset: 0.8, color: '#fff' },
								{ offset: 1, color: '#fff' },
							],
						},
						borderColor: '#9E87FF',
						borderWidth: 2,
					},
				},
			},
		],
	};
	
	console.log('图表配置:', option);
	state.global.homeChartOne.setOption(option);
	
	// 强制resize以确保图表正确显示
	setTimeout(() => {
		state.global.homeChartOne.resize();
		console.log('图表resize完成');
	}, 100);
	
	state.myCharts.push(state.global.homeChartOne);
	console.log('图表初始化完成');
};
// 批量设置 echarts resize
const initEchartsResizeFun = () => {
	nextTick(() => {
		for (let i = 0; i < state.myCharts.length; i++) {
			setTimeout(() => {
				state.myCharts[i].resize();
			}, i * 1000);
		}
	});
};
// 批量设置 echarts resize
const initEchartsResize = () => {
	window.addEventListener('resize', initEchartsResizeFun);
};
// 页面加载时
onMounted(() => {
	initEchartsResize();
	fetchTotalData(); // 调用获取数据
	fetchSalesData(); // 调用获取销售趋势数据
	
	// 初始化图表（使用默认数据），增加延迟确保DOM完全渲染
	setTimeout(() => {
		initLineChart();
	}, 200);
});
// 由于页面缓存原因，keep-alive
onActivated(() => {
	initEchartsResizeFun();
});
// 监听 pinia 中的 tagsview 开启全屏变化，重新 resize 图表，防止不出现/大小不变等
watch(
	() => isTagsViewCurrenFull.value,
	() => {
		initEchartsResizeFun();
	}
);
// 监听 pinia 中是否开启深色主题
watch(
	() => themeConfig.value.isIsDark,
	(isIsDark) => {
		nextTick(() => {
			state.charts.theme = isIsDark ? 'dark' : '';
			state.charts.bgColor = isIsDark ? 'transparent' : '';
			state.charts.color = isIsDark ? '#dadada' : '#303133';
			setTimeout(() => {
				initLineChart();
			}, 500);
		});
	},
	{
		deep: true,
		immediate: true,
	}
);
</script>

<style scoped lang="scss">
$homeNavLengh: 8;
.home-container {
	overflow: hidden;
	.home-card-one,
	.home-card-two,
	.home-card-three {
		.home-card-item {
			width: 100%;
			height: 130px;
			border-radius: 4px;
			transition: all ease 0.3s;
			padding: 20px;
			overflow: hidden;
			background: var(--el-color-white);
			color: var(--el-text-color-primary);
			border: 1px solid var(--next-border-color-light);
			&:hover {
				box-shadow: 0 2px 12px var(--next-color-dark-hover);
				transition: all ease 0.3s;
			}
			&-icon {
				width: 70px;
				height: 70px;
				border-radius: 100%;
				flex-shrink: 1;
				i {
					color: var(--el-text-color-placeholder);
				}
			}
			&-title {
				font-size: 15px;
				font-weight: bold;
				height: 30px;
			}
		}
	}
	.home-card-one {
		@for $i from 0 through 3 {
			.home-one-animation#{$i} {
				opacity: 0;
				animation-name: error-num;
				animation-duration: 0.5s;
				animation-fill-mode: forwards;
				animation-delay: calc($i/4) + s;
			}
		}
	}
	.home-card-two,
	.home-card-three {
		.home-card-item {
			height: 400px;
			width: 100%;
			overflow: hidden;
			.home-monitor {
				height: 100%;
				.flex-warp-item {
					width: 25%;
					height: 111px;
					display: flex;
					.flex-warp-item-box {
						margin: auto;
						text-align: center;
						color: var(--el-text-color-primary);
						display: flex;
						border-radius: 5px;
						background: var(--next-bg-color);
						cursor: pointer;
						transition: all 0.3s ease;
						&:hover {
							background: var(--el-color-primary-light-9);
							transition: all 0.3s ease;
						}
					}
					@for $i from 0 through $homeNavLengh {
						.home-animation#{$i} {
							opacity: 0;
							animation-name: error-num;
							animation-duration: 0.5s;
							animation-fill-mode: forwards;
							animation-delay: calc($i/10) + s;
						}
					}
				}
			}
		}
	}
}

// 新增：卡片点击效果样式
.home-card-clickable {
	position: relative;
	transition: all 0.3s ease;
	
	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		
		.card-overlay {
			opacity: 1;
			visibility: visible;
		}
	}
	
	.card-overlay {
		position: absolute;
		top: 50%;
		right: 10px;
		transform: translateY(-50%);
		opacity: 0;
		visibility: hidden;
		transition: all 0.3s ease;
		z-index: 10;
	}
}
</style>
