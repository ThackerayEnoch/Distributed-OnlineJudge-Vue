<template>
    <div class="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[500px] flex flex-col">
        <!-- Header -->
        <div class="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <h2 class="text-lg font-medium text-gray-800 dark:text-gray-200">答疑管理</h2>
        </div>

        <!-- Conversation List -->
        <div class="flex-1 overflow-y-auto p-6">
            <div v-if="loadingList" class="flex justify-center py-10">
                <span class="loading loading-spinner loading-md text-blue-500"></span>
            </div>
            <div v-else-if="conversations.length === 0"
                class="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span>暂无答疑请求</span>
            </div>
            <div v-else class="flex flex-col gap-4">
                <div v-for="conv in conversations" :key="conv.id" @click="openConversation(conv)"
                    class="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group w-full">
                    <div class="flex items-center gap-4 overflow-hidden flex-1 min-w-0">
                        <!-- Avatar Placeholder -->
                        <div
                            class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-300 font-bold text-lg">
                            {{ conv.userNickname.charAt(0).toUpperCase() }}
                        </div>
                        <div class="flex flex-col overflow-hidden flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <h3 class="text-base font-semibold text-gray-800 dark:text-gray-100 truncate">{{
                                    conv.userNickname }}</h3>
                                <span v-if="conv.unreadCount > 0"
                                    class="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{{ conv.unreadCount
                                    }}</span>
                            </div>
                            <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-1 w-full">{{
                                conv.lastMessageContent }}</p>
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                        <span class="text-xs text-gray-400">{{ formatTime(conv.lastTime) }}</span>
                        <svg xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chat Modal -->
        <div v-if="selectedConversation"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            @click.self="closeModal">
            <div
                class="w-full max-w-5xl h-[85vh] flex flex-col bg-gray-50 dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative animate-fade-in-up">
                <!-- 顶部标题 -->
                <div
                    class="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
                    <div>
                        <h2 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <span>{{ selectedConversation.userNickname }}</span>
                            <span
                                class="text-xs font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">学生</span>
                        </h2>
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

                <!-- 消息列表区域 -->
                <div class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-gray-50 dark:bg-gray-900"
                    ref="messageContainer">
                    <div v-if="loadingMessages" class="flex justify-center py-4">
                        <span class="loading loading-spinner loading-md text-blue-500"></span>
                    </div>

                    <template v-else>
                        <div v-for="msg in messages" :key="msg.id" class="flex w-full group"
                            :class="(msg.role === 'admin' && msg.adminNickname === userStore.currentUser.nickname) ? 'justify-end' : 'justify-start'">
                            <!-- 左侧头像 (用户 或 其他管理员) -->
                            <div v-if="msg.role === 'user' || (msg.role === 'admin' && msg.adminNickname !== userStore.currentUser.nickname)"
                                class="flex-shrink-0 mr-3 self-start pt-1">
                                <!-- 用户头像 -->
                                <div v-if="msg.role === 'user'"
                                    class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 dark:bg-blue-900 dark:border-blue-700 shadow-sm">
                                    <span class="text-xs font-bold text-blue-600 dark:text-blue-300">{{
                                        selectedConversation.userNickname.substring(0, 2) }}</span>
                                </div>
                                <!-- 其他管理员头像 -->
                                <div v-else
                                    class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                                    <span v-if="msg.adminNickname"
                                        class="text-xs font-bold text-gray-600 dark:text-gray-300">{{
                                            msg.adminNickname.substring(0, 2) }}</span>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400"
                                        viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                            </div>

                            <!-- 消息气泡 -->
                            <div class="flex flex-col max-w-[85%] md:max-w-[75%]">
                                <!-- 发送者名字和时间 -->
                                <div class="text-xs text-gray-400 mb-1 px-1 flex items-center gap-2"
                                    :class="(msg.role === 'admin' && msg.adminNickname === userStore.currentUser.nickname) ? 'flex-row-reverse' : 'flex-row'">
                                    <span class="font-medium text-gray-600 dark:text-gray-300">{{ msg.role === 'admin' ?
                                        msg.adminNickname : selectedConversation.userNickname }}</span>
                                    <span v-if="msg.role === 'admin'"
                                        class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                                        Admin
                                    </span>
                                    <span>{{ formatTime(msg.createTime) }}</span>
                                </div>

                                <!-- 内容 -->
                                <div class="rounded-2xl shadow-sm overflow-hidden border transition-all duration-200"
                                    :class="[
                                        (msg.role === 'admin' && msg.adminNickname === userStore.currentUser.nickname)
                                            ? 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 rounded-tr-none'
                                            : 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-tl-none'
                                    ]">
                                    <div class="px-4 py-2">
                                        <MdPreview :editorId="'preview-' + msg.id" :modelValue="msg.content"
                                            :theme="layoutConfig.darkTheme ? 'dark' : 'light'"
                                            class="!bg-transparent" />
                                    </div>
                                </div>
                            </div>

                            <!-- 当前管理员头像 (右侧) -->
                            <div v-if="msg.role === 'admin' && msg.adminNickname === userStore.currentUser.nickname"
                                class="flex-shrink-0 ml-3 self-start pt-1">
                                <div
                                    class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400"
                                        viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                            clip-rule="evenodd" />
                                    </svg>
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
                                @on-upload-img="onUploadImg" placeholder="回复学生... (支持 Markdown)" />
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
                                {{ sending ? '发送中' : '发送回复' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import globalMessage from '@/common/utils/toast';
import { MdEditor, MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { layoutConfig } from '@/common/views/layout/layout';
import {
    getAdminConversations,
    getConversationMessages,
    adminReplyConversation,
    type ClarificationSpace
} from '../api/clarificationAPI';
import { uploadFile } from '@/issue/api/IssueAPI';
import { useUserStore } from '@/common/utils/store';

const props = defineProps<{
    contestId: number
}>();

const userStore = useUserStore();

// --- 数据结构定义 ---
// 使用 API 定义的类型，或者本地扩展
type Conversation = ClarificationSpace.AdminConversationVO;

interface Message {
    id: number;
    content: string;
    role: 'user' | 'admin';
    createTime: string;
    adminNickname?: string;
}

// --- 状态管理 ---
const conversations = ref<Conversation[]>([]);
const selectedConversation = ref<Conversation | null>(null);
const messages = ref<Message[]>([]);
const inputText = ref('');
const loadingList = ref(false);
const loadingMessages = ref(false);
const sending = ref(false);
const messageContainer = ref<HTMLElement | null>(null);
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

// 加载会话列表
const loadConversations = async () => {
    if (props.contestId <= 0) return;
    loadingList.value = true;
    try {
        const res = await getAdminConversations(props.contestId);
        if (res.data) {
            conversations.value = res.data.sort((a, b) => {
                // 1. 未读数量优先 (降序)
                if (a.unreadCount !== b.unreadCount) {
                    return b.unreadCount - a.unreadCount;
                }
                // 2. 时间优先 (降序，晚发布的靠上)
                const timeA = new Date(a.lastTime).getTime();
                const timeB = new Date(b.lastTime).getTime();
                return timeB - timeA;
            });
        }
    } catch (error) {
        globalMessage.error('加载失败', '无法获取答疑列表');
    } finally {
        loadingList.value = false;
    }
};

// 打开会话
const openConversation = async (conv: Conversation) => {
    selectedConversation.value = conv;
    loadingMessages.value = true;
    messages.value = []; // Clear previous messages
    try {
        const res = await getConversationMessages(props.contestId, conv.id);
        if (res.data) {
            messages.value = res.data.map(m => ({
                id: m.id,
                content: m.content,
                role: m.isFromAdmin ? 'admin' : 'user',
                createTime: m.createTime,
                adminNickname: m.isFromAdmin ? m.nickname : undefined
            }));
            scrollToBottom();
            // TODO: Mark as read
            conv.unreadCount = 0;
        }
    } catch (error) {
        globalMessage.error('加载失败', '无法获取消息记录');
    } finally {
        loadingMessages.value = false;
    }
};

// 关闭会话
const closeModal = () => {
    selectedConversation.value = null;
};

// 发送消息
const handleSend = async () => {
    if (!inputText.value.trim() || !selectedConversation.value) return;

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

        await adminReplyConversation({
            contestId: props.contestId,
            conversationId: selectedConversation.value.id,
            content: contentToSend
        });

        // Optimistic update
        const newMsg: Message = {
            id: Date.now(),
            content: contentToSend,
            role: 'admin',
            createTime: new Date().toISOString(),
            adminNickname: userStore.currentUser.nickname
        };
        messages.value.push(newMsg);
        inputText.value = '';
        scrollToBottom();

        // Update conversation list preview
        if (selectedConversation.value) {
            selectedConversation.value.lastMessageContent = contentToSend;
            selectedConversation.value.lastTime = newMsg.createTime;
        }
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

// --- 生命周期 ---
onMounted(() => {
    loadConversations();
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
