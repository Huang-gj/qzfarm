<template>
	<div class="image-carousel-container" :style="{ width: containerWidth, height: containerHeight }">
		<div class="carousel-wrapper" v-if="imageList.length > 0">
			<!-- 主图片显示区域 -->
			<div class="main-image-container">
				<el-image
					:src="currentImage"
					:preview-src-list="showPreview ? imageList : []"
					:fit="imageFit"
					:style="{ width: '100%', height: '100%', borderRadius: borderRadius }"
					:hide-on-click-modal="true"
					class="main-image"
					@error="handleImageError"
				>
					<template #error>
						<div class="image-error-slot">
							<el-icon size="20px" color="#c0c4cc">
								<ele-Picture />
							</el-icon>
						</div>
					</template>
				</el-image>
				
				<!-- 切换按钮 -->
				<div v-if="imageList.length > 1 && showControls" class="carousel-controls">
					<div 
						class="control-btn prev-btn" 
						@click="prevImage"
						v-show="currentIndex > 0 || infinite"
					>
						<el-icon size="14px">
							<ele-ArrowLeft />
						</el-icon>
					</div>
					<div 
						class="control-btn next-btn" 
						@click="nextImage"
						v-show="currentIndex < imageList.length - 1 || infinite"
					>
						<el-icon size="14px">
							<ele-ArrowRight />
						</el-icon>
					</div>
				</div>
				
				<!-- 指示器 -->
				<div v-if="imageList.length > 1 && showIndicators" class="carousel-indicators">
					<span 
						v-for="(item, index) in imageList" 
						:key="index"
						:class="['indicator', { active: index === currentIndex }]"
						@click="setCurrentImage(index)"
					></span>
				</div>
			</div>
			
			<!-- 缩略图列表 (可选) -->
			<div v-if="showThumbnails && imageList.length > 1" class="thumbnail-list">
				<div 
					v-for="(image, index) in imageList" 
					:key="index"
					:class="['thumbnail-item', { active: index === currentIndex }]"
					@click="setCurrentImage(index)"
				>
					<el-image
						:src="image"
						fit="cover"
						style="width: 100%; height: 100%;"
					>
						<template #error>
							<div class="thumbnail-error">
								<el-icon size="12px">
									<ele-Picture />
								</el-icon>
							</div>
						</template>
					</el-image>
				</div>
			</div>
		</div>
		
		<!-- 无图片时的占位符 -->
		<div v-else class="no-image-placeholder">
			<el-icon size="30px" color="#c0c4cc">
				<ele-Picture />
			</el-icon>
			<span>暂无图片</span>
		</div>
	</div>
</template>

<script setup lang="ts" name="ImageCarousel">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ArrowLeft as EleArrowLeft, ArrowRight as EleArrowRight, Picture as ElePicture } from '@element-plus/icons-vue';

// Props 定义
interface Props {
	images?: string[] | string; // 支持数组或JSON字符串
	width?: string; // 容器宽度
	height?: string; // 容器高度
	fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'; // 图片适应方式
	borderRadius?: string; // 圆角
	showControls?: boolean; // 是否显示左右切换按钮
	showIndicators?: boolean; // 是否显示指示器
	showThumbnails?: boolean; // 是否显示缩略图
	showPreview?: boolean; // 是否启用预览功能
	autoplay?: boolean; // 是否自动播放
	autoplayDelay?: number; // 自动播放间隔(ms)
	infinite?: boolean; // 是否无限循环
}

const props = withDefaults(defineProps<Props>(), {
	images: () => [],
	width: '100px',
	height: '100px',
	fit: 'cover',
	borderRadius: '4px',
	showControls: true,
	showIndicators: false,
	showThumbnails: false,
	showPreview: true,
	autoplay: false,
	autoplayDelay: 3000,
	infinite: false
});

// 响应式数据
const currentIndex = ref(0);
const autoplayTimer = ref<NodeJS.Timeout | null>(null);

// 计算属性
const containerWidth = computed(() => props.width);
const containerHeight = computed(() => props.height);
const imageFit = computed(() => props.fit);

