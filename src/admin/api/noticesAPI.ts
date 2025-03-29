import request from "@/common/utils/api";
export namespace NoticesSpace {
    export interface AdminNoticesVO {
        id: number;
        title: string;
        content: string;
        author: string;
        lastUpdater: string;
        createTime: Date;
        updateTime: Date;
    }

    export interface AddUpdateNoticeDTO {
        id?: number; // 可选字段
        title: string; // 标题
        content: string; // 内容
    }
}
// 获取全部公告
export const getAdminNotices = () => {
    return request.get<NoticesSpace.AdminNoticesVO[]>('/api/u/admin/notices');
};

// 获取单个公告
export const getAdminNoticeById = (id: number) => {
    return request.get<NoticesSpace.AdminNoticesVO>(`/api/u/admin/notices/${id}`);
};

// 创建通知
export const createAdminNotice = (dto: NoticesSpace.AddUpdateNoticeDTO) => {
    return request.post<string>('/api/u/admin/notices', dto);
};

// 更新通知
export const updateAdminNotice = (id: number, dto: NoticesSpace.AddUpdateNoticeDTO) => {
    return request.put<string>(`/api/u/admin/notices/${id}`, dto);
};

// 删除通知
export const deleteAdminNotice = (id: number) => {
    return request.delete<string>(`/api/u/admin/notices/${id}`);
};