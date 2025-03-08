import request from '@/common/utils/api'
export namespace Ranking {
    export interface HomeworkRankingJSON {
        index: number;
        username: string;
        nickname: string;
        AC: number;
        time: string;
    }
    export interface HomeworkRankingProblemsJSON {
        index: number;
        displayId: number;
        problemId: number;
        title: string;
        count: number;
    }

}
export const getHomeworkRankingById = (homeworkId: number) => {
    return request.get<Array<Map<string, object>>>('/api/c/homeworks/rank', { homeworkId })
}