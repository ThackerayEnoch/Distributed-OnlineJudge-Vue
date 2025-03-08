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
    };
    export interface PersonalHomeworkProblemsJSON {
        displayId: number;
        problemId: number;
        title: string;
        submitCount: number;
        acceptCount: number;
    };
    export interface HomeworkProblemsStatusJSON {
        displayId: number;
        problemId: number;
        title: string;
        totalSubmitCount: number;
        totalAcceptCount: number;
    };
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
// 根据作业id获取题目列表
export const getHomeworkProblems = (homeworkId:number) => {
    return request.get<Homework.PersonalHomeworkProblemsJSON[]>('/api/c/homeworks/id/problems',{homeworkId})
}
// 根据作业id查询所有题目的提交状况
export const getHomeworkProblemsStatus = (homeworkId:number) => {
    return request.get<Homework.HomeworkProblemsStatusJSON[]>('/api/c/homeworks/id/problems/status',{homeworkId})
}
// 根据作业id查询是否有资格写作业
export const getHomeworkAuth = (homeworkId:number) => {
    return request.get<boolean>('/api/c/homeworks/auth',{homeworkId})
}