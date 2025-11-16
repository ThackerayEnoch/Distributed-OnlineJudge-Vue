<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { markNotificationsAsRead, loadUnreadNotifications } from '../api/messageAPI';
import type { Message } from '../entity/message';
import { MessagePriority } from '../entity/message';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import globalMessage from '@/common/utils/toast';
import OverlayBadge from 'primevue/overlaybadge';
import { APIError } from '@/common/entity/exception/APIException';

// 响应式数据
const messages = ref<Message[]>([]);
const unreadCount = ref<number>(0);
const isLoading = ref(false);
const showDropdown = ref(false);

// 获取优先级标签样式
const getPriorityClass = (priority: MessagePriority) => {
    switch (priority) {
        case MessagePriority.HIGH:
            return 'bg-red-500 text-white';
        case MessagePriority.MEDIUM:
            return 'bg-yellow-500 text-white';
        case MessagePriority.LOW:
            return 'bg-gray-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
};

// 获取优先级文本
const getPriorityText = (priority: MessagePriority) => {
    switch (priority) {
        case MessagePriority.HIGH:
            return '高';
        case MessagePriority.MEDIUM:
            return '中';
        case MessagePriority.LOW:
            return '低';
        default:
            return '低';
    }
};

// 格式化时间
const formatTime = (dateString: string) => {
    try {
        return formatDistanceToNow(new Date(dateString), {
            addSuffix: true,
            locale: zhCN
        });
    } catch (error) {
        return dateString;
    }
};

// 截断内容
const truncateContent = (content: string, maxLength: number = 60) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
};

const router = useRouter();

// 仅加载未读通知（通知专用）
const loadMessages = async () => {
    try {
        isLoading.value = true;
        const resp = await loadUnreadNotifications();
        const data = (resp as any).data || resp;
        if (Array.isArray(data)) {
            messages.value = data.map((m: any) => ({
                id: m.id,
                subject: m.subject,
                content: m.content,
                createTime: m.createTime,
                author: m.author,
                priority: m.priority || MessagePriority.LOW,
                isRead: !!m.isRead,
                isNotification: true
            }));
            unreadCount.value = messages.value.filter(m => !m.isRead).length;
        } else {
            messages.value = [];
            unreadCount.value = 0;
        }
    } catch (error) {
        console.error('加载通知失败:', error);
        // 轻降级：保持界面可用
        messages.value = [];
        unreadCount.value = 0;
    } finally {
        isLoading.value = false;
    }
};

