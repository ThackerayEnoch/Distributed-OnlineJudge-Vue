import request from "./index";

namespace User {

    // 登录成功后返回的token
    export interface getUserResData {
        status: string;
        message: string;
        data :{};
        timestamp: number;
    } 
}
// 用户登录
export const getUserInfo = () => {
    return request.get<User.getUserResData>('/api/users/me')
}