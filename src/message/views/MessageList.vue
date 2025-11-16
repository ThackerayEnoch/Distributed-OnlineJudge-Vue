<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/common/utils/store';
import { useRouter } from 'vue-router';
import { markNotificationsAsRead, loadNotifications, loadMails, getNotificationsCount, getMailsCount, deleteNotifications } from '../api/messageAPI';
import type { Message } from '../entity/message';
import { MessagePriority } from '../entity/message';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import globalMessage from '@/common/utils/toast';
import Avatar from 'primevue/avatar';

const router = useRouter();
const userStore = useUserStore();
const currentUserId = computed(() => userStore.currentUser.userId);

// 状态
const messages = ref<Message[]>([]);
const loading = ref(false);
const selectedMessages = ref<number[]>([]);
const searchKeyword = ref('');
const filterType = ref<'all' | 'unread' | 'notifications' | 'messages'>('all');

// 新增切换：默认显示通知
const showNotifications = ref(true);
const pageSize = 20;
const currentPage = ref(1);
const totalCount = ref(100); // 临时占位，总数先使用100

// 过滤后的消息
const filteredMessages = computed(() => {
    let result = messages.value;

    if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        result = result.filter(m =>
            m.subject.toLowerCase().includes(keyword) ||
            m.content.toLowerCase().includes(keyword) ||
            m.author.toLowerCase().includes(keyword)
        );
    }

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

const stats = computed(() => {
    const total = messages.value.length;
    const unread = messages.value.filter(m => !m.isRead).length;
    const notifications = messages.value.filter(m => m.isNotification).length;
    const personalMessages = total - notifications;
    return { total, unread, notifications, personalMessages };
});

const totalPages = computed(() => Math.max(1, Math.ceil((totalCount.value || 0) / pageSize)));

const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    loadMessages();
};

const getPriorityClass = (priority: MessagePriority) => {
    switch (priority) {
        case MessagePriority.HIGH:
            return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
        case MessagePriority.MEDIUM:
            return 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
        case MessagePriority.LOW:
        default:
            return 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
};

const getPriorityInfo = (priority: MessagePriority) => {
    switch (priority) {
        case MessagePriority.HIGH:
            return { text: '高', icon: 'pi-exclamation-triangle' };
        case MessagePriority.MEDIUM:
            return { text: '中', icon: 'pi-info-circle' };
        case MessagePriority.LOW:
        default:
            return { text: '低', icon: 'pi-minus' };
    }
};

const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const displayAuthor = (m: Message) => {
    // 后端提供的是上帝视角：userId/author(发送者)、receiver/receiverNickname
    const curId = currentUserId.value ?? 0;
    // @ts-ignore
    const userId = (m as any).authorId ?? (m as any).userId;
    // @ts-ignore
    const receiver = (m as any).toId ?? (m as any).receiver;
    // @ts-ignore
    const receiverNickname = (m as any).toName ?? (m as any).receiverName ?? (m as any).receiverNickname;

    // 如果当前用户是发送者，显示接收者昵称（对方）
    if (userId && userId === curId) return receiverNickname ?? '我';
    // 如果当前用户是接收者，显示发送者名字（对方）
    if (receiver && receiver === curId) return m.author || '我';
    // 否则默认显示发送者名字
    return m.author || receiverNickname || '';
}

const formatTime = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (hours < 1) return '刚刚';
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
    } catch (error) {
        return dateString;
    }
};

// 加载消息（分页大小固定 20）
const loadMessages = async () => {
    try {
        loading.value = true;
        const offset = (currentPage.value - 1) * pageSize;
        if (showNotifications.value) {
            const resp = await loadNotifications(offset, pageSize, 2, searchKeyword.value);
            const data = (resp as any).data || resp;
            messages.value = Array.isArray(data) ? (data as unknown as Message[]) : [];
            // 排序：未读优先，然后按时间降序
            messages.value.sort((a, b) => {
                const aUnread = a.isRead ? 1 : 0;
                const bUnread = b.isRead ? 1 : 0;
                if (aUnread !== bUnread) return aUnread - bUnread;
                const at = Date.parse(a.createTime || '') || 0;
                const bt = Date.parse(b.createTime || '') || 0;
                return bt - at;
            });
            try {
                const countResp = await getNotificationsCount(2, searchKeyword.value);
                const count = (countResp as any).data ?? countResp;
                totalCount.value = Number(count) || 0;
            } catch (e) {
                // ignore count errors, keep previous totalCount
            }
        } else {
            const resp = await loadMails(offset, 2, searchKeyword.value);
            const data = (resp as any).data || resp;
            // data is MailVO[] (上帝视角)，映射为前端 Message
            if (Array.isArray(data)) {
                messages.value = data.map((m: any) => ({
                    id: m.id,
                    subject: m.subject ?? '',
                    content: m.content ?? '',
                    createTime: m.createTime ? new Date(m.createTime).toISOString() : new Date().toISOString(),
                    author: m.author ?? '',
                    // 保留后端字段以便视角转换
                    // @ts-ignore
                    authorId: m.userId ?? m.authorId,
                    // @ts-ignore
                    toId: m.receiver ?? m.toId,
                    // @ts-ignore
                    toName: m.receiverNickname ?? m.toName ?? m.receiverName,
                    priority: m.priority ?? MessagePriority.LOW,
                    isRead: !!m.isRead,
                    isNotification: !!m.type && m.type === 'NOTIFICATION',
                    replies: []
                } as unknown as Message));
            } else {
                messages.value = [];
            }
            try {
                const countResp = await getMailsCount(2, searchKeyword.value);
                const count = (countResp as any).data ?? countResp;
                totalCount.value = Number(count) || 0;
            } catch (e) {
                // ignore count errors
            }
            // 排序：未读优先，然后按时间降序
            messages.value.sort((a, b) => {
                const aUnread = a.isRead ? 1 : 0;
                const bUnread = b.isRead ? 1 : 0;
                if (aUnread !== bUnread) return aUnread - bUnread;
                const at = Date.parse(a.createTime || '') || 0;
                const bt = Date.parse(b.createTime || '') || 0;
                return bt - at;
            });
        }
    } catch (error) {
        console.error('加载消息失败:', error);
        globalMessage.error('加载失败', '无法加载消息列表');
    } finally {
        loading.value = false;
    }
};

