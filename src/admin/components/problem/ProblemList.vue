<template>
    <div class="bg-white dark:bg-gray-800 mt-1 ml-2 mr-2 p-4 rounded-none shadow-md">
        <div id="functionArea">
            <!-- 题目列表标题 -->
            <div class="p-4">
                <h2 class="text-xl font-bold text-blue-500">题目列表</h2>
            </div>
            <!-- 操作栏 -->
            <div class="flex items-center space-x-5 p-4">
                <!-- 按钮：创建 -->
                <router-link to="/admin/problem/create"
                    class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow-md">
                    + 创建
                </router-link>
                <!-- 按钮：添加远程OJ题目 -->
                <button class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded shadow-md">
                    + 添加远程OJ题目
                </button>
                <!-- 搜索框 -->
                <span class="relative">
                    <InputText placeholder="输入关键词" class="p-2 w-64 rounded-md border border-gray-300" />
                    <i class="pi pi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </span>
                <!-- 下拉框：全部题目 -->
                <Select class="w-48" />
                <Select class="w-48" v-model="selectedStatus" :options="showOptions" optionLabel="label"
                    optionValue="value" />
            </div>
        </div>
        <div class="border-b border-gray-300 dark:border-gray-700 p-0 m-0 md-4" />
        <div id="tableArea">
            <DataTable :value="problems" stripedRows size="large" :paginator="true" :rows="10" lazy :first="first"
                :totalRecords="totalRecords" @page="onPage" tableClass="text-sm p-4">
                <Column field="id" header="ID"></Column>
                <Column field="displayId" header="展示ID"></Column>
                <Column field="title" header="标题">
                    <template #body="slotProps">
                        <router-link :to="'/problem/' + slotProps.data.id">{{ slotProps.data.title
                            }}</router-link>
                    </template>
                </Column>
                <Column field="creator" header="创建者"></Column>
                <Column field="createTime" header="创建时间"></Column>
                <Column field="modifier" header="最近修改者"></Column>
                <Column field="updateTime" header="修改时间"></Column>
                <Column field="status" header="状态">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.status" :options="statusOptions" optionLabel="label"
                            optionValue="value" @change="onStatusChange(slotProps)" />
                    </template>
                </Column>
                <Column header="操作">
                    <template #body="{ data }">
                        <div class="space-y-2">
                            <div class="flex space-x-2">
                                <router-link :to="`/admin/problem/edit/${data.id}`"
                                    class="bg-blue-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-blue-600"
                                    v-tooltip.top="'编辑题目'">
                                    <i class="fas fa-edit"></i>
                                </router-link>
                                <router-link :to="`/admin/problem/testcases/${data.id}`"
                                    class="bg-green-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-green-600"
                                    v-tooltip.top="'编辑测试点'">
                                    <i class="fas fa-edit"></i>
                                </router-link>
                                <router-link :to="`/delete/${data.id}`"
                                    class="bg-red-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-red-600"
                                    v-tooltip.top="'删除题目'">
                                    <i class="fas fa-trash"></i>
                                </router-link>
                            </div>
                        </div>
                    </template>
                </Column>


            </DataTable>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAdminProblems, getAdminProblemCount, updateAdminProblem, type ProblemSpace } from '@/admin/api/problemAPI';
import globalMessage from '@/common/utils/toast';
import Select from 'primevue/select';

const problems = ref<ProblemSpace.ProblemVO[]>([]);
const first = ref<number>(0);
const totalRecords = ref<number>(0);
const statusOptions = ref([
    { label: '公开题目', value: 1 },
    { label: '隐藏题目', value: 0 },
]);
const showOptions = ref([
    { label: '全部题目', value: 0 },
    { label: '公开题目', value: 1 },
    { label: '隐藏题目', value: 2 },
]);
const selectedStatus = ref(0);
onMounted(() => {
    loadProblems();
    loadProblemsCount();
});
function onStatusChange(event: any) {
    updateListProblem(event.data);
}
function onPage(event: any) {
    first.value = event.first;
    loadProblems();
}
async function updateListProblem(event: ProblemSpace.ProblemVO) {

    await updateAdminProblem(event.id, event.status).then((res) => {
        globalMessage.success("更新成功", res.message);
    }).catch((err) => {
        globalMessage.error('更新题目状态失败', err.msg);
    });
}
async function loadProblems() {
    await getAdminProblems(first.value).then((res) => {
        problems.value = res.data as ProblemSpace.ProblemVO[];
    }).catch((err) => {
        globalMessage.error('加载题目列表失败', err.msg);
    });
}
async function loadProblemsCount() {
    await getAdminProblemCount().then((res) => {
        totalRecords.value = res.data as number;
    }).catch((err) => {
        globalMessage.error('加载题目数量失败', err.msg);
    });
}
</script>
<style lang="css" scoped></style>