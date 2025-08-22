<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { markMessageAsRead } from '../api/messageAPI';
import type { Message, MessageReply } from '../entity/message';
import { MessagePriority } from '../entity/message';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import globalMessage from '@/common/utils/toast';
import Avatar from 'primevue/avatar';

const router = useRouter();
const route = useRoute();

// 响应式数据
const messages = ref<Message[]>([]);
const selectedMessage = ref<Message | null>(null);
const loading = ref(false);
const replyContent = ref('');
const isSending = ref(false);
const repliesContainer = ref<HTMLElement>();

// 获取当前用户信息（模拟）
const currentUser = ref('张三');

// 判断是否为通知（系统管理员发送的消息）
const isNotification = computed(() => {
    return selectedMessage.value?.author === '系统管理员' ||
        selectedMessage.value?.author === '开发团队' ||
        selectedMessage.value?.isNotification;
});

// 获取消息类型文本
const getMessageType = computed(() => {
    return isNotification.value ? '系统通知' : '私人消息';
});

// 获取优先级标签样式
const getPriorityClass = (priority: MessagePriority) => {
    switch (priority) {
        case MessagePriority.HIGH:
            return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case MessagePriority.MEDIUM:
            return 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
        case MessagePriority.LOW:
            return 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
        default:
            return 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
};

// 获取优先级文本和图标
const getPriorityInfo = (priority: MessagePriority) => {
    switch (priority) {
        case MessagePriority.HIGH:
            return { text: '高优先级', icon: 'pi-exclamation-triangle' };
        case MessagePriority.MEDIUM:
            return { text: '中优先级', icon: 'pi-info-circle' };
        case MessagePriority.LOW:
            return { text: '低优先级', icon: 'pi-minus' };
        default:
            return { text: '普通', icon: 'pi-minus' };
    }
};

// 格式化时间
const formatTime = (dateString: string) => {
    try {
        return format(new Date(dateString), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
    } catch (error) {
        return dateString;
    }
};

// 格式化简短时间
const formatShortTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return format(date, 'HH:mm', { locale: zhCN });
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return format(date, 'MM-dd', { locale: zhCN });
        }
    } catch (error) {
        return dateString;
    }
};

