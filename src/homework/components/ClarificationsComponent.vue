<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="closeModal">
        <div
            class="w-full max-w-5xl h-[85vh] flex flex-col bg-gray-50 dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative animate-fade-in-up">
            <!-- 顶部标题 -->
            <div
                class="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                                clip-rule="evenodd" />
                        </svg>
                        答疑解惑
                    </h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        管理员无法为您提供解题思路或判断结果。如果您认为题目存在排版错误或表述歧义，请在此处清晰描述。</p>
                </div>
                <div class="flex items-center gap-3">
                    <div
                        class="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full dark:bg-blue-900 dark:text-blue-300">
                        {{ messages.length }} 条消息
                    </div>
                    <button @click="closeModal"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- 消息列表区域 -->
            <div class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gray-50 dark:bg-gray-900"
                ref="messageContainer">
                <div v-if="loading" class="flex justify-center py-4">
                    <span class="loading loading-spinner loading-md text-blue-500"></span>
                </div>

                <div v-else-if="messages.length === 0"
                    class="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2 opacity-20" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>暂无消息，有问题请提问</p>
                </div>

                <template v-else>
                    <div v-for="msg in messages" :key="msg.id" class="flex w-full group"
                        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                        <!-- 管理员头像 (左侧) -->
                        <div v-if="msg.role === 'admin'" class="flex-shrink-0 mr-3 self-start pt-1">
                            <div
                                class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        <!-- 消息气泡 -->
                        <div class="flex flex-col max-w-[85%] md:max-w-[75%]">
                            <!-- 发送者名字和时间 -->
                            <div class="text-xs text-gray-400 mb-1 px-1 flex items-center gap-2"
                                :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
                                <span class="font-medium text-gray-600 dark:text-gray-300">{{ msg.role === 'user' ? '我'
                                    :
                                    (msg.adminNickname || '管理员') }}</span>
                                <span>{{ formatTime(msg.createTime) }}</span>
                            </div>

                            <!-- 内容 -->
                            <div class="rounded-2xl shadow-sm overflow-hidden border transition-all duration-200"
                                :class="[
                                    msg.role === 'user'
                                        ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 rounded-tr-none'
                                        : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-tl-none'
                                ]">
                                <div class="px-4 py-2">
                                    <MdPreview :editorId="'preview-' + msg.id" :modelValue="msg.content"
                                        :theme="layoutConfig.darkTheme ? 'dark' : 'light'" class="!bg-transparent" />
                                </div>
                            </div>
                        </div>

                        <!-- 用户头像 (右侧) -->
                        <div v-if="msg.role === 'user'" class="flex-shrink-0 ml-3 self-start pt-1">
                            <div
                                class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 dark:bg-blue-900 dark:border-blue-700 shadow-sm">
                                <span class="text-xs font-bold text-blue-600 dark:text-blue-300">Me</span>
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <!-- 输入框区域 -->
            <div
                class="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <div class="flex flex-col gap-3">
                    <div
                        class="w-full relative rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                        <MdEditor v-model="inputText" :theme="layoutConfig.darkTheme ? 'dark' : 'light'"
                            class="!h-[150px] !border-none"
                            :toolbars="['bold', 'underline', 'italic', '-', 'title', 'strikeThrough', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task', '-', 'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', '-', 'revoke', 'next', 'save', '=', 'pageFullscreen', 'fullscreen', 'preview', 'htmlPreview', 'catalog', 'github']"
                            @on-upload-img="onUploadImg" placeholder="请输入您的问题... (支持 Markdown)" />
                    </div>
                    <div class="flex justify-end">
                        <button @click="handleSend" :disabled="!inputText.trim() || sending"
                            class="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px] active:scale-95">
                            <span v-if="sending" class="animate-spin mr-2">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4">
                                    </circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                            </span>
                            {{ sending ? '发送中' : '发送消息' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import globalMessage from '@/common/utils/toast';
import { MdEditor, MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { layoutConfig } from '@/common/views/layout/layout';
import {
    getClarificationMessages,
    replyClarification,
    type ClarificationSpace
} from '../api/clarificationAPI';
import { uploadFile } from '@/issue/api/IssueAPI';

const props = defineProps<{
    contestId: number
}>();

// --- 数据结构定义 ---
interface Message {
    id: number;
    content: string;
    role: 'user' | 'admin';
    createTime: string; // ISO string or timestamp
    adminNickname?: string;
}

// --- 状态管理 ---
const messages = ref<Message[]>([]);
const inputText = ref('');
const loading = ref(false);
const sending = ref(false);
const messageContainer = ref<HTMLElement | null>(null);
const router = useRouter();
// 本地暂存上传文件：key=blobUrl, value=File
const pendingUploads = ref<Record<string, File>>({});

// --- 方法 ---

// 图片上传
const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    const validFiles: File[] = [];
    const invalidReasons: string[] = [];
    files.forEach((file) => {
        if (!file.name || String(file.name).trim() === '') {
            invalidReasons.push('文件名不能为空');
            return;
        }
        if (!file.type || !file.type.startsWith('image/')) {
            invalidReasons.push(`${file.name} 不是图片类型，已忽略`);
            return;
        }
        validFiles.push(file);
    });

    if (invalidReasons.length > 0) {
        globalMessage.warn('上传提醒', invalidReasons.join('; '));
    }

    const urls = validFiles.map((file) => {
        const blobUrl = URL.createObjectURL(file);
        pendingUploads.value[blobUrl] = file;
        return blobUrl;
    });
    callback(urls);
};

// 滚动到底部
const scrollToBottom = async () => {
    await nextTick();
    if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
};

// 加载消息
const loadMessages = async () => {
    if (props.contestId <= 0) return;
    loading.value = true;
    try {
        const res = await getClarificationMessages(props.contestId);
        if (res.data) {
            messages.value = res.data.map(m => ({
                id: m.id,
                content: m.content,
                role: m.isFromAdmin ? 'admin' : 'user',
                createTime: m.createTime,
                adminNickname: m.isFromAdmin ? m.nickname : undefined
            }));
            scrollToBottom();
        }
    } catch (error) {
        globalMessage.error('加载失败', '无法获取答疑记录');
    } finally {
        loading.value = false;
    }
};

// 发送消息
const handleSend = async () => {
    if (!inputText.value.trim()) return;

    sending.value = true;
    try {
        // 处理图片上传
        const blobRegex = /blob:[^\s)"']+/g;
        const localUrls = Array.from(new Set((inputText.value.match(blobRegex) || [])));

        if (localUrls.length > 0) {
            // 预校验
            const missing = localUrls.filter(u => !pendingUploads.value[u]);
            if (missing.length > 0) {
                globalMessage.error('上传失败', '部分附件尚未准备或已失效，请重新插入');
                sending.value = false;
                return;
            }

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
                    inputText.value = inputText.value.split(r.local).join(r.remote);
                }
            });
        }

        const contentToSend = inputText.value;

        await replyClarification({
            contestId: props.contestId,
            conversationId: 999999, // 约定：普通用户回复时填任意大数
            content: contentToSend
        });

        // Optimistic update
        const newMsg: Message = {
            id: Date.now(),
            content: contentToSend,
            role: 'user',
            createTime: new Date().toISOString()
        };
        messages.value.push(newMsg);
        inputText.value = '';
        scrollToBottom();
    } catch (error) {
        globalMessage.error('发送失败', '请稍后重试');
    } finally {
        sending.value = false;
    }
};

