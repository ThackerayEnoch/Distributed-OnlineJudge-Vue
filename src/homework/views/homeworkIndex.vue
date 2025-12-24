<template>
    <div class="w-full h-full">
        <div class="w-full h-[25%] p-4 shadow-lg bg-white dark:bg-gray-800 mb-4">
            <div class="flex items-center space-x-2">
                <Select class="w-25" v-model="selectedHomeworkType" :options="HomeworkTypeOptions" optionLabel="label"
                    optionValue="value" placeholder="筛选..." @change="filterHomeworks" />
                <InputGroup style="max-width: 50%;">
                    <InputText v-model="homeworkName" placeholder="请输入作业名" @keyup.enter="filterHomeworks" />
                    <InputGroupAddon style="margin: 0;padding: 0;border-radius: 0;">
                        <Button icon="pi pi-search" @click="filterHomeworks" severity="secondary"
                            style="border-radius: 0;" variant="text" />
                    </InputGroupAddon>
                </InputGroup>
            </div>
        </div>
        <div class="w-full h-[75%] p-4 shadow-lg bg-white dark:bg-gray-800">
            <DataTable :value="homeworks" stripedRows paginator :rows="30" tableStyle="min-width: 60%"
                responsiveLayout="scroll" size="large" :totalRecords="totalRecords" lazy :first="first" @page="onPage">
                <Column field="id" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">编号</span>
                    </template>
                </Column>
                <Column field="title" style="min-width: 35%;">
                    <template #header>
                        <span class="flex-1 font-bold">标题</span>
                    </template>
                    <template #body="slotProps">
                        <RouterLink :to="`/homework/${slotProps.data.id}/intro`"
                            class="text-blue-400 hover:text-blue-600 truncate">
                            {{ slotProps.data.title }}
                        </RouterLink>
                    </template>
                </Column>
                <Column field="total" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">题目数</span>
                    </template>
                </Column>
                <Column field="completeRate" style="text-align: center;min-width: 12%;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">完成进度</span>
                    </template>
                    <template #body="slotProps">
                        <ProgressBar
                            :value="parseFloat(((slotProps.data.solved / (slotProps.data.total || 1)) * 100).toFixed(2))"
                            :class="getProgressBarColor(parseFloat(((slotProps.data.solved / (slotProps.data.total || 1)) * 100).toFixed(2)))">
                        </ProgressBar>
                    </template>
                </Column>
                <Column field="startTime" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">开始时间</span>
                    </template>
                    <template #body="slotProps">
                        <span class="text-sm">{{ new Date(slotProps.data.startTime).toLocaleString('zh-CN', {
                            year: 'numeric', month:
                                '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })
                        }}</span>
                    </template>
                </Column>
                <Column field="endTime" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">结束时间</span>
                    </template>
                    <template #body="slotProps">
                        <span class="text-sm">{{ new Date(slotProps.data.endTime).toLocaleString('zh-CN', {
                            year: 'numeric', month:
                                '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })
                        }}</span>
                    </template>
                </Column>
                <Column field="status" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">状态</span>
                    </template>
                    <template #body="slotProps">
                        <span :class="getStatusClass(slotProps.data.startTime, slotProps.data.endTime)"
                            class="p-2 text-sm inline-block rounded">{{
                                getRealTimeStatusText(slotProps.data.startTime, slotProps.data.endTime) }}</span>
                    </template>
                </Column>
                <Column style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">开放</span>
                    </template>
                    <template #body="slotProps">
                        <span :class="getPremClass(slotProps.data.auth)" class="p-2 text-base">
                            {{ getPremText(slotProps.data.auth) }}
                        </span>
                    </template>
                </Column>
                <Column field="nickname" style="text-align: center;" class="text-sm">
                    <template #header>
                        <span class="flex-1 text-center text-base font-bold">作者</span>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getHomeworkPage, getHomeworkCount, type HomeworkSpace } from '../api/homeworkAPI'
import { useRouter, useRoute } from 'vue-router';
import globalMessage from '@/common/utils/toast';

const router = useRouter();
const route = useRoute();

const totalRecords = ref(0);
const first = ref((parseInt(route.query.currentPage as string || '1') - 1) * 30 || 0);

const homeworks = ref<HomeworkSpace.HomeworkJSON[]>([]);

const homeworkName = ref('');
const selectedHomeworkType = ref('own');
const HomeworkTypeOptions = ref([
    { label: '全部', value: 'all' },
    { label: '仅自己', value: 'own' }
]);
const currentTime = ref(Date.now());
let timeUpdateInterval: number;
function filterHomeworks() {
    first.value = 0;
    loadData();
    loadCount();
}
function getPremText(permission: number) {
    if (permission === 0) return '公开';
    if (permission === 1) return '保护';
    if (permission === 2) return '私有';
    return '未知';
}
function getPremClass(permission: number) {
    if (permission === 0) return 'text-blue-500';
    if (permission === 1) return 'text-yellow-500';
    if (permission === 2) return 'text-red-500';
    return 'text-gray-800';
}
function computeStatus(startTime: string, endTime: string) {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const oneDay = 24 * 60 * 60 * 1000; // 一天的毫秒数
    if (now > end) return 1; // 已结束
    if (now < start) {
        if (start - now < oneDay) return 4; // 小于1天
        return 2; // 未开始
    }
    if (end - now < oneDay) return 3; // 小于1天
    return 0; // 进行中
}
function getRealTimeStatusText(startTime: string, endTime: string) {
    const now = currentTime.value;
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (now > end) return '已结束';
    if (now < start) {
        const diff = start - now;
        if (diff < oneDay) {
            return getRealTimeText(diff) + '后开始';
        }
        return '未开始';
    }

    const remaining = end - now;
    if (remaining < oneDay) {
        return '剩余' + getRealTimeText(remaining);
    }
    return '进行中';
}
function getRealTimeText(timeDiff: number): string {
    if (timeDiff <= 0) return '';

    const hours = Math.floor(timeDiff / 3600000);
    const minutes = Math.floor((timeDiff % 3600000) / 60000);
    const seconds = Math.floor((timeDiff % 60000) / 1000);

    if (hours > 0) {
        return ` ${hours} 小时 ${minutes} 分钟`;
    } else if (minutes > 0) {
        return ` ${minutes} 分钟 ${seconds} 秒`;
    } else {
        return ` ${seconds} 秒`;
    }
}
function getStatusClass(startTime: string, endTime: string) {
    const status = computeStatus(startTime, endTime);
    let result: string;
    switch (status) {
        case 0:
            result = 'bg-blue-500 text-white';
            break;
        case 1:
            result = 'bg-gray-500 text-white';
            break;
        case 2:
            result = 'bg-green-500 text-white';
            break;
        case 3:
            result = 'bg-red-500 text-white';
            break;
        case 4:
            result = 'bg-green-500 text-white';
            break;
        default:
            result = 'bg-gray-500 text-white';
            break;
    }
    return result;
}
function onPage(event: any) {
    first.value = event.first;
    loadData();
}
// 获取进度条的颜色
function getProgressBarColor(accuracy: number) {
    if (accuracy < 40) return 'progress-20';
    if (accuracy < 60) return 'progress-40';
    if (accuracy < 80) return 'progress-60';
    return 'progress-80';
};
onMounted(() => {
    loadData();
    loadCount();

    // 启动每秒更新时间的定时器
    timeUpdateInterval = setInterval(() => {
        currentTime.value = Date.now();
    }, 1000);
});

onUnmounted(() => {
    // 清理定时器
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
    }
});
async function loadData() {
    getHomeworkPage(first.value, selectedHomeworkType.value, homeworkName.value).then(result => {
        homeworks.value = result.data as unknown as HomeworkSpace.HomeworkJSON[];
        router.push({ query: { currentPage: (first.value / 30 + 1).toString() } });
    }).catch(err => {
        globalMessage.error("加载错误", err.message);
    });

}
async function loadCount() {
    const result = await getHomeworkCount(selectedHomeworkType.value, homeworkName.value);
    totalRecords.value = result.data as number;
}
</script>

<style scoped>
.progress-20 ::v-deep(.p-progressbar-value) {
    background-color: #F56C6C !important;
}

.progress-40 ::v-deep(.p-progressbar-value) {
    background-color: #E6A23C !important;
}

.progress-60 ::v-deep(.p-progressbar-value) {
    background-color: #1989FA !important;
}

.progress-80 ::v-deep(.p-progressbar-value) {
    background-color: #10B981 !important;
}
</style>