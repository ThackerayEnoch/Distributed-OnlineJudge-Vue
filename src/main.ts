/* eslint-disable vue/multi-word-component-names */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' //引入持久化插件
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import Tooltip from 'primevue/tooltip';

import '@/common/assets/styles.scss';
import '@/common/assets/tailwind.css';
import '@fortawesome/fontawesome-free/css/all.css';
import globalErrorHandler from '@/common/exception/globalErrorHandler';

import App from './App.vue'
import router from './common/utils/router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.directive('tooltip', Tooltip);
app.component('Toast', Toast);
// 获取 ToastService 实例并传递给全局错误处理器
const toast = app.config.globalProperties.$toast;
app.config.errorHandler = globalErrorHandler(toast);
app.mount('#app')
export default app;