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
}
export const getAdminProblems = (offset:number) => {
    return request.get<ProblemSpace.ProblemVO[]>('/api/p/admin/problems',{offset})
}
export const getAdminProblemCount = () => {
    return request.get<number>('/api/p/admin/problems/count',{})
}
