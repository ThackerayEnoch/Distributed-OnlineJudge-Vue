<template>
    <div v-if="isBlockAPILoading || loading" class="flex flex-col items-center justify-center h-screen">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
            aria-label="Custom ProgressSpinner" />
        <span class="mt-2 text-gray-500">加载数据中...</span>
    </div>
    <div class="w-full" v-else>
        <JoinHomeworkComponent v-if="isAccessDenied && joinAuth !== 2" :contestId="homeworkId" :auth="joinAuth"
            :title="joinTitle" :onSuccess="onSuccess" />
        <AccessDenied v-else-if="isAccessDenied && joinAuth === 2" :message="message" btnLabel="返回作业" btnTo="/homeworks"
            btnIcon="pi pi-book" />
        <div v-else class=" felx flex-col w-full dark:bg-gray-800">
            <div class="w-full bg-white p-6 my-3 shadow-lg flex flex-col items-center dark:bg-gray-800">
                <div class="w-full flex justify-between items-center">
                    <h1 class="my-2 font-bold text-gray-600 text-2xl text-center flex-grow dark:text-white">{{
                        homework.title }}</h1>
                    <div class="mr-4 px-3 py-1 bg-blue-500 rounded-md text-white flex items-center space-x-1">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                        </svg>
                        <span v-if="!homework.type">ACM</span>
                        <span v-if="homework.type">OI</span>
                    </div>
                </div>
                <div class="w-full p-4">
                    <ProgressBar :value="timeProgress" :showValue="true" :class="getProgressBarColor(timeProgress)">
                    </ProgressBar>
                </div>
                <div class="w-full p-4 flex items-center justify-between">
                    <div>开始时间: {{ homework.startTime }}</div>
                    <div
                        :class="{ 'text-red-500 font-bold': currentTime < new Date(homework.startTime.replace(/-/g, '/')).getTime() }">
                        {{ currentTime < new Date(homework.startTime.replace(/-/g, '/')).getTime() ? '距离开始: '
                            : '剩余时间: ' }}{{ remainingTime }} </div>
                            <div>结束时间: {{ homework.endTime }}</div>
                    </div>
                </div><!--作业信息-->
                <div class="w-full bg-white p-3 shadow-lg dark:bg-gray-800">
                    <div class="w-full p-2 flex items-center justify-start space-x-10">
                        <RouterLink :to="`/homework/${homeworkId}/intro`"
                            :class="{ 'text-blue-500 border-b-2 border-blue-500': selectedTab === 'intro' }"
                            class="hover:border-b-2 hover:border-blue-500 hover:text-blue-500">
                            <svg class="w-4 h-4 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path
                                    d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                                <path
                                    d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                            </svg>
                            比赛简介
                        </RouterLink>
                        <RouterLink v-if="!isContestNotStarted" :to="`/homework/${homeworkId}/problems`"
                            :class="{ 'text-blue-500 border-b-2 border-blue-500': selectedTab === 'problems' }"
                            class="hover:border-b-2 hover:border-blue-500 hover:text-blue-500">
                            <svg class="w-5 h-5 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z"
                                    clip-rule="evenodd" />
                            </svg>
                            题目列表
                        </RouterLink>
                        <span v-else class="text-gray-400 cursor-not-allowed">
                            <svg class="w-5 h-5 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z"
                                    clip-rule="evenodd" />
                            </svg>
                            题目列表
                        </span>
                        <RouterLink v-if="!isContestNotStarted" :to="`/homework/${homeworkId}/ranking`"
                            :class="{ 'text-blue-500 border-b-2 border-blue-500': selectedTab === 'ranking' }"
                            class="hover:border-b-2 hover:border-blue-500 hover:text-blue-500">
                            <svg class="w-4 h-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                            </svg>
                            排行榜
                        </RouterLink>
                        <span v-else class="text-gray-400 cursor-not-allowed">
                            <svg class="w-4 h-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                            </svg>
                            排行榜
                        </span>
                        <RouterLink v-if="!isContestNotStarted"
                            :to="`/homework/${homeworkId}/submit?contestId=${homeworkId}`"
                            :class="{ 'text-blue-500 border-b-2 border-blue-500': selectedTab === 'submissions' }"
                            class="hover:border-b-2 hover:border-blue-500 hover:text-blue-500">
                            <svg class="w-5 h-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                            </svg>
                            提交记录
                        </RouterLink>
                        <span v-else class="text-gray-400 cursor-not-allowed">
                            <svg class="w-5 h-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                            </svg>
                            提交记录
                        </span>
                    </div>
                </div><!--导航栏-->
                <div class="flex" style="align-items: flex-start;">
                    <div v-if="selectedTab == 'intro' || selectedTab == 'problems'"
                        class="w-[25%] p-6 my-3 flex bg-white shadow-lg felx flex-col dark:bg-gray-800  mr-3">
                        <div class="flex justify-between items-center m-2">
                            <span>比赛编号</span>
                            <span>{{ homework.id }}</span>
                        </div>
                        <div class="flex justify-between items-center m-2">
                            <span>比赛权限</span>
                            <span v-if="homework.auth == 0">公开赛</span>
                            <span v-else-if="homework.auth == 2">私有赛</span>
                            <span v-else-if="homework.auth == 1">保护赛</span>
                        </div>
                        <div class="flex justify-between items-center m-2">
                            <span>完成题数</span>
                            <span>{{ homework.solved }}</span>
                        </div>
                        <div class="flex justify-between items-center m-2">
                            <span>总题目数</span>
                            <span>{{ homework.total }}</span>
                        </div>
                        <div class="flex justify-between items-center m-2">
                            <span>作者</span>
                            <span>{{ homework.nickname }}</span>
                        </div>
                        <div class="flex justify-between items-center m-2">
                            <span>最近更新</span>
                            <span>{{ homework.updateTime }}</span>
                        </div>
                    </div><!--作业信息小窗-->
                    <div
                        class="w-full p-6 ml-0 my-3 flex bg-white shadow-lg flex flex-col dark:bg-gray-800 overflow-x-auto">
                        <router-view name="homeworkTab" :title="homework.title" :description="homework.description"
                            :problems="problems" />
                    </div><!--显示不同导航栏内容-->
                </div>
            </div>
        </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { getHomeworkSummary, getHomeworkProblems, type HomeworkSpace } from '@/homework/api/homeworkAPI';
