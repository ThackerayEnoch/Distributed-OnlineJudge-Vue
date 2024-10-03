import request from "../common/utils/api";

namespace Auth {
    // 用户登录表单
    export interface LoginReqParams{
        username: string;
        password: string;
        isRememberMe: boolean;
    }
    // 登录成功后返回的token
    export interface LoginResData {
        temporaryToken: string;
    }
    // 发送验证码表单
    export interface SendCaptchaReqParams {
        email: string;
    } 
    // 注册表单
    export interface RegisterReqParams {
        username: string;
        password: string;
        email: string;
        captcha: string;
    }
}
// 用户登录
export const login = (params: Auth.LoginReqParams) => {
    return request.post<Auth.LoginResData>('/api/auth/login', params)
}
// 发送验证码
export const sendCaptcha = (params: Auth.SendCaptchaReqParams) => {
    return request.post('/api/auth/captcha/send', params)
}
// 用户注册
export const register = (params: Auth.RegisterReqParams) => {
    return request.post('/api/users', params)
}