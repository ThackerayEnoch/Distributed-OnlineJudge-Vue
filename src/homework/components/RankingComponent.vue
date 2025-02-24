<template>
    <div class="rankings">
        <DataTable :value="users" tableStyle="min-width: 50rem" showGridlines>
            <Column field="ranking" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">排名</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.index + 1 }}</span>
                </template>
            </Column>
            <Column field="userName" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">用户名</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.userName }}</span>
                </template>
            </Column>
            <Column field="nickName" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">姓名</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.nickName }}</span>
                </template>
            </Column>
            <Column field="time" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">总时间</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.time }}</span>
                </template>
            </Column>
            <Column field="totalAcceptCount" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">AC</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.totalAcceptCount }}</span>
                </template>
            </Column>

            <Column v-for="problem in problems" :key="problem.id" :header="problem.name"
                style="text-align: center;">
                <template #body="slotProps">
                    <div>{{ slotProps.data.problems[problem.id] }}</div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';

const users = ref([
    {
        index: 0,
        userName: 'user1',
        nickName: 'User One',
        totalAcceptCount: 10,
        time: '1:30:00',
        problems: [
            { Problem0: 440, count: 3 },
            { Problem1: 220, count: 2 },
            { Problem2: 1, count: 5 },
            { Problem3: 2, count: 1 },
            { Problem4: 3, count: 4 },
            { Problem5: 20, count: 2 },
            { Problem6: 30, count: 3 },
            { Problem7: 200, count: 1 },
            { Problem8: 259, count: 0 },
            { Problem9: 476, count: 2 }
            // problem0: 这里该题目提交时间 
            // count: 表示提交次数用于计算罚时
        ]
    },
    {
        index: 1,
        userName: 'user2',
        nickName: 'User two',
        totalAcceptCount: 10,
        time: '1:40:00',
        problems: [
            { Problem0: 440, count: 3 },
            { Problem1: 220, count: 2 },
            { Problem2: 1, count: 5 },
            { Problem3: 2, count: 1 },
            { Problem4: 3, count: 4 },
            { Problem5: 20, count: 2 },
            { Problem6: 30, count: 3 },
            { Problem7: 200, count: 1 },
            { Problem8: 259, count: 0 },
            { Problem9: 476, count: 2 }
        ]
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
    { id: 'Problem9', name: 'J' }
]);

</script>