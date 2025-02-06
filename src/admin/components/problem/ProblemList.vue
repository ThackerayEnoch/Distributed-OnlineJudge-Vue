<template>
    <div class="bg-white dark:bg-gray-800 mt-1 ml-2 mr-2 p-4 rounded-none shadow-md">
        <div id="functionArea">
        </div>
        <div class="border-b border-gray-300 dark:border-gray-700 p-0 m-0" />
        <div id="tableArea">
            <DataTable :value="problems" :paginator="true" :rows="20" lazy :first="first" :totalRecords="totalRecords"
                @page="onPage">
                <Column field="id" header="ID"></Column>
                <Column field="displayId" header="展示ID"></Column>
                <Column field="title" header="标题"></Column>
                <Column field="creator" header="创建者"></Column>
                <Column field="createTime" header="创建时间"></Column>
                <Column field="modifier" header="最近修改者"></Column>
                <Column field="updateTime" header="修改时间"></Column>
                <Column field="status" header="状态"></Column>
                <Column header="操作">
                </Column>

            </DataTable>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAdminProblems, getAdminProblemCount, type ProblemSpace } from '@/admin/api/problemAPI';
import globalMessage from '@/common/utils/toast';

const problems = ref<ProblemSpace.ProblemVO>([]);
const first = ref<number>(0);
const totalRecords = ref<number>(0);
onMounted(() => {
    loadProblems();
    loadProblemsCount();
});
function onPage(event: any) {
    first.value = event.first;
    loadProblems();
}
async function loadProblems() {
    await getAdminProblems(first.value, 20).then((res) => {
        problems.value = res.data;
    }).catch((err) => {
        globalMessage.error('加载题目列表失败', err.msg);
    });
}
async function loadProblemsCount() {
    await getAdminProblemCount().then((res) => {
        totalRecords.value = res.data;
    }).catch(() => {
        globalMessage.error('加载题目数量失败', err.msg);
    });
}
</script>
<style lang="css" scoped></style>