const handleMarkAsRead = async (message: Message) => {
    if (message.isRead) return;
    try {
        // 仅允许标记属于当前用户的通知为已读
        const curId = currentUserId.value ?? 0;
        // @ts-ignore
        const receiver = (message as any).toId ?? (message as any).receiver;
        if (message.isNotification) {
            if (!receiver || receiver !== curId) {
                globalMessage.error('操作受限', '只能标记属于您自己的通知为已读');
                return;
            }
            await markNotificationsAsRead([message.id]);
        }
        message.isRead = true;
        globalMessage.success('操作成功', '消息已标记为已读');
    } catch (error) {
        console.error('标记消息已读失败:', error);
        globalMessage.error('操作失败', '无法标记消息为已读');
    }
};

const handleBatchMarkAsRead = async () => {
    if (selectedMessages.value.length === 0) return;
    try {
        const ids = selectedMessages.value.slice();
        const curId = currentUserId.value ?? 0;
        // 只选择属于当前用户的通知
        const validIds = messages.value.filter(m => ids.includes(m.id) && m.isNotification && (((m as any).toId ?? (m as any).receiver) === curId)).map(m => m.id);
        if (validIds.length === 0) {
            globalMessage.error('操作受限', '所选项中没有属于您的通知可以标为已读');
            return;
        }
        await markNotificationsAsRead(validIds);
        messages.value.forEach(m => {
            if (validIds.includes(m.id)) m.isRead = true;
        });
        // 清除已处理的选中项
        selectedMessages.value = selectedMessages.value.filter(id => !validIds.includes(id));
        globalMessage.success('操作成功', `已标记 ${validIds.length} 条通知为已读`);
        const skipped = ids.length - validIds.length;
        if (skipped > 0) globalMessage.info('部分未处理', '部分所选项非您的通知，已跳过');
    } catch (error) {
        console.error('批量标记已读失败:', error);
        globalMessage.error('操作失败', '无法批量标记消息为已读');
    }
};

const handleBatchDelete = async () => {
    if (selectedMessages.value.length === 0) return;
    try {
        const ids = selectedMessages.value.slice();
        // 只允许删除通知类型，过滤出 messages 中标记为 isNotification 的 id
        const notifIds = messages.value.filter(m => ids.includes(m.id) && m.isNotification).map(m => m.id);

        if (notifIds.length === 0) {
            globalMessage.error('操作受限', '只能删除通知类消息，聊天消息无法删除');
            return;
        }

        // 使用后端批量删除通知接口
        await deleteNotifications(notifIds);

        // 从列表中移除已删除的通知
        messages.value = messages.value.filter(m => !notifIds.includes(m.id));
        totalCount.value = Math.max(0, (Number(totalCount.value) || 0) - notifIds.length);
        // 清理已选项（去掉成功删除的）
        selectedMessages.value = selectedMessages.value.filter(id => !notifIds.includes(id));
        globalMessage.success('操作成功', `已删除 ${notifIds.length} 条通知`);
        // 如果同时包含不可删除的聊天，提示用户
        const nonDeletable = ids.filter(id => !notifIds.includes(id));
        if (nonDeletable.length > 0) {
            globalMessage.info('部分未删除', '聊天消息无法删除，已跳过这些项');
        }
    } catch (error) {
        console.error('批量删除失败:', error);
        globalMessage.error('操作失败', '无法批量删除消息');
    }
};
// end of handleBatchDelete

