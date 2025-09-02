import { RouteRecordRaw } from 'vue-router';

/**
 * 建议：路由 path 路径与文件夹名称相同，找文件可浏览器地址找，方便定位文件位置
 *
 * 路由meta对象参数说明
 * meta: {
 *      title:          菜单栏及 tagsView 栏、菜单搜索名称（国际化）
 *      isLink：        是否超链接菜单，开启外链条件，`1、isLink: 链接地址不为空 2、isIframe:false`
 *      isHide：        是否隐藏此路由
 *      isKeepAlive：   是否缓存组件状态
 *      isAffix：       是否固定在 tagsView 栏上
 *      isIframe：      是否内嵌窗口，开启条件，`1、isIframe:true 2、isLink：链接地址不为空`
 *      roles：         当前路由权限标识，取角色管理。控制路由显示、隐藏。超级管理员：admin 普通角色：common
 *      icon：          菜单、tagsView 图标，阿里：加 `iconfont xxx`，fontawesome：加 `fa xxx`
 * }
 */

// 扩展 RouteMeta 接口
declare module 'vue-router' {
	interface RouteMeta {
		title?: string;
		isLink?: string;
		isHide?: boolean;
		isKeepAlive?: boolean;
		isAffix?: boolean;
		isIframe?: boolean;
		roles?: string[];
		icon?: string;
	}
}

/**
 * 定义动态路由
 * 前端添加路由，请在顶级节点的 `children 数组` 里添加
 * @description 未开启 isRequestRoutes 为 true 时使用（前端控制路由），开启时第一个顶级 children 的路由将被替换成接口请求回来的路由数据
 * @description 各字段请查看 `/@/views/system/menu/component/addMenu.vue 下的 ruleForm`
 * @returns 返回路由菜单数据
 */
