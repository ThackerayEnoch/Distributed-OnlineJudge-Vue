<template>
    <div class="w-full h-full">
        <div class="w-full h-[75%] p-4 shadow-lg bg-white dark:bg-gray-800">
            <DataTable :value="homeworks" stripedRows paginator :rows="30" tableStyle="min-width: 60%"
                responsiveLayout="scroll" size="large" :totalRecords="totalRecords" lazy :first="first" @page="onPage">
                <Column field="contestId" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">编号</span>
                    </template>
                </Column>
                <Column field="title" style="min-width: 28%;">
                    <template #header>
                        <span class="flex-1 font-bold">标题</span>
                    </template>
                    <template #body="slotProps">
                        <router-link :to="`/status/${slotProps.data.id}`"
                            class="text-blue-400 hover:text-blue-600 truncate">
                            {{ slotProps.data.title }}
                        </router-link>
                    </template>
                </Column>
                <Column field="total" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">题目数</span>
                    </template>
                </Column>
                <Column field="completeRate" style="text-align: center;min-width: 17%;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">完成进度</span>
                    </template>
                    <template #body="slotProps">
                        <ProgressBar
                            :value="parseFloat(((slotProps.data.acCount / (slotProps.data.total || 1)) * 100).toFixed(2))"
                            :class="getProgressBarColor(parseFloat(((slotProps.data.acCount / (slotProps.data.total || 1)) * 100).toFixed(2)))">
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
                                getStatusText(slotProps.data.startTime, slotProps.data.endTime) }}</span>
                    </template>
                </Column>
                <Column field="permission" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">开放</span>
                    </template>
                    <template #body="slotProps">
                        <span :class="getPremClass(slotProps.data.permission)" class="p-2 text-base">
                            {{ getPremText(slotProps.data.permission) }}
                        </span>
                    </template>
                </Column>
                <Column field="author" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">作者</span>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
const totalRecords = ref(0);
const first = ref(0);

const homeworks = ref([
    {
        contestId: 1,
        title: '已结束的作业',
        total: 5,
        acCount: 3,
        startTime: '2025-01-01T00:00:00',
        endTime: '2025-01-10T00:00:00',
        permission: 0,
    },
    {
        contestId: 2,
        title: '进行中的作业',
        total: 5,
        acCount: 2,
        startTime: '2025-01-20T00:00:00',
        endTime: '2025-01-30T00:00:00',
        permission: 1,
    },
    {
        contestId: 3,
        title: '未开始的作业',
        total: 5,
        acCount: 5,
        startTime: '2025-02-01T00:00:00',
        endTime: '2025-02-10T00:00:00',
        permission: 0,
    },
    {
        contestId: 4,
        title: '还有一天结束的作业',
        total: 10,
        acCount: 8,
        startTime: '2025-01-15T00:00:00',
        endTime: '2025-01-25T18:50:00',
        permission: 0,
    },
    {
        contestId: 5,
        title: '还有15小时结束的作业',
        total: 5,
        acCount: 1,
        startTime: '2025-01-15T00:00:00',
        endTime: '2025-01-25T09:50:00',
        permission: 0,
    },
    {
        contestId: 6,
        title: '还有1小时结束的作业',
        total: 5,
        acCount: 2,
        startTime: '2025-01-15T00:00:00',
        endTime: '2025-01-24T19:50:00',
        permission: 0,
    },
    {
        contestId: 7,
        title: '还有5分钟结束的作业',
        total: 50,
        acCount: 20,
        startTime: '2025-01-15T00:00:00',
        endTime: '2025-01-24T18:55:00',
        permission: 0,
    },
    {
        contestId: 8,
        title: '还有30秒结束的作业',
        total: 5,
        acCount: 0,
        startTime: '2025-01-15T00:00:00',
        endTime: '2025-01-24T18:50:30',
        permission: 0,
    },
    {
        contestId: 9,
        title: '还有15小时开始的作业',
        total: 5,
        acCount: 0,
        startTime: '2025-01-25T09:50:00',
        endTime: '2025-02-01T00:00:00',
        permission: 0,
    },
    {
        contestId: 10,
        title: '还有1小时开始的作业',
        total: 5,
        acCount: 0,
        startTime: '2025-01-24T19:50:00',
        endTime: '2025-02-01T00:00:00',
        permission: 0,
    },
    {
        contestId: 11,
        title: '还有5分钟开始的作业',
        total: 5,
        acCount: 0,
        startTime: '2025-01-24T18:55:00',
        endTime: '2025-02-01T00:00:00',
        permission: 0,
    },
    {
        contestId: 12,
        title: '还有30秒开始的作业',
        total: 5,
        acCount: 0,
        startTime: '2025-01-24T18:50:30',
        endTime: '2025-02-01T00:00:00',
        permission: 0,
    }
]);
function getPremText(permission: number) {
    if (permission === 0) return '公开';
    if (permission === 1) return '私有';
    return '未知';
}
function getPremClass(permission: number) {
    if (permission === 0) return 'text-blue-400';
    if (permission === 1) return 'text-red-800';
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
function getStatusText(startTime: string, endTime: string) {
    const status = computeStatus(startTime, endTime);
    let result: string;
    switch (status) {
        case 0:
            result = '进行中';
            break;
        case 1:
            result = '已结束';
            break;
        case 2:
            result = '未开始';
            break;
        case 3:
            result = '剩余' + getStatusStartText(endTime);
            break;
        case 4:
            result = getStatusStartText(startTime) + '后开始';
            break;
        default:
            result = '未知';
            break;
    }
    return result;
}
function getStatusStartText(startTime: string) {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    let result: string;

    const diff = start - now;

    if (diff > 3600000) { // 大于一小时
        const hours = Math.floor(diff / 3600000);
        result = ` ${hours} 小时`;
    } else if (diff > 60000) { // 大于一分钟
        const minutes = Math.floor(diff / 60000);
        result = ` ${minutes} 分钟`;
    } else { // 小于一分钟
        const seconds = Math.floor(diff / 1000);
        result = ` ${seconds} 秒`;
    }

    return result;
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
    // loadData();
}
// 获取进度条的颜色
function getProgressBarColor(accuracy: number) {
    if (accuracy < 40) return 'progress-20';
    if (accuracy < 60) return 'progress-40';
    if (accuracy < 80) return 'progress-60';
    return 'progress-80';
};
onMounted(() => {
    // loadData();
});

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