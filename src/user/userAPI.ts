import request from "../common/utils/api";
export namespace UserSpace {

    export interface UserInfoVO {
        id?: number;
        nickname: string;
        course: string;
        tag: string;
        email: string;
        totalSubmitCount: number;
        solvedCount: number;
        rank: number;
    }
    export interface UserInfoUpdateDTO {
        nickname: string;
        email: string;
    }
    
    export interface UserPasswordUpdateDTO {
        oldPassword: string;
        newPassword: string;
    }
}
// 获取用户信息
export const getUserInfoById = (id: number) => {
    return request.get<UserSpace.UserInfoVO>(`/api/u/user/${id}`);
};

// 更新用户信息
export const updateUserInfo = (data: UserSpace.UserInfoUpdateDTO) => {
    return request.put<string>('/api/u/user', data);
};

// 更新用户密码
export const updatePassword = (data: UserSpace.UserPasswordUpdateDTO) => {
    return request.put<string>('/api/u/user/password', data);
};