import request from '@/common/utils/api';

// 基于后端新的 VO/DTO 定义
export interface MailVO {
  id: number;
  parentId?: number;
  userId?: number;
  receiver?: number;
  author?: string;
  receiverNickname?: string;
  content?: string;
  subject?: string;
  isRead?: boolean;
  isSent?: boolean;
  priority?: number;
  createTime?: string;
}

export interface MailBO {
  id: number;
  type?: string;
  parentId?: number;
  userId?: number;
  receiver?: number;
  author?: string;
  receiverNickname?: string;
  content?: string;
  subject?: string;
  isRead?: boolean;
  isSent?: boolean;
  priority?: number;
  createTime?: string;
}

export interface MailDetailVO {
  isNotification?: boolean;
  parentMail?: MailBO;
  childMails?: MailBO[];
}

export interface MailAppendCommentDTO {
  id: number; // parentId
  content: string;
}

export interface SendMailDTO {
  parentId?: number;
  authorId: number;
  receiver: number;
  subject: string;
  content: string;
}

// API helpers (对应后端 Controller 的 endpoints)
export const loadUnreadNotifications = (size?: number) => {
  // 可选 size，用于只拉取最近 N 条未读通知
  return request.get<MailVO[]>('/api/u/notifications/unread', size ? { size } : undefined);
};

export const loadNotifications = (offset: number, size: number, read: number, searchContent?: string) => {
  return request.get<MailVO[]>('/api/u/notifications', { offset, size, read, searchContent });
};

export const markNotificationsAsRead = (notificationIds: number[]) => {
  if (!notificationIds || notificationIds.length === 0) {
    return Promise.resolve();
  }
  const params = new URLSearchParams();
  notificationIds.forEach((id) => params.append('notificationIds', String(id)));
  const url = `/api/u/notifications/read?${params.toString()}`;
  return request.post<string>(url, {});
};

// 标记单个消息为已读（兼容前端调用）
export const markMessageAsRead = (id: number) => {
  return markNotificationsAsRead([id]);
};

// 删除消息（代理到通知删除）
export const deleteMessage = (id: number) => {
  return deleteNotification(id);
};

// 新后端 API：分页获取邮件（包含父邮件/简略信息）
export const loadMails = (offset: number, read: number, searchContent?: string) => {
  return request.get<MailVO[]>('/api/u/mails', { offset, read, searchContent });
};

// 获取邮件总数
export const getMailsCount = (read: number, searchContent?: string) => {
  return request.get<number>('/api/u/mails/count', { read, searchContent });
};

// 获取邮件详情（包含往来 child mails）
export const getMailDetail = (id: number) => {
  return request.get<MailDetailVO>('/api/u/mail', { id });
};

// 发送邮件或回复（后端 SendMailDTO）
export const sendMail = (dto: SendMailDTO) => {
  return request.post<number>('/api/u/mail', dto);
};

// 获取通知数量
export const getNotificationsCount = (read: number, searchContent?: string) => {
  return request.get<number>('/api/u/notifications/count', { read, searchContent });
};

// 删除单个通知
export const deleteNotification = (id: number) => {
  return request.delete<string>(`/api/u/notification/${id}`);
};

// 批量删除通知（后端已新增支持）
export const deleteNotifications = (ids: number[]) => {
  if (!ids || ids.length === 0) return Promise.resolve();
  return request.post<string>('/api/u/notifications/batch', ids);
};

// 兼容旧接口：将 createMail 映射到 sendMail（保持向后兼容，传入 payload.id 为 receiver）
// 已移除 createMail 兼容包装，请使用 sendMail(SendMailDTO)