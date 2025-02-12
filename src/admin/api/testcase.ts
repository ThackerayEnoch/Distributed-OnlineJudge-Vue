import request from "@/common/utils/api";
export namespace TestCaseSpace{
    export interface TestCase {
        id:number;
        pid:number;
        input:string;
        output:string;
        score:number;
        groupNum?:number;
        status:number;
        createTime:string;
        updateTime:string;
    }
    export interface TestCaseInfo{
        id:number;
        input:string;
        output:string;
        score:number;
        subtask:number;
    }
    export interface UploadTestcaseDTO {
        fileType: string;
        id: number;
    }
}
export const uploadTestcase = (files:FormData,headers:object) => {
    return request.post<string>('/api/p/admin/testcase/upload',files, headers);
}
export const getTestcases = (pid:number) => {
    return request.get<TestCaseSpace.TestCase[]>(`/api/p/admin/testcases/${pid}`,{});
}
export const getTestcase = (id:number) => {
    return request.get<TestCaseSpace.TestCaseInfo>(`/api/p/admin/testcase/${id}`,{});
}