import request from "@/common/utils/api";
export namespace RejudgeSpace {
    export interface RejudgeDTO {
        type: string;
        problemId?: number;
        contestId?: number;
        submitId?: number;
    }
    export interface ContestVO {
        id: number;
        title: string;
    }
    
    export interface ContestProblemVO {
        id: number;
        displayId: number;
        title: string;
    }
}
export const rejudge = (dto: RejudgeSpace.RejudgeDTO) => {
    return request.post<string>('/api/j/judge/rejudge', dto);
}
export const getContests = (content:string) => {
    return request.get<RejudgeSpace.ContestVO[]>('/api/j/rejudge/contest',{content});
}
export const getContestProblems = (contestId: number) => {
    return request.get<RejudgeSpace.ContestProblemVO[]>('/api/j/rejudge/contest/problem', { contestId });
}