import request from "@/common/utils/api";
export namespace UserSpace{
    export interface UserInfoVO{
        id: number;
        username: string;
        nickname: string;
        lastLogin: string;
        signedUp: string;
        status:boolean;
    }
    export interface Role {
        id: number;
        role: string;
        code: string;
        description: string;
        status: number;
        createTime: string;
        updateTime: string;
    }
    export interface RoleAssignDTO{
        roleId: number;
        username: string;
    }
    export interface AdminCreateUserInfoDTO {
        username: string;
        password: string;
        nickname: string;
        email?: string;
        major?: string;
    }
    export interface AdminUpdateUserDTO {
        id: number;
        nickname: string;
        password?: string;
        status: boolean;
    }
    export interface AdminCreateUserBatchDTO {
        username: string;
        nickname: string;
        password: string;
    }
}
export const getAdminUsers = (offset:number,limit:number,content:string|null) => {
    return request.get<UserSpace.UserInfoVO[]>('/api/u/admin/users',{offset,limit,content});
}
export const getAdminUserCount = (content:string|null) => {
    return request.get<number>('/api/u/admin/users/count',{content});
}
export const getRoles = () => {
    return request.get<UserSpace.Role[]>('/api/u/roles',{})
}
export const updateUserInfo = (data:UserSpace.AdminUpdateUserDTO) => {
    return request.put<string>('/api/u/admin/user',data)
}
export const createUser = (data:UserSpace.AdminCreateUserInfoDTO) => {
    return request.post<string>('/api/u/admin/user',data)
}
export const assignRole = (data:UserSpace.RoleAssignDTO) => {
    return request.post<string>('/api/u/role/user',data)
}
export const createUserBatch = (data:UserSpace.AdminCreateUserBatchDTO[]) => {
    return request.post<string>('/api/u/admin/users',data)
}

