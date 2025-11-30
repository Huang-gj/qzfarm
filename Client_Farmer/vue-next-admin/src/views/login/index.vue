<template>
	<div class="login-container flex">
		<div class="login-left">
			<!-- <div class="login-left-logo">
				<img :src="logoMini" />
				<div class="login-left-logo-text">
					<span>{{ getThemeConfig.globalViceTitle }}</span>
					<span class="login-left-logo-text-msg">{{ getThemeConfig.globalViceTitleMsg }}</span>
				</div>
			</div>
			<div class="login-left-img">
				<img :src="loginMain" />
			</div> -->
			<div class="login-left-title">
				<span>智慧农业系统</span>
				<div class="login-left-title-en">SMART AGRICULTURE SYSTEM</div>
			</div>
			<img :src="loginBg" class="login-left-waves" />
		</div>
		<div class="login-right flex">
			<div class="login-right-warp flex-margin">
				<span class="login-right-warp-one"></span>
				<span class="login-right-warp-two"></span>
				<div class="login-right-warp-mian">
					<div class="login-right-warp-main-title">智慧农业系统欢迎您！</div>
					<div class="login-right-warp-main-form">
						<div v-if="!state.isScan">
							<el-tabs v-model="state.tabsActiveName">
								<el-tab-pane :label="$t('message.label.one1')" name="account">
									<Account />
								</el-tab-pane>
								<el-tab-pane :label="$t('message.label.two2')" name="mobile">
									<Mobile />
								</el-tab-pane>
							</el-tabs>
						</div>
						<Scan v-if="state.isScan" />
						<div class="login-content-main-sacn" @click="state.isScan = !state.isScan">
							<i class="iconfont" :class="state.isScan ? 'icon-diannao1' : 'icon-barcode-qr'"></i>
							<div class="login-content-main-sacn-delta"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 底部版权信息 -->
		<div class="login-footer">
			<div class="login-footer-content">
				<div class="copyright">版权所有 © 黄高俊</div>
				<div class="icp">
					<a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">
						浙ICP备2025157146号
					</a>
				</div>
				<div class="gongan">
					<p>
						<img  width="20" style="vertical-align: middle; margin-right: 4px;"/>
						<a href="https://beian.mps.gov.cn/#/query/webSearch?code=xxx" rel="noreferrer" target="_blank">
							浙公网安备33019202002718号 
						</a>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="loginIndex">
