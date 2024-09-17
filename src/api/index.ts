import axios from 'axios'
import router from '@/router';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse,InternalAxiosRequestConfig, AxiosError } from 'axios'
import globalMessage from '@/utils/toast';
// 数据返回的接口
// 定义请求响应参数，不含data
interface Result {
  status: number;
  message: string,
  timestamp: number;
}

// 请求响应参数，包含data
export interface ResultData<T = any> extends Result {
  data?: T;
}
// 请求地址
const URL: string = 'http://localhost:8080'

export enum ResponseCode {
  SUCCESS = 1000, // 请求成功
  CLIENT_AUTHENTICATION_FAILED = 1001, // 客户端认证失败
  USERNAME_OR_PASSWORD_ERROR = 1002, // 用户名或密码错误
  USERNAME_OR_EMAIL_NOT_UNIQUE = 1003, // 用户名或邮箱重复
  UNSUPPORTED_GRANT_TYPE = 1004, // 不支持的认证模式
  VALIDATOR_ERROR = 1005, // 参数校验错误
  VERIFICATION_CODE_ERROR = 1006, // 验证码错误
  INTERNAL_SERVER_ERROR = 1007, // 内部服务器错误
  TIME_OUT = 1008, // 请求超时
  UNAUTHORIZED = 2001, // 访问令牌不合法
  ACCESS_DENIED = 2003 // 没有权限访问该资源
}

export const ResponseMessage: { [key in ResponseCode]: string } = {
  [ResponseCode.SUCCESS]: "请求成功",
  [ResponseCode.CLIENT_AUTHENTICATION_FAILED]: "客户端认证失败",
  [ResponseCode.USERNAME_OR_PASSWORD_ERROR]: "用户名或密码错误",
  [ResponseCode.USERNAME_OR_EMAIL_NOT_UNIQUE]: "用户名或邮箱重复",
  [ResponseCode.UNSUPPORTED_GRANT_TYPE]: "不支持的认证模式",
  [ResponseCode.VALIDATOR_ERROR]: "参数校验错误",
  [ResponseCode.VERIFICATION_CODE_ERROR]: "验证码错误",
  [ResponseCode.INTERNAL_SERVER_ERROR]: "内部服务器错误",
  [ResponseCode.TIME_OUT]: "请求超时",
  [ResponseCode.UNAUTHORIZED]: "访问令牌不合法",
  [ResponseCode.ACCESS_DENIED]: "没有权限访问该资源"
};
const config = {
  // 默认地址
  baseURL: URL as string,
  // 设置超时时间
  timeout: 10000,
  // 跨域时候允许携带凭证
  withCredentials: true
}

class RequestHttp {
  // 定义成员变量并指定类型
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    // 实例化axios
    this.service = axios.create(config);

    /**
     * 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的token,存储到vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token') || '';
        if (config.headers) {
          config.headers['x-access-token'] = token; // 直接设置请求头中的 token 信息
        }
        return config;
      },
      (error: AxiosError) => {
        // 请求报错
        Promise.reject(error)
      }
    )

    /**
     * 响应拦截器
     * 服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {data, config} = response; // 解构
        if (data.status === ResponseCode.UNAUTHORIZED) {
          // 登录信息失效，应跳转到登录页面，并清空本地的token
          localStorage.setItem('token', '');
          router.push('/auth/login');
          return Promise.reject(data);
        }
        // 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
        if (!data.status) {
          globalMessage.error('错误',data); // 此处也可以使用组件提示报错信息
          return Promise.reject(data)
        }
        return data;
      },
      (error: AxiosError) => {
        const {response} = error;
        if (response) {
          this.handleCode(response.status)
        }
        if (!window.navigator.onLine) {
            globalMessage.error('错误','网络连接失败');
          // 可以跳转到错误页面，也可以不做操作
          // return router.replace({
          //   path: '/404'
          // });
        }
      }
    )
  }
  handleCode(code: number):void {
    switch(code) {
      case 401:
        globalMessage.error('错误','登录失败，请重新登录');
        break;
      default:
        globalMessage.error('错误','请求失败');
        break;
    }
  }

  // 常用方法封装
  get<T>(url: string, params?: object): Promise<ResultData<T>> {
    return this.service.get(url, {params});
  }
  post<T>(url: string, params?: object): Promise<ResultData<T>> {
    return this.service.post(url, params);
  }
  put<T>(url: string, params?: object): Promise<ResultData<T>> {
    return this.service.put(url, params);
  }
  delete<T>(url: string, params?: object): Promise<ResultData<T>> {
    return this.service.delete(url, {params});
  }
}

// 导出一个实例对象
export default new RequestHttp(config);