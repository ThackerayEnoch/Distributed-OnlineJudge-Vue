import request from '@/common/utils/api'
export namespace RankingSpace {
    export interface RankProblem {
        problemId: number;
        displayId: number;
    }

    export interface ProblemData {
        problemId: number;
        isSolved: boolean;
        isFirst: boolean;
        tries: number;
        solvedTime: number;
        solvedSubmitId: number;
    }

    export interface UserProblemData {
        rank?: number;
        username: string;
        nickname: string;
        userId: number;
        totalTries: number;
        solvedCount: number;
        totalPenalty: number;
        problems: ProblemData[];
    }

    export interface RankVO {
        problems: RankProblem[];
        users: UserProblemData[];
        cacheStartTime:number;
        serverTime:number;
    }
}
export const getHomeworkRankingById = (homeworkId: number) => {
    return request.get<RankingSpace.RankVO>(`/api/c/contest/${homeworkId}/rank`);
}