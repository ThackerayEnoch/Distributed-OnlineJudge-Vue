import request from "@/common/utils/api";
export namespace ProblemSpace{
    export interface ProblemVO {
        id: number;
        displayId: string;
        title: string;
        creator: string;
        createTime: Date;
        modifier: string;
        updateTime: Date;
        status: number;
    }
    export interface AdminCreateProblemDTO {
        displayId: string;
        title: string;
        timeLimit: number;
        memoryLimit: number;
        stackLimit: number;
        problemDesc: string;
        inputDesc: string;
        outputDesc: string;
        hintDesc?: string;
        problemType: number;
        selectedDifficulty: number;
        auth: number;
        share: boolean;
        selectedLanguages: number[];
        samples: AdminCreateProblemSampleDTO[];
        spjCode?: string;
        spjLanguage?: string;
        userJudgeFile?: boolean;
        spjJudgeFile?: boolean;
        userFiles?: AdminCreateProblemFileDTO[];
        spjFiles?: AdminCreateProblemFileDTO[];
        judgeMode: number;
        acmJudgeCaseMode?: number;
        oiJudgeCaseMode?: number;
        removeBlank: boolean;
        judgeCaseStatus: boolean;
    }

    export interface AdminCreateProblemSampleDTO {
        id: number;
        input: string;
        output: string;
        score: number;
        subtask: number;
        collapsed: boolean;
    }

    export interface AdminCreateProblemFileDTO {
        name: string;
        code: string;
    }
}
export const getAdminProblems = (offset:number) => {
    return request.get<ProblemSpace.ProblemVO[]>('/api/p/admin/problems',{offset})
}
export const getAdminProblemCount = () => {
    return request.get<number>('/api/p/admin/problems/count',{})
}
export const updateAdminProblem = (id:number,status:number) => {
    return request.put<ProblemSpace.ProblemVO>(`/api/p/admin/problem/${id}/status`,{status})
}
export const createProblem = (data:ProblemSpace.AdminCreateProblemDTO) => {
    return request.post<ProblemSpace.ProblemVO>('/api/p/admin/problem',data)
}
