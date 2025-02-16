import request from "@/common/utils/api";
export namespace ContestSpace{
    export interface HomeworkListVO {
        id: number;
        title: string;
        auth:  number;
        type:number;
        visible: number;
        startTime: string;
        endTime: string;
        creator: string;
    }
    export interface AdminParseUsers{
        studentId:string;
        nickname:string;
    }
    export interface AdminHomeworkGroupVO{
        id:number;
        name:string;
        creator:string;
    }
    export interface CreateHomeworkDTO {
        title: string;
        description: string;
        auth: number;
        type: number;
        password?: string;
        visible: boolean;
        duplicateCheck: boolean;
        languages: number[];
        groupId: number;
        users: string[];
        startTime: number;
        endTime: number;
    }
}
export const getHomeworkList = (offset:number,type:string) => {
    return request.get<ContestSpace.HomeworkListVO[]>('/api/c/admin/homeworks',{offset,type});
}
export const getHomeworksCount = (type:string) => {
    return request.get<number>('/api/c/admin/homeworks/count',{type});
}
export const parseUsers = (usernames:string[])=>{
    return request.post<ContestSpace.AdminParseUsers[]>('/api/c/admin/homework/create/parse',usernames);
}
export const getHomeworkGroup = (type:string) => {
    return request.get<ContestSpace.AdminHomeworkGroupVO[]>('/api/c/admin/homework/create/group',{type});
}
export const createHomework = (data:ContestSpace.CreateHomeworkDTO) => {
    return request.post('/api/c/admin/homework/create',data);
}