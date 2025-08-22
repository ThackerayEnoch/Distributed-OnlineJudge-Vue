<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { markMessageAsRead, deleteMessage } from '../api/messageAPI';
import type { Message } from '../entity/message';
import { MessagePriority } from '../entity/message';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import globalMessage from '@/common/utils/toast';
import Avatar from 'primevue/avatar';

const router = useRouter();

// 响应式数据
const messages = ref<Message[]>([]);
const loading = ref(false);
const selectedMessages = ref<number[]>([]);
const searchKeyword = ref('');
const filterType = ref<'all' | 'unread' | 'notifications' | 'messages'>('all');

// 过滤后的消息列表
const filteredMessages = computed(() => {
    let result = messages.value;

    // 搜索过滤
    if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(m =>
            m.subject.toLowerCase().includes(keyword) ||
            m.content.toLowerCase().includes(keyword) ||
            m.author.toLowerCase().includes(keyword)
        );
    }

    // 类型过滤
    switch (filterType.value) {
        case 'unread':
            result = result.filter(m => !m.isRead);
            break;
        case 'notifications':
            result = result.filter(m => m.isNotification);
            break;
        case 'messages':
            result = result.filter(m => !m.isNotification);
            break;
    }

    return result;
});

// 统计信息
const stats = computed(() => {
    const total = messages.value.length;
    const unread = messages.value.filter(m => !m.isRead).length;
    const notifications = messages.value.filter(m => m.isNotification).length;
    const personalMessages = total - notifications;

    return {
        total,
        unread,
        notifications,
        personalMessages
    };
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

// 获取优先级信息
const getPriorityInfo = (priority: MessagePriority) => {
    switch (priority) {
        case MessagePriority.HIGH:
            return { text: '高', icon: 'pi-exclamation-triangle' };
        case MessagePriority.MEDIUM:
            return { text: '中', icon: 'pi-info-circle' };
        case MessagePriority.LOW:
            return { text: '低', icon: 'pi-minus' };
        default:
            return { text: '普通', icon: 'pi-minus' };
    }
};

// 截断文本
const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// 格式化时间
const formatTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (hours < 1) {
            return '刚刚';
        } else if (hours < 24) {
            return `${hours}小时前`;
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return formatDistanceToNow(date, {
                addSuffix: true,
                locale: zhCN
            });
        }
    } catch (error) {
        return dateString;
    }
};

// 加载消息
const loadMessages = async () => {
    try {
        loading.value = true;

        // 模拟数据
        const mockMessages: Message[] = [
            {
                id: 1,
                subject: '系统维护通知',
                content: '系统将于今晚23:00-01:00进行例行维护，期间可能会出现短暂的服务中断，请提前保存您的工作进度。维护期间，在线判题服务将暂停，请合理安排提交时间。如有紧急问题，请联系管理员。',
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
                        content: '同学你好，这种情况通常是由于输入输出格式不匹配等原因...',
                        author: '张教授',
                        createTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                        isFromUser: false
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
                content: '亲爱的用户，我们很高兴地宣布平台新增了代码对比功能，可以方便地比较不同提交版本之间的差异，提升调试效率。同时优化了界面体验。',
                createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                author: '开发团队',
                priority: MessagePriority.LOW,
                isRead: true,
                isNotification: true,
                replies: []
            }
        ];

        messages.value = mockMessages;

    } catch (error) {
        console.error('加载消息失败:', error);
        globalMessage.error('加载失败', '无法加载消息列表');
    } finally {
        loading.value = false;
    }
};

// 标记消息已读
const handleMarkAsRead = async (message: Message) => {
    if (message.isRead) return;

    try {
        await markMessageAsRead(message.id);
        message.isRead = true;
        globalMessage.success('操作成功', '消息已标记为已读');
    } catch (error) {
        console.error('标记消息已读失败:', error);
        globalMessage.error('操作失败', '无法标记消息为已读');
    }
};

