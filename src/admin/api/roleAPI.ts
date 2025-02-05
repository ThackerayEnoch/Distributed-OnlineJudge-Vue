import request from "@/common/utils/api";
export namespace RoleSpace{
    export interface PermInRoleData {
        id: number;
        name: string;
        code: string;
        description: string;
        createTime: string;
        updateTime: string;
    }

    export interface PermInRole {
        key: string;
        data: PermInRoleData;
        children: PermInRole[];
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
    export interface RolePerm{
        roleId:number,
        permIds:number[],
    }
}
export const getRoles = () => {
    return request.get<RoleSpace.Role[]>('/api/u/roles',{})
}
export const getRolePerms = (roleId:number) => {
    return request.get<RoleSpace.PermInRole[]>('/api/u/role/perms',{roleId})
}
export const updateRolePerms = (data:RoleSpace.RolePerm) => {
    return request.put('/api/u/role/perms',data)
}