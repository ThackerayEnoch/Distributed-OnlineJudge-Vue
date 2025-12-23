import request from "@/common/utils/api";

export namespace ClarificationSpace {
    export interface CreateContestNoticeDTO {
        contestId: number;
        title: string;
        content: string;
    }

    export interface AdminConversationVO {
        id: number;
        userId: number;
        userNickname: string;
        lastMessageContent: string;
        lastTime: string;
        unreadCount: number;
    }

    export interface ConversationMessageVO {
        id: number;
        content: string;
        isFromAdmin: boolean;
        nickname: string;
        createTime: string;
    }

    export interface ReplyConversationDTO {
        contestId: number;
        conversationId: number;
        content: string;
    }

    export interface ContestNoticeVO {
        id: number;
        title: string;
        content: string;
        createTime: string;
        author: string;
    }

    export interface QueryNoticeAndConversationVO {
        notifications: number[];
        existUnreadMessage: boolean;
    }
}
// 管理员创建公告
export const createContestNotice = (dto: ClarificationSpace.CreateContestNoticeDTO) => {
    return request.post<string>('/api/u/contest/admin/notice', dto);
}
// 管理员获取预览答疑列表
export const getAdminConversations = (contestId: number) => {
    return request.get<ClarificationSpace.AdminConversationVO[]>('/api/u/contest/admin/conversations', { contestId });
}
// 管理员获取指定答疑的具体消息
export const getConversationMessages = (contestId: number, conversationId: number) => {
    return request.get<ClarificationSpace.ConversationMessageVO[]>('/api/u/contest/admin/conversation/messages', { contestId, conversationId });
}
// 管理员回复
export const adminReplyConversation = (dto: ClarificationSpace.ReplyConversationDTO) => {
    return request.post<number>('/api/u/contest/admin/conversation/reply', dto);
}
// 普通用户获取历史消息
export const getClarificationMessages = (contestId: number) => {
    return request.get<ClarificationSpace.ConversationMessageVO[]>('/api/u/contest/clarifications', { contestId });
}
// 普通用户回复
// 普通用户回复conversationId随便填写一个数字(>1000)即可
export const replyClarification = (dto: ClarificationSpace.ReplyConversationDTO) => {
    return request.post<number>('/api/u/contest/clarification/reply', dto);
}
// 普通用户获取全部公告
export const getContestNotices = (contestId: number) => {
    return request.get<ClarificationSpace.ContestNoticeVO[]>('/api/u/contest/notices', { contestId });
}

// 查询比赛公告和对话
export const queryNoticeAndConversation = (contestId: number) => {
    return request.get<ClarificationSpace.QueryNoticeAndConversationVO>('/api/u/contest/notice-and-conversations', { contestId });
}