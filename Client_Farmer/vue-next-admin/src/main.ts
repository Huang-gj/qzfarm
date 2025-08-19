import { createApp } from 'vue';
import pinia from '/@/stores/index';
import App from '/@/App.vue';
import router from '/@/router';
import { directive } from '/@/directive/index';
import { i18n } from '/@/i18n/index';
import other from '/@/utils/other';

import ElementPlus from 'element-plus';
import '/@/theme/index.scss';
import VueGridLayout from 'vue-grid-layout';

const app = createApp(App);

directive(app);
other.elSvg(app);

app.use(pinia).use(router).use(ElementPlus).use(i18n).use(VueGridLayout).mount('#app');

// 应用挂载后初始化用户信息
import { useUserInfoStore, useUserInfo } from '/@/stores/userInfo';

// 恢复用户信息
const userInfoStore = useUserInfoStore();
userInfoStore.restoreUserInfo();

// 初始化兼容的用户信息
const userInfo = useUserInfo();
userInfo.setUserInfos();
