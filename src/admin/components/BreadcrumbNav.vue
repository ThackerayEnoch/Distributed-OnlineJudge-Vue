<template>
    <div>
        <Breadcrumb :home="home" :model="breadcrumbs">
            <template #item="{ item, props }">
                <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                    <a :href="href" v-bind="props.action" @click="navigate">
                        <span :class="[item.icon, 'text-color']" />
                        <span class="text-primary font-semibold">{{ item.label }}</span>
                    </a>
                </router-link>
                <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                    <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
                </a>
            </template>
        </Breadcrumb>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
interface MenuItem {
    label: string;
    icon?: string;
    to?: string;
    items?: MenuItem[];
}

export default defineComponent({
    name: 'BreadcrumbNav',
    setup() {
        const route = useRoute();
        // 📌 侧边栏菜单
        const model = ref<MenuItem[]>([
            {
                label: "数据统计",
                items: [{ label: "仪表盘", icon: "pi pi-chart-bar", to: "/admin/dashboard" }],
            },
            {
                label: "常规管理",
                items: [
                    {
                        label: "题目管理",
                        icon: "pi pi-book",
                        to: "/admin/problems",
                        items: [
                            { label: "题目列表", icon: "pi pi-list", to: "/admin/problems/list" },
                            { label: "创建题目", icon: "pi pi-plus", to: "/admin/problem/create" },
                            { label: "题目标签", icon: "pi pi-tags", to: "/admin/problems/tags" },
                            { label: "导入|导出题目", icon: "pi pi-upload", to: "/admin/problems/import-export" },
                        ],
                    },
                    {
                        label: "作业管理",
                        icon: "pi pi-folder-open",
                        to: "/admin/homework",
                        items: [
                            { label: "作业列表", icon: "pi pi-list", to: "/admin/homework/list" },
                            { label: "创建作业", icon: "pi pi-plus", to: "/admin/homework/create" },
                        ],
                    },
                    {
                        label: "考试管理",
                        icon: "pi pi-calendar",
                        to: "/admin/exams",
                        items: [
                            { label: "考试列表", icon: "pi pi-list", to: "/admin/exams/list" },
                            { label: "创建考试", icon: "pi pi-plus", to: "/admin/exams/create" },
                        ],
                    },
                    {
                        label: "用户管理",
                        icon: "pi pi-users",
                        to: "/admin/users",
                        items: [
                            { label: "用户列表", icon: "pi pi-user", to: "/admin/users/list" },
                            { label: "创建用户", icon: "pi pi-user-plus", to: "/admin/users/create" },
                            { label: "导入用户", icon: "pi pi-upload", to: "/admin/users/import" },
                            { label: "用户组管理", icon: "pi pi-users", to: "/admin/users/groups" },
                        ],
                    },
                ],
            },
            {
                label: "系统设置",
                icon: "pi pi-cog",
                to: "/admin/settings",
                items: [
                    { label: "公告管理", icon: "pi pi-megaphone", to: "/admin/announcements" },
                    { label: "通知管理", icon: "pi pi-bell", to: "/admin/notifications" },
                    {
                        label: '权限管理',
                        icon: 'pi pi-lock',
                        to: '/admin/perm',
                        items: [
                            { label: '用户角色分配', icon: 'pi pi-user', to: '/admin/perm/users' },
                            { label: '角色管理', icon: 'pi pi-users', to: '/admin/perm/roles' },
                            { label: '权限项管理', icon: 'pi pi-lock', to: '/admin/perm/permissions' }
                        ]
                    },
                    { label: "系统配置", icon: "pi pi-cog", to: "/admin/config" },
                ],
            },
        ]);
        // 📌 首页面包屑
        const home = ref<{ icon: string; route: string }>({
            icon: "pi pi-home",
            route: "/admin/dashboard",
        });
        const items = ref([
            { label: 'Components' },
            { label: 'Form' },
            { label: 'InputText', route: '/inputtext' }
        ]);
        const breadcrumbs = computed(() => {
            const currentPath = route.path;
            let breadcrumbItems: MenuItem[] = [];

            const findBreadcrumb = (items: MenuItem[], parentPath?: MenuItem) => {
                for (const item of items) {
                    if (item.to === currentPath) {
                        if (parentPath) breadcrumbItems.push(parentPath);
                        breadcrumbItems.push(item);
                        return true;
                    }
                    if (item.items) {
                        if (findBreadcrumb(item.items, item)) return true;
                    }
                }
                return false;
            };

            model.value.forEach((category) => {
                if (category.items) findBreadcrumb(category.items, category);
            });

            return breadcrumbItems;
        });
        return {
            home, items, breadcrumbs
        }
    }
})
</script>
<style scoped></style>