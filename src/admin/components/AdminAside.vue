<template>
    <div class="w-full h-full bg-white dark:bg-gray-800 flex flex-col">
        <div class="p-4 mt-2 inline-block">
            <Image class="flex justify-center" width="70%" src="https://r2.wcfs.dokidokiujn.ninja/WCFS/ujn.png" />
        </div>
        <ul class="layout-menu m-4 mr-0 p-2 overflow-y-auto text-custom flex-1">
            <template v-for="(item, i) in model" :key="item">
                <AppMenuItem v-if="!('separator' in item)" :item="item" :index="i"></AppMenuItem>
                <li v-if="'separator' in item" class="menu-separator"></li>
            </template>
        </ul>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
export default defineComponent({
    name: 'AdminAside',
    components: {
        AppMenuItem
    },
    setup() {
        // Add your composition API logic here
        const model = ref([
            {
                label: '数据统计',
                items: [{ label: '仪表盘', icon: 'pi pi-chart-bar', to: '/admin/dashboard' }]
            },
            {
                label: '常规管理',
                items: [
                    {
                        label: '题目管理',
                        icon: 'pi pi-book',
                        to: '/admin/problems',
                        items: [
                            { label: '题目列表', icon: 'pi pi-list', to: '/admin/problems/list' },
                            { label: '创建题目', icon: 'pi pi-plus', to: '/admin/problem/create' },
                            { label: '题目标签', icon: 'pi pi-tags', to: '/admin/problems/tags' },
                            { label: '导入|导出题目', icon: 'pi pi-upload', to: '/admin/problems/import-export' }
                        ]
                    },
                    {
                        label: '作业管理',
                        icon: 'pi pi-folder-open',
                        to: '/admin/homework',
                        items: [
                            { label: '作业列表', icon: 'pi pi-list', to: '/admin/homework/list' },
                            { label: '创建作业', icon: 'pi pi-plus', to: '/admin/homework/create' }
                        ]
                    },
                    {
                        label: '考试管理',
                        icon: 'pi pi-calendar',
                        to: '/admin/exams',
                        items: [
                            { label: '考试列表', icon: 'pi pi-list', to: '/admin/exams/list' },
                            { label: '创建考试', icon: 'pi pi-plus', to: '/admin/exams/create' }
                        ]
                    },
                    {
                        label: '用户管理',
                        icon: 'pi pi-users',
                        to: '/admin/users',
                        items: [
                            { label: '用户列表', icon: 'pi pi-user', to: '/admin/users/list' },
                            { label: '创建用户', icon: 'pi pi-user-plus', to: '/admin/users/create' },
                            { label: '导入用户', icon: 'pi pi-upload', to: '/admin/users/import' },
                            { label: '用户组管理', icon: 'pi pi-users', to: '/admin/users/groups' }
                        ]
                    }
                ]
            },
            {
                label: '系统设置',
                icon: 'pi pi-cog',
                to: '/admin/settings',
                items: [
                    { label: '公告管理', icon: 'pi pi-megaphone', to: '/admin/announcements' },
                    { label: '通知管理', icon: 'pi pi-bell', to: '/admin/notifications' },
                    {
                        label: '权限管理',
                        icon: 'pi pi-lock',
                        to: '/admin/perm',
                        items: [
                            { label: '用户角色管理', icon: 'pi pi-user', to: '/admin/perm/users' },
                            { label: '角色管理', icon: 'pi pi-users', to: '/admin/perm/roles' },
                            { label: '权限项管理', icon: 'pi pi-lock', to: '/admin/perm/permissions' }
                        ]
                    },
                    { label: '系统配置', icon: 'pi pi-cog', to: '/admin/config' }
                ]
            }
        ]);

        return {
            model
        };
    },
});
</script>
<style scoped>
.text-custom {
    font-size: 1.04rem;
}
</style>