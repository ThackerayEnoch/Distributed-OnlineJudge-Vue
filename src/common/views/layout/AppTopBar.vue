<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { useLayout } from '@/common/views/layout/layout';
import { survive } from '@/common/views/noticeAPI';
import request from '@/common/utils/api';
// 主题设置
import AppConfigurator from './AppConfigurator.vue';
// 消息组件
import TopBarMessage from '@/message/components/TopBarMessage.vue';
// template ref，用于调用子组件通过 defineExpose 暴露的方法
const topBarMessageRef = ref<any>(null);
const { toggleDarkMode, isDarkTheme } = useLayout();
// 当前用户
import { Role } from '@/common/constant/Role';
import { useUserStore } from '@/common/utils/store';
import type { MenuItem } from 'primevue/menuitem';
import globalMessage from '@/common/utils/toast';
const counterStore = useUserStore();
const router = useRouter();
const route = useRoute();
// 当前页面
const activeMenu = ref('/');
// 导航栏
const items = ref<MenuItem[]>([

    {
        label: '首页',
        name: 'home',
        icon: 'pi pi-home',
        root: true,
    },
    {
        label: '题目',
        name: 'problems',
        icon: 'pi pi-book',
        root: true,
    },
    {
        label: '评测',
        name: 'statuses',
        icon: 'pi pi-check-circle',
        root: true,
    },
    {
        label: '比赛',
        name: 'homeworks',
        icon: 'pi pi-trophy',
        root: true,
    },
    {
        label: '反馈',
        name: 'issues',
        icon: 'fas fa-bug',
        root: true,
    },
    {
        label: '管理',
        name: 'admin',
        icon: 'pi pi-cog',
        root: true,
    },
]
);
const isLogouting = ref(false);
const logout = async () => {
    // axiosPost调用logout 
    isLogouting.value = true;
    request.post('/api/a/doLogout').then((res: any) => {
        if (res.status === 10000) {
            globalMessage.success("登出成功", "已成功登出");
            // 清除用户信息
            counterStore.resetUser();
            // 清除Cookie
            router.push('/auth/login');
        } else {
            globalMessage.error("登出失败", res.data);
        }
    }).catch((error: any) => {
        globalMessage.error("登出失败", error.message);
    }).finally(() => {
        isLogouting.value = false;
    });
}
// 页面跳转函数
const navigateTo = (menu: string) => {
    activeMenu.value = menu;
    router.push('/' + menu);
}
// 根据当前页面自动切换导航栏的项
let intervalId: number;
onMounted(() => {
    const currentRoute = route.path.split('/')[1].toLowerCase();
    switchMenu(currentRoute);
    intervalId = setInterval(async () => {
        await survive();
    }, 5 * 60 * 1000);
});
onUnmounted(() => {
    clearInterval(intervalId);
});
function switchMenu(menu: string) {
    switch (menu) {
        case 'problem':
            activeMenu.value = 'problems';
            break;
        case 'status':
            activeMenu.value = 'statuses';
            break;
        case 'homework':
            activeMenu.value = 'homeworks';
            break;
        case 'contest':
            activeMenu.value = 'contests';
            break;
        case 'class':
            activeMenu.value = 'classes';
            break;
        case 'admin':
            activeMenu.value = 'admin';
            break
        case 'issue':
            activeMenu.value = 'issues';
            break;
        default:
            activeMenu.value = menu;
    }
}
// 监听路由变化
watch(route, async (newRoute) => {
    const currentRoute = newRoute.path.split('/')[1].toLowerCase();
    switchMenu(currentRoute);
    // 当路由变化时，尝试调用子组件暴露的 loadMessages 方法刷新消息
    // 使用可选链以防组件尚未挂载
    /*try {
        await topBarMessageRef.value?.loadMessages?.();
    } catch (e) {
        // 忽略子组件刷新错误，避免阻塞路由切换
        console.error('刷新 TopBarMessage 失败:', e);
    }*/
});
</script>

<template>
    <div class="fixed top-0 left-0 w-full z-50">
        <MegaMenu :model="items as MenuItem[][]" class="p-4 bg-surface-0 layout-topbar">
            <template #start>
                <div class="layout-topbar-logo-container ml-3 relative flex items-center" style="width: 13rem;">
                    <div @click="navigateTo('home')" class="layout-topbar-logo flex items-center">
                        <img src="@/common/assets/ujn.svg" alt="Logo" class="w-[21%] h-auto" />
                        <span class="ml-1" @click="navigateTo('home')">UJNOJ</span>
                        <div class="ml-0 text-xs whitespace-nowrap self-end">v1.1.5</div>
                    </div>
                </div>
            </template>


            <template #item="{ item }">
                <router-link
                    v-if="item.root && (item.name !== 'admin' || item.name === 'admin' && counterStore.currentUser.roleId <= Role.COLLBORATOR)"
                    :to="'/' + item.name" custom v-slot="{ href, navigate }">
                    <a :href="href" @click="navigate"
                        class="flex items-center w-[7rem] cursor-pointer px-4 py-2 overflow-hidden relative font-semibold text-lg uppercase"
                        :class="[
                            activeMenu === item.name
                                ? 'text-[var(--primary-color)] ]'
                                : 'text-gray-700 hover:text-[var(--primary-hover-color)]'
                        ]">
                        <span class="mx-auto flex items-center gap-2">
                            <i v-if="item.icon" :class="item.icon"></i> <!-- 图标 -->
                            {{ item.label }} <!-- 文本 -->
                        </span>
                    </a>
                </router-link>
            </template>

            <template #end>
                <div class="layout-topbar-actions">
                    <div class="layout-config-menu">
                        <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                            <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                        </button>
                        <div class="relative">
                            <button
                                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                                type="button" class="layout-topbar-action layout-topbar-action-highlight">
                                <i class="pi pi-palette"></i>
                            </button>
                            <AppConfigurator />
                        </div>
                    </div>

                    <button class="layout-topbar-menu-button layout-topbar-action"
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }">
                        <i class="pi pi-ellipsis-v"></i>
                    </button>

                    <div class="layout-topbar-menu hidden lg:block">
                        <div class="layout-topbar-menu-content">
                            <!-- 使用TopBarMessage组件替换原来的Messages按钮 -->
                            <TopBarMessage ref="topBarMessageRef" />
                        </div>
                    </div>
                    <!-- 修改部分：用户菜单按钮 -->
                    <div class="relative">
                        <button
                            v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                            type="button" class="layout-topbar-action">
                            <i class="pi pi-user"></i>
                        </button>
                        <div
                            class="layout-topbar-menu hidden absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border rounded shadow-lg z-10">
                            <div class="layout-topbar-menu-content flex flex-col p-2">
                                <button type="button"
                                    class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <RouterLink :to="`/profile/${counterStore.currentUser.userId}`"
                                        class="flex items-center">
                                        <i class="pi pi-user mr-2"></i>
                                        <span>个人主页</span>
                                    </RouterLink>
                                </button>
                                <button type="button" @click="logout" :loading="isLogouting"
                                    class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <i class="pi pi-sign-out mr-2"></i>
                                    <span>登出</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </MegaMenu>
    </div>
</template>