export const dynamicRoutes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: '/',
		component: () => import('/@/layout/index.vue'),
		redirect: '/home',
		meta: {
			isKeepAlive: true,
		},
		children: [
			{
				path: '/home',
				name: 'home',
				component: () => import('/@/views/home/index.vue'),
				meta: {
					title: 'message.router.home',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: true,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'iconfont icon-shouye',
				},
			},
			{
				path: '/system',
				name: 'system',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/system/menu',
				meta: {
					title: 'message.router.system',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'iconfont icon-zhongduancanshuchaxun',
				},
				children: [
					{
						path: '/system/menu',
						name: 'systemMenu',
						component: () => import('/@/layout/routerView/parent.vue'),
						redirect: '/system/menu/order',
						meta: {
							title: '农产品订单管理',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-zhongduancanshuchaxun',
						},
						children: [
							{
								path: '/system/menu/order',
								name: 'systemMenuOrder',
								component: () => import('/@/views/system/menu/index.vue'),
								meta: {
									title: '订单管理',
									isLink: '',
									isHide: false,
									isKeepAlive: true,
									isAffix: false,
									isIframe: false,
									roles: ['admin', 'common'],
									icon: 'ele-List',
								},
							},
						],
					},
					{
						path: '/system/role',
						name: 'systemRole',
						component: () => import('/@/layout/routerView/parent.vue'),
						redirect: '/system/role/order',
						meta: {
							title: '土地订单管理',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-zhongduancanshuchaxun',
						},
						children: [
							{
								path: '/system/role/order',
								name: 'systemRoleOrder',
								component: () => import('/@/views/system/role/index.vue'),
								meta: {
									title: '订单管理',
									isLink: '',
									isHide: false,
									isKeepAlive: true,
									isAffix: false,
									isIframe: false,
									roles: ['admin', 'common'],
									icon: 'ele-List',
								},
							},
						],
					},
					// 用户管理、部门管理、字典管理 - 已删除
				],
			},
			{
				path: '/limits',
				name: 'limits',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/limits/frontEnd',
				meta: {
					title: 'message.router.limits',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'iconfont icon-quanxian',
				},
				children: [
					{
						path: '/limits/frontEnd',
						name: 'limitsFrontEnd',
						component: () => import('/@/layout/routerView/parent.vue'),
						redirect: '/limits/frontEnd/page',
						meta: {
							title: 'message.router.limitsFrontEnd',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: '',
						},
						children: [
							{
								path: '/limits/frontEnd/page',
								name: 'limitsFrontEndPage',
								component: () => import('/@/views/limits/frontEnd/page/index.vue'),
								meta: {
									title: 'message.router.limitsFrontEndPage',
									isLink: '',
									isHide: false,
									isKeepAlive: true,
									isAffix: false,
									isIframe: false,
									roles: ['admin', 'common'],
									icon: '',
								},
							},
							{
								path: '/limits/frontEnd/btn',
								name: 'limitsFrontEndBtn',
								component: () => import('/@/views/limits/frontEnd/btn/index.vue'),
								meta: {
									title: 'message.router.limitsFrontEndBtn',
									isLink: '',
									isHide: false,
									isKeepAlive: true,
									isAffix: false,
									isIframe: false,
									roles: ['admin', 'common'],
									icon: '',
								},
							},
						],
					},
					{
						path: '/limits/backEnd',
						name: 'limitsBackEnd',
						component: () => import('/@/layout/routerView/parent.vue'),
						meta: {
							title: 'message.router.limitsBackEnd',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: '',
						},
						children: [
							{
								path: '/limits/backEnd/page',
								name: 'limitsBackEndEndPage',
								component: () => import('/@/views/limits/backEnd/page/index.vue'),
								meta: {
									title: 'message.router.limitsBackEndEndPage',
									isLink: '',
									isHide: false,
									isKeepAlive: true,
									isAffix: false,
									isIframe: false,
									roles: ['admin', 'common'],
									icon: '',
								},
							},
						],
					},
				],
			},
			// 菜单模块 - 已删除
			// {
			// 	path: '/menu',
			// 	name: 'menu',
			// 	component: () => import('/@/layout/routerView/parent.vue'),
			// 	redirect: '/menu/menu1',
			// 	meta: {
			// 		title: 'message.router.menu',
			// 		isLink: '',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: false,
			// 		isIframe: false,
			// 		roles: ['admin', 'common'],
			// 		icon: 'iconfont icon-caidan',
			// 	},
			// 	children: [
			// 		{
			// 			path: '/menu/menu1',
			// 			name: 'menu1',
			// 			component: () => import('/@/layout/routerView/parent.vue'),
			// 			redirect: '/menu/menu1/menu11',
			// 			meta: {
			// 				title: 'message.router.menu1',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: false,
			// 				isIframe: false,
			// 				roles: ['admin', 'common'],
			// 				icon: 'iconfont icon-caidan',
			// 			},
			// 			children: [
			// 				{
			// 					path: '/menu/menu1/menu11',
			// 					name: 'menu11',
			// 					component: () => import('/@/views/menu/menu1/menu11/index.vue'),
			// 					meta: {
			// 						title: 'message.router.menu11',
			// 						isLink: '',
			// 						isHide: false,
			// 						isKeepAlive: true,
			// 						isAffix: false,
			// 						isIframe: false,
			// 						roles: ['admin', 'common'],
			// 						icon: 'iconfont icon-caidan',
			// 					},
			// 				},
			// 				{
			// 					path: '/menu/menu1/menu12',
			// 					name: 'menu12',
			// 					component: () => import('/@/layout/routerView/parent.vue'),
			// 					redirect: '/menu/menu1/menu12/menu121',
			// 					meta: {
			// 						title: 'message.router.menu12',
			// 						isLink: '',
			// 						isHide: false,
			// 						isKeepAlive: true,
			// 						isAffix: false,
			// 						isIframe: false,
			// 						roles: ['admin', 'common'],
			// 						icon: 'iconfont icon-caidan',
			// 					},
			// 					children: [
			// 						{
			// 							path: '/menu/menu1/menu12/menu121',
			// 							name: 'menu121',
			// 							component: () => import('/@/views/menu/menu1/menu12/menu121/index.vue'),
			// 							meta: {
			// 								title: 'message.router.menu121',
			// 								isLink: '',
			// 								isHide: false,
			// 								isKeepAlive: true,
			// 								isAffix: false,
			// 								isIframe: false,
			// 								roles: ['admin', 'common'],
			// 								icon: 'iconfont icon-caidan',
			// 							},
			// 						},
			// 						{
			// 							path: '/menu/menu1/menu12/menu122',
			// 							name: 'menu122',
			// 							component: () => import('/@/views/menu/menu1/menu12/menu122/index.vue'),
			// 							meta: {
			// 								title: 'message.router.menu122',
			// 								isLink: '',
			// 								isHide: false,
			// 								isKeepAlive: true,
			// 								isAffix: false,
			// 								isIframe: false,
			// 								roles: ['admin', 'common'],
			// 								icon: 'iconfont icon-caidan',
			// 							},
			// 						},
			// 					],
			// 				},
			// 				{
			// 					path: '/menu/menu1/menu13',
			// 					name: 'menu13',
			// 					component: () => import('/@/views/menu/menu1/menu13/index.vue'),
			// 					meta: {
			// 						title: 'message.router.menu13',
			// 						isLink: '',
			// 						isHide: false,
			// 						isKeepAlive: true,
			// 						isAffix: false,
			// 						isIframe: false,
			// 						roles: ['admin', 'common'],
			// 						icon: 'iconfont icon-caidan',
			// 					},
			// 				},
			// 			],
			// 		},
			// 		{
			// 			path: '/menu/menu2',
			// 			name: 'menu2',
			// 			component: () => import('/@/views/menu/menu2/index.vue'),
			// 			meta: {
			// 				title: 'message.router.menu2',
			// 				isLink: '',
			// 				isHide: false,
			// 				isKeepAlive: true,
			// 				isAffix: false,
			// 				isIframe: false,
			// 				roles: ['admin', 'common'],
			// 				icon: 'iconfont icon-caidan',
			// 			},
			// 		},
			// 	],
			// },
			{
				path: '/fun',
				name: 'funIndex',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/fun/tagsView',
				meta: {
					title: 'message.router.funIndex',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'fa fa-tty',
				},
				children: [
					{
						path: '/fun/tagsView',
						name: 'funTagsView',
						component: () => import('/@/views/fun/tagsView/index.vue'),
						meta: {
							title: 'message.router.funTagsView',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Pointer',
						},
					},
					{
						path: '/fun/countup',
						name: 'funCountup',
						component: () => import('/@/views/fun/activityManagement/index.vue'),
						meta: {
							title: 'message.router.funCountup',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Odometer',
						},
					},
					// {
					// 	path: '/fun/wangEditor',
					// 	name: 'funWangEditor',
					// 	component: () => import('/@/views/fun/wangEditor/index.vue'),
					// 	meta: {
					// 		title: 'message.router.funWangEditor',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin', 'common'],
					// 		icon: 'iconfont icon-fuwenbenkuang',
					// 	},
					// },
					// {
					// 	path: '/fun/cropper',
					// 	name: 'funCropper',
					// 	component: () => import('/@/views/fun/cropper/index.vue'),
					// 	meta: {
					// 		title: 'message.router.funCropper',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin', 'common'],
					// 		icon: 'iconfont icon-caijian',
					// 	},
					// },
					// {
					// 	path: '/fun/qrcode',
					// 	name: 'funQrcode',
					// 	component: () => import('/@/views/fun/qrcode/index.vue'),
					// 	meta: {
					// 		title: 'message.router.funQrcode',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin', 'common'],
					// 		icon: 'iconfont icon-ico',
					// 	},
					// },
					// {
					// 	path: '/fun/echartsMap',
					// 	name: 'funEchartsMap',
					// 	component: () => import('/@/views/fun/echartsMap/index.vue'),
					// 	meta: {
					// 		title: 'message.router.funEchartsMap',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin', 'common'],
					// 		icon: 'iconfont icon-ditu',
					// 	},
					// },
					// {
					// 	path: '/fun/printJs',
					// 	name: 'funPrintJs',
					// 	component: () => import('/@/views/fun/printJs/index.vue'),
					// 	meta: {
					// 		title: 'message.router.funPrintJs',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin', 'common'],
					// 		icon: 'ele-Printer',
					// 	},
					// },
					// {
					// 	path: '/fun/clipboard',
					// 	name: 'funClipboard',
					// 	component: () => import('/@/views/fun/clipboard/index.vue'),
					// 	meta: {
					// 		title: 'message.router.funClipboard',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin', 'common'],
					// 		icon: 'ele-DocumentCopy',
					// 	},
					// },
					// {
					// 	path: '/fun/gridLayout',
					// 	name: 'funGridLayout',
					// 	component: () => import('/@/views/fun/gridLayout/index.vue'),
					// 	meta: {
					// 		title: 'message.router.funGridLayout',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin', 'common'],
					// 		icon: 'iconfont icon-tuodong',
					// 	},
					// },
										// {
					// 	path: '/fun/splitpanes',
					// 	name: 'funSplitpanes',
					// 	component: () => import('/@/views/fun/splitpanes/index.vue'),
					// 	meta: {
					// 		title: 'message.router.funSplitpanes',
					// 		isLink: '',
					// 		isHide: false,
					// 		isKeepAlive: true,
					// 		isAffix: false,
					// 		isIframe: false,
					// 		roles: ['admin', 'common'],
					// 		icon: 'iconfont icon--chaifenlie',
					// 	},
					// },
			],
				},
			{
				path: '/device',
				name: 'deviceIndex',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/device/temperature',
				meta: {
					title: 'message.router.deviceIndex',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'ele-Monitor',
				},
				children: [
					{
						path: '/device/temperature',
						name: 'deviceTemperature',
						component: () => import('/@/views/device/temperature/index.vue'),
						meta: {
							title: 'message.router.deviceTemperature',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'fa fa-thermometer',
						},
					},
					{
						path: '/device/humidity',
						name: 'deviceHumidity',
						component: () => import('/@/views/device/humidity/index.vue'),
						meta: {
							title: 'message.router.deviceHumidity',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Drizzling',
						},
					},
					{
						path: '/device/soil-humidity',
						name: 'deviceSoilHumidity',
						component: () => import('/@/views/device/soil-humidity/index.vue'),
						meta: {
							title: 'message.router.deviceSoilHumidity',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Ship',
						},
					},
					{
						path: '/device/light-intensity',
						name: 'deviceLightIntensity',
						component: () => import('/@/views/device/light-intensity/index.vue'),
						meta: {
							title: 'message.router.deviceLightIntensity',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Sunny',
						},
					},
					{
						path: '/device/wind-speed',
						name: 'deviceWindSpeed',
						component: () => import('/@/views/device/wind-speed/index.vue'),
						meta: {
							title: 'message.router.deviceWindSpeed',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-MostlyCloudy',
						},
					},
					{
						path: '/device/rainfall',
						name: 'deviceRainfall',
						component: () => import('/@/views/device/rainfall/index.vue'),
						meta: {
							title: 'message.router.deviceRainfall',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Pouring',
						},
					},
					{
						path: '/device/ph-value',
						name: 'devicePhValue',
						component: () => import('/@/views/device/ph-value/index.vue'),
						meta: {
							title: 'message.router.devicePhValue',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-ScaleToOriginal',
						},
					},
					{
						path: '/device/nitrogen',
						name: 'deviceNitrogen',
						component: () => import('/@/views/device/nitrogen/index.vue'),
						meta: {
							title: 'message.router.deviceNitrogen',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Place',
						},
					},
					{
						path: '/device/phosphorus',
						name: 'devicePhosphorus',
						component: () => import('/@/views/device/phosphorus/index.vue'),
						meta: {
							title: 'message.router.devicePhosphorus',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Place',
						},
					},
					{
						path: '/device/workflow',
						name: 'deviceWorkflow',
						component: () => import('/@/views/device/workflow/index.vue'),
						meta: {
							title: 'message.router.deviceWorkflow',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Connection',
						},
					},
				],
			},
			{
				path: '/make',
				name: 'makeIndex',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/make/resource',
				meta: {
					title: 'message.router.makeIndex',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'fa fa-pagelines',
				},
				children: [
					{
						path: '/make/resource',
						name: 'makeResource',
						component: () => import('/@/views/system/menu/resource.vue'),
						meta: {
							title: '资源管理',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Box',
						},
					},
					{
						path: '/make/resource/add',
						name: 'makeResourceAdd',
						component: () => import('/@/views/system/menu/resource-add.vue'),
						meta: {
							title: '新增资源',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-CirclePlus',
						},
					},
				],
			},
			{
				path: '/params',
				name: 'paramsIndex',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/params/resource',
				meta: {
					title: 'message.router.paramsIndex',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'fa fa-tree',
				},
				children: [
					{
						path: '/params/resource',
						name: 'paramsResource',
						component: () => import('/@/views/system/role/resource.vue'),
						meta: {
							title: '资源管理',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-Box',
						},
					},
					{
						path: '/params/resource/add',
						name: 'paramsResourceAdd',
						component: () => import('/@/views/system/role/resource-add.vue'),
						meta: {
							title: '新增资源',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'ele-CirclePlus',
						},
					},
				],
			},
			{
				path: '/visualizing',
				name: 'visualizingIndex',
				component: () => import('/@/layout/routerView/parent.vue'),
				redirect: '/visualizing/visualizingLinkDemo1',
				meta: {
					title: 'message.router.visualizingIndex',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'iconfont icon-ico_shuju',
				},
				/**
				 * 打开内置全屏
				 * component 都为 `() => import('/@/layout/routerView/link.vue')`
				 * isLink 链接为内置的路由地址，地址为 staticRoutes 中定义
				 */
				children: [
					{
						path: '/visualizing/visualizingLinkDemo1',
						name: 'visualizingLinkDemo1',
						component: () => import('/@/views/visualizing/product-analysis.vue'),
						meta: {
							title: 'message.router.visualizingLinkDemo1',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-ico_shuju',
						},
					},
					{
						path: '/visualizing/visualizingLinkDemo2',
						name: 'visualizingLinkDemo2',
						component: () => import('/@/views/visualizing/demo2.vue'),
						meta: {
							title: 'message.router.visualizingLinkDemo2',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-ico_shuju',
						},
					},
					{
						path: '/visualizing/salesAnalysis',
						name: 'salesAnalysis',
						component: () => import('/@/views/visualizing/sales-analysis.vue'),
						meta: {
							title: '销售额分析',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-ico_shuju',
						},
					},
					{
						path: '/visualizing/userAnalysis',
						name: 'userAnalysis',
						component: () => import('/@/views/visualizing/user-analysis.vue'),
						meta: {
							title: '系统使用人数分析',
							isLink: '',
							isHide: false,
							isKeepAlive: true,
							isAffix: false,
							isIframe: false,
							roles: ['admin', 'common'],
							icon: 'iconfont icon-ico_shuju',
						},
					},
				],
			},
			// {
			// 	path: '/chart',
			// 	name: 'chartIndex',
			// 	component: () => import('/@/views/chart/index.vue'),
			// 	meta: {
			// 		title: 'message.router.chartIndex',
			// 		isLink: '',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: false,
			// 		isIframe: false,
			// 		roles: ['admin', 'common'],
			// 		icon: 'iconfont icon-ico_shuju',
			// 	},
			// },
			{
				path: '/personal',
				name: 'personal',
				component: () => import('/@/views/personal/index.vue'),
				meta: {
					title: 'message.router.personal',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'iconfont icon-gerenzhongxin',
				},
			},
			{
				path: '/tools',
				name: 'tools',
				component: () => import('/@/views/tools/index.vue'),
				meta: {
					title: 'message.router.tools',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'common'],
					icon: 'ele-DocumentChecked',
				},
			},
			// {
			// 	path: '/link',
			// 	name: 'layoutLinkView',
			// 	component: () => import('/@/layout/routerView/link.vue'),
			// 	meta: {
			// 		title: 'message.router.layoutLinkView',
			// 		isLink: 'https://element-plus.gitee.io/#/zh-CN/component/installation',
			// 		isHide: false,
			// 		isKeepAlive: false,
			// 		isAffix: false,
			// 		isIframe: false,
			// 		roles: ['admin'],
			// 		icon: 'iconfont icon-caozuo-wailian',
			// 	},
			// },
			// {
			// 	path: '/iframesOne',
			// 	name: 'layoutIframeViewOne',
			// 	component: () => import('/@/layout/routerView/iframes.vue'),
			// 	meta: {
			// 		title: 'message.router.layoutIframeViewOne',
			// 		isLink: 'https://nodejs.org/zh-cn/',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: true,
			// 		isIframe: true,
			// 		roles: ['admin'],
			// 		icon: 'iconfont icon-neiqianshujuchucun',
			// 	},
			// },
			// {
			// 	path: '/iframesTwo',
			// 	name: 'layoutIframeViewTwo',
			// 	component: () => import('/@/layout/routerView/iframes.vue'),
			// 	meta: {
			// 		title: 'message.router.layoutIframeViewTwo',
			// 		isLink: 'https://undraw.co/illustrations',
			// 		isHide: false,
			// 		isKeepAlive: true,
			// 		isAffix: true,
			// 		isIframe: true,
			// 		roles: ['admin'],
			// 		icon: 'iconfont icon-neiqianshujuchucun',
			// 	},
			// },
		],
	},
];

