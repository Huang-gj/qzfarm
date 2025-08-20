<template>
	<div class="device-container">
		<el-card shadow="hover" header="磷含量监测">
			<div class="device-content">
				<el-result icon="info" title="功能开发中" subTitle="磷含量监测功能正在开发中，敬请期待...">
					<template #extra>
						<el-button type="primary">返回设备管理</el-button>
					</template>
				</el-result>
			</div>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="devicePhosphorus">
// 磷含量监测功能待开发
</script>

<style scoped lang="scss">
.device-container {
	.device-content {
		min-height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style> 