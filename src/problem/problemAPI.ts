import request from "../common/utils/api";
export namespace Problem{
    // Axios会自动解包ResultData并处理错误 这里只定义请求成功的data里的数据类型 
    // 请求成功后的数据
    export interface DemoResData {
        id: string;
        name: string;
    }
    // 请求参数
    export interface DemoReqParams {
        id: string;
    }
    // 通过token无参请求用户信息
    // 定义后端返回的list<JSONObject>数据类型
    export interface ProblemListJSONObject {
        problemId: number;
        title: string;
        difficulty: number;
        submissionCount: number;
        acCount: number;
        waCount: number;
        tleCount: number;
        mleCount: number;
        reCount: number;
        ceCount: number;
        otherCount: number;
        oiSubmissionCount: number;
        oiAverageScore: number;
        hasDo: boolean;
    }
    export interface ProblemCountJSONObject {
        count: number;
    }
}
// GET获取用户数据
export const getProblemPage = (currentPage:number) => {
    return request.get<Problem.ProblemListJSONObject[]>('/api/p/problems',{currentPage})
}
export const getProblemCount = () => {
    return request.get<Problem.ProblemCountJSONObject>('/api/p/problems/count')
}
/*// GET获取demo数据
export const getDemoData = (params:Demo.DemoReqParams) => {
    return request.get<Demo.DemoResData>('/demo/'+params.id)
}
// POST请求demo数据
export const sendCaptcha = (params: Demo.DemoReqParams) => {
    return request.post('/email-service/captcha', params)
}
// PUT修改demo数据
export const register = (params: Demo.DemoReqParams) => {
    return request.put('/user-service/api/users', params)
}
// DELETE删除demo数据
export const deleteDemoData = (params: Demo.DemoReqParams) => {
    return request.delete('/api/demo/'+params.id)
}
*/