<template>
    <div class="bg-white dark:bg-gray-800 mt-1 ml-2 mr-2 p-4 rounded-none shadow-md font-sans">
        <div id="functionArea">
            <!-- 题目列表标题 -->
            <div class="p-4 space-x-4 flex items-center">
                <h2 class="text-2xl font-bold text-blue-500">作业列表</h2>
                <ToggleSwitch v-tooltip.top="'只显示自己创建的作业'" @change="modeChange" v-model="displayMode" />
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
                <Column field="title" style="text-align: center;min-width:30%;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">标题</span>
                    </template>
                    <template #body="slotProps">
                        <router-link :to="'/admin/contest/edit/' + slotProps.data.id">{{ slotProps.data.title
                            }}</router-link>
                    </template>
                </Column>
                <Column field="type" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">类型</span>
                    </template>
                    <template #body="slotProps">
                        <span v-if="slotProps.data.type === 0"
                            class="bg-blue-100 text-blue-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">ACM</span>
                        <span v-else-if="slotProps.data.type === 1"
                            class="bg-yellow-100 text-yellow-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">OI</span>
                    </template>
                </Column>
                <Column field="auth" style="text-align: center; min-width: 7%;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">权限</span>
                    </template>
                    <template #body="slotProps">
                        <span v-if="slotProps.data.auth === 0"
                            class="bg-green-100 text-green-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">公开</span>
                        <span v-else-if="slotProps.data.auth === 1"
                            class="bg-red-100 text-red-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">私有</span>
                        <span v-else
                            class="bg-yellow-100 text-yellow-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">保护</span>
                    </template>
                </Column>
                <Column field="visible" style="text-align: center;min-width: auto;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">是否可见</span>
                    </template>
                    <template #body="slotProps">
                        <div class="flex items-center justify-center">
                            <CustomToggleButton class="text-xs" v-model="slotProps.data.visible"
                                @change="visibleChange(slotProps.data.visible, slotProps.data.id)" />
                        </div>
                    </template>
                </Column>
                <Column field="createTime" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">开始时间</span>
                    </template>
                    <template #body="slotProps">
                        <span class="text-center test-xs">{{ slotProps.data.startTime }}</span>
                    </template>
                </Column>
                <Column field="updateTime" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">结束时间</span>
                    </template>
                    <template #body="slotProps">
                        <span class="text-center test-xs">{{ slotProps.data.endTime }}</span>
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
                            <button
                                class="bg-green-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-green-600"
                                v-tooltip.top="'复制作业'">
                                <i class="fas fa-copy"></i>
                            </button>
                            <router-link :to="`/admin/problem/stats/${slotProps.data.id}`"
                                class="bg-purple-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-purple-600"
                                v-tooltip.top="'查看统计信息'">
                                <i class="fas fa-chart-bar"></i>
                            </router-link>
                            <router-link :to="`/delete/${slotProps.data.id}`"
                                class="bg-red-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-red-600"
                                v-tooltip.top="'删除作业'">
                                <i class="fas fa-trash"></i>
                            </router-link>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { type ContestSpace, getHomeworkList, getHomeworksCount } from '@/admin/api/contestAPI'
import globalMessage from '@/common/utils/toast';
import ToggleSwitch from 'primevue/toggleswitch';
import CustomToggleButton from './CustomToggleButton.vue';

const homeworks = ref<ContestSpace.HomeworkListVO[]>([]);
const first = ref<number>(0);
const totalRecords = ref<number>(0);
const displayMode = ref<boolean>(true);
onMounted(() => {
    loadHomeworks();
    loadHomeworksCount();
});
async function loadHomeworks() {
    const mode = displayMode.value ? 'own' : 'all';
    await getHomeworkList(first.value, mode).then(res => {
        homeworks.value = res.data as ContestSpace.HomeworkListVO[];
    }).catch(err => {
        globalMessage.error("加载数据失败", err.message);
    });
}
async function loadHomeworksCount() {
    const mode = displayMode.value ? 'own' : 'all';
    await getHomeworksCount(mode).then(res => {
        totalRecords.value = res.data as number;
    }).catch(err => {
        globalMessage.error("加载数据失败", err.message);
    });
}
function visibleChange(visible: boolean, id: number) {
    console.log(visible, id);
}
function modeChange() {
    first.value = 0;
    loadHomeworks();
    loadHomeworksCount();
}
function onPage(event: { first: number }) {
    first.value = event.first;
    loadHomeworks();
}
</script>
<style scoped></style>