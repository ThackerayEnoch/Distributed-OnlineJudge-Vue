import request from "../common/utils/api";
export namespace Status{
    export interface StatJSONObject {
        submitId: number;
        displayId: string;
        title: string;
        pId: number;
        uId: number;
        status: number;
        oiRankScore: number;
        time: string;
        memory: string;
        length: number;
        language: string;
        nickname: string;
        createTime: string;
        judger: string;
        share: boolean;
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
export const getStatPage = (currentPage:number) => {
    return request.get<Status.StatJSONObject[]>('/api/p/statuses',{currentPage})
}
export const getStatMaxCount = () => {
    return request.get<Status.StatusmMaxCountJSONObject>('/api/p/status/count')
}
export const getStatBySubmitid = (submitId:number) => {
    return request.get<Status.StatusItem>(`/api/j/judge/status/${submitId}`)
}
export const getStatDetail = (submitId:number) => {
    return request.get<Status.StatusDetail>(`/api/p/status/${submitId}`)
}