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
        openCase: boolean;
        isRemote: boolean;
        errorMessage: string;
        testcase: TestCase[];
    }
}
export const getStatPage = (currentPage:number,problemId?:number,contestId?:number,userId?:number,type?:string,status?:number) => {
    return request.get<Status.StatJSONObject[]>('/api/j/statuses',{currentPage,problemId,contestId,userId,type,status})
}
export const getStatMaxCount = (problemId?:number,contestId?:number,userId?:number,type?:string,status?:number) => {
    return request.get<Status.StatusmMaxCountJSONObject>('/api/j/status/count',{problemId,contestId,userId,type,status})
}
export const getStatBySubmitid = (submitId:number) => {
    return request.get<Status.StatusItem>(`/api/j/judge/status/${submitId}`)
}
export const getStatDetail = (submitId:number) => {
    return request.get<Status.StatusDetail>(`/api/j/status/${submitId}`)
}