// 加载消息列表和详情
const loadMessages = async () => {
    try {
        loading.value = true;

        // 模拟数据 - 包含回复
        const mockMessages: Message[] = [
            {
                id: 1,
                subject: '系统维护通知',
                content: '系统将于今晚23:00-01:00进行例行维护，期间可能会出现短暂的服务中断，请提前保存您的工作进度。\n\n维护内容包括：\n• 数据库优化\n• 服务器升级\n• 安全补丁更新\n\n维护期间，在线判题服务将暂停，请合理安排提交时间。如有紧急问题，请联系管理员。',
                createTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                author: '系统管理员',
                priority: MessagePriority.HIGH,
                isRead: false,
                isNotification: true,
                replies: []
            },
            {
                id: 2,
                subject: '关于作业提交的问题',
                content: '老师您好，我在提交数据结构作业时遇到了问题，程序在本地运行正常，但提交后显示运行时错误。请问可能是什么原因？',
                createTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                author: '张教授',
                priority: MessagePriority.MEDIUM,
                isRead: false,
                isNotification: false,
                replies: [
                    {
                        id: 1,
                        messageId: 2,
                        content: '同学你好，这种情况通常是由于以下几种原因：\n1. 输入输出格式不匹配\n2. 内存使用超限\n3. 运行时间超时\n\n建议你仔细检查题目要求，特别注意输入输出的格式。',
                        author: '张教授',
                        createTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                        isFromUser: false
                    },
                    {
                        id: 2,
                        messageId: 2,
                        content: '谢谢老师！我重新检查了代码，发现确实是输出格式的问题。现在已经解决了。',
                        author: '张三',
                        createTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        isFromUser: true
                    }
                ]
            },
            {
                id: 3,
                subject: '竞赛报名确认',
                content: '您好，我想确认一下程序设计竞赛的报名情况，我在系统中已经提交了报名信息，但状态显示"待审核"，请问什么时候能得到结果？',
                createTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                author: '竞赛组委会',
                priority: MessagePriority.LOW,
                isRead: true,
                isNotification: false,
                replies: []
            },
            {
                id: 4,
                subject: '平台功能更新通知',
                content: '亲爱的用户，我们很高兴地宣布平台新增了以下功能：\n\n🚀 新功能特性：\n• 代码对比工具 - 轻松比较不同版本的代码\n• 智能代码提示 - 提升编程效率\n• 深色主题模式 - 保护你的眼睛\n• 移动端优化 - 随时随地刷题\n\n📱 界面优化：\n• 全新的现代化界面设计\n• 更流畅的用户体验\n• 响应式布局适配\n\n⚡ 性能提升：\n• 页面加载速度提升50%\n• 判题响应时间优化\n• 数据库查询性能优化',
                createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                author: '开发团队',
                priority: MessagePriority.LOW,
                isRead: true,
                isNotification: true,
                replies: []
            }
        ];

        messages.value = mockMessages;

        // 如果有指定的消息ID，自动选择
        const messageId = parseInt(route.params.id as string);
        if (messageId) {
            const targetMessage = messages.value.find(m => m.id === messageId);
            if (targetMessage) {
                await selectMessage(targetMessage);
            }
        } else if (messages.value.length > 0) {
            // 默认选择第一条未读消息，如果没有则选择第一条
            const firstUnread = messages.value.find(m => !m.isRead);
            await selectMessage(firstUnread || messages.value[0]);
        }

    } catch (error) {
        console.error('加载消息失败:', error);
        globalMessage.error('加载失败', '无法加载消息列表');
    } finally {
        loading.value = false;
    }
};

// 选择消息
const selectMessage = async (message: Message) => {
    selectedMessage.value = message;

    // 如果消息未读，标记为已读
    if (!message.isRead) {
        await handleMarkAsRead(message);
    }

    // 滚动到回复区域底部
    nextTick(() => {
        scrollToBottom();
    });

    // 更新URL
    router.replace(`/messages/${message.id}`);
};

// 标记消息已读
const handleMarkAsRead = async (message: Message) => {
    if (message.isRead) return;

    try {
        await markMessageAsRead(message.id);
        message.isRead = true;
    } catch (error) {
        console.error('标记消息已读失败:', error);
    }
};

// 发送回复
const sendReply = async () => {
    if (!replyContent.value.trim() || !selectedMessage.value || isSending.value) {
        return;
    }

    try {
        isSending.value = true;

        // 模拟发送回复
        const newReply: MessageReply = {
            id: Date.now(),
            messageId: selectedMessage.value.id,
            content: replyContent.value.trim(),
            author: currentUser.value,
            createTime: new Date().toISOString(),
            isFromUser: true
        };

        // 添加到回复列表
        if (!selectedMessage.value.replies) {
            selectedMessage.value.replies = [];
        }
        selectedMessage.value.replies.push(newReply);

        // 清空输入框
        replyContent.value = '';

        globalMessage.success('发送成功', '您的回复已发送');

        // 滚动到底部
        nextTick(() => {
            scrollToBottom();
        });

    } catch (error) {
        console.error('发送回复失败:', error);
        globalMessage.error('发送失败', '无法发送回复');
    } finally {
        isSending.value = false;
    }
};

// 滚动到回复区域底部
const scrollToBottom = () => {
    if (repliesContainer.value) {
        repliesContainer.value.scrollTop = repliesContainer.value.scrollHeight;
    }
};

// 返回消息列表
const goBack = () => {
    router.push('/messages');
};