// 标记通知为已读（单条）
const handleMarkAsRead = async (message: Message) => {
    if (message.isRead) return;
    try {
        await markNotificationsAsRead([message.id]);
        message.isRead = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (error) {
        console.error('标记通知已读失败:', error);
        globalMessage.error('操作失败', error instanceof APIError ? error.message : String(error));
    }
};

// 标记所有消息已读
const handleMarkAllAsRead = async () => {
    try {
        const ids = messages.value.filter(m => !m.isRead).map(m => m.id);
        if (ids.length > 0) {
            await markNotificationsAsRead(ids);
        }
        messages.value.forEach(msg => msg.isRead = true);
        unreadCount.value = 0;
        globalMessage.success('操作成功', '所有消息已标记为已读');
    } catch (error) {
        console.error('标记所有消息已读失败:', error);
        globalMessage.error('操作失败', '无法标记所有消息为已读');
    }
};

// 切换下拉菜单
const toggleDropdown = async () => {
    showDropdown.value = !showDropdown.value;
    if (showDropdown.value) {
        await loadMessages();
    }
};

const viewMessageDetail = (message: Message) => {
    // 不在这里标记为已读，导航到详情页，由详情页负责标记和展示
    router.push(`/messages/${message.id}`);
    showDropdown.value = false;
};

// 组件挂载时加载未读消息数量
onMounted(() => {
    // 尝试从后端获取未读消息
    // 初次挂载时预加载未读通知（非阻塞）
    loadMessages();
});

// 定义暴露给父组件的方法
defineExpose({
    loadMessages,
    unreadCount: computed(() => unreadCount.value),
});
</script>

<template>
    <div class="relative">
        <!-- 消息按钮：只有在有未读时显示 OverlayBadge，未读为 0 时只渲染图标 -->
        <template v-if="unreadCount > 0">
            <OverlayBadge severity="danger" :value="unreadCount" :badge="unreadCount" @click="toggleDropdown">
                <i class="pi pi-envelope layout-topbar-action" style="font-size: 1.25rem" />
            </OverlayBadge>
        </template>
        <template v-else>
            <span @click="toggleDropdown" class="cursor-pointer">
                <i class="pi pi-envelope layout-topbar-action" style="font-size: 1.25rem" />
            </span>
        </template>

        <!-- 下拉消息面板 -->
        <div v-show="showDropdown"
            class="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-fadeIn"
            @click.stop>
            <!-- 消息头部 -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    消息通知
                </h3>
                <div class="flex items-center gap-2">
                    <span v-if="unreadCount > 0" class="text-sm text-gray-500 dark:text-gray-400">
                        {{ unreadCount }} 条未读
                    </span>
                    <button v-if="unreadCount > 0" @click="handleMarkAllAsRead"
                        class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        全部已读
                    </button>
                </div>
            </div>

            <!-- 消息列表 -->
            <div class="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <div v-if="isLoading" class="flex justify-center items-center p-8">
                    <i class="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
                    <span class="ml-2 text-gray-500 dark:text-gray-400">加载中...</span>
                </div>

                <div v-else-if="messages.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
                    <i class="pi pi-inbox text-4xl mb-2 block text-gray-300 dark:text-gray-600"></i>
                    <p class="text-sm">暂无消息</p>
                </div>

                <div v-else>
                    <div v-for="message in messages" :key="message.id"
                        class="border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative message-item group"
                        @click="viewMessageDetail(message)">
                        <div class="p-4">
                            <!-- 消息头部：标题和优先级 -->
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex items-center gap-2 flex-1 min-w-0">
                                    <h4 class="font-medium text-gray-900 dark:text-white truncate text-sm"
                                        :class="{ 'font-bold': !message.isRead }">
                                        {{ message.subject }}
                                    </h4>
                                    <span
                                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                                        :class="getPriorityClass(message.priority)">
                                        {{ getPriorityText(message.priority) }}
                                    </span>
                                </div>
                                <div v-if="!message.isRead" class="w-2 h-2 bg-blue-500 rounded-full shrink-0 ml-2 mt-1">
                                </div>
                            </div>

                            <!-- 消息内容 -->
                            <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed"
                                :class="{ 'font-medium': !message.isRead }">
                                {{ truncateContent(message.content) }}
                            </p>

                            <!-- 消息元信息：作者和时间 -->
                            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-user text-xs"></i>
                                    系统消息
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-clock text-xs"></i>
                                    {{ formatTime(message.createTime) }}
                                </span>
                            </div>
                        </div>

                        <!-- 悬停时显示已读操作 -->
                        <div v-if="!message.isRead"
                            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity message-actions">
                            <button @click.stop="handleMarkAsRead(message)"
                                class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-1 py-0.5 rounded"
                                title="标记已读">
                                <i class="pi pi-check text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 消息底部 -->
            <div class="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                <router-link to="/messages"
                    class="block text-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    @click="showDropdown = false">
                    查看所有消息
                </router-link>
            </div>
        </div>

        <!-- 点击外部关闭下拉菜单的遮罩层 -->
        <div v-show="showDropdown" class="fixed inset-0 z-40" @click="showDropdown = false"></div>
    </div>
</template>

<style scoped>
.layout-topbar-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    transition: background-color 0.15s ease-in-out;
    /* 确保顶部栏按钮可溢出以显示徽章 */
}

.layout-topbar-action:hover {
    background-color: rgb(243 244 246);
}

:global(.dark) .layout-topbar-action:hover {
    background-color: rgb(55 65 81);
}

/* 添加动画效果 */
.animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 自定义滚动条 */
.scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: rgb(209 213 219) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgb(209 213 219);
    border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: rgb(156 163 175);
}

:global(.dark) .scrollbar-thin {
    scrollbar-color: rgb(75 85 99) transparent;
}

:global(.dark) .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgb(75 85 99);
}

:global(.dark) .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: rgb(107 114 128);
}

/* 为消息项添加组样式以支持悬停效果 */
.message-item:hover .message-actions {
    opacity: 1;
}

/* 徽章置顶并且不捕获指针事件，避免阻挡按钮点击 */
.badge-z {
    z-index: 60;
    pointer-events: none;
}
</style>
