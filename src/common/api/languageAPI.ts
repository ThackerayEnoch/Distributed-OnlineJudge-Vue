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

// 获取本地语言（对应后端 GET /local-languages）
export const getLocalLanguages = () => {
    return request.get<LanguageSpace.LanguageVO[]>('/api/p/local-languages');
}

// 获取远程 OJ 的语言列表（对应后端 GET /remote-languages?ojName=XXX）
export const getRemoteLanguages = (ojName: string) => {
    return request.get<LanguageSpace.LanguageVO[]>(`/api/p/remote-languages`,{ojName});
}