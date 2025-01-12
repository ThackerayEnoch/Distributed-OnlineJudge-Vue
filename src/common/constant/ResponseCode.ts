export enum ResponseCode {
    SUCCESS = 10000, // 请求成功
    CREATED = 10001, // 创建成功
    ACCEPTED = 10002, // 请求已被接受
    NO_CONTENT = 10003, // 请求已被处理
    BAD_REQUEST = 10004, // 参数校验错误
    INTERNAL_SERVER_ERROR = 10005, // 服务器异常
    GONE = 10006, // 资源已被删除
    TOO_MANY_REQUESTS = 10007, // 请求过于频繁
    UNAUTHORIZED = 10008, // 访问令牌不合法
    ACCESS_DENIED = 10009, // 没有权限访问该资源
    NOT_FOUND = 10010, // 资源不存在
    METHOD_NOT_ALLOWED = 10011, // 请求方法不支持
    USERNAME_OR_PASSWORD_ERROR = 11001, // 用户名或密码错误
    USERNAME_OR_EMAIL_NOT_UNIQUE = 11002, // 用户名或邮箱重复
    UNSUPPORTED_GRANT_TYPE = 11003, // 不支持的认证模式
    USER_IS_BANNED = 11004, // 用户已被封禁
    VERIFICATION_CODE_ERROR = 12001, // 验证码错误
    CAPTCHA_NOT_FOUND = 12002, // 请先发送验证码
    TOO_MANY_REQUESTS_CAPTCHA = 12003, // 发送验证码过于频繁，请稍后再试
    EMAIL_NOT_FOUND = 12004, // 邮箱不存在
    EMAIL_IS_EXIST = 12005, // 邮箱已存在
    SMTP_ERROR = 12006, // 邮件发送失败
    USER_NOT_FOUND = 13001, // 用户不存在
    USER_IS_EXIST = 13002, // 用户已存在
    EMAIL_IS_EXIST_USER = 13003, // 邮箱已存在
    USER_IS_BANNED_USER = 13004 // 用户已被封禁
}

export const ResponseMessage: { [key in ResponseCode]: string } = {
    [ResponseCode.SUCCESS]: "请求成功",
    [ResponseCode.CREATED]: "创建成功",
    [ResponseCode.ACCEPTED]: "请求已被接受",
    [ResponseCode.NO_CONTENT]: "请求已被处理",
    [ResponseCode.BAD_REQUEST]: "参数校验错误",
    [ResponseCode.INTERNAL_SERVER_ERROR]: "服务器异常",
    [ResponseCode.GONE]: "资源已被删除",
    [ResponseCode.TOO_MANY_REQUESTS]: "请求过于频繁",
    [ResponseCode.UNAUTHORIZED]: "访问令牌不合法",
    [ResponseCode.ACCESS_DENIED]: "没有权限访问该资源",
    [ResponseCode.NOT_FOUND]: "资源不存在",
    [ResponseCode.METHOD_NOT_ALLOWED]: "请求方法不支持",
    [ResponseCode.USERNAME_OR_PASSWORD_ERROR]: "用户名或密码错误",
    [ResponseCode.USERNAME_OR_EMAIL_NOT_UNIQUE]: "用户名或邮箱重复",
    [ResponseCode.UNSUPPORTED_GRANT_TYPE]: "不支持的认证模式",
    [ResponseCode.USER_IS_BANNED]: "用户已被封禁",
    [ResponseCode.VERIFICATION_CODE_ERROR]: "验证码错误",
    [ResponseCode.CAPTCHA_NOT_FOUND]: "请先发送验证码",
    [ResponseCode.TOO_MANY_REQUESTS_CAPTCHA]: "发送验证码过于频繁，请稍后再试",
    [ResponseCode.EMAIL_NOT_FOUND]: "邮箱不存在",
    [ResponseCode.EMAIL_IS_EXIST]: "邮箱已存在",
    [ResponseCode.SMTP_ERROR]: "邮件发送失败",
    [ResponseCode.USER_NOT_FOUND]: "用户不存在",
    [ResponseCode.USER_IS_EXIST]: "用户已存在",
    [ResponseCode.EMAIL_IS_EXIST_USER]: "邮箱已存在",
    [ResponseCode.USER_IS_BANNED_USER]: "用户已被封禁"
};
// 根据数字获取具体信息的函数
export function getResponseMessage(code: number): string {
    return ResponseMessage[code as ResponseCode] || "未知错误";
}