import request from '@/common/utils/api';
import type { MessageResponse } from '../entity/message';

/**
 * 获取用户消息列表
 */
export const getUserMessages = async (page: number = 1, size: number = 10): Promise<MessageResponse> => {
    try {
        const response = await request.get('/api/message/list', {
            params: { page, size }
        });
        return response.data as MessageResponse;
    } catch (error) {
        console.error('获取消息列表失败:', error);
        throw error;
    }
};

/**
 * 获取未读消息数量
 */
export const getUnreadMessageCount = async (): Promise<number> => {
    try {
        const response = await request.get('/api/message/unread-count');
        return (response.data as any).count || 0;
    } catch (error) {
        console.error('获取未读消息数量失败:', error);
        return 0;
    }
};

/**
 * 标记消息为已读
 */
export const markMessageAsRead = async (messageId: number): Promise<void> => {
    try {
        await request.put(`/api/message/${messageId}/read`);
    } catch (error) {
        console.error('标记消息已读失败:', error);
        throw error;
    }
};

/**
 * 标记所有消息为已读
 */
export const markAllMessagesAsRead = async (): Promise<void> => {
    try {
        await request.put('/api/message/read-all');
    } catch (error) {
        console.error('标记所有消息已读失败:', error);
        throw error;
    }
};

/**
 * 删除消息
 */
export const deleteMessage = async (messageId: number): Promise<void> => {
    try {
        await request.delete(`/api/message/${messageId}`);
    } catch (error) {
        console.error('删除消息失败:', error);
        throw error;
    }
};
