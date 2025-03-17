<template>
    <div class="w-full h-full">

        <div class="w-full h-[75%] p-4 shadow-lg bg-white dark:bg-gray-800">
            <DataTable :value="problems" v-model:filters="filters" filterDisplay="menu" stripedRows paginator :rows="30"
                tableStyle="min-width: 60%" responsiveLayout="scroll" class="custom-font-size" size="small"
                :totalRecords="totalRecords" lazy :first="first" @page="onPage">
                <template #header>
                    <div class="flex flex-row space-x-4 items-center">
                        <h1 class="text-2xl font-bold">评测状态</h1>
                        <div class="flex items-center ml-10">
                            <span>只显示自己</span>
                            <ToggleSwitch v-model="isMe" @change="onIsMeChange" />
                        </div>
                        <div class="flex-grow"></div>

                        <Button icon="pi pi-refresh" class="p-button-outlined" />
                    </div>
                </template>
                <Column field="submitId" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">Run ID</span>
                    </template>
                </Column>
                <Column field="title" style="min-width: 30%;text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">题目</span>
                    </template>
                    <template #body="slotProps">
                        <router-link :to="`/problem/${slotProps.data.pid}`"
                            class="text-blue-400 hover:text-blue-600 truncate">
                            P{{ slotProps.data.pid }} {{ slotProps.data.title }}
                        </router-link>
                    </template>
                </Column>
                <Column field="status" :showFilterMatchModes="false" style="max-width: 10%;text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">状态</span>
                    </template>
                    <template #body="slotProps">
                        <span :class="getStatusClass(slotProps.data.status)"
                            class="p-2 px-4 text-base inline-block rounded">
                            {{ getStatusText(slotProps.data.status) }}
                        </span>
                    </template>
                    <template #filter>
                        <Select v-model="selectedStatus" :options="statusOptions" optionLabel="name" placeholder="全部"
                            option-value="code" multiple />
                    </template>
                </Column>
                <Column field="oiRankScore" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">OI得分</span>
                    </template>
                    <template #body="slotProps">
                        <Tag severity="secondary" class="border border-gray-300 text-gray-700"
                            :value="slotProps.data.oiRankScore || '--'">
                        </Tag>
                    </template>
                </Column>
                <Column field="time" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">运行时间</span>
                    </template>
                    <template #body="slotProps">
                        {{ slotProps.data.time }}ms
                    </template>
                </Column>
                <Column field="memory" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">运行内存</span>
                    </template>
                    <template #body="slotProps">
                        <span>
                            {{ formatMemory(slotProps.data.memory) }}
                        </span>
                    </template>
                </Column>
                <Column field="length" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">代码长度</span>
                    </template>
                    <template #body="slotProps">
                        <span>
                            {{ formatLength(slotProps.data.length) }}
                        </span>
                    </template>
                </Column>
                <Column field="language" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">语言</span>
                    </template>
                    <template #body="slotProps">
                        <router-link :to="`/status/${slotProps.data.submitId}`"
                            class="text-blue-400 hover:text-blue-600 truncate">
                            {{ slotProps.data.language }}
                        </router-link>
                    </template>
                </Column>
                <Column field="judger" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">判题源</span>
                    </template>
                </Column>
                <Column field="nickname" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">用户</span>
                    </template>
                    <template #body="slotProps">
                        <router-link :to="`/user/${slotProps.data.uid}`"
                            class="text-blue-400 hover:text-blue-600 truncate">
                            {{ slotProps.data.nickname }}
                        </router-link>
                    </template>
                </Column>

                <Column field="createTime" style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">提交时间</span>
                    </template>
                    <template #body="slotProps">
                        <span>
                            {{ formatTimeAgo(slotProps.data.createTime) }}
                        </span>
                    </template>
                </Column>

            </DataTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStatPage, getStatBySubmitid, getStatMaxCount, type Status } from '@/problem/StatusAPI';
import { statusMap, statusClassMap, statusOptions } from '@/common/constant/AllConstant';
import { useRoute, useRouter } from 'vue-router';
import { FilterMatchMode } from '@primevue/core/api';