/**
 * 定义404、401界面
 * @link 参考：https://next.router.vuejs.org/zh/guide/essentials/history-mode.html#netlify
 */
export const notFoundAndNoPower = [
	{
		path: '/:path(.*)*',
		name: 'notFound',
		component: () => import('/@/views/error/404.vue'),
		meta: {
			title: 'message.staticRoutes.notFound',
			isHide: true,
		},
	},
	{
		path: '/401',
		name: 'noPower',
		component: () => import('/@/views/error/401.vue'),
		meta: {
			title: 'message.staticRoutes.noPower',
			isHide: true,
		},
	},
];

/**
 * 定义静态路由（默认路由）
 * 此路由不要动，前端添加路由的话，请在 `dynamicRoutes 数组` 中添加
 * @description 前端控制直接改 dynamicRoutes 中的路由，后端控制不需要修改，请求接口路由数据时，会覆盖 dynamicRoutes 第一个顶级 children 的内容（全屏，不包含 layout 中的路由出口）
 * @returns 返回路由菜单数据
 */
export const staticRoutes: Array<RouteRecordRaw> = [
	{
		path: '/login',
		name: 'login',
		component: () => import('/@/views/login/index.vue'),
		meta: {
			title: '登录',
		},
	},
	/**
	 * 提示：写在这里的为全屏界面，不建议写在这里
	 * 请写在 `dynamicRoutes` 路由数组中
	 */
	{
		path: '/visualizingDemo1',
		name: 'visualizingDemo1',
		component: () => import('/@/views/visualizing/demo1.vue'),
		meta: {
			title: 'message.router.visualizingLinkDemo1',
		},
	},
	{
		path: '/visualizingDemo2',
		name: 'visualizingDemo2',
		component: () => import('/@/views/visualizing/demo2.vue'),
		meta: {
			title: 'message.router.visualizingLinkDemo2',
		},
	},
];
