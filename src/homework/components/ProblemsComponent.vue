<template>
    <div>
        <DataTable :value="problems" stripedRows size="large" tableStyle="min-width: 50rem" :rows="30" lazy>
            <Column field="status" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">状态</span>
                </template>
                <template #body="slotProps">
                    <div class="flex-1 text-center font-bold">
                        <Tag v-if="slotProps.data.acceptCount" severity="success" value="AC"></Tag>
                        <Tag v-if="!slotProps.data.acceptCount&&slotProps.data.submitCount" severity="danger" value="WA"></Tag>                        
                    </div>
                </template>
            </Column>
            <Column field="displayId" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">编号</span>
                </template>
            </Column>
            <Column field="title" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">标题</span>
                </template>
                <template #body="slotProps">
                    <router-link :to="{ path: `/problem/${slotProps.data.problemId}`, query: { contestId: props.homeworkId } }"
                        class="text-blue-400 hover:text-blue-600 truncate">
                        {{ slotProps.data.title }}
                    </router-link>
                </template>
            </Column>
            <Column field="tag" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">标签</span>
                </template>
                <template #body>
                    <span>ACM</span>
                </template>
            </Column>
            <Column field="totalSubmitCount" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">总提交</span>
                </template>
            </Column>
            <Column field="totalAcceptCount" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">通过次数</span>
                </template>
            </Column>
            <Column field="rate" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">通过率</span>
                </template>
                <template #body="slotProps">
                    <span>{{ parseFloat(((slotProps.data.totalAcceptCount/slotProps.data.totalSubmitCount)*100).toFixed(2)) }}%</span>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { getHomeworkProblems, getHomeworkProblemsStatus } from '../api/homeworkAPI';
interface Problem {
    displayId: number;
    problemId: number;
    title: string;
    submitCount: number;
    acceptCount: number;    
    totalSubmitCount: number;
    totalAcceptCount: number;
}

const problems = ref<Problem[]>([]);
const userProblems = ref<Problem[]>([]);
const props = defineProps<{
    homeworkId: number;
}>();
// 根据作业ID查找该用户在该作业下的题目数据
async function localProblems(){
    const res = await getHomeworkProblems(props.homeworkId)
    console.log('userProblem',res.data)
    userProblems.value = res.data as any;
}
// 根据作业ID查找该作业下的所有题目状态
async function localHomeworkProblemsStatus() {
    const res = await getHomeworkProblemsStatus(props.homeworkId);
    console.log('problems',res.data);
    problems.value = res.data as any;
}
async function mergeProblemsAndStatus(){
    await localProblems();
    await localHomeworkProblemsStatus();
    problems.value = problems.value.map((problem: any) => {
        const userProblem = userProblems.value.find((userProblem: any) => userProblem.problemId === problem.problemId&&userProblem.displayId === problem.displayId);
        return {
            ...problem,
            submitCount: userProblem ? userProblem.submitCount : 0,
            acceptCount: userProblem ? userProblem.acceptCount : 0,
        }
    })
    console.log(problems.value);
}
onMounted(() => {
    console.log(props.homeworkId);
    mergeProblemsAndStatus();
});
</script>