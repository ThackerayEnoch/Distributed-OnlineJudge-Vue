export interface Message {
    id: number;
    subject: string;
    content: string;
    createTime: string;
    author: string;
    /** 后端可能返回的作者 id */
    authorId?: number;
    /** 收件人 id（detail VO 中为 receiver） */
    toId?: number;
    /** 收件人昵称（列表 VO 中为 toName，明细 VO 中为 receiverName） */
    toName?: string;
    receiverName?: string;
    priority: MessagePriority;
    isRead: boolean;
    /** 是否由用户客户端发送（后端标记） */
    isSent?: boolean;
    isNotification?: boolean; // 是否为通知（系统管理员或开发团队发送）
    replies?: MessageReply[]; // 回复列表
}

export interface MessageReply {
    id: number;
    messageId: number;
    content: string;
    author: string;
    /** 后端评论作者 id（可选） */
    authorId?: number;
    createTime: string;
    isFromUser: boolean; // 是否来自用户（用于区分左右显示）
    /** 是否由用户客户端发送（后端标记） */
    isSent?: boolean;
    /** 回复是否已读（后端标记） */
    isRead?: boolean;
}

export enum MessagePriority {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2
}

export interface MessageResponse {
    messages: Message[];
    unreadCount: number;
    totalCount: number;
}
