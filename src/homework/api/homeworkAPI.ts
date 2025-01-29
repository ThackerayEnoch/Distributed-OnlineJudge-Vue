import request from "@/common/utils/api";
export namespace Homework{
    export interface HomeworkJSON {
        id: number;
        uid: number;
        nickname: string;
        title: string;
        description: string;
        auth: number;
        total: number;
        visible: boolean;
        solved: number;
        startTime: string;
        endTime: string;
    }
}
export const getHomeworkPage = (currentPage:number) => {
    return request.get<Homework.HomeworkJSON[]>('/api/c/homeworks',{currentPage})
}
export const getHomeworkCount = () => {
    return request.get<number>('/api/c/homeworks/count')
}