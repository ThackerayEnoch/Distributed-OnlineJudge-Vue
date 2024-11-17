<script setup>
import { reactive } from 'vue';
const props = defineProps(['username']);

const user = reactive({
    name: props.username,
    email: 'ThackerayEnoch@foxmail.com',
    avatar: 'https://r2.wcfs.dokidokiujn.ninja/WCFS/User/ProfilePhoto/EdReO11VAAIQygI.jpg'
});

const items = [
    { label: '您的信息', icon: 'pi pi-user', route: '/profile/' + props.username + '/info' },
    { label: '统计数据', icon: 'pi pi-chart-bar', route: '/profile/' + props.username + '/statistics' }
];
</script>

<template>
    <div class="layout-sidebar p-4">
        <div class="flex items-center mt-8">
            <img class="rounded-full w-16 h-16 object-cover mr-2" :src="user.avatar" />
            <div class="flex-1 min-w-0">
                <div class="font-bold text-lg">{{ user.name }}</div>
                <div class="truncate text-gray-500">{{ user.email }}</div>
            </div>
        </div>
        <Menu :model="items" class="mt-8">
            <template #item="{ item, props }">
                <router-link v-slot="{ href, navigate }" :to="item.route" custom>
                    <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                    </a>
                </router-link>
            </template>
        </Menu>
    </div>
    <RouterView name="profile" />
</template>

<style lang="scss" scoped>
:deep(.p-menu) {
    background-color: transparent !important;
    border: 0;
}

:deep(.p-menu .p-menu-item) {
    background-color: transparent !important;
    border: 0;
}

:deep(.p-menu-item-content:hover) {
    background-color: var(--surface-overlay) !important;
}

:deep(.p-menu-item-active>.p-menu-item-link) {
    background-color: #4CAF50 !important;
    /* 自定义背景颜色 */
    color: white !important;
    /* 自定义文本颜色 */
}
</style>
