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
                    <span>{{ slotProps.data.totalTime }}</span>
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
                    <div class="h-20 flex flex-col justify-center" :class="getBackgroundClass(slotProps.data[problem.id], slotProps.data['usetime' + problem.id.slice(7)])">
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
import { ref, defineProps } from 'vue';
import { onMounted } from 'vue';
import { getHomeworkRankingById } from '../api/homeworkRankingAPI';
import homework from '../routes/homework';
const props = defineProps<{
    homeworkId: number;
}>();
// 排行榜数据
const data = ref<any[]>([]);
// 问题渲染
const problems = ref<{ id: string, name: string }[]>([]);
// ac问题背景色
const acColor = ref([
    'bg-green-300',
    'bg-green-400',
    'bg-green-500',
    'bg-green-600',
]);
// 获取背景色
function getBackgroundClass(tries: number, time: any) {
    if(tries>0 && !time){
        return 'bg-red-300';
    }    
    if (tries >= 1) {
        return acColor.value[Math.min(tries - 1, acColor.value.length - 1)];
    }
    return '';
}
// 问题数据进一步处理
function extractProblems(dataItem: any) {
    const problemKeys = Object.keys(dataItem).filter(key => key.startsWith('Problem'));
    problems.value = problemKeys.map((key, index) => ({
        id: key,
        name: String.fromCharCode(65 + index)
    }));
}

// 计算总时间(含罚时)
function calculateTotalTime(dataItem: any) {
    let totalTime = 0;
    // penaltyTime罚时
    let penaltyTime = 0;
    problems.value.forEach(problem => {
        const problemId = problem.id;
        const usetime = dataItem['usetime' + problemId.slice(7)];
        const tries = dataItem[problemId];
        if (!isNaN(usetime)) {
            totalTime += usetime;
        }
        
        if (tries > 0) {
            penaltyTime += (tries - 1) * 20;
        }
    });
    return totalTime + penaltyTime;
}

// 加载排行榜数据
function loadRankingData(homeworkId:number) {
    getHomeworkRankingById(homeworkId).then((res: any) => {
        data.value = res.data;
        // 比赛问题列表获取
        if (data.value.length >= 0) {
            extractProblems(data.value[0]);
        }
        // 总时间计算
        data.value = res.data.map((item: any, index: number) => {
           let totalTime = calculateTotalTime(item); 
           return { ...item, index, totalTime };
        });
        // 排行榜排序
        data.value.sort((a, b) => {
            if (a.totalAccept === b.totalAccept) {
                return a.totalTime - b.totalTime;
            }
            return b.totalAccept - a.totalAccept;
        });


    });   
}


onMounted(() => {
    loadRankingData(props.homeworkId);
});
</script>