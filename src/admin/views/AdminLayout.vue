<template>
    <div class="flex h-screen">
        <!-- 侧边栏固定 -->
        <aside class="w-[15%] fixed h-screen left-0 top-0 bg-gray-800 text-white">
            <AdminAside />
        </aside>
        <!-- 右侧内容区域 -->
        <div class="flex flex-col flex-1 ml-[15%] h-screen overflow-hidden">
            <!-- 二级导航栏固定 -->
            <header class="h-auto ml-1 rounded-none sticky top-0 z-10">
                <BreadcrumbNav />
            </header>
            <!-- 主内容区域，滚动只作用于这里 -->
            <main class="mt-2 ml-3 flex-1 overflow-y-auto">
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