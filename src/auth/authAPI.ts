import request from "../common/utils/api";

namespace Auth {
    // 用户登录表单
    export interface LoginReqParams{
        username: string;
        password: string;
    }
    // 登录成功后返回的token
    export interface LoginResData {
        token: string;
        username: string;
        nickname: string;
        roleId: number;
        id: number;
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
// 用户登录
export const login = (params: Auth.LoginReqParams) => {
    const urlEncodedParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
        urlEncodedParams.append(key, (params as any)[key]);
    });

    return request.post<Auth.LoginResData>('/auth-server/doLogin', urlEncodedParams, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'loginType':'memberLogin'
        }
    });
}
// 发送验证码
export const sendCaptcha = (params: Auth.SendCaptchaReqParams) => {
    return request.post('/email-service/captcha', params)
}
// 用户注册
export const register = (params: Auth.RegisterReqParams) => {
    return request.post('/user-service/api/users', params)
}