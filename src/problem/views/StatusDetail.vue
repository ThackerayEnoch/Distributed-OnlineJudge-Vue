<template>
    <div v-if="isLoading" class="flex flex-col items-center justify-center h-screen">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
            aria-label="Custom ProgressSpinner" />
        <span class="mt-2 text-gray-500">加载数据中...</span>
    </div>
    <AccessDenied v-else-if="isAccessDenied" :message="message" btnLabel="返回提交列表" btnTo="/statuses"
        btnIcon="pi pi-book" />
    <div v-else class="w-full min-h-screen p-6 flex flex-col mt-[-2.5rem]">
        <!-- Header -->
        <div class="text-white p-4 rounded-md shadow flex items-center"
            :class="getStatusClass(status.status as unknown as keyof typeof statusClassMap)">
            <div class="ml-2 mr-4">
                <svg v-if="status && status.status != 0" t="1736596442098" class="icon" viewBox="0 0 1024 1024"
                    version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4857" id="mx_n_1736596442099" width="25"
                    height="25">
                    <path
                        d="M512 0C229.376 0 0 229.376 0 512s229.376 512 512 512 512-229.376 512-512S794.624 0 512 0z m218.624 672.256c15.872 15.872 15.872 41.984 0 57.856-8.192 8.192-18.432 11.776-29.184 11.776s-20.992-4.096-29.184-11.776L512 569.856l-160.256 160.256c-8.192 8.192-18.432 11.776-29.184 11.776s-20.992-4.096-29.184-11.776c-15.872-15.872-15.872-41.984 0-57.856L454.144 512 293.376 351.744c-15.872-15.872-15.872-41.984 0-57.856 15.872-15.872 41.984-15.872 57.856 0L512 454.144l160.256-160.256c15.872-15.872 41.984-15.872 57.856 0 15.872 15.872 15.872 41.984 0 57.856L569.856 512l160.768 160.256z"
                        fill="#ffffff" p-id="4858"></path>
                </svg>
                <svg v-else t="1736607219239" class="icon" viewBox="0 0 1024 1024" version="1.1"
                    xmlns="http://www.w3.org/2000/svg" p-id="5058" id="mx_n_1736607219239" width="25" height="25">
                    <path
                        d="M512 1015.345c-277.909 0-503.198-225.29-503.198-503.198s225.287-503.196 503.198-503.196c277.907 0 503.198 225.29 503.198 503.198s-225.29 503.196-503.198 503.196zM512 71.851c-243.163 0-440.295 197.134-440.295 440.297s197.134 440.295 440.295 440.295 440.295-197.134 440.295-440.295-197.134-440.297-440.295-440.297zM713.042 337.108c8.681-15.049 3.543-34.274-11.506-42.957s-34.274-3.543-42.957 11.506l-201.147 348.361-112.531-103.77c-11.856-12.674-31.756-13.329-44.45-1.453-12.676 11.876-13.308 31.778-1.432 44.452l143.776 132.617c11.876 12.674 31.778 13.308 44.452 1.432 3.825-3.582 225.793-390.19 225.793-390.19z"
                        fill="#ffffff" p-id="5059"></path>
                </svg>
            </div>
            <div class="mt-2 mb-2">
                <h1 class="text-2xl text-white font-bold mb-2">{{ statusMap[status.status as unknown as keyof typeof
                    statusMap]
                }}</h1>
                <p class="text-m" v-if="status.status !== -2 && isJudgingComplete(status)">
                    运行时间: <span class="font-medium">{{ status.time }} ms </span> 运行内存: <span class="font-medium">{{
                        formatMemory(status.memory) }} </span>
                    代码长度: <span class="font-medium">{{ formatLength(status.length) }}</span> 语言: <span
                        class="font-medium">{{ status.language }}</span>
                    作者: <span class="font-medium">{{ status.nickname }}</span>
                </p>
                <p v-else>
                    题目: <span class="font-medium">{{ status.title }}</span> 语言: <span class="font-medium">{{
                        status.language }}</span>
                    作者: <span class="font-medium">{{ status.nickname }}</span>
                </p>
            </div>
        </div>

        <!-- Submission Info -->
        <DataTable v-if="status.status !== -2 && isJudgingComplete(status)" :value="[status]"
            class="bg-white mt-4 shadow text-sm" resizableColumns columnResizeMode="fit">
            <Column field="id" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">RunID</span>
                </template>
            </Column>
            <Column field="createTime" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">提交时间</span>
                </template>
            </Column>
            <Column style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">标题</span>
                </template>
                <template #body="slotProps">
                    <router-link
                        :to="contestId != null ? `/problem/${slotProps.data.pid}?contestId=${contestId}` : `/problem/${slotProps.data.pid}`"
                        class="text-blue-400 hover:text-blue-600 truncate">
                        {{ slotProps.data.title }}
                    </router-link>
                </template>
            </Column>
            <Column field="status" :showFilterMatchModes="false" style="max-width: 10%;text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">状态</span>
                </template>
                <template #body="slotProps">
                    <span :class="getStatusClass(slotProps.data.status)"
                        class="p-1 px-4 text-base inline-block rounded">
                        {{ getStatusText(slotProps.data.status) }}
                    </span>
                </template>
            </Column>
            <Column field="oiRankScore" style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">OI得分</span>
                </template>
                <template #body="slotProps">
                    <Tag severity="secondary" class="border border-gray-300 text-gray-700"
                        :value="slotProps.data.score || '--'">
                    </Tag>
                </template>
            </Column>
            <Column style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">运行时间</span>
                </template>
                <template #body="slotProps">
                    {{ slotProps.data.time }} ms
                </template>
            </Column>
            <Column style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">运行内存</span>
                </template>
                <template #body="slotProps">
                    <span>
                        {{ formatMemory(slotProps.data.memory) }}
                    </span>
                </template>
            </Column>
            <Column style="text-align: center;">
                <template #header>
                    <span class="flex-1 text-center font-bold">代码长度</span>
                </template>
                <template #body="slotProps">
                    <span>
                        {{ formatLength(slotProps.data.length) }}
                    </span>
                </template>
            </Column>
        </DataTable>
        <div v-if="status.status === -2 || !isJudgingComplete(status) || isAbnormalStatus(status)">
            <div class="bg-white dark:bg-gray-800 mt-6 p-4 rounded-md shadow">
                <h2 v-if="status.status === -2" class="text-custom font-semibold mb-4">编译错误</h2>
                <h2 v-else-if="!isJudgingComplete(status)" class="text-custom font-semibold mb-4">请等待判题结束</h2>
                <h2 v-else class="text-custom font-semibold mb-4">异常状态</h2>
                <hr class="border-gray-300 my-2 mb-4">
                <pre><code>{{ status.errorMessage }}</code></pre>
            </div>
        </div>
        <div v-if="status.status !== -2 && isJudgingComplete(status) && !isAbnormalStatus(status)"
            class="bg-white dark:bg-gray-800 mt-6 p-4 rounded-md shadow">
            <h2 class="text-custom font-semibold mb-4">测试点详情</h2>
            <hr class="border-gray-300 my-2 mb-4">
            <div class="flex flex-wrap gap-2" style="justify-content: flex-start;">
                <div v-for="(testCase, index) in status.testcase" :key="index"
                    class="relative text-lg text-white font-bold text-center p-2 flex flex-col justify-center items-center"
                    :class="testcaseClassMap[testCase.status as unknown as keyof typeof testcaseClassMap]"
                    style="aspect-ratio: 1 / 1; width: 110px;height: 110px;">
                    <!-- 固定在左上角的编号 -->
                    <p class="absolute top-2 left-2 font-medium">#{{ index + 1 }}</p>

                    <!-- 垂直居中的状态和内存时间 -->
                    <div class="flex flex-col justify-center items-center">
                        <p class="text-2xl mt-2 mb-2 font-bold">
                            {{ statusMapMin[testCase.status as unknown as keyof typeof statusMapMin] || 'Unknown Status'
                            }}
                        </p>
                        <p class="text-sm">
                            {{ testCase.time }}ms/{{ formatMemory(testCase.memory) || 0 }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <!-- 新增的代码显示区域 -->
        <div class="bg-white dark:bg-gray-800 mt-6 p-4 rounded-md shadow">
            <h2 class="text-custom font-semibold mb-4">代码</h2>
            <hr class="border-gray-300 my-2 mb-4">
            <pre><code :class="`language-cpp`" class="line-numbers">{{ status.code
            }}</code></pre>
        </div>
    </div>
</template>
<script setup lang="ts">
import { type Status, getStatDetail } from '../StatusAPI';
import Column from 'primevue/column';
import { ref, defineProps, onMounted, onUpdated } from 'vue'
import AccessDenied from '@/common/components/AccessDenied.vue';
import globalMessage from '@/common/utils/toast';
import { ProblemStatus } from '../status/problemStatus';
import Prism from "prismjs";
import { number } from 'yup';
import { useRoute } from 'vue-router';
const route = useRoute();
// 定义props，获取URL中的pid参数
const props = defineProps({
    submitId: number
});
// 从URL中获取contestId
const contestId = route.query.contestId ? Number(route.query.contestId) : null;
// 定义是否加载中变量
const isLoading = ref(false);
// 题目数据
const status = ref<Status.StatusDetail>(
    {
        id: -8000,
        pid: 0,
        status: 0,
        time: 0,
        memory: 0,
        length: 0,
        score: 0,
        title: '',
        createTime: '',
        nickname: '',
        language: '',
        code: '',
        errorMessage: '',
        testcase: []
    }
);
// 状态映射
const statusMap = {
    '-10': 'Not Submitted',
    '9': 'Submitting',
    '6': 'Compiling',
    '7': 'Judging',
    '-2': 'Compile Error',
    '-3': 'Presentation Error',
    '-1': 'Wrong Answer',
    '0': 'Accepted',
    '1': 'Time Limit Exceeded',
    '2': 'Memory Limit Exceeded',
    '3': 'Runtime Error',
    '4': 'System Error',
    '5': 'Pending',
    '8': 'Partial Accepted',
    '10': 'Submitted Failed',
    '15': 'No Status'
};
// 状态映射简写
const statusMapMin = {
    '9': 'Submitting',
    '6': 'Compiling',
    '7': 'Judging',
    '-2': 'CE',
    '-3': 'PE',
    '-1': 'WA',
    '0': 'AC',
    '1': 'TLE',
    '2': 'MLE',
    '3': 'RE',
    '4': 'SE',
    '5': 'Pending',
};
// 测试点状态颜色
const testcaseClassMap = {
    '9': 'bg-blue-500',     // 提交中
    '6': 'bg-blue-500',   // 编译中
    '7': 'bg-blue-500',   // 判题中
    '-2': 'bg-yellow-500',  // 编译错误
    '-3': 'bg-amber-500',   // 格式错误
    '-1': 'wa-color',     // 答案错误
    '0': 'bg-green-500',    // 全部通过
    '1': 'tle-color',   // 超时
    '2': 'tle-color',    // 内存溢出
    '3': 're-color',      // 运行错误
    '4': 'bg-gray-500',     // 系统错误
    '5': 'bg-blue-500',     // 等待判题
};
// 判题详情状态颜色
const statusClassMap = {
    '-10': 'bg-blue-500 text-white',
    '9': 'bg-blue-500 text-white',
    '6': 'bg-blue-500 text-white',
    '7': 'bg-blue-500 text-white',
    '-2': 'bg-yellow-500 text-white',
    '-3': 'bg-yellow-500 text-white',
    '-1': 'wa-color text-white',
    '0': 'bg-green-500 text-white',
    '1': 'tle-color text-white',
    '2': 'tle-color text-white',
    '3': 're-color text-white',
    '4': 'bg-yellow-500 text-white',
    '5': 'bg-blue-500 text-white',
    '10': 'bg-yellow-500 text-white',
    '15': 'bg-yellow-500 text-white',
};
// 判断是否已判题完毕的函数
function isJudgingComplete(status: Status.StatusDetail): boolean {
    return status.status !== 5 && status.status !== 6 && status.status !== 7 && status.status !== 9;
}
// 判断是不是异常状态
function isAbnormalStatus(status: Status.StatusDetail): boolean {
    return status.status !== -3 && status.status !== -2 && status.status !== -1 && status.status !== 0 && status.status !== 1 && status.status !== 2 && status.status !== 3
}
// 语言映射，用于Prism高亮代码

// 加载数据
onMounted(() => {
    isLoading.value = true;
    getJudgeDetail(props.submitId as unknown as number);
});
// Prism高亮代码
onUpdated(() => {
    Prism.highlightAll();
});
const message = ref<string>('您没有权限查看此记录');
const isAccessDenied = ref<boolean>(false);
// 通过API获取判题详情
async function getJudgeDetail(submitId: number) {
    // 获取提交详情
    isLoading.value = true;
    await getStatDetail(submitId).then((result) => {
        status.value = result.data as unknown as Status.StatusDetail;
    }).catch((error) => {
        if (error.code === ProblemStatus.ACCESS_DENIED) {
            isAccessDenied.value = true;
            message.value = '您没有权限查看此记录';
            globalMessage.warn('提示', '您没有权限查看此记录');
            return;
        } else if (error.code === ProblemStatus.CONTEST_PROBLEM_USED) {
            isAccessDenied.value = true;
            message.value = '该题目已被使用，无法查看';
            globalMessage.warn('提示', '该题目已被使用，无法查看');
            return;
        }
    });
    isLoading.value = false;
}
// 获取状态文本
function getStatusText(status: keyof typeof statusMap) {
    return statusMap[status] || '未知状态';
}
// 获取状态颜色
function getStatusClass(status: keyof typeof statusClassMap) {
    return statusClassMap[status] || 'bg-gray-100 text-gray-800';
}
// 格式化内存
function formatMemory(memory: number) {
    if (memory < 1024) {
        return `${memory} KiB`;
    } else {
        if (memory % 1024 == 0) {
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
        if (length % 1024 == 0) {
            return `${(length / 1024).toFixed(0)} KiB`;
        }
        return `${(length / 1024).toFixed(2)} KiB`;
    }
}
</script>

<style scoped>
.text-custom {
    font-size: x-large;
}

.wa-color {
    background-color: #ED3F14;
}

.re-color {
    background-color: #9C3DCD;
}

.tle-color {
    background-color: #052242;
}
</style>