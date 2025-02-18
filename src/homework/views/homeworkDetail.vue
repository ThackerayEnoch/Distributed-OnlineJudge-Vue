<template>
    <div class="felx flex-col w-full dark:bg-gray-800">
        <div class="w-full bg-white p-6 my-3 shadow-lg flex flex-col items-center dark:bg-gray-800">
            <div class="w-full flex justify-between items-center">
                <h1 class="my-2 font-bold text-gray-600 text-2xl text-center flex-grow dark:text-white">{{ homework.title }}</h1>
                <div class="mr-4 px-3 py-1 bg-blue-500 rounded-md text-white flex items-center space-x-1">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                    </svg>
                    <span v-if="!homework.type">ACM</span>
                    <span v-if="homework.type">OI</span>
                </div>
            </div>
            <div class="w-full p-4">
                <ProgressBar :value="parseFloat(((homework.solved / (homework.total || 1)) * 100).toFixed(2))"
                    showValue="true"
                    :class="getProgressBarColor(parseFloat(((homework.solved / (homework.total || 1)) * 100).toFixed(2)))">
                </ProgressBar>                
            </div>
            <div class="w-full p-4 flex items-center justify-between">
                <div>开始时间: {{ homework.startTime }}</div>
                <div>剩余题目数: {{ homework.solved }}/{{ homework.total }}</div>
                <div>结束时间: {{ homework.endTime }}</div>
            </div>
        </div><!--作业信息-->
        <div class="w-full bg-white p-6 shadow-lg dark:bg-gray-800">
            <div class="w-full p-4 flex items-center justify-start space-x-10">
                <span @click="selectedTab = 'intro'" :class="{'text-blue-500 border-b-2 border-blue-500':selectedTab === 'intro'}" class="hover:border-b-2 hover:border-blue-500 hover:text-blue-500">
                    <svg class="w-4 h-4 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                        <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                    </svg>
                    作业简介
                </span>
                <span @click="selectedTab = 'problems'" :class="{'text-blue-500 border-b-2 border-blue-500':selectedTab === 'problems'}" class="hover:border-b-2 hover:border-blue-500 hover:text-blue-500">
                    <svg class="w-5 h-5 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
                    </svg>
                    题目列表
                </span>
                <span @click="selectedTab = 'ranking'" :class="{'text-blue-500 border-b-2 border-blue-500':selectedTab === 'ranking'}" class="hover:border-b-2 hover:border-blue-500 hover:text-blue-500">
                    <svg class="w-4 h-4 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                    </svg>
                    排行榜
                </span>
                <span @click="selectedTab = 'submissions'" :class="{'text-blue-500 border-b-2 border-blue-500':selectedTab === 'submissions'}" class="hover:border-b-2 hover:border-blue-500 hover:text-blue-500">
                    <svg class="w-5 h-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                    提交记录
                </span>
            </div>
        </div><!--导航栏-->
        <div class="flex" style="align-items: flex-start;">
            <div class="w-[25%] p-6 my-3 flex bg-white shadow-lg felx flex-col dark:bg-gray-800">
                <div class="flex justify-between items-center m-2">
                    <span>作业编号</span>
                    <span>{{ homework.id }}</span>
                </div>
                <div class="flex justify-between items-center m-2">
                    <span>作业权限</span>
                    <span v-if="homework.auth == 0">公开赛</span>
                    <span v-else-if="homework.auth == 1">私有赛</span>
                    <span v-else-if="homework.auth == 2">保护赛</span>
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
            <div class="w-[75%] p-6 ml-3 my-3 flex bg-white shadow-lg felx flex-col dark:bg-gray-800">
                <div v-if="selectedTab === 'intro'">
                    <IntroComponent :description="homework.title" />
                </div>
                <div v-if="selectedTab === 'problems'">
                    <ProblemsComponent :homeworkId="homework.id" />
                </div>
                <div v-if="selectedTab === 'ranking'">
                    <RankingComponent />
                </div>
                <div v-if="selectedTab === 'submissions'">
                    <SubmissionsComponent :homeworkId="homework.id" />
                </div>
            </div><!--显示不同导航栏内容-->
        </div>
    </div>

</template>
<script lang="ts" setup>
import { onMounted, defineProps, ref } from 'vue';
import { searchHomeworkById, getHomeworkAuth } from '@/homework/api/homeworkAPI';
import globalMessage from '@/common/utils/toast';
import ProgressBar from 'primevue/progressbar';
import IntroComponent from '../components/IntroComponent.vue';
import ProblemsComponent from '../components/ProblemsComponent.vue';
import RankingComponent from '../components/RankingComponent.vue';
import SubmissionsComponent from '../components/SubmissionsComponent.vue';
import router from '@/common/utils/router';

// 获取路径的hid参数
const { hid } = defineProps(['hid']);
let homework = ref({
    id: -1,
    title: '',
    type: -1,
    description: '',
    auth: 0,
    total: 0,
    solved: 0,
    startTime: '',
    nickname:'',
    endTime: '',
    updateTime: '',
});
const selectedTab = ref('intro');

function getProgressBarColor(accuracy:number){
    if (accuracy < 40) return 'progress-20';
    if (accuracy < 60) return 'progress-40';
    if (accuracy < 80) return 'progress-60';
    return 'progress-80';
}
async function localHomeworkDetail(hid:number) {
    const res = await searchHomeworkById(hid);
    homework.value = res.data as any;
    console.log('作业信息',homework.value);
}
onMounted(async () => {
    await getAuthPermission(hid);
    localHomeworkDetail(hid);
})
async function getAuthPermission(homeworkId:number) {
    const res = await getHomeworkAuth(homeworkId);
    if(!res.data){
        router.push({name:'Homework'});
        globalMessage.warn('提示','您没有权限访问该作业');
    }
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