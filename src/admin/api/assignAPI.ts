import request from "@/common/utils/api";
export namespace UserSpace{
    export interface User{
        id:number,
        username:string,
        nickname:string,
        status:number,
        createTime:string,
        updateTime:string,
    }
    export interface deleteUserDTO{
        userId:number,
        roleId:number,
    }
}
export const getRoleUsers = (roleId:number,currentPage:number) => {
    return request.get<UserSpace.User[]>('/api/u/role/users',{roleId,currentPage})
}
export const getUserCount = (roleId:number) => {
    return request.get<number>('/api/u/role/users/count',{roleId})
}
export const addUser = (roleId:number,username:string) => {
    return request.post('/api/u/role/user',{roleId,username})
}
export const deleteUser = (data:UserSpace.deleteUserDTO) => {
    return request.delete(`/api/u/role/user/${data.roleId}/${data.userId}`,{})
}
