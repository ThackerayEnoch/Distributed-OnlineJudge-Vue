<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { useLayout } from '@/common/views/layout/layout';
import { survive } from '@/common/views/noticeAPI';
// 主题设置
import AppConfigurator from './AppConfigurator.vue';
const { toggleDarkMode, isDarkTheme } = useLayout();
// 当前用户
import { Role } from '@/common/constant/Role';
import { useUserStore } from '@/common/utils/store';
import type { MenuItem } from 'primevue/menuitem';
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
        command: () => navigateTo('home'),
        root: true,
    },
    {
        label: '题目',
        name: 'problems',
        icon: 'pi pi-book',
        command: () => navigateTo('problems'),
        root: true,
    },
    {
        label: '评测',
        name: 'statuses',
        icon: 'pi pi-check-circle',
        command: () => navigateTo('statuses'),
        root: true,
    },
    {
        label: '作业',
        name: 'homeworks',
        icon: 'pi pi-pencil',
        command: () => navigateTo('homeworks'),
        root: true,
    },
    {
        label: '反馈',
        name: 'issues',
        icon: 'fas fa-bug',
        command: () => navigateTo('issues'),
        root: true,
    },
    {
        label: '管理',
        name: 'admin',
        icon: 'pi pi-cog',
        command: () => navigateTo('admin'),
        root: true,
    },
]
);
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
watch(route, (newRoute) => {
    const currentRoute = newRoute.path.split('/')[1].toLowerCase();
    switchMenu(currentRoute);
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
                        <div class="ml-0 text-xs whitespace-nowrap self-end">v1.0.0</div>
                    </div>
                </div>
            </template>


            <template #item="{ item }">
                <a v-if="item.root && (item.name !== 'admin' || item.name === 'admin' && counterStore.currentUser.roleId <= Role.TEACHER)"
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
                            <button type="button" class="layout-topbar-action">
                                <i class="pi pi-inbox"></i>
                                <span>Messages</span>
                            </button>
                            <button type="button" class="layout-topbar-action">
                                <RouterLink :to="`/profile/${counterStore.currentUser.userId}`">
                                    <i class="pi pi-user"></i>
                                    <span>Profile</span>
                                </RouterLink>
                            </button>
                        </div>
                    </div>
                </div>
            </template>
        </MegaMenu>
    </div>
</template>