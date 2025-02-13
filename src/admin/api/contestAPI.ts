import request from "@/common/utils/api";
export namespace ContestSpace{
    export interface HomeworkListVO {
        id: number;
        title: string;
        auth:  number;
        type:number;
        visible: number;
        startTime: string;
        endTime: string;
        creator: string;
    }
}
export const getHomeworkList = (offset:number,type:string) => {
    return request.get<ContestSpace.HomeworkListVO[]>('/api/c/admin/homeworks',{offset,type});
}
export const getHomeworksCount = (type:string) => {
    return request.get<number>('/api/c/admin/homeworks/count',{type});
}