// 批量标记已读
const handleBatchMarkAsRead = async () => {
    if (selectedMessages.value.length === 0) return;

    try {
        const count = selectedMessages.value.length;
        for (const msgId of selectedMessages.value) {
            await markMessageAsRead(msgId);
            const message = messages.value.find(m => m.id === msgId);
            if (message) {
                message.isRead = true;
            }
        }
        selectedMessages.value = [];
        globalMessage.success('操作成功', `已标记 ${count} 条消息为已读`);
    } catch (error) {
        console.error('批量标记已读失败:', error);
        globalMessage.error('操作失败', '无法批量标记消息为已读');
    }
};

// 批量删除
const handleBatchDelete = async () => {
    if (selectedMessages.value.length === 0) return;

    try {
        const count = selectedMessages.value.length;
        for (const msgId of selectedMessages.value) {
            await deleteMessage(msgId);
        }

        messages.value = messages.value.filter(m => !selectedMessages.value.includes(m.id));
        selectedMessages.value = [];
        globalMessage.success('操作成功', `已删除 ${count} 条消息`);
    } catch (error) {
        console.error('批量删除失败:', error);
        globalMessage.error('操作失败', '无法批量删除消息');
    }
};

// 删除消息
const handleDeleteMessage = async (messageId: number) => {
    try {
        await deleteMessage(messageId);
        messages.value = messages.value.filter(m => m.id !== messageId);
        selectedMessages.value = selectedMessages.value.filter(id => id !== messageId);
        globalMessage.success('操作成功', '消息已删除');
    } catch (error) {
        console.error('删除消息失败:', error);
        globalMessage.error('操作失败', '无法删除消息');
    }
};

// 查看消息详情
const viewMessageDetail = (messageId: number) => {
    router.push(`/messages/${messageId}`);
};

// 全选/取消全选
const toggleSelectAll = () => {
    if (selectedMessages.value.length === filteredMessages.value.length) {
        selectedMessages.value = [];
    } else {
        selectedMessages.value = filteredMessages.value.map((m: Message) => m.id);
    }
};

onMounted(() => {
    loadMessages();
});
</script>

