import request from "../common/utils/api";
import { User } from "@/user/entity/user";
namespace User {

    // 登录成功后返回的token
    export interface getUserResData {
        userId:string;
        username:string;
        originalUsername:string;
        password:string;
        salt:string;
        email:string;
        role:string;
        createTime:string;
        updateTime:string;
    } 
}
// 用户登录
export const getUserInfo = () => {
    return request.get<User.getUserResData>('/api/users')
}