// 时间格式化
const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (isToday) {
        return `${hours}:${minutes}`;
    } else {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}-${day} ${hours}:${minutes}`;
    }
};

const closeModal = () => {
    // 尝试返回上一页，如果上一页不是当前作业页面，则跳转到题目列表
    if (window.history.length > 1) {
        router.back();
    } else {
        // Fallback logic if needed, though router.back() is usually sufficient
        // We might want to parse the homeworkId from the current route and go to problems
        const currentPath = router.currentRoute.value.path;
        const homeworkIdMatch = currentPath.match(/\/homework\/(\d+)/);
        if (homeworkIdMatch) {
            router.push(`/homework/${homeworkIdMatch[1]}/problems`);
        } else {
            router.push('/');
        }
    }
};

// --- 生命周期 ---
onMounted(() => {
    loadMessages();
});

</script>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translate3d(0, 20px, 0);
    }

    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

.animate-fade-in-up {
    animation: fadeInUp 0.3s ease-out forwards;
}

/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.8);
}

/* 调整 MdPreview 在气泡中的样式 */
:deep(.md-editor-preview-wrapper) {
    padding: 0;
}

:deep(.md-editor-preview) {
    font-size: 0.875rem;
    /* text-sm */
    line-height: 1.6;
    color: inherit;
}
</style>
