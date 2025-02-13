<template>
    <div class="bg-white dark:bg-gray-800 mt-1 ml-2 mr-2 p-4 rounded-none shadow-md">
        <div id="functionArea">
            <!-- 题目列表标题 -->
            <div class="p-4">
                <h2 class="text-2xl font-bold text-blue-500">作业列表</h2>
            </div>
            <!-- 操作栏 -->
            <div class="flex items-center space-x-5 p-4">
                <!-- 按钮：创建 -->
                <router-link to="/admin/problem/create"
                    class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow-md">
                    + 创建
                </router-link>
                <!-- 搜索框 -->
                <span class="relative">
                    <InputText placeholder="输入关键词" class="p-2 w-64 rounded-md border border-gray-300" />
                    <i class="pi pi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </span>
            </div>
        </div>
        <div>
            <DataTable :value="homeworks" stripedRows size="large" :paginator="true" :rows="20" lazy :first="first"
                :totalRecords="totalRecords" @page="onPage" tableClass="text-sm p-4">
                <Column field="id" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">ID</span>
                    </template>
                </Column>
                <Column field="title" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">标题</span>
                    </template>
                    <template #body="slotProps">
                        <router-link :to="'/admin/contest/edit/' + slotProps.data.id">{{ slotProps.data.title
                            }}</router-link>
                    </template>
                </Column>
                <Column field="auth" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">权限</span>
                    </template>
                    <template #body="slotProps">
                        <span v-if="slotProps.data.auth === 'public'"
                            class="bg-green-100 text-green-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">公开</span>
                        <span v-else
                            class="bg-red-100 text-red-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">私有</span>
                    </template>
                </Column>
                <Column field="visible" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">是否可见</span>
                    </template>
                    <template #body="slotProps">
                        <div class="flex items-center justify-center">
                            <ToggleSwitch v-model="slotProps.data.visible" />
                        </div>
                    </template>
                </Column>
                <Column field="createTime" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">开始时间</span>
                    </template>
                    <template #body="slotProps">
                        <span class="text-center">{{ slotProps.data.startTime }}</span>
                    </template>
                </Column>
                <Column field="updateTime" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">结束时间</span>
                    </template>
                    <template #body="slotProps">
                        <span class="text-center">{{ slotProps.data.endTime }}</span>
                    </template>
                </Column>
                <Column field="creator" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">创建人</span>
                    </template>
                    <template #body="slotProps">
                        <span class="text-center">{{ slotProps.data.creator }}</span>
                    </template>
                </Column>
                <Column>
                    <template #header>
                        <span class="flex-1 text-center font-bold">操作</span>
                    </template>
                    <template #body="slotProps">
                        <div class="flex space-x-2 justify-center">
                            <router-link :to="`/admin/problem/edit/${slotProps.data.id}`"
                                class="bg-blue-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-blue-600"
                                v-tooltip.top="'编辑作业'">
                                <i class="fas fa-edit"></i>
                            </router-link>
                            <router-link :to="`/delete/${slotProps.data.id}`"
                                class="bg-red-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-red-600"
                                v-tooltip.top="'删除作业'">
                                <i class="fas fa-trash"></i>
                            </router-link>
                            <button
                                class="bg-green-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-green-600"
                                v-tooltip.top="'复制作业'">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
<script lang="ts" setup>
import ToggleSwitch from 'primevue/toggleswitch';
import { ref } from 'vue';

const homeworks = ref([
    {
        id: 1,
        title: '第一次作业',
        auth: 'public',
        visible: 1,
        startTime: '2021-10-01',
        endTime: '2021-10-02',
        creator: 'admin',
    },
    {
        id: 2,
        title: '第二次作业',
        auth: 'private',
        visible: 0,
        startTime: '2021-10-01',
        endTime: '2021-10-02',
        creator: 'admin',
    }
]);
const first = ref<number>(0);
const totalRecords = ref<number>(0);


function onPage(event: { first: number }) {
    first.value = event.first;
}
</script>
<style scoped></style>