onMounted(() => {
    loadMessages();
});
</script>
<template>
    <div class="w-full h-[calc(100vh-9rem)] flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <!-- 左侧消息列表 -->
        <div class="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
            <!-- 头部 -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between mb-3">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">消息中心</h2>
                    <button @click="goBack"
                        class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                        <i class="pi pi-times text-sm"></i>
                    </button>
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                    共 {{ messages.length }} 条消息
                    <span v-if="messages.filter(m => !m.isRead).length > 0"
                        class="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        {{messages.filter(m => !m.isRead).length}} 条未读
                    </span>
                </div>
            </div>

            <!-- 消息列表 -->
            <div class="flex-1 overflow-y-auto">
                <div v-if="loading" class="flex items-center justify-center py-20">
                    <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>

                <div v-else class="space-y-1 p-2">
                    <div v-for="message in messages" :key="message.id"
                        class="p-3 rounded-lg cursor-pointer transition-all duration-200 group" :class="{
                            'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500': selectedMessage?.id === message.id,
                            'hover:bg-gray-50 dark:hover:bg-gray-700': selectedMessage?.id !== message.id,
                            'font-medium': !message.isRead
                        }" @click="selectMessage(message)">

                        <div class="flex items-start gap-3">
                            <!-- 头像和状态指示器 -->
                            <div class="relative flex-shrink-0">
                                <Avatar :icon="message.isNotification ? 'pi pi-bell' : 'pi pi-user'" size="small"
                                    :style="{
                                        backgroundColor: message.isNotification ? '#3b82f6' : '#10b981',
                                        color: 'white'
                                    }" />
                                <div v-if="!message.isRead"
                                    class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800">
                                </div>
                            </div>

                            <!-- 消息内容 -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="font-medium text-gray-900 dark:text-white text-sm truncate">
                                        {{ message.author }}
                                    </span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                        {{ formatShortTime(message.createTime) }}
                                    </span>
                                </div>

                                <h4 class="font-medium text-gray-900 dark:text-white text-sm mb-1 line-clamp-1"
                                    :class="{ 'font-semibold': !message.isRead }">
                                    {{ message.subject }}
                                </h4>

                                <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {{ message.content }}
                                </p>

                                <!-- 标签 -->
                                <div class="flex items-center gap-2 mt-2">
                                    <span
                                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                        :class="getPriorityClass(message.priority)">
                                        <i :class="`pi ${getPriorityInfo(message.priority).icon} text-xs`"></i>
                                        {{ getPriorityInfo(message.priority).text }}
                                    </span>

                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                        :class="message.isNotification ?
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'">
                                        {{ message.isNotification ? '通知' : '消息' }}
                                    </span>

                                    <span v-if="message.replies && message.replies.length > 0"
                                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        <i class="pi pi-comment text-xs"></i>
                                        {{ message.replies.length }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧消息详情 -->
        <div class="flex-1 flex flex-col bg-white dark:bg-gray-800">
            <div v-if="!selectedMessage" class="flex-1 flex items-center justify-center">
                <div class="text-center">
                    <div
                        class="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <i class="pi pi-inbox text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">选择一条消息</h3>
                    <p class="text-gray-500 dark:text-gray-400">从左侧列表中选择一条消息来查看详细内容</p>
                </div>
            </div>

            <div v-else class="flex-1 flex flex-col overflow-hidden">
                <!-- 消息头部 -->
                <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1 min-w-0">
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight break-words">
                                {{ selectedMessage.subject }}
                            </h1>

                            <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div class="flex items-center gap-2">
                                    <Avatar :icon="selectedMessage.isNotification ? 'pi pi-bell' : 'pi pi-user'"
                                        size="small" :style="{
                                            backgroundColor: selectedMessage.isNotification ? '#3b82f6' : '#10b981',
                                            color: 'white'
                                        }" />
                                    <div>
                                        <div class="font-medium text-gray-900 dark:text-gray-100">{{
                                            selectedMessage.author }}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ getMessageType }}</div>
                                    </div>
                                </div>

                                <div class="flex items-center gap-1">
                                    <i class="pi pi-clock text-xs"></i>
                                    <span>{{ formatTime(selectedMessage.createTime) }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 flex-shrink-0">
                            <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium"
                                :class="getPriorityClass(selectedMessage.priority)">
                                <i :class="`pi ${getPriorityInfo(selectedMessage.priority).icon} text-xs`"></i>
                                {{ getPriorityInfo(selectedMessage.priority).text }}
                            </span>

                            <span v-if="!selectedMessage.isRead"
                                class="inline-flex items-center px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 text-sm font-medium">
                                未读
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 消息内容和对话区域 -->
                <div class="flex-1 flex flex-col overflow-hidden">
                    <!-- 滚动区域 -->
                    <div ref="repliesContainer" class="flex-1 overflow-y-auto p-6 space-y-6">
                        <!-- 原始消息 -->
                        <div class="flex gap-4">
                            <Avatar :icon="selectedMessage.isNotification ? 'pi pi-bell' : 'pi pi-user'" :style="{
                                backgroundColor: selectedMessage.isNotification ? '#3b82f6' : '#10b981',
                                color: 'white'
                            }" />

                            <div class="flex-1">
                                <div class="bg-gray-50 dark:bg-gray-700 rounded-2xl rounded-tl-sm p-4">
                                    <div class="prose prose-gray dark:prose-invert max-w-none">
                                        <div
                                            class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed break-words">
                                            {{ selectedMessage.content }}
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {{ formatTime(selectedMessage.createTime) }}
                                </div>
                            </div>
                        </div>

                        <!-- 回复列表 -->
                        <div v-if="selectedMessage.replies && selectedMessage.replies.length > 0" class="space-y-4">
                            <div v-for="reply in selectedMessage.replies" :key="reply.id" class="flex gap-4"
                                :class="{ 'flex-row-reverse': reply.isFromUser }">

                                <Avatar icon="pi pi-user" :style="{
                                    backgroundColor: reply.isFromUser ? '#3b82f6' : '#10b981',
                                    color: 'white'
                                }" />

                                <div class="flex-1 max-w-2xl">
                                    <div class="rounded-2xl p-4"
                                        :class="reply.isFromUser ?
                                            'bg-blue-500 text-white rounded-tr-sm' :
                                            'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'">
                                        <div class="whitespace-pre-wrap leading-relaxed break-words">
                                            {{ reply.content }}
                                        </div>
                                    </div>
                                    <div class="mt-2 text-xs text-gray-500 dark:text-gray-400"
                                        :class="{ 'text-right': reply.isFromUser }">
                                        {{ reply.author }} · {{ formatTime(reply.createTime) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 回复输入区域 - 固定在底部 -->
                    <div v-if="!isNotification"
                        class="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                        <div class="flex gap-4">
                            <Avatar icon="pi pi-user" :style="{ backgroundColor: '#3b82f6', color: 'white' }" />

                            <div class="flex-1">
                                <div class="relative">
                                    <textarea v-model="replyContent" placeholder="输入回复内容..." rows="3"
                                        class="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none transition-colors pr-20"
                                        :disabled="isSending" @keydown.ctrl.enter="sendReply"
                                        @keydown.meta.enter="sendReply">
                                    </textarea>

                                    <button @click="sendReply" :disabled="!replyContent.trim() || isSending"
                                        class="absolute bottom-3 right-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                        <i v-if="isSending" class="pi pi-spin pi-spinner text-sm"></i>
                                        <i v-else class="pi pi-send text-sm"></i>
                                        {{ isSending ? '发送中...' : '发送' }}
                                    </button>
                                </div>

                                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    按 Ctrl+Enter 快速发送
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 通知类消息的提示 - 固定在底部 -->
                    <div v-else
                        class="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                        <div class="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                            <i class="pi pi-info-circle text-sm"></i>
                            <span class="text-sm">系统通知无法回复</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 美化滚动条 */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

.dark .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}
</style>
