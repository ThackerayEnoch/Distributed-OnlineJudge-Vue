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
        id?:number;
        studentId:string;
        nickname:string;
    }
    export interface AdminHomeworkGroupVO{
        id:number;
        name:string;
        creator:string;
    }
    export interface contestProblem{
        problemId:number;
        title?:string;
        displayId:number;
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
        // per-remote-OJ selected language ids, e.g. { HDU: [1,2], POJ: [3] }
        remoteLanguages?: Record<string, number[]>;
        isHideAdminUser:boolean;
        problems: contestProblem[];
        groupIds: number[];
        users: string[];
        collaborators: number[];
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
        groupIds: number[];
        groups: AdminHomeworkGroupVO[];
        startTime: number;
        isHideAdminUser:boolean;
        endTime: number;
        languages: number[];
        problems: contestProblem[];
        users: string[];
        collaboratorIds: number[];
        collaborators: AdminParseUsers[];
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
    export interface DataSetVO {
        type: string;
        label: string;
        data: number[];
    }

    export interface ProblemVO {
        id: number;
        displayId: number;
        title: string;
        submissions: number;
        passRate: number;
        tags: TagVO[];
    }

    export interface StudentsVO {
        id: number;
        nickname: string;
        solved: number;
        attempts: number;
    }

    export interface TopRateVO {
        submitRate: number;
        passRate: number;
        avgRate: number;
        difficultTitle: string;
    }

    export interface StatVO {
        totalUser: number;
        auth: number;
        topRateVO: TopRateVO;
        studentsVO: StudentsVO[];
        problemVO: ProblemVO[];
        countDataSetVO: DataSetVO[];
        submitDataSetVO: number[];
    }
    export interface ContestUpdateStatusDTO{
        id:number;
        status:boolean;
    }
    export interface TagVO {
        id: number;
        name: string;
        color: string;
    }
}
export const getHomeworkList = (offset:number,type:string,searchContent:string) => {
    return request.get<ContestSpace.HomeworkListVO[]>('/api/c/admin/contests',{offset,type,searchContent});
}
export const getHomeworksCount = (type:string,searchContent:string) => {
    return request.get<number>('/api/c/admin/contests/count',{type,searchContent});
}
export const parseUsers = (usernames:string[])=>{
    return request.post<ContestSpace.AdminParseUsers[]>('/api/c/admin/contest/create/parse',usernames);
}
export const getHomeworkGroup = (type:string) => {
    return request.get<ContestSpace.AdminHomeworkGroupVO[]>('/api/c/admin/contest/create/group',{type});
}
export const createHomework = (data:ContestSpace.CreateHomeworkDTO) => {
    return request.post<string>('/api/c/admin/contest/create',data);
}
export const getHomeworkDetail = (id:number) => {
    return request.get<ContestSpace.HomeworkDetailVO>('/api/c/admin/contest',{id});
}
export const updateHomework = (data:ContestSpace.CreateHomeworkDTO) => {
    return request.put<string>('/api/c/admin/contest',data);
}
export const getAdminAllProblems = (offset:number,type:string,content:string,tagIds:number[]) => {
    return request.get<ContestSpace.AdminAllProblemVO[]>('/api/c/admin/contest/all-problems',{offset,type,content,tagIds});
}
export const getAdminProblemsCount = (type:string,content:string,tagIds:number[]) => {
    return request.get<number>('/api/c/admin/contest/problems/count',{type,content,tagIds});
}
export const getAdminProblems = (id:number) => {
    return request.get<ContestSpace.AdminProblemVO[]>('/api/c/admin/contest/problems',{id});
}
export const updateContestProblems = (data:ContestSpace.UpdateContestProblemDTO) => {
    return request.put<string>('/api/c/admin/contest/problems',data);
}
export const getHomeworkStat = (cid:number) => {
    return request.get<ContestSpace.StatVO>('/api/c/admin/contest/statistics',{cid});
}
export const updateHomeworkStatus = (data:ContestSpace.ContestUpdateStatusDTO) => {
    return request.put<string>('/api/c/admin/contest/status',data);
}
export const uploadFile = (files:FormData,headers:object) => {
    return request.post<string>(`/api/c/admin/contest/upload`,files, headers);
}
export const getCollaborators = (content:string) => {
    return request.get<ContestSpace.AdminParseUsers[]>('/api/c/admin/contest/collaborators',{content});
}