import request from "@/common/utils/api";
export namespace HomeworkSpace{
    export interface HomeworkJSON {
        id: number;
        uid: number;
        nickname: string;
        title: string;
        description: string;
        auth: number;
        total: number;
        visible: boolean;
        startTime: string;
        endTime: string;
    }
    export interface HomeworkSummaryVO {
        id: number;
        nickname: string;
        title: string;
        type: number;
        description: string;
        auth: number;
        total: number;
        startTime: string;
        endTime: string;
        updateTime: string;
    }
    export interface HomeworkProblemsVO {
        displayId: number;
        problemId: number;
        isSolved: boolean;
        title: string;
        totalSubmit: number;
        totalSolved: number;
    }
}
export const getHomeworkPage = (currentPage:number,type:string,content:string) => {
    return request.get<HomeworkSpace.HomeworkJSON[]>('/api/c/contests',{currentPage,type,content})
}
export const getHomeworkCount = (type:string,content:string) => {
    return request.get<number>('/api/c/contests/count',{type,content})
}
export const getHomeworkSummary = (id:number) => {
    return request.get<HomeworkSpace.HomeworkSummaryVO>(`/api/c/contest/${id}`, {})
}
export const getHomeworkProblems = (id:number) => {
    return request.get<HomeworkSpace.HomeworkProblemsVO[]>(`/api/c/contest/${id}/problems`, {})
}
