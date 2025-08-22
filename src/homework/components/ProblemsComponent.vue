<template>
    <div>
        <DataTable :value="props.problems" stripedRows size="large" tableStyle="min-width: 50rem" :rows="30" lazy>
            <Column field="status" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">状态</span>
                </template>
                <template #body="slotProps">
                    <div class="flex-1 text-center font-bold">
                        <Tag v-if="slotProps.data.isSolved" severity=" success" value="AC"></Tag>
                        <Tag v-if="slotProps.data.isSolved != null && !slotProps.data.isSolved" severity="danger"
                            value="WA"></Tag>
                    </div>
                </template>
            </Column>
            <Column field="displayId" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">编号</span>
                </template>
                <template #body="slotProps">
                    <span>{{ convertToLetter(slotProps.data.displayId + 1) }}</span>
                </template>
            </Column>
            <Column field="title" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">标题</span>
                </template>
                <template #body="slotProps">
                    <router-link
                        :to="{ path: `/problem/${slotProps.data.problemId}`, query: { contestId: Number(props.homeworkId) } }"
                        class="text-blue-400 hover:text-blue-600 truncate">
                        {{ slotProps.data.title }}
                    </router-link>
                </template>
            </Column>
            <Column field="tag" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">类型</span>
                </template>
                <template #body>
                    <span>ACM</span>
                </template>
            </Column>
            <Column field="totalSubmit" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">总提交</span>
                </template>
            </Column>
            <Column field="totalSolved" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">通过次数</span>
                </template>
            </Column>
            <Column field="rate" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">通过率</span>
                </template>
                <template #body="slotProps">
                    <span v-if="slotProps.data.totalSubmit != 0">{{
                        parseFloat(((slotProps.data.totalSolved / slotProps.data.totalSubmit)
                            * 100).toFixed(2))
                    }}%</span>
                    <span v-else> </span>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
<script lang="ts" setup>
import { type HomeworkSpace } from '../api/homeworkAPI';
const props = defineProps<{
    homeworkId: string;
    problems: HomeworkSpace.HomeworkProblemsVO[];
}>();
function convertToLetter(num: number) {
    let str = '';
    while (num > 0) {
        let m = num % 26;
        if (m === 0) {
            m = 26;
        }
        str = String.fromCharCode(m + 64) + str;
        num = (num - m) / 26;
    }
    return str;
}
</script>