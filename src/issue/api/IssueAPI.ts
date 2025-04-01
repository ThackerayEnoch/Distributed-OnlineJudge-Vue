import request from "@/common/utils/api";
export namespace IssueSpace {
    export interface AddIssueDTO {
        title: string;
        content: string;
        labels: number[];
        priority: number;
    }

    export interface IssueVO {
        id: number;
        title: string;
        content: string;
        status: number;
        priority: number;
        author: string;
        date: Date;
        visible: boolean;
        labels: string[];
        comments: CommentVO[];
        issueTimelines: IssueTimeline[];
    }

    export interface IssuesVO {
        id: number;
        title: string;
        status: number;
        priority: number;
        author: string;
        date: Date;
        comments: number;
        labels: string[];
    }

    export interface CommentVO {
        id: number;
        content: string;
        author: string;
        roleId: number;
        avatar: string;
        date: Date;
    }

    export interface IssueTimeline {
        id: number;
        issueId: number;
        userId: number; // 创建人
        name: string;
        createTime: Date;
    }
}
export const getAllIssues = (offset: number, priority: number, status: number[],type:number) => {
    return request.get<IssueSpace.IssuesVO[]>('/api/u/issues', { offset, priority, status,type });
};
export const getIssuesCount = (priority: number, status: number[],type:number) => {
    return request.get<number>('/api/u/issues/count', { priority, status,type });
}
export const getIssueById = (id: number) => {
    return request.get<IssueSpace.IssueVO>(`/api/u/issue/${id}`);
};

export const createIssue = (dto: IssueSpace.AddIssueDTO) => {
    return request.post<string>('/api/u/issue', dto);
};

export const appendMessage = (id: number, message: string) => {
    return request.post<IssueSpace.CommentVO>('/api/u/issue/message', { id,message });
};
export const updateIssueVisible = (id: number, visible: boolean) => {
    return request.put<void>('/api/u/issue/visible', {id, visible });
};
export const updateIssueStatus = (id: number, status: number) => {
    return request.put<void>('/api/u/issue/status', {id, status });
};
export const uploadFile = (files:FormData,headers:object) => {
    return request.post<string>(`/api/u/issue/upload`,files, headers);
}
