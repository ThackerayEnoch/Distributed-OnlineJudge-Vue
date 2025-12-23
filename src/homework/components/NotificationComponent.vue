<template>
    <div class="w-full h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[500px]">
        <!-- Header -->
        <div class="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <h2 class="text-lg font-medium text-gray-800 dark:text-gray-200">公告 (Notifications)</h2>
        </div>

        <!-- Content Area -->
        <div class="flex-1 p-6 overflow-y-auto">
            <!-- Admin Post Notification Area -->
            <div v-if="isAdmin"
                class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <h3 class="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2">发布新公告</h3>
                <div class="space-y-3">
                    <input v-model="newNotificationTitle" type="text" placeholder="公告标题"
                        class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200">
                    <div class="rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
                        <MdEditor v-model="newNotificationContent" :theme="layoutConfig.darkTheme ? 'dark' : 'light'"
                            class="!h-[300px] w-full !border-none"
                            :toolbars="['bold', 'underline', 'italic', '-', 'title', 'strikeThrough', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task', '-', 'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', '-', 'revoke', 'next', 'save', '=', 'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview', 'catalog', 'github']"
                            @on-upload-img="onUploadImg" placeholder="公告内容 (支持 Markdown)" />
                    </div>
                    <div class="flex justify-end">
                        <button @click="submitNotification"
                            :disabled="!newNotificationTitle.trim() || !newNotificationContent.trim() || isSubmitting"
                            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2">
                            <i v-if="isSubmitting" class="pi pi-spin pi-spinner"></i>
                            <span>{{ isSubmitting ? '发布中...' : '发布公告' }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="notifications.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span>暂无公告</span>
            </div>
            <div v-for="note in notifications" :key="note.id"
                class="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 mb-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ note.title }}</h3>
                    <span
                        class="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {{ note.createTime }}
                    </span>
                </div>
                <div class="text-gray-600 dark:text-gray-300 leading-relaxed">
                    <MdPreview :editorId="'preview-note-' + note.id" :modelValue="note.content"
                        :theme="layoutConfig.darkTheme ? 'dark' : 'light'" class="!bg-transparent !p-0" />
                </div>
                <div class="mt-3 text-right">
                    <span class="text-xs text-gray-400 dark:text-gray-500">发布者: {{ note.author }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/common/utils/store';
import { Role } from '@/common/constant/Role';
import { MdEditor, MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { layoutConfig } from '@/common/views/layout/layout';
import { createContestNotice, getContestNotices, type ClarificationSpace } from '../api/clarificationAPI';
import { uploadFile } from '@/issue/api/IssueAPI';
import globalMessage from '@/common/utils/toast';

const props = defineProps<{
    contestId: number
}>();

// State
const notifications = ref<ClarificationSpace.ContestNoticeVO[]>([]);
const newNotificationTitle = ref('');
const newNotificationContent = ref('');
const pendingUploads = ref<Record<string, File>>({});
const isSubmitting = ref(false);

const userStore = useUserStore();
const isAdmin = computed(() => {
    const user = userStore.currentUser;
    return user.roleId !== null && user.roleId <= Role.COLLBORATOR;
});

// 图片上传
const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    const res = files.map((file) => {
        const url = URL.createObjectURL(file);
        pendingUploads.value[url] = file;
        return url;
    });
    callback(res);
};

// API Methods (Empty / Mock)
const fetchNotifications = async () => {
    if (props.contestId <= 0) return;
    try {
        const res = await getContestNotices(props.contestId);
        if (res.data) {
            notifications.value = res.data.sort((a, b) => {
                const timeA = new Date(a.createTime).getTime();
                const timeB = new Date(b.createTime).getTime();
                if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) {
                    return timeB - timeA;
                }
                return b.id - a.id;
            });
        }
    } catch (error) {
        console.error(error);
    }
};

const submitNotification = async () => {
    if (!newNotificationTitle.value.trim() || !newNotificationContent.value.trim()) return;

    isSubmitting.value = true;
    try {
        // 处理图片上传
        const blobRegex = /blob:[^\s)"']+/g;
        const localUrls = Array.from(new Set((newNotificationContent.value.match(blobRegex) || [])));

        if (localUrls.length > 0) {
            const uploadResults = await Promise.all(localUrls.map(async (localUrl) => {
                const file = pendingUploads.value[localUrl];
                if (!file) return { local: localUrl, remote: localUrl };

                const form = new FormData();
                form.append('files', file);
                const resp = await uploadFile(form, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                const data = (resp as any).data ?? resp;
                let remoteUrl = '';
                if (typeof data === 'string') remoteUrl = data;
                else if (Array.isArray(data) && data.length > 0) remoteUrl = data[0];
                else if (data && typeof data === 'object') remoteUrl = data.url || data.path || JSON.stringify(data);

                try { URL.revokeObjectURL(localUrl); } catch (e) { /* ignore */ }
                delete pendingUploads.value[localUrl];
                return { local: localUrl, remote: remoteUrl };
            }));

            uploadResults.forEach(r => {
                if (r.remote && r.remote !== r.local) {
                    newNotificationContent.value = newNotificationContent.value.split(r.local).join(r.remote);
                }
            });
        }

        await createContestNotice({
            contestId: props.contestId,
            title: newNotificationTitle.value,
            content: newNotificationContent.value
        });
        globalMessage.success('成功', '公告发布成功');
        newNotificationTitle.value = '';
        newNotificationContent.value = '';
        await fetchNotifications();
    } catch (error) {
        globalMessage.error('公告发布失败', (error as any)?.message || '发生未知错误');
    } finally {
        isSubmitting.value = false;
    }
};

// Lifecycle
onMounted(() => {
    fetchNotifications();
});

</script>

<style scoped>
/* Custom scrollbar for the list areas if needed */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb {
    background: #475569;
}

.dark ::-webkit-scrollbar-thumb:hover {

    /* 调整 MdPreview 样式 */
    :deep(.md-editor-preview-wrapper) {
        padding: 0;
    }

    :deep(.md-editor-preview) {
        font-size: 0.875rem;
        /* text-sm */
        line-height: 1.6;
        color: inherit;
    }

    background: #64748b;
}
</style>
