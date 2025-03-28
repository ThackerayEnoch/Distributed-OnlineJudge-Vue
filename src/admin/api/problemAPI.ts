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
    export interface Problem{
        id: number;
        displayId: string;
        judgeMode: string;
        title: string;
        type: number;
        timeLimit: number;
        memoryLimit: number;
        stackLimit: number;
        description: string;
        input: string;
        output: string;
        inputExamples: string;
        outputExamples: string;
        source: number;
        difficulty: number;
        hint: string;
        auth: number;
        ioScore: number;
        codeShare: boolean;
        spjCode: string;
        spjLanguage: string;
        userExtraFile: string;
        judgeExtraFile: string;
        judgeCaseMode: string;
        isRemoveEndBlank: boolean;
        openCaseResult: boolean;
        caseVersion: string;
        isUploadCase: boolean;
        modifiedUser: number;
        isGroup: boolean;
        gid: number;
        isFileIo: boolean;
        ioReadFileName: string;
        ioWriteFileName: string;
        createdUser: number;
        createTime: Date;
        updateTime: Date;
    }
}
export const getAdminProblems = (offset:number,own:boolean,auth:number,content:string) => {
    return request.get<ProblemSpace.ProblemVO[]>('/api/p/admin/problems',{offset,own,auth,content})
}
export const getAdminProblemCount = (offset:number,own:boolean,auth:number,content:string) => {
    return request.get<number>('/api/p/admin/problems/count',{offset,own,auth,content})
}
export const updateAdminProblem = (id:number,status:number) => {
    return request.put<ProblemSpace.ProblemVO>(`/api/p/admin/problem/${id}/status`,{status})
}
export const createProblem = (data:ProblemSpace.AdminCreateProblemDTO) => {
    return request.post<ProblemSpace.ProblemVO>('/api/p/admin/problem',data)
}
export const getProblem = (id:number) => {
    return request.get<ProblemSpace.Problem>(`/api/p/admin/problem/${id}`,{})
}
export const getProblemLanguages = (id:number) => {
    return request.get<number[]>(`/api/p/admin/problem/${id}/languages`,{})
}
export const updateProblem = (id:number,data:ProblemSpace.AdminCreateProblemDTO) => {
    return request.put<ProblemSpace.ProblemVO>(`/api/p/admin/problem/${id}`,data)
}
export const uploadFile = (files:FormData,headers:object) => {
    return request.post<string>(`/api/p/admin/problem/upload`,files, headers);
}
