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
export const searchHomeworks = (currentPage:number, type:string, homeworkName:string ) => {
    return request.get<Homework.HomeworkJSON[]>('/api/c/homeworks/search',{currentPage, type, homeworkName})
}
export const searchHomeworksCount = ( type:string, homeworkName:string ) => {
    return request.get<number>('/api/c/homeworks/search/count',{ type, homeworkName })
}
export const searchHomeworkById = (homeworkId:number) => {
    return request.get<Homework.HomeworkJSON>('/api/c/homeworks/search/id',{homeworkId})
}