const route = useRoute();
const router = useRouter();
// 评测状态数据
const problems = ref<Status.StatJSONObject[]>([]);
// 总记录数
const totalRecords = ref(150);
// Url参数
const first = ref((parseInt(route.query.currentPage as string || '1') - 1) * 30 || 0);
const problemId = ref(route.query.problemId ? parseInt(route.query.problemId as string) : null);
const contestId = ref(route.query.contestId ? parseInt(route.query.contestId as string) : null);
const userId = ref(route.query.userId ? parseInt(route.query.userId as string) : null);
const type = ref(route.query.type as string || 'all');
const statusProp = ref(route.query.status ? parseInt(route.query.status as string) : null);
const selectedStatus = ref<string[]>([]);
// 是否只显示自己
const isMe = ref(false);
function onIsMeChange() {
    if (isMe.value) {
        type.value = "own";
    } else {
        type.value = "all";
    }
    const query = { ...route.query, type: type.value };
    router.push({ query });
    getStatusData(0);
    getStatusCount();
}
// 判题状态过滤器
const filters = ref<any>({
    status: { value: null, matchMode: FilterMatchMode.EQUALS }, // 仅支持多选过滤
});
// 获取判题状态文本
function getStatusText(status: keyof typeof statusMap) {
    return statusMap[status] || '未知状态';
}
// 获取判题状态标签颜色
function getStatusClass(status: keyof typeof statusClassMap) {
    return statusClassMap[status] || 'bg-gray-100 text-gray-800';
}
// 获取判题状态数据
onMounted(() => {
    getStatusCount();
    getStatusData(first.value);
});
// 页面切换事件，重新加载数据
function onPage(event: any) {
    first.value = event.first;
    const query = { ...route.query, currentPage: event.page + 1 };
    router.push({ query });
    getStatusData(first.value);
}
// 获取判题状态数据
async function getStatusData(currentPage: number) {
    const res = await getStatPage(currentPage, problemId.value ?? undefined, contestId.value ?? undefined, userId.value ?? undefined, type.value, statusProp.value ?? undefined);
    problems.value = res.data ?? [];
    initializePollingQueue();
    startPolling();
}
// 获取判题状态总记录数
async function getStatusCount() {
    const res = await getStatMaxCount(problemId.value ?? undefined, contestId.value ?? undefined, userId.value ?? undefined, type.value, statusProp.value ?? undefined);
    totalRecords.value = res.data as unknown as number;
}
// 格式化内存
function formatMemory(memory: number) {
    if (memory < 1024) {
        return `${memory} KiB`;
    } else {
        if (memory % 1024 === 0) {
            return `${(memory / 1024).toFixed(0)} MiB`;
        }
        return `${(memory / 1024).toFixed(2)} MiB`;
    }
}
// 格式化代码长度
function formatLength(length: number) {
    if (length < 1024) {
        return `${length} B`;
    } else {
        if (length % 1024 === 0) {
            return `${(length / 1024).toFixed(0)} KiB`;
        }
        return `${(length / 1024).toFixed(2)} KiB`;
    }
}
// 格式化时间
function formatTimeAgo(time: string) {
    const now: Date = new Date();
    const past: Date = new Date(time);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000); // 秒差

    if (diff < 60) {
        return `${diff}秒前`;
    } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}分钟前`;
    } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)}小时前`;
    } else if (diff < 31536000) {
        return `${Math.floor(diff / 86400)}天前`;
    } else {
        return `${Math.floor(diff / 31536000)}年前`;
    }
}
// 轮询队列，用于存储需要轮询的提交ID。当提交的题目判题未完成时，将其提交ID加入轮询队列。
const pollingQueue = ref<{ submitId: number }[]>([]);
// 需要轮询的判题状态
const pollingStatuses = [-10, 9, 6, 7, 5, 15];
// 初始化轮询队列
const initializePollingQueue = () => {
    problems.value.forEach(problem => {
        if (pollingStatuses.includes(problem.status)) {
            pollingQueue.value.push({ submitId: problem.submitId });
        }
    });
};
// 获取状态更新
const fetchStatusUpdate = async (submitId: number): Promise<Status.StatusItem> => {
    // 调用API获取状态更新
    const response = await getStatBySubmitid(submitId);
    return response.data as Status.StatusItem;
};
// 更新判题状态
const updateProblems = (statusItem: Status.StatusItem) => {
    const index = problems.value.findIndex(problem => problem.submitId === statusItem.submitId);
    if (index !== -1) {
        problems.value[index].status = statusItem.status;
        problems.value[index].time = statusItem.time.toString();
        problems.value[index].memory = statusItem.memory.toString();
        problems.value[index].oiRankScore = statusItem.score;
        problems.value[index].judger = statusItem.judger;

        if (!pollingStatuses.includes(statusItem.status)) {
            pollingQueue.value = pollingQueue.value.filter(item => item.submitId !== statusItem.submitId);
        }
    }
};
// 开始轮询，1s轮询一次
const startPolling = () => {
    if (pollingQueue.value.length === 0) {
        return;
    }
    setInterval(async () => {
        for (const item of pollingQueue.value) {
            const statusItem = await fetchStatusUpdate(item.submitId);
            updateProblems(statusItem);
        }
    }, 1000);
};
</script>

<style scoped>
.custom-font-size {
    font-size: 0.875rem;
}

.truncate {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.status-column {
    max-width: 5%;
}

.re-color {
    background-color: #9C3DCD;
}

.tle-color {
    background-color: #052242;
}
</style>