import request from "@/common/utils/api";

export namespace LanguageSpace {
    // 编程语言VO
    export interface LanguageVO {
        id: number;
        description: string;
        name: string;
        oj: string;
        isSpj: boolean;
    }
}

// 获取所有编程语言
export const getAllLanguages = () => {
    return request.get<LanguageSpace.LanguageVO[]>('/api/p/all-languages');
}