<template>
    <div class="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        <!-- 顶部导航栏 -->
        <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">消息中心</h1>
                        <div class="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>共 {{ stats.total }} 条消息</span>
                            <span v-if="stats.unread > 0"
                                class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                                {{ stats.unread }} 条未读
                            </span>
                        </div>
                    </div>

                    <!-- 搜索框 -->
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <i
                                class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                            <input v-model="searchKeyword" type="text" placeholder="搜索消息..."
                                class="pl-10 pr-4 py-2 w-80 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm">
                        </div>

                        <!-- 过滤器 -->
                        <select v-model="filterType"
                            class="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm">
                            <option value="all">全部消息</option>
                            <option value="unread">未读消息</option>
                            <option value="notifications">系统通知</option>
                            <option value="messages">私人消息</option>
                        </select>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <!-- 批量操作 -->
                    <div v-if="selectedMessages.length > 0" class="flex items-center gap-2">
                        <button @click="handleBatchMarkAsRead"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm font-medium">
                            <i class="pi pi-check text-sm"></i>
                            标记已读
                        </button>

                        <button @click="handleBatchDelete"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors text-sm font-medium">
                            <i class="pi pi-trash text-sm"></i>
                            删除
                        </button>

                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            已选择 {{ selectedMessages.length }} 条消息
                        </span>
                    </div>

                    <button @click="loadMessages"
                        class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium">
                        <i class="pi pi-refresh text-sm"></i>
                        刷新
                    </button>
                </div>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="flex-1 p-6 overflow-auto">
            <!-- 加载状态 -->
            <div v-if="loading" class="flex items-center justify-center py-20">
                <div class="flex flex-col items-center gap-4">
                    <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p class="text-gray-600 dark:text-gray-400">正在加载消息列表...</p>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-else-if="filteredMessages.length === 0" class="flex flex-col items-center justify-center py-20">
                <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <i class="pi pi-inbox text-4xl text-gray-400"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {{ searchKeyword || filterType !== 'all' ? '没有找到匹配的消息' : '暂无消息' }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    {{ searchKeyword || filterType !== 'all' ? '尝试调整搜索条件或过滤器' : '您的消息箱是空的，当有新消息时会显示在这里。' }}
                </p>
            </div>

            <!-- 消息网格 -->
            <div v-else>
                <!-- 批量选择控制栏 -->
                <div class="mb-4 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox"
                                :checked="selectedMessages.length === filteredMessages.length && filteredMessages.length > 0"
                                :indeterminate="selectedMessages.length > 0 && selectedMessages.length < filteredMessages.length"
                                @change="toggleSelectAll"
                                class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                            <span class="text-sm text-gray-700 dark:text-gray-300">全选</span>
                        </label>

                        <div class="text-sm text-gray-500 dark:text-gray-400">
                            共找到 {{ filteredMessages.length }} 条消息
                        </div>
                    </div>

                    <!-- 排序选项 -->
                    <div class="flex items-center gap-2 text-sm">
                        <span class="text-gray-500 dark:text-gray-400">排序：</span>
                        <button
                            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                            最新优先
                        </button>
                    </div>
                </div>

                <!-- 消息卡片网格 -->
                <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    <div v-for="message in filteredMessages" :key="message.id"
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 overflow-hidden group cursor-pointer"
                        @click="viewMessageDetail(message.id)">

                        <!-- 卡片头部 -->
                        <div class="p-4 pb-3">
                            <div class="flex items-start justify-between mb-3">
                                <!-- 左侧选择和头像 -->
                                <div class="flex items-start gap-3">
                                    <div class="pt-0.5">
                                        <input v-model="selectedMessages" :value="message.id" type="checkbox"
                                            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            @click.stop />
                                    </div>

                                    <div class="relative">
                                        <Avatar :icon="message.isNotification ? 'pi pi-bell' : 'pi pi-user'" :style="{
                                            backgroundColor: message.isNotification ? '#3b82f6' : '#10b981',
                                            color: 'white'
                                        }" />
                                        <div v-if="!message.isRead"
                                            class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800">
                                        </div>
                                    </div>
                                </div>

                                <!-- 右侧时间和优先级 -->
                                <div class="flex items-center gap-2 flex-shrink-0">
                                    <span
                                        class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                                        :class="getPriorityClass(message.priority)">
                                        <i :class="`pi ${getPriorityInfo(message.priority).icon} text-xs`"></i>
                                        {{ getPriorityInfo(message.priority).text }}
                                    </span>
                                </div>
                            </div>

                            <!-- 发送者和时间 -->
                            <div class="flex items-center justify-between mb-2 text-sm">
                                <div class="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                    <span>{{ message.author }}</span>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                        :class="message.isNotification ?
                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'">
                                        {{ message.isNotification ? '通知' : '消息' }}
                                    </span>
                                </div>
                                <span class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ formatTime(message.createTime) }}
                                </span>
                            </div>

                            <!-- 消息标题 -->
                            <h4 class="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1"
                                :class="{ 'font-bold': !message.isRead }">
                                {{ message.subject }}
                            </h4>

                            <!-- 消息预览 -->
                            <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-3">
                                {{ truncateText(message.content) }}
                            </p>

                            <!-- 底部标签和操作 -->
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span v-if="message.replies && message.replies.length > 0"
                                        class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        <i class="pi pi-comment text-xs"></i>
                                        {{ message.replies.length }}
                                    </span>
                                </div>

                                <!-- 操作按钮 -->
                                <div
                                    class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button v-if="!message.isRead" @click.stop="handleMarkAsRead(message)"
                                        class="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                                        title="标记已读">
                                        <i class="pi pi-check text-xs"></i>
                                    </button>

                                    <button @click.stop="handleDeleteMessage(message.id)"
                                        class="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                        title="删除消息">
                                        <i class="pi pi-trash text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 未读指示条 -->
                        <div v-if="!message.isRead" class="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
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

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 美化滚动条 */
.overflow-auto::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

.dark .overflow-auto::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
}

.dark .overflow-auto::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
}

.dark .overflow-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* indeterminate 样式 */
input[type="checkbox"]:indeterminate {
    background-color: #3b82f6;
    border-color: #3b82f6;
}

input[type="checkbox"]:indeterminate::before {
    content: '—';
    color: white;
    font-size: 12px;
    font-weight: bold;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
