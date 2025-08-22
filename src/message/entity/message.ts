export interface Message {
    id: number;
    subject: string;
    content: string;
    createTime: string;
    author: string;
    priority: MessagePriority;
    isRead: boolean;
    isNotification?: boolean; // 是否为通知（系统管理员或开发团队发送）
    replies?: MessageReply[]; // 回复列表
}

export interface MessageReply {
    id: number;
    messageId: number;
    content: string;
    author: string;
    createTime: string;
    isFromUser: boolean; // 是否来自用户（用于区分左右显示）
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
