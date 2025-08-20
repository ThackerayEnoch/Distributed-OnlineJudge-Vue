import request from "@/common/utils/api";
export namespace SubmissionsStatus{
    export interface StatJSONObject {
        submitId: number;
        contestId: number;
        displayId: string;
        problemId: number;
        userId: number;
        title: string;
        nickname: string;
        status: number;
        share: boolean;
        time: string;
        memory: string;
        length: number;
        language: string;
        judger: string;
        oiRankScore: number;
        createTime: string;
    }

    export interface StatusItem {
        submitId: number;
        status: number;
        time: number;
        memory: number;
        judger: string;
        score: number;
        // 其他属性根据实际情况添加
    }

    export interface TestCase {
        id: number;
        status: number;
        time: number;
        memory: number;
        score: number;
    }
    
    export interface StatusDetail {
        id: number;
        pid: number;
        status: number;
        time: number;
        memory: number;
        length: number;
        score: number | null;
        title: string;
        createTime: string;
        nickname: string;
        language: string;
        code: string;
        errorMessage: string;
        testcase: TestCase[];
    }
}
export const getSubmissions = ( currentPage:number, homeworkId:number, type:boolean ) => {
    return request.get<SubmissionsStatus.StatJSONObject[]>('/api/c/contests/submission/statuses',{ currentPage, homeworkId, type })
}
export const getSubmissionsMaxCount = ( homeworkId:number, type: Boolean ) => {
    return request.get<number>('/api/c/contests/submission/statuses/count', { homeworkId, type })
}
export const getSubmissionBySubmitid = (submitId:number) => {
    return request.get<SubmissionsStatus.StatusItem>(`/api/c/contests/submission`,{ submitId })
}
