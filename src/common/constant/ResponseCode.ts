export enum ResponseCode {
    SUCCESS = 1000, // 请求成功
    CLIENT_AUTHENTICATION_FAILED = 1001, // 客户端认证失败
    USERNAME_OR_PASSWORD_ERROR = 1002, // 用户名或密码错误
    USERNAME_OR_EMAIL_NOT_UNIQUE = 1003, // 用户名或邮箱重复
    UNSUPPORTED_GRANT_TYPE = 1004, // 不支持的认证模式
    VALIDATOR_ERROR = 1005, // 参数校验错误
    VERIFICATION_CODE_ERROR = 1006, // 验证码错误
    INTERNAL_SERVER_ERROR = 1007, // 内部服务器错误
    GONE = 1008, // 资源不存在
    TIME_OUT = 1009, // 请求超时
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
    [ResponseCode.GONE]: "资源不存在",
    [ResponseCode.TIME_OUT]: "请求超时",
    [ResponseCode.UNAUTHORIZED]: "访问令牌不合法",
    [ResponseCode.ACCESS_DENIED]: "没有权限访问该资源"
};
// 根据数字获取具体信息的函数
export function getResponseMessage(code: number): string {
    return ResponseMessage[code as ResponseCode] || "未知错误";
}