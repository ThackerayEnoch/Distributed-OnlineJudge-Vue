import request from "@/common/utils/api";

export namespace RemoteAccountSpace {
    // 远程评测账号VO
    export interface RemoteJudgeAccountVO {
        id: number;
        oj: string;
        username: string;
        password: string;
        status: boolean;
        isValid: boolean;
        isPrivate: boolean;
        creator: number;
        createTime: string;
    }

    // 创建远程账号DTO
    export interface CreateRemoteAccountDTO {
        oj: string;         // 远程OJ
        username: string;   // 用户名
        password: string;   // 密码
        isValid: boolean;   // 状态
        isPrivate: boolean; // 私有状态
    }

    // 更新远程账号DTO
    export interface UpdateRemoteAccountDTO {
        id: number;         // ID
        username: string;   // 用户名
        password?: string;  // 密码（可选，留空则不修改）
        isValid: boolean;   // 状态
        isPrivate: boolean; // 私有状态
    }
}

// 获取所有远程评测账号
export const getAdminRemoteJudgeAccounts = (
    offset: number,
    username?: string,
    oj?: string,
    status?: number,
    privateStatus?: number
) => {
    return request.get<RemoteAccountSpace.RemoteJudgeAccountVO[]>('/api/u/admin/remote-judge-accounts', {
        offset,
        username: username || '',
        oj: oj || '',
        status: status ?? '',
        privateStatus: privateStatus ?? ''
    });
};

// 获取远程评测账号数量
export const getAdminRemoteJudgeAccountsCount = (
    username?: string,
    oj?: string,
    status?: number,
    privateStatus?: number
) => {
    return request.get<number>('/api/u/admin/remote-judge-accounts-count', {
        username: username || '',
        oj: oj || '',
        status: status ?? '',
        privateStatus: privateStatus ?? ''
    });
};

// 创建远程评测账号
export const createRemoteJudgeAccount = (data: RemoteAccountSpace.CreateRemoteAccountDTO) => {
    return request.post<string>('/api/u/admin/remote-judge-accounts', data);
};

// 更新远程评测账号
export const updateRemoteJudgeAccount = (data: RemoteAccountSpace.UpdateRemoteAccountDTO) => {
    return request.put<string>('/api/u/admin/remote-judge-accounts', data);
};

// 删除远程评测账号
export const deleteRemoteJudgeAccount = (id: number) => {
    return request.delete<string>(`/api/u/admin/remote-judge-accounts/${id}`);
};

// 测试远程账号连接（如果后端有此接口）
export const testRemoteJudgeAccount = (id: number) => {
    return request.post<string>(`/api/u/admin/remote-judge-accounts/${id}/test`);
};