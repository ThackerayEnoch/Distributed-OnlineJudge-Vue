import request from "../common/utils/api";
export namespace Problem{
    // Axios会自动解包ResultData并处理错误 这里只定义请求成功的data里的数据类型 
    // 请求成功后的数据
    export interface ProblemResData {
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
        userExtraFile: string;
        codeShare: number;
        isRemoveEndBlank: number;
        openCaseResult: number;
        modifiedUser: number;
        allowLanguages: number[];
        nickname: string;
        createTime: Date;
        updateTime: Date;
    }
    // 通过token无参请求用户信息
    // 定义后端返回的list<JSONObject>数据类型
    export interface ProblemListJSONObject {
        id: number;
        displayId: string;
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
        totalProblems: number;
    }
    export interface ProblemStatistics {
        totalSubmission: number;
        solvedCount: number;
        userScore: number;
        isSolved: boolean;
    }
}
export namespace Judge{
    // Axios会自动解包ResultData并处理错误 这里只定义请求成功的data里的数据类型 
    // 请求成功后的数据
    export interface SubmitReqData {
        pid: number;
        language: string;
        code: string;
        cid?:number;
        tid?:number;
        gid?:number;
        isRemote: boolean;
    }
}
// GET获取用户数据
export const getProblemPage = (currentPage:number,content:string) => {
    return request.get<Problem.ProblemListJSONObject[]>('/api/p/problems',{currentPage,content})
}
export const getProblemCount = (content:string) => {
    return request.get<Problem.ProblemCountJSONObject>('/api/p/problems/count',{content})
}
export const getProblemDetail = (problemId :number,contestId?:number) => {
    if(contestId === undefined||contestId==null) return request.get<Problem.ProblemResData>(`/api/p/problem/${problemId}`);
    return request.get<Problem.ProblemResData>(`/api/p/problem/${problemId}`,{contestId});
}
export const submitProblem = (submitJudgeDTO:Judge.SubmitReqData) => {
    return request.post('/api/j/judge/submit',submitJudgeDTO);
}
export const getProblemStatistics = (problemId:number,contestId?:number) => {
    if(contestId === undefined||contestId==null) return request.get<Problem.ProblemStatistics>(`/api/p/problem/${problemId}/statistics`);
    return request.get<Problem.ProblemStatistics>(`/api/p/problem/${problemId}/statistics`,{contestId});
}
export const survive = () =>{
    return request.get<string>('/api/p/survive')
}