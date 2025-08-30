<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useUserStore } from '@/common/utils/store';
import { useRouter, useRoute } from 'vue-router';
import { getMailDetail, sendMail, loadNotifications, loadMails, getNotificationsCount, getMailsCount, markNotificationsAsRead, type SendMailDTO } from '../api/messageAPI';
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
const loading = ref(false); // legacy (kept for compatibility)
const loadingDetail = ref(false); // 仅用于详情加载，不影响左侧列表的 loadingList
// 左侧列表单独 loading 与分页控制
const loadingList = ref(false);
const showNotifications = ref(true);
const pageSize = 20;
const currentPage = ref(1);
const totalCount = ref(0);
const searchKeyword = ref('');
const replyContent = ref('');
const isSending = ref(false);
const repliesContainer = ref<HTMLElement>();

const isNewConversation = ref(false);
const newConversationTo = ref<string | undefined>(undefined);
const newConversationToId = ref<number | undefined>(undefined);
const newConversationSubject = ref('');

// 获取当前用户信息（从 pinia store）
const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);

// 判断是否为通知（系统管理员发送的消息）；新会话不是通知
const isNotification = computed(() => {
    if (isNewConversation.value) return false;
    // 优先使用后端标志，其次判断 author 名称
    if (selectedMessage.value?.isNotification) return true;
    const authorName = selectedMessage.value?.author ?? '';
    return authorName === '系统管理员' || authorName === '开发团队';
});

// 获取消息类型文本
const getMessageType = computed(() => {
    return isNotification.value ? '系统通知' : '私人消息';
});

// 显示用的对方名称（新会话用 query 的 toNick）；详情中优先显示 toName/receiverName，视角转换为“我”由 UI 使用 authorId/toId/currentUserId 决定
const displayAuthor = computed(() => {
    if (isNewConversation.value) return newConversationTo.value ?? '新对话';
    const curId = currentUser.value?.userId ?? 0;
    const msg = selectedMessage.value;
    if (!msg) return '';
    // 如果当前用户是作者，则显示接收者昵称；否则显示作者名
    if (msg.authorId && msg.authorId === curId) {
        return (msg.toName && msg.toName.trim()) ? msg.toName : (msg.receiverName && msg.receiverName.trim() ? msg.receiverName : (msg.author || ''));
    }
    return msg.author || '';
});

const displaySubject = computed(() => {
    if (isNewConversation.value) return '';
    return selectedMessage.value?.subject ?? '';
});

const displayContent = computed(() => {
    if (isNewConversation.value) return '';
    return selectedMessage.value?.content ?? '';
});

// 获取本会话中“对方”的显示名（如果当前用户是发送者则返回接收者昵称，反之返回发送者昵称）
const getCounterpartName = () => {
    const curId = currentUser.value?.userId ?? 0;
    const msg = selectedMessage.value;
    if (!msg) return '';
    // @ts-ignore
    const authorId = (msg as any).authorId ?? (msg as any).userId;
    // @ts-ignore
    const receiverName = (msg as any).toName ?? (msg as any).receiverName ?? (msg as any).receiverNickname;

    if (authorId && authorId === curId) {
        // 我是发送者，对方为接收者
        return receiverName ?? '';
    }
    // 我可能是接收者或第三方，显示发送者名称
    return msg.author ?? '';
};

// 回复显示名：如果该回复来自当前用户，显示我的昵称；否则显示对方昵称（基于会话）
const replyDisplayName = (reply: any) => {
    const curId = currentUser.value?.userId ?? 0;
    if (reply.authorId && reply.authorId === curId) {
        return currentUser.value?.nickname ?? currentUser.value?.username ?? '我';
    }
    // 如果 reply 中有 author 字段且不是我，则直接返回；否则回退到会话对方名
    if (reply.author && String(reply.author).trim()) return reply.author;
    return getCounterpartName();
};

