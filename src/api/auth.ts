import request from "./index";

namespace Auth {
    // 用户登录表单
    export interface LoginReqParams{
        username: string;
        password: string;
        isRememberMe: boolean;
    }
    // 登录成功后返回的token
    export interface LoginResData {
        status: string;
        message: string;
        data :[];
        timestamp: number;
    } 
}
// 用户登录
export const login = (params: Auth.LoginReqParams) => {
    return request.post<Auth.LoginResData>('/api/auth/login', params)
}