import { defineAsyncComponent, onMounted, reactive, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { NextLoading } from '/@/utils/loading';
// import logoMini from '/@/assets/logo.jpg';
// import loginMain from '/@/assets/login-main.svg';
import loginBg from '/@/assets/login-bg.svg';

// 引入组件
const Account = defineAsyncComponent(() => import('/@/views/login/component/account.vue'));
const Mobile = defineAsyncComponent(() => import('/@/views/login/component/mobile.vue'));
const Scan = defineAsyncComponent(() => import('/@/views/login/component/scan.vue'));

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const state = reactive({
	tabsActiveName: 'account',
	isScan: false,
});

// 获取布局配置信息
const getThemeConfig = computed(() => {
	return themeConfig.value;
});
// 页面加载时
onMounted(() => {
	NextLoading.done();
});
</script>

<style scoped lang="scss">
.login-container {
	
	height: 100%;
	
	background: var(--el-color-white);
	.login-left {
		flex: 1;
		position: relative;
		
		background-color: rgba(211, 239, 255, 1);
		margin-right: 100px;
		/* .login-left-logo {
			display: flex;
			align-items: center;
			position: absolute;
			top: 50px;
			left: 80px;
			z-index: 1;
			animation: logoAnimation 0.3s ease;
			img {
				width: 52px;
				height: 52px;
			}
			.login-left-logo-text {
				display: flex;
				flex-direction: column;
				span {
					margin-left: 10px;
					font-size: 28px;
					color: #26a59a;
				}
				.login-left-logo-text-msg {
					font-size: 12px;
					color: #32a99e;
				}
			}
		}
		.login-left-img {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 100%;
			height: 52%;
			img {
				width: 100%;
				height: 100%;
				animation: error-num 0.6s ease;
			}
		} */
		.login-left-title {
			position: absolute;
			top: 50px;
			left: 80px;
			z-index: 10;
			animation: logoAnimation 0.3s ease;
			span {
				font-size: 28px;
				font-weight: bold;
				color: #26a59a;
				text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
			}
			.login-left-title-en {
				margin-top: 8px;
				font-size: 14px;
				font-weight: 500;
				color: #32a99e;
				letter-spacing: 1px;
				text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
			}
		}
		.login-left-waves {
			position: absolute;
			top: 0;
			right: -100px;
		}
	}
	.login-right {
		width: 700px;
		.login-right-warp {
			border: 1px solid var(--el-color-primary-light-3);
			border-radius: 3px;
			width: 500px;
			height: 500px;
			position: relative;
			overflow: hidden;
			background-color: var(--el-color-white);
			.login-right-warp-one,
			.login-right-warp-two {
				position: absolute;
				display: block;
				width: inherit;
				height: inherit;
				&::before,
				&::after {
					content: '';
					position: absolute;
					z-index: 1;
				}
			}
			.login-right-warp-one {
				&::before {
					filter: hue-rotate(0deg);
					top: 0px;
					left: 0;
					width: 100%;
					height: 3px;
					background: linear-gradient(90deg, transparent, var(--el-color-primary));
					animation: loginLeft 3s linear infinite;
				}
				&::after {
					filter: hue-rotate(60deg);
					top: -100%;
					right: 2px;
					width: 3px;
					height: 100%;
					background: linear-gradient(180deg, transparent, var(--el-color-primary));
					animation: loginTop 3s linear infinite;
					animation-delay: 0.7s;
				}
			}
			.login-right-warp-two {
				&::before {
					filter: hue-rotate(120deg);
					bottom: 2px;
					right: -100%;
					width: 100%;
					height: 3px;
					background: linear-gradient(270deg, transparent, var(--el-color-primary));
					animation: loginRight 3s linear infinite;
					animation-delay: 1.4s;
				}
				&::after {
					filter: hue-rotate(300deg);
					bottom: -100%;
					left: 0px;
					width: 3px;
					height: 100%;
					background: linear-gradient(360deg, transparent, var(--el-color-primary));
					animation: loginBottom 3s linear infinite;
					animation-delay: 2.1s;
				}
			}
			.login-right-warp-mian {
				display: flex;
				flex-direction: column;
				height: 100%;
				.login-right-warp-main-title {
					height: 130px;
					line-height: 130px;
					font-size: 27px;
					text-align: center;
					letter-spacing: 3px;
					animation: logoAnimation 0.3s ease;
					animation-delay: 0.3s;
					color: var(--el-text-color-primary);
				}
				.login-right-warp-main-form {
					flex: 1;
					padding: 0 50px 50px;
					.login-content-main-sacn {
						position: absolute;
						top: 0;
						right: 0;
						width: 50px;
						height: 50px;
						overflow: hidden;
						cursor: pointer;
						transition: all ease 0.3s;
						color: var(--el-color-primary);
						&-delta {
							position: absolute;
							width: 35px;
							height: 70px;
							z-index: 2;
							top: 2px;
							right: 21px;
							background: var(--el-color-white);
							transform: rotate(-45deg);
						}
						&:hover {
							opacity: 1;
							transition: all ease 0.3s;
							color: var(--el-color-primary) !important;
						}
						i {
							width: 47px;
							height: 50px;
							display: inline-block;
							font-size: 48px;
							position: absolute;
							right: 1px;
							top: 0px;
						}
					}
				}
			}
		}
	}
	
	// 底部版权信息样式
	.login-footer {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(135deg, rgba(211, 239, 255, 0.8), rgba(255, 255, 255, 0.9));
		backdrop-filter: blur(10px);
		border-top: 1px solid rgba(38, 165, 154, 0.2);
		padding: 16px 0;
		z-index: 10;
		
		.login-footer-content {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 30px;
			max-width: 1200px;
			margin: 0 auto;
			padding: 0 20px;
			
			.copyright {
				font-size: 14px;
				color: #666;
				font-weight: 500;
			}
			
			.icp {
				a {
					font-size: 14px;
					color: #666;
					text-decoration: none;
					transition: all 0.3s ease;
					padding: 4px 8px;
					border-radius: 4px;
					
					&:hover {
						color: #26a59a;
						background-color: rgba(38, 165, 154, 0.1);
						transform: translateY(-1px);
					}
					
					&:active {
						transform: translateY(0);
					}
				}
			}
			
			.gongan {
				p {
					margin: 0;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				
				a {
					font-size: 14px;
					color: #666;
					text-decoration: none;
					transition: all 0.3s ease;
					padding: 4px 8px;
					border-radius: 4px;
					
					&:hover {
						color: #26a59a;
						background-color: rgba(38, 165, 154, 0.1);
						transform: translateY(-1px);
					}
					
					&:active {
						transform: translateY(0);
					}
				}
			}
		}
	}
	
	// 响应式设计
	@media (max-width: 768px) {
		.login-footer {
			.login-footer-content {
				flex-direction: column;
				gap: 8px;
				
				.copyright,
				.icp a,
				.gongan a {
					font-size: 12px;
				}
			}
		}
	}
}
</style>