import globalMessage from '@/common/utils/toast';
import ProgressBar from 'primevue/progressbar';
import AccessDenied from '@/common/components/AccessDenied.vue';
import JoinHomeworkComponent from '@/homework/components/JoinHomeworkComponent.vue'
import { type JoinHomeworkSpace, getBlockContestInfo } from '@/homework/api/joinHomeworkAPI';
import { ProblemStatus } from '@/homework/status/homeworkStatus';
import { useRoute } from 'vue-router';

const message = ref<string>('您没有权限查看此题目');
const isAccessDenied = ref<boolean>(false);
const route = useRoute();
// 获取路径的homeworkId参数
const { homeworkId } = defineProps(['homeworkId']);
const problems = ref<HomeworkSpace.HomeworkProblemsVO[]>([]);
const homework = ref({
    id: -1,
    title: '',
    type: -1,
    description: '',
    auth: 0,
    total: 0,
    solved: 0,
    startTime: '',
    nickname: '',
    endTime: '',
    updateTime: '',
});
watch(route, (newRoute) => {
    tabSelect(newRoute);
});
function onSuccess() {
    isAccessDenied.value = false;
    isBlockAPILoading.value = false;
    isContestNotStarted.value = false;
    joinAuth.value = 2;
    localHomeworkDetail(homeworkId);
    tabSelect(route);
}
function tabSelect(router: any) {
    const path = router.path
    if (path.includes('/intro')) {
        selectedTab.value = 'intro';
    } else if (path.includes('/problems')) {
        selectedTab.value = 'problems';
        // 点击题目列表时才加载题目数据
        if (problems.value.length === 0) {
            localHomeworkProblems(homeworkId);
        }
    } else if (path.includes('/ranking')) {
        selectedTab.value = 'ranking';
        // 排行榜的权限检查由对应的 API 调用处理
    } else if (path.includes('/submit')) {
        selectedTab.value = 'submissions';
        // 提交记录的权限检查由对应的 API 调用处理
    }
}
const selectedTab = ref('intro');
const timeProgress = ref(0);
const currentTime = ref(new Date().getTime());
const endTimeDate = ref(new Date().getTime());
let isEnd = false;
const remainingTime = ref('');
// 计算时间进度
function calculateTimeProgress() {
    const startTime = new Date(homework.value.startTime.replace(/-/g, '/')).getTime();
    const endTime = new Date(homework.value.endTime.replace(/-/g, '/')).getTime();
    if (currentTime.value < startTime) {
        timeProgress.value = 0;
    } else if (currentTime.value > endTime) {
        timeProgress.value = 100;
        isEnd = true;
    } else {
        timeProgress.value = parseFloat(((currentTime.value - startTime) / (endTime - startTime) * 100).toFixed(2));
    }
}
function calculateRemainingTime(timeDiff: number) {
    // 判断是否未开始
    const startTime = new Date(homework.value.startTime.replace(/-/g, '/')).getTime();
    const isNotStarted = currentTime.value < startTime;

    let actualTimeDiff = timeDiff;
    if (isNotStarted) {
        // 如果未开始，计算距离开始的时间
        actualTimeDiff = startTime - currentTime.value;
    }

    if (actualTimeDiff <= 0) {
        remainingTime.value = isNotStarted ? '即将开始' : '00:00:00';
        return;
    }

    const days = Math.floor(actualTimeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((actualTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((actualTimeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((actualTimeDiff % (1000 * 60)) / 1000);

    if (days > 0) {
        remainingTime.value = `${days}天 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (hours > 0) {
        remainingTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
        remainingTime.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        remainingTime.value = `${seconds}秒`;
    }
}
// 每秒获取当前时间
setInterval(() => {
    if (isEnd) return;

    const previousIsContestNotStarted = isContestNotStarted.value;
    currentTime.value = new Date().getTime();
    calculateTimeProgress();
    const timeDiff = endTimeDate.value - currentTime.value;
    calculateRemainingTime(timeDiff);

    // 检查比赛是否刚刚开始（从未开始变为已开始）
    const startTime = new Date(homework.value.startTime.replace(/-/g, '/')).getTime();
    const isNowStarted = currentTime.value >= startTime;

    if (previousIsContestNotStarted && isNowStarted) {
        // 比赛刚刚开始，解锁功能
        isContestNotStarted.value = false;
        isAccessDenied.value = false;

        console.log('比赛已开始，功能已解锁');
        globalMessage.success('比赛开始', '比赛已开始，现在可以查看所有内容了！');

        // 如果当前在简介页面，可以选择自动加载题目数据
        if (selectedTab.value === 'intro' && problems.value.length === 0) {
            // 延迟一点时间再加载，让用户看到提示
            setTimeout(() => {
                localHomeworkProblems(homeworkId);
            }, 1000);
        }
    }
}, 1000);
function getProgressBarColor(accuracy: number) {
    if (accuracy < 40) return 'progress-80';
    if (accuracy < 60) return 'progress-60';
    if (accuracy < 80) return 'progress-40';
    return 'progress-20';
}
const joinTitle = ref('');
const joinAuth = ref(2);
const isBlockAPILoading = ref(false);
async function loadBlockContest(id: number) {
    isBlockAPILoading.value = true;
    await getBlockContestInfo(id).then(res => {
        const data = res.data as JoinHomeworkSpace.BlockContestInfoVO;
        joinTitle.value = data.title;
        joinAuth.value = data.auth;
    }).catch(error => {
        console.error(error.message);
    }).finally(() => {
        isBlockAPILoading.value = false;
    });
}
const loading = ref(false);
const isContestNotStarted = ref(false);
async function localHomeworkDetail(homeworkId: number) {
    loading.value = true;
    getHomeworkSummary(homeworkId).then(res => {
        homework.value = res.data as any;
        calculateTimeProgress();
        endTimeDate.value = new Date(homework.value.endTime.replace(/-/g, '/')).getTime();

        // 根据开始时间判断比赛是否已经开始
        const startTime = new Date(homework.value.startTime.replace(/-/g, '/')).getTime();
        const now = new Date().getTime();
        if (now < startTime) {
            // 比赛未开始，允许访问简介但标记状态
            isContestNotStarted.value = true;
            globalMessage.warn('提示', '比赛未开始，只能查看作业简介');
        } else {
            isContestNotStarted.value = false;
        }
    }).catch(error => {
        if (error.code === ProblemStatus.ACCESS_DENIED) {
            loadBlockContest(homeworkId);
            isAccessDenied.value = true;
            message.value = '您没有权限查看此作业';
            return;
        } else {
            globalMessage.error('错误', error.message);
        }
    }).finally(() => {
        loading.value = false;
    });

}
async function localHomeworkProblems(homeworkId: number) {
    // 检查访问权限
    if (isAccessDenied.value && isContestNotStarted.value) {
        // 只有在比赛未开始且被拒绝的情况下才直接返回
        return;
    }

    getHomeworkProblems(homeworkId).then(res => {
        problems.value = res.data as HomeworkSpace.HomeworkProblemsVO[];
        homework.value.solved = problems.value.filter(problem => problem.isSolved).length;
        // 对题目按DisplayId(int)数字顺序升序排序
        problems.value.sort((a, b) => a.displayId - b.displayId);
        // 成功加载后，确保错误状态被清除
        if (isAccessDenied.value) {
            isAccessDenied.value = false;
        }
    }).catch(error => {
        if (error.code === ProblemStatus.ACCESS_DENIED || error.code === ProblemStatus.CONTEST_NOT_START) {
            isAccessDenied.value = true;
            if (error.code === ProblemStatus.CONTEST_NOT_START) {
                message.value = '比赛未开始，无法查看题目列表';
            } else {
                message.value = '您没有权限查看题目列表';
            }
            return;
        }
        console.error(error.message);
    });
}
onMounted(() => {
    localHomeworkDetail(homeworkId);
    tabSelect(route);
})
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