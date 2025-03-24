import request from "@/common/utils/api";
export namespace GroupSpace {
    export interface AdminCreateGroupDTO {
        id?: number;
        name: string;
        description: string;
        auth: number;
        startTime: number;
        endTime: number;
        password?: string;
        studentNames: string[];
    }

    export interface AdminGroupInfoVO {
        id: number;
        name: string;
        description: string;
        auth: number;
        status: number;
        creator: number;
        creatorName: string;
        password?: string;
        startTime: Date;
        endTime: Date;
        createTime: Date;
        studentCount: number;
        students: string[];
    }

    export interface AdminGroupVO {
        id: number;
        name: string;
        description: string;
        userCount: number;
        auth: number;
        startTime: Date;
        endTime: Date;
        isOwner: boolean;
        creatorName: string;
        isEnded: boolean;
    }
}
export const getAdminGroups = (offset: number, type: string, auth: number[], status: number) => {
    return request.get<GroupSpace.AdminGroupVO[]>('/api/u/admin/groups', { offset, type, auth, status });
};
export const getAdminGroupCount = (type: string, auth: number[], status: number) => {
    return request.get<number>('/api/u/admin/groups/count', { type, auth, status });
}
export const getAdminGroupDetail = (id: number) => {
    return request.get<GroupSpace.AdminGroupInfoVO>('/api/u/admin/group', { id });
};

export const createAdminGroup = (dto: GroupSpace.AdminCreateGroupDTO) => {
    return request.post<string>('/api/u/admin/group', dto);
};

export const updateAdminGroup = (dto: GroupSpace.AdminCreateGroupDTO) => {
    return request.put<string>('/api/u/admin/group', dto);
};

export const deleteAdminGroup = (id: number) => {
    return request.delete<string>(`/api/u/admin/group/${id}`);
};