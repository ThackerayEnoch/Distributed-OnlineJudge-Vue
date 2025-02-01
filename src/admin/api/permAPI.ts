import request from "@/common/utils/api";
import { number } from "yup";
export namespace PermSpace{
    export interface PermObject {
        id: number;
        name: string;
        description: string;
        perm: string;
        type: any;
        parentId: number;
        status: boolean;
        createTime: Date;
        updateTime: Date;
    }
    export interface newPermObject {
        name: string; // @NotBlank(message = "权限项名称不能为空")
        perm: string; // @NotBlank(message = "权限字符串不能为空")
        type: any; // @NotBlank(message = "权限类别不能为空")
        status: boolean; // @NotNull(message = "权限状态不能为空")
        description?: string;
        parentId?: number;
    }
}
export const getPerms = (currentPage:number,type:string,parentIds:number[]) => {
    return request.get<PermSpace.PermObject>('/api/u/perms',{
        currentPage,
        type,
        parentId: parentIds.join(',')
    })
}
export const getPerm = (context:string,type:string) => {
    if(type === 'NAME'){
        context = encodeURIComponent(context);
    }
    return request.get<PermSpace.PermObject[]>('/api/u/perm',{context,type})
}
export const getPermCount = (type: string, parentIds: number[]) => {
    return request.get<number>('/api/u/perms/count', { 
        type, 
        parentId: parentIds.join(',') // 将数组转换为逗号分隔的字符串
    });
}
export const addPerm = (data:PermSpace.newPermObject) => {
    return request.post<string>('/api/u/perm',data)
}
export const updatePerm = (data:PermSpace.PermObject) => {
    return request.put<string>('/api/u/perm',data)
}
export const deletePerm = (id:number) => {
    return request.delete<string>(`/api/u/perm/${id}`)
}