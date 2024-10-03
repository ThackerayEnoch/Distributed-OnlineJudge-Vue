import { getResponseMessage,ResponseCode } from '@/common/constant/ResponseCode';
export class APIError extends Error {
    public code: number;
    public msg: string;
    // 构造函数重载模拟
    constructor(code: number, message?: string);
    constructor(responseCode: ResponseCode, message?: string);
    constructor(codeOrResponseCode: number | ResponseCode, message?: string) {
        // 如果提供了 message，则使用它，否则使用默认的响应消息
        super(message || getResponseMessage(codeOrResponseCode as ResponseCode));
        
        if (typeof codeOrResponseCode === 'number') {
            this.code = codeOrResponseCode;
            this.msg = getResponseMessage(codeOrResponseCode as ResponseCode);
        } else {
            this.code = codeOrResponseCode;
            this.msg = getResponseMessage(codeOrResponseCode);
        }
    }
    getCode() {
        return this.code;
    }
    getMsg() {
        return this.msg;
    }
}