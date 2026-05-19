import request from "../common/utils/api";

export namespace Auth {
    // 用户登录表单
    export interface LoginReqParams{
        username: string;
        password: string;
        captchaToken?: string;
    }
    // 登录成功后返回的token
    export interface LoginResData {
        token: string;
        username: string;
        nickname: string;
        roleId: number;
        userId: number;
        isLoggedIn: boolean;
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
    export interface FirstChangePasswordDTO{
        password: string;
    }
}
// 用户登录
// 用户登录
export const hustojLogin = (params?: Auth.LoginReqParams) => {
    const urlEncodedParams = new URLSearchParams();
    if (params) {
        Object.keys(params).forEach(key => {
            urlEncodedParams.append(key, (params as any)[key]);
        });
    }

    return request.post<Auth.LoginResData>('/api/a/doLogin', urlEncodedParams, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'loginType':'hustojLogin'
        }
    });
}
export const login = (params: Auth.LoginReqParams) => {
    const urlEncodedParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
        urlEncodedParams.append(key, (params as any)[key]);
    });

    return request.post<Auth.LoginResData>('/api/a/doLogin', urlEncodedParams, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'loginType':'memberLogin'
        }
    });
}
export const survive = () =>{
    return request.get<boolean>('/api/a/survive')
}
export const firstChangePassword = (params: Auth.FirstChangePasswordDTO) => {
    return request.put('/api/u/user/password/first', params)
}
