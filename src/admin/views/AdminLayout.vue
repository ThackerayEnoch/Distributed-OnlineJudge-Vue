<template>
    <div class="flex h-screen">
        <!-- 侧边栏 -->
        <aside class="w-[15%]">
            <AdminAside />
        </aside>
        <!-- 右侧内容 -->
        <div class="flex flex-col flex-1 gap-4">
            <!-- 二级导航栏 -->
            <header class="h-auto ml-1 rounded-none">
                <!-- 二级导航内容 -->
                <BreadcrumbNav />
            </header>
            <main class="mt-2 ml-3">
                <router-view name="admin"></router-view>
            </main>
        </div>
    </div>
</template>

<script lang="ts" setup>
import AdminAside from '@/admin/components/AdminAside.vue';
import BreadcrumbNav from '@/admin/components/BreadcrumbNav.vue';
</script>

<style scoped></style>