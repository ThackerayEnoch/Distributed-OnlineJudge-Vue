import axios, { HttpStatusCode } from "axios";
import router from "@/common/utils/router";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import globalMessage from "@/common/utils/toast";
import { APIError } from "@/common/entity/exception/APIException";
// 数据返回的接口
// 定义请求响应参数，不含data
interface Result {
  status: number;
  message: string;
  timestamp: number;
}

// 请求响应参数，包含data
export interface ResultData<T = any> extends Result {
  data?: T;
}
// 请求地址
const URL: string = "http://192.168.200.9";

const config = {
  // 默认地址
  // baseURL: URL as string,
  // 设置超时时间
  timeout: 1000000,
  // 跨域时候允许携带凭证
  withCredentials: true,
};

class RequestHttp {
  // 定义成员变量并指定类型
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    // 实例化axios
    this.service = axios.create(config);
    this.service.defaults.paramsSerializer = (params) => {
      // 创建一个新的 URLSearchParams 对象
      const searchParams = new URLSearchParams();

      Object.keys(params).forEach((key) => {
        const value = params[key];
        // 过滤掉 undefined 和 null
        if (value !== undefined && value !== null) {
          // 处理数组和非数组情况
          if (Array.isArray(value)) {
            value.forEach((item) => {
              searchParams.append(key, item);
            });
          } else {
            searchParams.append(key, value);
          }
        }
      });

      // 转换为查询字符串
      return searchParams.toString();
    };

    /**
     * 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的token,存储到vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error: AxiosError) => {
        // 请求报错
        Promise.reject(error);
      }
    );

    /**
     * 响应拦截器
     * 服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data, config } = response; // 解构
        // 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
        if (!data.status || response.status >= 400) {
          globalMessage.error("错误", data); // 此处也可以使用组件提示报错信息
          return Promise.reject(data);
        }
        return data;
      },
      (error: AxiosError) => {
        const { response } = error;
        if (response) {
          // 服务器有返回
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { data, config } = response; // 解构
          // 使用类型断言明确 data 的类型
          const responseData = data as { status: number; data: string };
          if (response.status === HttpStatusCode.Unauthorized) {
            // 登录信息失效，应跳转到登录页面，并清空本地的token
            localStorage.setItem("token", "");
            router.push("/auth/login");
          }
          const apiError = new APIError(responseData.status, responseData.data);
          return Promise.reject(apiError);
        }
        if (!window.navigator.onLine) {
          globalMessage.error("错误", "网络连接失败");
        }
      }
    );
  }
  // 常用方法封装
  get<T>(
    url: string,
    params?: object,
    headers?: object
  ): Promise<ResultData<T>> {
    return this.service.get(url, { params, headers });
  }
  post<T>(
    url: string,
    params?: object,
    headers?: object
  ): Promise<ResultData<T>> {
    return this.service.post(url, params, headers);
  }
  put<T>(
    url: string,
    params?: object,
    headers?: object
  ): Promise<ResultData<T>> {
    return this.service.put(url, params, headers);
  }
  delete<T>(url: string, headers?: object): Promise<ResultData<T>> {
    return this.service.delete(url, { headers });
  }
}

// 导出一个实例对象
export default new RequestHttp(config);
