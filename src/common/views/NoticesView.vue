<template>
    <div class="w-full flex gap-6 p-0">
        <!-- 主内容区 -->
        <div class="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-8">
            <div class="mb-6 border-b pb-4">
                <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-300">{{ currentNotice.title }}</h1>
                <div class="mt-2 flex items-center gap-4 text-gray-500">
                    <span class="flex items-center">
                        <i class="pi pi-user mr-2"></i>
                        {{ currentNotice.author }}
                    </span>
                    <span class="flex items-center">
                        <i class="pi pi-clock mr-2"></i>
                        {{ formatDate(currentNotice.createTime) }}
                    </span>
                </div>
            </div>

            <MdPreview :modelValue="currentNotice.content" class="prose max-w-none text-gray-700" />
        </div>

        <!-- 历史公告栏 -->
        <div class="w-96 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 overflow-y-auto">
            <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                <i class="pi pi-history mr-2"></i>
                历史公告
            </h2>

            <div v-for="notice in historyNotices" :key="notice.id"
                class="group p-4 mb-2 rounded-lg cursor-pointer transition-colors" :class="{
                    'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700': notice.id === currentNotice.id,
                    'hover:bg-gray-50 dark:hover:bg-gray-700': notice.id !== currentNotice.id
                }" @click="selectNotice(notice.id)">
                <div class="flex justify-between items-start">
                    <h3 class="font-medium text-gray-800 dark:text-gray-200 mb-1">{{ notice.title }}</h3>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {{ notice.author }} · {{ formatDate(notice.createTime) }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import { type NoticesSpace, getAllNotices, getNoticeById } from '@/common/views/noticeAPI';
import dayjs from 'dayjs';
import globalMessage from '../utils/toast';

// 当前公告数据
const currentNotice = ref<NoticesSpace.NoticeVO>({
    id: 0,
    authorId: 0,
    title: '',
    content: '', // markdown内容
    author: '',
    createTime: new Date(),
});

// 历史公告数据
const historyNotices = ref<NoticesSpace.NoticesVO[]>([]);

const formatDate = (date: Date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm');
};

const selectNotice = (id: number) => {
    loadSingle(id);
};
async function loadSingle(id: number) {
    getNoticeById(id).then((res) => {
        currentNotice.value = res.data as NoticesSpace.NoticeVO;
    }).catch(err => {
        globalMessage.error('错误', '获取通知详情失败！' + err.message);
    });
};
async function loadAll() {
    getAllNotices(50).then((res) => {
        historyNotices.value = res.data as NoticesSpace.NoticesVO[];
    }).catch(err => {
        globalMessage.error('错误', '获取通知列表失败！' + err.message);
    });
}
onMounted(() => {
    loadAll();
    const id = Number(location.pathname.split('/').pop());
    if (id) {
        loadSingle(id);
    } else {
        globalMessage.error('错误', '获取通知详情失败！');
    }
});
</script>

<style scoped>
/* 配置Prose样式继承 */
:deep(.prose) {
    max-width: none !important;
    font-size: 15px;
    line-height: 1.7;
}

:deep(.prose h2) {
    @apply text-2xl font-semibold mt-8 mb-4 text-gray-800;
}

:deep(.prose p) {
    @apply mb-4 text-gray-700;
}
</style>