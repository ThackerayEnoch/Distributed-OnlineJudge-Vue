import request from "@/common/utils/api";
export namespace TagsSpace {
    export interface TagVO {
        id: number;
        name: string;
        color: string;
    }

    export interface AdminCreateAndUpdateTagDTO {
        id?: number; // 可选字段
        name: string; // 标签名
        color: string; // 标签颜色
    }
}
// 获取所有标签
export const getTags = (content: string) => {
    return request.get<TagsSpace.TagVO[]>('/api/p/admin/tags', { content });
};

// 创建标签
export const createTag = (dto: TagsSpace.AdminCreateAndUpdateTagDTO) => {
    return request.post<string>('/api/p/admin/tags', dto);
};

// 更新标签
export const updateTag = (dto: TagsSpace.AdminCreateAndUpdateTagDTO) => {
    return request.put<string>('/api/p/admin/tags', dto);
};

// 删除标签
export const deleteTag = (id: number) => {
    return request.delete<string>(`/api/p/admin/tags/${id}`);
};

// 获取指定题目的标签
export const getTagsByPid = (id: number) => {
    return request.get<TagsSpace.TagVO[]>(`/api/p/admin/${id}/tags`);
};

// 为题目添加标签
export const addTagToProblem = (id: number, tagIds: number[]) => {
    return request.post<string>(`/api/p/admin/${id}/tags`, tagIds);
};

// 更新题目的标签
export const updateTagToProblem = (id: number, tagIds: number[]) => {
    return request.put<string>(`/api/p/admin/${id}/tags`, tagIds);
};

// 删除题目的指定标签
export const deleteTagToProblem = (id: number, lid: number) => {
    return request.delete<string>(`/api/p/admin/${id}/tags/${lid}`);
};