const handleDeleteMessage = async (messageId: number) => {
    try {
        const msg = messages.value.find(m => m.id === messageId);
        if (!msg) return;
        if (!msg.isNotification) {
            globalMessage.error('操作受限', '聊天消息无法删除');
            return;
        }

        await deleteNotifications([messageId]);
        messages.value = messages.value.filter(m => m.id !== messageId);
        selectedMessages.value = selectedMessages.value.filter(id => id !== messageId);
        totalCount.value = Math.max(0, (Number(totalCount.value) || 0) - 1);
        globalMessage.success('操作成功', '通知已删除');
    } catch (error) {
        console.error('删除消息失败:', error);
        globalMessage.error('操作失败', '无法删除消息');
    }
};

const viewMessageDetail = (messageId: number) => {
    router.push(`/messages/${messageId}`);
};

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
    <div class="w-full p-4">
        <!-- 顶部控制栏：切换、批量操作、刷新 -->
        <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="inline-flex rounded-md shadow-sm" role="group">
                    <button @click="showNotifications = true; currentPage = 1; loadMessages()"
                        :class="['px-3 py-1 text-sm font-medium', showNotifications ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700']">
                        通知
                    </button>
                    <button @click="showNotifications = false; currentPage = 1; loadMessages()"
                        :class="['px-3 py-1 text-sm font-medium', !showNotifications ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700']">
                        消息
                    </button>
                </div>

                <div class="flex items-center gap-2">
                    <button @click="handleBatchMarkAsRead"
                        class="px-3 py-1 text-sm bg-green-50 text-green-700 rounded">标为已读</button>
                    <button @click="handleBatchDelete"
                        class="px-3 py-1 text-sm bg-red-50 text-red-700 rounded">删除</button>
                </div>

                <!-- 全选 + 统计 -->
                <div class="flex items-center gap-3 ml-2">
                    <input type="checkbox"
                        :checked="selectedMessages.length === filteredMessages.length && filteredMessages.length > 0"
                        @change="toggleSelectAll" class="w-4 h-4 rounded border-gray-300 text-blue-600" />
                    <div class="text-sm text-gray-500">总计 {{ totalCount }} / 未读 {{ stats.unread }} / 通知 {{
                        stats.notifications }}</div>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">已选择 {{ selectedMessages.length }} 条</span>
                <button @click="loadMessages" class="px-3 py-1 text-sm bg-gray-100 rounded">刷新</button>
            </div>
        </div>

        <!-- 主要内容 -->
        <div v-if="loading" class="flex items-center justify-center py-20">
            <div class="text-gray-600">正在加载消息列表...</div>
        </div>

        <div v-else-if="filteredMessages.length === 0" class="text-center py-20 text-gray-500">
            暂无消息
        </div>

        <div v-else class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div v-for="message in filteredMessages" :key="message.id"
                class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 overflow-hidden group cursor-pointer"
                @click="viewMessageDetail(message.id)">
                <div class="p-4 pb-3">
                    <div class="flex items-start justify-between mb-3">
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

                        <div class="flex items-center gap-2 flex-shrink-0">
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                                :class="getPriorityClass(message.priority)">
                                <i :class="`pi ${getPriorityInfo(message.priority).icon} text-xs`"></i>
                                {{ getPriorityInfo(message.priority).text }}
                            </span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between mb-2 text-sm">
                        <div class="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                            <span>{{ displayAuthor(message) }}</span>
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                :class="message.isNotification ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'">
                                {{ message.isNotification ? '通知' : '消息' }}
                            </span>
                        </div>
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(message.createTime)
                        }}</span>
                    </div>

                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1"
                        :class="{ 'font-bold': !message.isRead }">{{ message.subject }}</h4>
                    <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-3">{{
                        truncateText(message.content) }}</p>

                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span v-if="message.replies && message.replies.length > 0"
                                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                                <i class="pi pi-comment text-xs"></i>
                                {{ message.replies.length }}
                            </span>
                        </div>
                        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button v-if="!message.isRead" @click.stop="handleMarkAsRead(message)"
                                class="p-1.5 text-green-600 hover:text-green-800 rounded-md" title="标记已读"><i
                                    class="pi pi-check text-xs"></i></button>
                            <button v-if="message.isNotification" @click.stop="handleDeleteMessage(message.id)"
                                class="p-1.5 text-red-600 hover:text-red-800 rounded-md" title="删除消息"><i
                                    class="pi pi-trash text-xs"></i></button>
                        </div>
                    </div>
                </div>
                <div v-if="!message.isRead" class="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            </div>
        </div>

        <!-- 分页控件 -->
        <div class="mt-4 flex items-center justify-end gap-3">
            <button :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)"
                class="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">上一页</button>
            <span class="text-sm text-gray-500">第 {{ currentPage }} / {{ totalPages }} 页</span>
            <button :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)"
                class="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">下一页</button>
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
