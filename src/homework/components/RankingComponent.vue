<template>
    <div class="rankings">
        <DataTable :value="data" tableStyle="min-width: 50rem" showGridlines>
            <Column field="ranking" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">排名</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.index + 1 }}</span>
                </template>
            </Column>
            <Column field="userName" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">用户名</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.user_id }}</span>
                </template>
            </Column>
            <Column field="nickName" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">姓名</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.nickname }}</span>
                </template>
            </Column>
            <Column field="time" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">总时间</span>
                </template>
                <template #body="slotProps">
                    <span>{{ calculateTotalTime(slotProps.data) }}</span>
                </template>
            </Column>
            <Column field="totalAcceptCount" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">AC</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.totalAccept}}</span>
                </template>
            </Column>

            <Column v-for="problem in problems" :key="problem.id" style="text-align: center;padding: 0;">
                <template #header>
                    <span class="flex-1 text-center font-bold" >{{ problem.name }}</span>
                </template>
                <template #body="slotProps">
                    <div class="p-4" :class="{ 'bg-green-500': slotProps.data[problem.id] >= 1 }">
                        <div v-if="!isNaN(slotProps.data['usetime' + problem.id.slice(7)])">
                            {{ Math.floor(slotProps.data['usetime' + problem.id.slice(7)] / 60) }} 
                        </div>
                        <div v-if="slotProps.data[problem.id] <= 1">{{ slotProps.data[problem.id] }} try </div>
                        <div v-else>{{ slotProps.data[problem.id] }} tries </div>                      
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import { getHomeworkRankingById } from '../api/homeworkRankingAPI';
const data = ref<any[]>([]);
const problems = ref<{ id: string, name: string }[]>([]);

function extractProblems(dataItem: any) {
    const problemKeys = Object.keys(dataItem).filter(key => key.startsWith('Problem'));
    problems.value = problemKeys.map((key, index) => ({
        id: key,
        name: String.fromCharCode(65 + index)
    }));
}

function calculateTotalTime(dataItem: any) {
    let totalTime = 0;
    problems.value.forEach(problem => {
        const problemId = problem.id;
        const usetime = dataItem['usetime' + problemId.slice(7)];
        const tries = dataItem[problemId];
        if (!isNaN(usetime) && !isNaN(tries)) {
            totalTime += Math.floor(usetime / 60) + tries * 20;
        }
    });
    return totalTime;
}

onMounted(() => {
    console.time('getHomeworkRankingById');
    getHomeworkRankingById(1457).then((res: any) => {
        console.timeEnd('getHomeworkRankingById');
        console.log('这是排行榜数据',res);
        data.value = res.data.map((item: any, index: number) => ({ ...item, index }));
        if (data.value.length >= 0) {
            extractProblems(data.value[0]);
        }
    });
});
</script>