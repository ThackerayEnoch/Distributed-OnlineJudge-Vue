import request from "../utils/api";
export namespace Judge{
    // Axios会自动解包ResultData并处理错误 这里只定义请求成功的data里的数据类型 
    // 请求成功后的数据
    export interface SubmitReqData {
        pid: number;
        language: string;
        code: string;
        cid:number;
        tid:number;
        gid:number;
        isRemote: boolean;
    }
    export enum Language {
        C = "C",
        Cpp = "C++",
        Java = "Java",
        PyPy2 = "PyPy2",
        PyPy3 = "PyPy3",
    }
}
export const submitProblem = (submitJudgeDTO:Judge.SubmitReqData) => {
    return request.post('/api/j/judge/submit',submitJudgeDTO);
}