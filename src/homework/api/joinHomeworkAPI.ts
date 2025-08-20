import request from "@/common/utils/api";
export namespace JoinHomeworkSpace {
    export interface BlockContestInfoVO {
        title: string;
        auth: number;
    }
    
    export interface JoinHomeworkDTO {
        contestId: number;
        password?: string;
    }
}
// 加入作业
export const joinHomework = (dto: JoinHomeworkSpace.JoinHomeworkDTO) => {
    return request.post<string>('/api/c/contest/join', dto);
};

// 获取受限作业信息
export const getBlockContestInfo = (id: number) => {
    return request.get<JoinHomeworkSpace.BlockContestInfoVO>(`/api/c/contest/join/${id}`);
};