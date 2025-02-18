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
        id?: number;
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
    export interface HomeworkDetailVO {
        id: number;
        title: string;
        description: string;
        auth: number;
        type: number;
        password: string;
        visible: boolean;
        duplicateCheck: boolean;
        groupId: number;
        startTime: number;
        endTime: number;
        languages: number[];
        users: string[];
        createTime: string;
        updateTime: string;
    }
    export interface AdminAllProblemVO {
        id: number;
        title: string;
        difficulty: number;
        total: number;
        solved: number;
    }
    export interface AdminProblemVO {
        id: number;
        title: string;
        difficulty: number;
        number: number;
        createTime: string;
        updateTime: string;
    }
    export interface UpdateContestProblemEntityDTO{
        id:number;
        number:number;
    }
    export interface UpdateContestProblemDTO{
        id:number;
        problems:UpdateContestProblemEntityDTO[];
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
    return request.post<string>('/api/c/admin/homework/create',data);
}
export const getHomeworkDetail = (id:number) => {
    return request.get<ContestSpace.HomeworkDetailVO>('/api/c/admin/homework',{id});
}
export const updateHomework = (data:ContestSpace.CreateHomeworkDTO) => {
    return request.put<string>('/api/c/admin/homework',data);
}
export const getAdminAllProblems = (offset:number,type:string,content:string) => {
    return request.get<ContestSpace.AdminAllProblemVO[]>('/api/c/admin/homework/all-problems',{offset,type,content});
}
export const getAdminProblemsCount = (type:string,content:string) => {
    return request.get<number>('/api/c/admin/homework/problems/count',{type,content});
}
export const getAdminProblems = (id:number) => {
    return request.get<ContestSpace.AdminProblemVO[]>('/api/c/admin/homework/problems',{id});
}
export const addProblems = (id:number,problems:number[]) => {
    return request.post<string>('/api/c/admin/homework/problems',{id,problems});
}
export const updateContestProblems = (data:ContestSpace.updateContestProblemDTO) => {
    return request.put<string>('/api/c/admin/homework/problems',data);
}
export const deleteHomeworkProblem = (cid:number,pid:number) => {
    return request.delete<string>(`/api/c/admin/homework/problems/${cid}/${pid}`);
}