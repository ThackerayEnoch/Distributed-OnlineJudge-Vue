import request from "@/common/utils/api";
export namespace NoticesSpace {
    export interface NoticesVO {
        id: number;
        title: string;
        author: string;
        createTime: Date; // Date 转换为 ISO 格式字符串
    }

    export interface NoticeVO {
        id: number;
        title: string;
        content: string;
        author: string;
        authorId: number;
        createTime: Date; // Date 转换为 ISO 格式字符串
    }
}
// 获取单个公告
export const getNoticeById = (id: number) => {
    return request.get<NoticesSpace.NoticeVO>(`/api/u/notices/${id}`);
};

// 获取所有公告
export const getAllNotices = (limit:number) => {
    return request.get<NoticesSpace.NoticesVO[]>('/api/u/notices', {limit});
};