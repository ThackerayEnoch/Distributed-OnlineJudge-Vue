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
                    <span>{{ slotProps.data.user_id }}</span>
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

            <Column v-for="problem in problems" :key="problem.id" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">{{ problem.name }}</span>
                </template>
                <template #body="slotProps">
                    <div>{{ slotProps.data[problem.id] }}</div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import { getHomeworkRankingById } from '../api/homeworkRankingAPI';
const data = ref([]);
const users = ref([
    {
        index: 0,
        userName: 'user1',
        nickName: 'User One',
        totalAcceptCount: 10,
        time: '1:30:00',
        problems: {
            Problem0: 1
        }
    },
    {
        index: 1,
        userName: 'user2',
        nickName: 'User two',
        totalAcceptCount: 10,
        time: '1:40:00',
        problems: {
            Problem0: 1,
        }
    },
]);

const problems = ref([
    { id: 'Problem0', name: 'A' },
    { id: 'Problem1', name: 'B' },
    { id: 'Problem2', name: 'C' },
    { id: 'Problem3', name: 'D' },
    { id: 'Problem4', name: 'E' },
    { id: 'Problem5', name: 'F' },
    { id: 'Problem6', name: 'G' },
    { id: 'Problem7', name: 'H' },
    { id: 'Problem8', name: 'I' },
    { id: 'Problem9', name: 'J' },
    { id: 'Problem10',name: 'K' },
]);

onMounted(() => {
    console.time('getHomeworkRankingById');
    getHomeworkRankingById(1457).then((res: any) => {
        console.timeEnd('getHomeworkRankingById');
        console.log('只是排行榜数据',res);
        data.value = res.data;
    });
});
</script>