// 处理图片列表
const imageList = computed(() => {
	if (!props.images) return [];
	
	if (Array.isArray(props.images)) {
		return props.images.filter(img => img && img.trim());
	}
	
	if (typeof props.images === 'string') {
		try {
			// 尝试解析JSON
			const parsed = JSON.parse(props.images);
			return Array.isArray(parsed) ? parsed.filter(img => img && img.trim()) : [];
		} catch {
			// 如果不是JSON，尝试按逗号分割
			return props.images.split(',').map(img => img.trim()).filter(img => img);
		}
	}
	
	return [];
});

const currentImage = computed(() => {
	return imageList.value[currentIndex.value] || '';
});

// 方法
const setCurrentImage = (index: number) => {
	if (index >= 0 && index < imageList.value.length) {
		currentIndex.value = index;
	}
};

const prevImage = () => {
	if (currentIndex.value > 0) {
		currentIndex.value--;
	} else if (props.infinite && imageList.value.length > 1) {
		currentIndex.value = imageList.value.length - 1;
	}
};

const nextImage = () => {
	if (currentIndex.value < imageList.value.length - 1) {
		currentIndex.value++;
	} else if (props.infinite && imageList.value.length > 1) {
		currentIndex.value = 0;
	}
};

const handleImageError = () => {
	console.warn('图片加载失败:', currentImage.value);
};

const startAutoplay = () => {
	if (props.autoplay && imageList.value.length > 1) {
		autoplayTimer.value = setInterval(() => {
			nextImage();
		}, props.autoplayDelay);
	}
};

const stopAutoplay = () => {
	if (autoplayTimer.value) {
		clearInterval(autoplayTimer.value);
		autoplayTimer.value = null;
	}
};

// 监听器
watch(() => props.images, () => {
	currentIndex.value = 0; // 重置到第一张图片
}, { deep: true });

watch(() => props.autoplay, (newVal) => {
	if (newVal) {
		startAutoplay();
	} else {
		stopAutoplay();
	}
});

// 生命周期
onMounted(() => {
	if (props.autoplay) {
		startAutoplay();
	}
});

onUnmounted(() => {
	stopAutoplay();
});
</script>

<style scoped lang="scss">
.image-carousel-container {
	position: relative;
	display: inline-block;
}

.carousel-wrapper {
	width: 100%;
	height: 100%;
}

.main-image-container {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	
	.main-image {
		cursor: pointer;
		transition: all 0.3s ease;
		
		&:hover {
			transform: scale(1.02);
		}
	}
}

.carousel-controls {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	pointer-events: none;
	
	.control-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.3s ease;
		pointer-events: auto;
		opacity: 0;
		
		&:hover {
			background: rgba(0, 0, 0, 0.7);
			transform: scale(1.1);
		}
	}
	
	.prev-btn {
		margin-left: 8px;
	}
	
	.next-btn {
		margin-right: 8px;
	}
}

.main-image-container:hover .control-btn {
	opacity: 1;
}

.carousel-indicators {
	position: absolute;
	bottom: 8px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	gap: 6px;
	
	.indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		transition: all 0.3s ease;
		
		&.active {
			background: #409EFF;
		}
		
		&:hover {
			background: rgba(255, 255, 255, 0.8);
		}
	}
}

.thumbnail-list {
	display: flex;
	gap: 4px;
	margin-top: 8px;
	max-width: 100%;
	overflow-x: auto;
	
	.thumbnail-item {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
		border: 2px solid transparent;
		transition: all 0.3s ease;
		
		&.active {
			border-color: #409EFF;
		}
		
		&:hover {
			border-color: #79bbff;
		}
	}
}

.thumbnail-error {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	background: #f5f7fa;
}

.no-image-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	background: #f5f7fa;
	border-radius: 4px;
	color: #909399;
	font-size: 12px;
	
	span {
		margin-top: 8px;
	}
}

.image-error-slot {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	background: #f5f7fa;
}
</style> 