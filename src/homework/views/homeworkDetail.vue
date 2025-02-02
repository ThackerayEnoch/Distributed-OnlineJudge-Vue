<template>
    <div class="felx flex-col w-full">
        <div class="w-full bg-white p-6 my-3 shadow-lg flex flex-col items-center">
            <div class="w-full flex justify-between items-center">
                <h1 class="my-2 font-bold text-gray-600 text-2xl text-center flex-grow">{{ homework.title }}</h1>
                <div class="mr-4 px-3 py-1 bg-blue-500 rounded-md text-white flex items-center space-x-1">
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                    </svg>
                    <span>ACM</span>
                </div>
            </div>
            <div class="w-full p-4">
                <ProgressBar :value="parseFloat(((homework.solved / (homework.total || 1)) * 100).toFixed(2))"
                    showValue="true"
                    :class="getProgressBarColor(parseFloat(((homework.solved / (homework.total || 1)) * 100).toFixed(2)))">
                </ProgressBar>                
            </div>
            <div class="w-full p-4 flex items-center justify-between">
                <div>开始时间:{{ homework.startTime }}</div>
                <div>剩余题目数:{{ homework.solved }}/{{ homework.total }}</div>
                <div>结束时间:{{ homework.endTime }}</div>
            </div>
        </div>            
    </div>

</template>
<script lang="ts" setup>
import { onMounted, defineProps, ref } from 'vue';
import { searchHomeworkById,} from '@/homework/api/homeworkAPI'
import ProgressBar from 'primevue/progressbar';

// 获取路径的hid参数
const { hid } = defineProps(['hid']);
let homework = ref({
    id: 0,
    uid:0,
    nickname: '',
    title: '',
    description: '',
    auth: 0,
    total: 0,
    visible: false,
    solved: 0,
    startTime: '',
    endTime: '',
});

function getProgressBarColor(accuracy:number){
    if (accuracy < 40) return 'progress-20';
    if (accuracy < 60) return 'progress-40';
    if (accuracy < 80) return 'progress-60';
    return 'progress-80';
}
async function localHomeworkDetail(hid:number) {
    const res = await searchHomeworkById(hid);
    homework.value = res.data as any;
    console.log(homework.value);
}
onMounted(() => {
    localHomeworkDetail(hid);
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