// 判断父消息是否由当前用户发送（全局规则：若 receiver !== currentUserId 则视为我方发送）
const isParentFromCurrentUser = computed(() => {
    const curId = currentUser.value?.userId ?? 0;
    const msg = selectedMessage.value;
    if (!msg) return false;
    // 优先使用 toId 字段，不存在时尝试回退字段名
    // 若 receiver 等于当前用户 id -> 则不是我发（对方发给我）
    const receiver = (msg as any).toId ?? (msg as any).receiver ?? 0;
    return Number(receiver) !== Number(curId);
});

// 父消息底部需要展示的名称：若 receiver == 当前用户 则显示 author（发送者）；否则显示我方昵称
const parentFooterName = computed(() => {
    const curId = currentUser.value?.userId ?? 0;
    const msg = selectedMessage.value;
    if (!msg) return '';
    const receiver = (msg as any).toId ?? (msg as any).receiver ?? 0;
    if (Number(receiver) === Number(curId)) {
        return msg.author ?? '';
    }
    return currentUser.value?.nickname ?? currentUser.value?.username ?? '我';
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

// 加载消息列表和详情（如果 route 中有 id，则从 API 获取详情）
const loadMessages = async () => {
    try {
        loading.value = true;

        const messageId = parseInt(route.params.id as string);
        // 支持 id=0 的新会话路由：/messages/0?to=nickname
        if (messageId === 0) {
            const to = route.query.toNick as string | undefined;
            const toId = route.query.toId as string | undefined;
            if (toId) newConversationToId.value = Number(toId);
            if (to || toId) {
                isNewConversation.value = true;
                newConversationTo.value = to ? decodeURIComponent(String(to)) : undefined;
                // 不去调用后端详情，等待用户填写并发送
                messages.value = [];
                selectedMessage.value = null;
                return;
            }
        }
        if (messageId) {
            // 从后端获取详情
            try {
                const resp = await getMailDetail(messageId);
                const data = (resp as any).data || resp;
                // data: MailDetailVO { parentMail: MailBO, childMails: MailBO[] }
                const currentUserId = currentUser.value?.userId ?? 0;
                const parent = data.parentMail as any;
                const children = Array.isArray(data.childMails) ? data.childMails as any[] : [];
                const otherName = parent?.receiverNickname || parent?.author || '';
                const isParentAuthorCurrentUser = !!parent.userId && parent.userId === currentUserId;
                const msg: Message = {
                    id: parent.id,
                    subject: parent.subject || '',
                    content: parent.content || '',
                    createTime: parent.createTime ? new Date(parent.createTime).toISOString() : new Date().toISOString(),
                    // 前端显示层面：如果作者是当前用户则显示 '我'，但保留 authorId/toName 用于头部显示逻辑
                    author: isParentAuthorCurrentUser ? '我' : (parent.author || otherName),
                    authorId: parent.userId,
                    toId: parent.receiver,
                    toName: parent.receiverNickname,
                    receiverName: parent.receiverNickname,
                    priority: parent.priority ?? MessagePriority.LOW,
                    // 发送/已读 状态
                    isSent: !!parent.isSent,
                    isRead: !!parent.isRead,
                    // 优先使用 MailDetailVO.isNotification；若未提供，则退回到 parent.type 或 author 名称判断
                    isNotification: !!data.isNotification || ((parent as any).type === 'NOTIFICATION') || (parent?.author === '系统管理员' || parent?.author === '开发团队'),
                    replies: children.map((c: any) => ({
                        id: c.id,
                        messageId: c.parentId ?? parent.id,
                        content: c.content,
                        author: (c.userId && c.userId === currentUserId) ? '我' : (c.author || ''),
                        authorId: c.userId,
                        createTime: c.createTime ? new Date(c.createTime).toISOString() : new Date().toISOString(),
                        isFromUser: (c.userId && c.userId === currentUserId),
                        isSent: !!c.isSent,
                        isRead: !!c.isRead
                    }))
                };

                // 不替换左侧列表，只设置为选中详情。
                // 对于通知类型：后端可能不会在 getMailDetail 自动标记（视实现），因此在这里确保通知被标记为已读。
                // 仅对通知调用标记接口，普通消息保持原有行为（前端不主动标记）。
                selectedMessage.value = msg;
                // 使用后端返回的已读状态同步左侧列表项（不调用 mark 接口）
                msg.isRead = !!parent.isRead;
                const idx = messages.value.findIndex(m => m.id === msg.id);
                if (idx >= 0) messages.value[idx].isRead = msg.isRead;
                // 如果这是通知且后端返回为未读，则主动调用后端标记为已读并更新 UI
                if (msg.isNotification && !msg.isRead) {
                    try {
                        await markNotificationsAsRead([msg.id]);
                        msg.isRead = true;
                        if (idx >= 0) messages.value[idx].isRead = true;
                    } catch (e) {
                        console.warn('标记通知已读失败', e);
                    }
                }
                nextTick(() => scrollToBottom());
                router.replace(`/messages/${msg.id}`);
                return;
            } catch (err) {
                console.warn('获取消息详情失败，回退到本地数据', err);
            }
        }

        // 回退：如果没有 id 或 API 不可用，保留当前 mock 行为（最小化）
        messages.value = [];

    } catch (error) {
        console.error('加载消息失败:', error);
        globalMessage.error('加载失败', '无法加载消息列表');
    } finally {
        loading.value = false;
    }
};

// 选择消息
const selectMessage = async (message: Message) => {
    // 点击列表项时，优先从后端拉取该会话的权威详情（仅设置详情 loading，不影响左侧列表）
    loadingDetail.value = true;
    try {
        const resp = await getMailDetail(message.id);
        const data = (resp as any).data || resp;
        const currentUserId = currentUser.value?.userId ?? 0;
        const parent = data.parentMail as any;
        const children = Array.isArray(data.childMails) ? data.childMails as any[] : [];
        const otherName = parent?.receiverNickname || parent?.author || '';
        const isParentAuthorCurrentUser = !!parent.userId && parent.userId === currentUserId;

        const msg: Message = {
            id: parent.id,
            subject: parent.subject || '',
            content: parent.content || '',
            createTime: parent.createTime ? new Date(parent.createTime).toISOString() : new Date().toISOString(),
            author: isParentAuthorCurrentUser ? '我' : (parent.author || otherName),
            authorId: parent.userId,
            toId: parent.receiver,
            toName: parent.receiverNickname,
            receiverName: parent.receiverNickname,
            isSent: !!parent.isSent,
            isRead: !!parent.isRead,
            priority: parent.priority ?? MessagePriority.LOW,
            // 同样在 selectMessage 路径中使用相同的判定规则
            isNotification: !!data.isNotification || ((parent as any).type === 'NOTIFICATION') || (parent?.author === '系统管理员' || parent?.author === '开发团队'),
            replies: children.map((c: any) => ({
                id: c.id,
                messageId: c.parentId ?? parent.id,
                content: c.content,
                author: (c.userId && c.userId === currentUserId) ? '我' : (c.author || ''),
                authorId: c.userId,
                createTime: c.createTime ? new Date(c.createTime).toISOString() : new Date().toISOString(),
                isFromUser: (c.userId && c.userId === currentUserId),
                isSent: !!c.isSent,
                isRead: !!c.isRead
            }))
        };

        // 不覆盖左侧消息列表，保持 messages.value 不变，直接设置选中消息
        selectedMessage.value = msg;

        // 后端会在 getMailDetail 中标记为已读（或非通知时不标记），前端仅使用返回的 isRead 并同步左侧列表项
        msg.isRead = !!parent.isRead;
        const idx = messages.value.findIndex(m => m.id === msg.id);
        if (idx >= 0) messages.value[idx].isRead = msg.isRead;
        // 若为通知且后端未标记，则主动标记为已读
        if (msg.isNotification && !msg.isRead) {
            try {
                await markNotificationsAsRead([msg.id]);
                msg.isRead = true;
                if (idx >= 0) messages.value[idx].isRead = true;
            } catch (e) {
                console.warn('标记通知已读失败', e);
            }
        }
        nextTick(() => scrollToBottom());
        router.replace(`/messages/${msg.id}`);
    } catch (err) {
        // 后端获取失败则回退到本地对象，保证 UX 不阻塞
        selectedMessage.value = message;
        // 不额外调用已读接口，保留本地状态或依赖后续同步
        message.isRead = !!message.isRead;
        nextTick(() => scrollToBottom());
        router.replace(`/messages/${message.id}`);
    } finally {
        loadingDetail.value = false;
    }
};



// 发送回复（调用 appendMailComment）
const sendReply = async () => {
    if (!replyContent.value.trim() || (!selectedMessage.value && !isNewConversation.value) || isSending.value) return;
    try {
        isSending.value = true;
        // 如果是新会话（路由为 /messages/0?to=nickname），调用 createMail
        if (isNewConversation.value) {
            try {
                // 构建后端期望的 CreateMailDTO
                const dto = {
                    parentId: undefined,
                    authorId: currentUser.value?.userId ?? 0,
                    receiver: newConversationToId?.value ?? 0,
                    subject: String(newConversationSubject.value.trim()).slice(0, 200),
                    content: replyContent.value.trim()
                } as SendMailDTO;

                try {
                    const resp = await sendMail(dto);
                    const newId = (resp as any).data ?? resp;
                    if (newId) {
                        replyContent.value = '';
                        newConversationSubject.value = '';
                        isNewConversation.value = false;
                        await router.replace(`/messages/${newId}`);
                        // loadMessages 会根据 route.params.id 拉取详情
                        await loadMessages();
                        globalMessage.success('发送成功', '消息已发送');
                        return;
                    }
                } catch (err: any) {
                    console.error('创建会话并发送失败:', err);
                    const msg = err?.message || (err?.response && err.response.data) || '无法发送消息';
                    globalMessage.error('发送失败', String(msg));
                    return;
                }


                // 如果后端没有返回 id，回退到本地显示（兼容）
                const assignedId = Date.now();
                const newMsg: Message = {
                    id: assignedId,
                    subject: '',
                    content: '',
                    createTime: new Date().toISOString(),
                    // 回退展示：将会话发起者显示为 '我' 以配合模板中对 '我' 的判断
                    author: '我',
                    // 记录当前用户 id 以便后续视角判断使用
                    authorId: currentUser.value?.userId,
                    priority: MessagePriority.LOW,
                    isRead: true,
                    isNotification: false,
                    replies: []
                };

                const firstReply: MessageReply = {
                    id: Date.now(),
                    messageId: newMsg.id,
                    content: replyContent.value.trim(),
                    author: currentUser.value?.nickname ?? currentUser.value?.username ?? '我',
                    createTime: new Date().toISOString(),
                    isFromUser: true
                };
                newMsg.replies!.push(firstReply);
                selectedMessage.value = newMsg;
                isNewConversation.value = false;
                replyContent.value = '';
                globalMessage.success('发送成功', '消息已发送');
                nextTick(() => scrollToBottom());
                return;
            } catch (err) {
                console.error('创建会话并发送失败:', err);
                globalMessage.error('发送失败', '无法发送消息');
                return;
            }
        }

        const messageId = selectedMessage!.value!.id;
        // 计算会话对方 id：如果父消息作者是当前用户，则对方为 toId；否则对方为 authorId
        const curId = currentUser.value?.userId ?? 0;
        const parentAuthorId = selectedMessage.value?.authorId ?? 0;
        const parentReceiverId = selectedMessage.value?.toId ?? 0;
        const counterpartId = (parentAuthorId && parentAuthorId === curId) ? parentReceiverId : (parentAuthorId || parentReceiverId);
        // 构建 SendMailDTO 用于回复：parentId 指定顶级邮件 id，receiver 固定为会话对方
        const receiverId = counterpartId || 0;
        if (!receiverId || receiverId === curId) {
            globalMessage.error('发送失败', '无法确定有效的接收者');
            isSending.value = false;
            return;
        }

        const dto = {
            parentId: messageId,
            authorId: curId,
            receiver: receiverId,
            subject: selectedMessage.value?.subject ?? '',
            content: replyContent.value.trim()
        } as SendMailDTO;

        try {
            await sendMail(dto);
        } catch (err: any) {
            console.error('发送回复失败:', err);
            const msg = err?.message || (err?.response && err.response.data) || '无法发送回复';
            globalMessage.error('发送失败', String(msg));
            isSending.value = false;
            return;
        }

        // 乐观追加一条回复，随后从后端刷新会话以获取权威数据（视角/评论列表）
        const newReply: MessageReply = {
            id: Date.now(),
            messageId: messageId,
            content: replyContent.value.trim(),
            author: currentUser.value?.nickname ?? currentUser.value?.username ?? '我',
            authorId: currentUser.value?.userId,
            createTime: new Date().toISOString(),
            isFromUser: true
        };
        const sm = selectedMessage.value;
        if (sm) {
            if (!sm.replies) sm.replies = [];
            sm.replies.push(newReply);
        }

        // 清空输入并短暂提示，随后刷新详情以确保视角与回复来自后端
        replyContent.value = '';
        globalMessage.success('发送成功', '您的回复已发送，正在同步最新消息');
        nextTick(() => scrollToBottom());

        // 从后端重新拉取详情（loadMessages 会使用 route.params.id）
        await loadMessages();
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

onMounted(async () => {
    // 加载左侧列表（分页）与右侧详情（如果 route 带 id）
    // 如果 route 带有 id（非新会话），优先通过后端获取该 id 的详情来判断是通知还是消息，再加载左侧列表
    messages.value = [];
    const messageId = Number(route.params.id || 0);
    if (messageId && messageId !== 0) {
        try {
            const resp = await getMailDetail(messageId);
            const data = (resp as any).data || resp;
            const parent = data.parentMail as any;
            const inferredIsNotification = !!data.isNotification || ((parent as any).type === 'NOTIFICATION') || (parent?.author === '系统管理员' || parent?.author === '开发团队');
            showNotifications.value = inferredIsNotification;
        } catch (e) {
            // 无法从后端判断则保持默认，不阻塞加载
            console.warn('无法根据 id 推断消息类型，使用默认侧栏：', e);
        }
    }
    // 根据上面的判断加载左侧列表与详情
    await loadList();
    await loadMessages();
});

const totalPages = computed(() => Math.max(1, Math.ceil((totalCount.value || 0) / pageSize)));

const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    loadList();
};

// 加载左侧列表（根据 showNotifications 切换使用不同后端接口）
const loadList = async () => {
    try {
        loadingList.value = true;
        const offset = (currentPage.value - 1) * pageSize;
        if (showNotifications.value) {
            const resp = await loadNotifications(offset, pageSize, 2, searchKeyword.value);
            const data = (resp as any).data || resp;
            messages.value = Array.isArray(data) ? (data as any).map((m: any) => ({
                id: m.id,
                subject: m.subject ?? '',
                content: m.content ?? '',
                createTime: m.createTime ? new Date(m.createTime).toISOString() : new Date().toISOString(),
                author: m.author ?? '',
                // 保留后端字段用于视角转换
                // @ts-ignore
                authorId: m.userId ?? m.authorId,
                // @ts-ignore
                toId: m.receiver ?? m.toId,
                // @ts-ignore
                toName: m.receiverNickname ?? m.toName ?? m.receiverName,
                priority: m.priority ?? MessagePriority.LOW,
                isRead: !!m.isRead,
                isNotification: true,
                replies: []
            } as unknown as Message)) : [];

            try {
                const countResp = await getNotificationsCount(2, searchKeyword.value);
                const count = (countResp as any).data ?? countResp;
                totalCount.value = Number(count) || 0;
            } catch (e) {
                // ignore
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
        } else {
            const resp = await loadMails(offset, 2, searchKeyword.value);
            const data = (resp as any).data || resp;
            if (Array.isArray(data)) {
                messages.value = data.map((m: any) => ({
                    id: m.id,
                    subject: m.subject ?? '',
                    content: m.content ?? '',
                    createTime: m.createTime ? new Date(m.createTime).toISOString() : new Date().toISOString(),
                    author: m.author ?? '',
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
                // ignore
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
    } catch (err) {
        console.error('加载左侧列表失败', err);
    } finally {
        loadingList.value = false;
    }
};
</script>
<template>
    <div class="w-full h-[calc(100vh-9rem)] flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <!-- 移动端消息列表 - 当没有选择消息时显示 -->
        <div v-if="!selectedMessage && !isNewConversation"
            class="w-full sm:hidden flex flex-col bg-white dark:bg-gray-800">
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
                        class="p-3 rounded-lg cursor-pointer transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-gray-700"
                        :class="{ 'font-medium': !message.isRead }" @click="selectMessage(message)">

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

        <!-- 左侧消息列表 - 响应式宽度，移动端隐藏 -->
        <div
            class="w-80 lg:w-80 md:w-64 sm:w-56 hidden sm:flex border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-col">
            <!-- 头部 - 响应式调整 -->
            <div class="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between mb-2 sm:mb-3">
                    <h2 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">消息中心</h2>
                    <div class="flex items-center gap-2">
                        <div class="inline-flex rounded-md shadow-sm mr-2" role="group">
                            <button @click="showNotifications = true; currentPage = 1; loadList()"
                                :class="['px-2 py-1 text-xs sm:text-sm font-medium', showNotifications ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700']">
                                通知
                            </button>
                            <button @click="showNotifications = false; currentPage = 1; loadList()"
                                :class="['px-2 py-1 text-xs sm:text-sm font-medium', !showNotifications ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700']">
                                消息
                            </button>
                        </div>
                        <button @click="goBack"
                            class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                            <i class="pi pi-times text-sm"></i>
                        </button>
                    </div>
                </div>
                <div class="flex items-center justify-between">
                    <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        共 {{ totalCount }} 条
                        <span v-if="messages.filter(m => !m.isRead).length > 0"
                            class="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {{messages.filter(m => !m.isRead).length}} 条未读
                        </span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)"
                            class="px-2 py-1 bg-gray-100 rounded disabled:opacity-50 text-xs">上一页</button>
                        <span class="text-xs text-gray-500">第 {{ currentPage }} / {{ totalPages }} 页</span>
                        <button :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)"
                            class="px-2 py-1 bg-gray-100 rounded disabled:opacity-50 text-xs">下一页</button>
                    </div>
                </div>
            </div>

            <!-- 消息列表 -->
            <div class="flex-1 overflow-y-auto">
                <div v-if="loading" class="flex items-center justify-center py-20">
                    <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>

                <div v-else class="space-y-1 p-1 sm:p-2">
                    <div v-for="message in messages" :key="message.id"
                        class="p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 group" :class="{
                            'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500': selectedMessage?.id === message.id,
                            'hover:bg-gray-50 dark:hover:bg-gray-700': selectedMessage?.id !== message.id,
                            'font-medium': !message.isRead
                        }" @click="selectMessage(message)">

                        <div class="flex items-start gap-2 sm:gap-3">
                            <!-- 头像和状态指示器 -->
                            <div class="relative flex-shrink-0">
                                <Avatar :icon="message.isNotification ? 'pi pi-bell' : 'pi pi-user'" size="small"
                                    :style="{
                                        backgroundColor: message.isNotification ? '#3b82f6' : '#10b981',
                                        color: 'white'
                                    }" />
                                <div v-if="!message.isRead"
                                    class="absolute -top-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800">
                                </div>
                            </div>

                            <!-- 消息内容 -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                        {{ message.author }}
                                    </span>
                                    <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-1 sm:ml-2">
                                        {{ formatShortTime(message.createTime) }}
                                    </span>
                                </div>

                                <h4 class="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-1 line-clamp-1"
                                    :class="{ 'font-semibold': !message.isRead }">
                                    {{ message.subject }}
                                </h4>

                                <p
                                    class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed hidden sm:block">
                                    {{ message.content }}
                                </p>

                                <!-- 标签 - 响应式隐藏部分 -->
                                <div class="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                                    <span
                                        class="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium"
                                        :class="getPriorityClass(message.priority)">
                                        <i :class="`pi ${getPriorityInfo(message.priority).icon} text-xs`"></i>
                                        <span class="hidden sm:inline">{{ getPriorityInfo(message.priority).text
                                            }}</span>
                                    </span>

                                    <span
                                        class="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium"
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

        <!-- 右侧消息详情 - 在小屏幕时占满全宽，隐藏左侧栏 -->
        <div class="flex-1 flex flex-col bg-white dark:bg-gray-800"
            :class="{ 'sm:flex': true, 'hidden': selectedMessage && 'block' }">
            <!-- 移动端返回按钮 -->
            <div v-if="selectedMessage" class="sm:hidden p-4 border-b border-gray-200 dark:border-gray-700">
                <button @click="selectedMessage = null"
                    class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <i class="pi pi-arrow-left"></i>
                    <span>返回消息列表</span>
                </button>
            </div>

            <div v-if="!selectedMessage && !isNewConversation" class="flex-1 flex items-center justify-center">
                <div class="text-center p-4">
                    <div
                        class="w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <i class="pi pi-inbox text-2xl sm:text-3xl text-gray-400"></i>
                    </div>
                    <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">选择一条消息</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">从左侧列表中选择一条消息来查看详细内容</p>
                </div>
            </div>

            <div v-else class="flex-1 flex flex-col overflow-hidden">
                <!-- 消息头部 - 响应式调整 -->
                <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-start justify-between mb-3 sm:mb-4">
                        <div class="flex-1 min-w-0">
                            <h1
                                class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight break-words">
                                {{ displaySubject }}
                            </h1>

                            <div
                                class="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                <div class="flex items-center gap-2">
                                    <Avatar :icon="isNotification ? 'pi pi-bell' : 'pi pi-user'" size="small" :style="{
                                        backgroundColor: isNotification ? '#3b82f6' : '#10b981',
                                        color: 'white'
                                    }" />
                                    <div>
                                        <div class="font-medium text-gray-900 dark:text-gray-100">{{ displayAuthor }}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ getMessageType }}</div>
                                    </div>
                                </div>

                                <div class="flex items-center gap-1">
                                    <i class="pi pi-clock text-xs"></i>
                                    <span>{{ selectedMessage ? formatTime(selectedMessage.createTime) : '' }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0 mt-3 sm:mt-0">
                            <span
                                class="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium"
                                :class="getPriorityClass(selectedMessage ? selectedMessage.priority : MessagePriority.LOW)">
                                <i
                                    :class="`pi ${getPriorityInfo(selectedMessage ? selectedMessage.priority : MessagePriority.LOW).icon} text-xs`"></i>
                                <span class="hidden sm:inline">{{ getPriorityInfo(selectedMessage ?
                                    selectedMessage.priority : MessagePriority.LOW).text
                                }}</span>
                            </span>

                            <span v-if="selectedMessage && !selectedMessage.isRead"
                                class="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 text-xs sm:text-sm font-medium">
                                未读
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 消息内容和对话区域 -->
                <div class="flex-1 flex flex-col overflow-hidden">
                    <!-- 滚动区域 - 响应式间距 -->
                    <div ref="repliesContainer" class="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
                        <!-- 原始消息：隐藏空内容，按视角调整对齐与样式 -->
                        <div v-if="displayContent && displayContent.trim()" class="flex gap-3 sm:gap-4"
                            :class="{ 'flex-row-reverse': isParentFromCurrentUser }">
                            <Avatar
                                :icon="isParentFromCurrentUser ? 'pi pi-user' : (isNotification ? 'pi pi-bell' : 'pi pi-user')"
                                :style="{
                                    backgroundColor: isParentFromCurrentUser ? '#3b82f6' : (isNotification ? '#3b82f6' : '#10b981'),
                                    color: 'white'
                                }" />

                            <div class="max-w-[60ch] w-auto">
                                <div
                                    :class="isParentFromCurrentUser ? 'rounded-2xl p-3 sm:p-4 bg-blue-500 text-white rounded-tr-sm' : 'bg-gray-50 dark:bg-gray-700 rounded-2xl rounded-tl-sm p-3 sm:p-4'">
                                    <div class="prose prose-gray dark:prose-invert max-w-none">
                                        <div class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed break-words text-sm sm:text-base"
                                            :class="isParentFromCurrentUser ? 'text-white' : ''">
                                            {{ displayContent }}
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {{ selectedMessage ? (parentFooterName + ' · ' +
                                        formatTime(selectedMessage.createTime)) : '' }}
                                    <span v-if="selectedMessage && typeof selectedMessage.isSent !== 'undefined'"> · {{
                                        selectedMessage.isSent ? '已接收' : '未接收' }}</span>
                                    <span v-if="selectedMessage && typeof selectedMessage.isRead !== 'undefined'"> · {{
                                        selectedMessage.isRead ? '已读' : '未读' }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 回复列表 -->
                        <div v-if="selectedMessage && selectedMessage.replies && selectedMessage.replies.length > 0"
                            class="space-y-3 sm:space-y-4">
                            <div v-for="reply in (selectedMessage?.replies || [])" :key="reply.id"
                                class="flex gap-3 sm:gap-4" :class="{ 'flex-row-reverse': reply.isFromUser }">

                                <Avatar icon="pi pi-user" :style="{
                                    backgroundColor: reply.isFromUser ? '#3b82f6' : '#10b981',
                                    color: 'white'
                                }" />

                                <div class="max-w-[60ch] w-auto">
                                    <div class="rounded-2xl p-3 sm:p-4"
                                        :class="reply.isFromUser ?
                                            'bg-blue-500 text-white rounded-tr-sm' :
                                            'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'">
                                        <div
                                            class="whitespace-pre-wrap leading-relaxed break-words text-sm sm:text-base">
                                            {{ reply.content }}
                                        </div>
                                    </div>
                                    <div class="mt-2 text-xs text-gray-500 dark:text-gray-400"
                                        :class="{ 'text-right': reply.isFromUser }">
                                        {{ replyDisplayName(reply) }} · {{ formatTime(reply.createTime) }}
                                        <span v-if="typeof reply.isSent !== 'undefined'"> · {{ reply.isSent ? '已接收' :
                                            '未接收' }}</span>
                                        <span v-if="typeof reply.isRead !== 'undefined'"> · {{ reply.isRead ? '已读' :
                                            '未读' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 回复输入区域 - 固定在底部，响应式间距 -->
                    <div v-if="!isNotification"
                        class="flex-shrink-0 p-3 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                        <div class="flex gap-3 sm:gap-4">
                            <Avatar icon="pi pi-user" :style="{ backgroundColor: '#3b82f6', color: 'white' }" />

                            <div class="flex-1">
                                <div class="relative">
                                    <div v-if="isNewConversation" class="mb-2 text-xs text-gray-600 dark:text-gray-400">
                                        发送给：<span class="font-medium text-gray-900 dark:text-white">{{ newConversationTo
                                        }}</span>
                                    </div>
                                    <div v-if="isNewConversation" class="mb-3">
                                        <input v-model="newConversationSubject" placeholder="输入会话标题..."
                                            class="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm sm:text-base" />
                                    </div>
                                    <textarea v-model="replyContent" placeholder="输入回复内容..." rows="3"
                                        class="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none transition-colors pr-16 sm:pr-20 text-sm sm:text-base"
                                        :disabled="isSending" @keydown.ctrl.enter="sendReply"
                                        @keydown.meta.enter="sendReply">
                </textarea>

                                    <button @click="sendReply"
                                        :disabled="((isNewConversation ? (!newConversationSubject.trim() || !replyContent.trim()) : !replyContent.trim()) || isSending)"
                                        class="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2">
                                        <i v-if="isSending" class="pi pi-spin pi-spinner text-xs sm:text-sm"></i>
                                        <i v-else class="pi pi-send text-xs sm:text-sm"></i>
                                        <span class="hidden sm:inline">{{ isSending ? '发送中...' : '发送' }}</span>
                                    </button>
                                </div>

                                <div class="mt-1 sm:mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    按 Ctrl+Enter 快速发送
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 通知类消息的提示 - 固定在底部，响应式间距 -->
                    <div v-else
                        class="flex-shrink-0 p-3 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
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
