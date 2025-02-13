import request from "@/common/utils/api";
export namespace Status{
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
    export interface StatusmMaxCountJSONObject {
        count: number;
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
export const getHomeworkProblemsSubmissions = ( currentPage:number, homeworkId:number, type:boolean ) => {
    return request.get<Status.StatJSONObject[]>('/api/c/homeworks/id/submission/statuses',{ currentPage, homeworkId, type })
}
export const getHomeworkProblemsSubmissionsMaxCount = ( homeworkId:number ) => {
    return request.get<Status.StatusmMaxCountJSONObject>('/api/c/homeworks/id/submission/statuses/count', { homeworkId })
}
export const getStatBySubmitid = (submitId:number) => {
    return request.get<Status.StatusItem>(`/api/j/judge/status/${submitId}`)
}
export const getStatDetail = (submitId:number) => {
    return request.get<Status.StatusDetail>(`/api/p/status/${submitId}`)
}