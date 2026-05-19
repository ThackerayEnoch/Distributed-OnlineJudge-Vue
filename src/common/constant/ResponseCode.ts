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
    TOKEN_EXPIRED = 11005, // Token已过期
    INVALID_SESSION_ID = 11006, // 无效SESSION ID
    SESSION_ID_NOT_FOUND = 11007, // SESSION已失效，请重新登陆旧OJ
    IP_ADDRESS_ILLEGAL = 11008, // IP登录策略禁止登录
    ACCOUNT_EXPIRED = 11009, // 账号已过期
    BAD_CREDENTIALS = 11010, // 凭据异常
    CAPTCHA_ERROR_OR_REQUIRED = 11011, // 验证码错误或必填
    USER_ACCOUNT_LOCKED = 11012, // 账号被锁定
    PASSWORD_EXPIRED = 11013, // 密码已过期
    VERIFICATION_CODE_ERROR = 12001, // 验证码错误
    CAPTCHA_NOT_FOUND = 12002, // 请先发送验证码
    TOO_MANY_REQUESTS_CAPTCHA = 12003, // 发送验证码过于频繁，请稍后再试
    EMAIL_NOT_FOUND = 12004, // 邮箱不存在
    EMAIL_IS_EXIST = 12005, // 邮箱已存在
    SMTP_ERROR = 12006, // 邮件发送失败
    USER_NOT_FOUND = 13001, // 用户不存在
    USER_IS_EXIST = 13002, // 用户已存在
    EMAIL_IS_EXIST_USER = 13003, // 邮箱已存在
    USER_IS_BANNED_USER = 13004, // 用户已被封禁
}

export const ResponseMessage: { [key in ResponseCode]: string } = {
    [ResponseCode.CAPTCHA_ERROR_OR_REQUIRED]: "验证码错误或必填",
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
    [ResponseCode.TOKEN_EXPIRED]: "Token已过期",
    [ResponseCode.INVALID_SESSION_ID]: "无效SESSION ID",
    [ResponseCode.SESSION_ID_NOT_FOUND]: "SESSION已失效，请重新登陆旧OJ",
    [ResponseCode.IP_ADDRESS_ILLEGAL]: "IP登录策略禁止登录",
    [ResponseCode.VERIFICATION_CODE_ERROR]: "验证码错误",
    [ResponseCode.CAPTCHA_NOT_FOUND]: "请先发送验证码",
    [ResponseCode.TOO_MANY_REQUESTS_CAPTCHA]: "发送验证码过于频繁，请稍后再试",
    [ResponseCode.EMAIL_NOT_FOUND]: "邮箱不存在",
    [ResponseCode.EMAIL_IS_EXIST]: "邮箱已存在",
    [ResponseCode.SMTP_ERROR]: "邮件发送失败",
    [ResponseCode.USER_NOT_FOUND]: "用户不存在",
    [ResponseCode.USER_IS_EXIST]: "用户已存在",
    [ResponseCode.EMAIL_IS_EXIST_USER]: "邮箱已存在",
    [ResponseCode.USER_IS_BANNED_USER]: "用户已被封禁",
    [ResponseCode.ACCOUNT_EXPIRED]: "账号已过期",
    [ResponseCode.BAD_CREDENTIALS]: "凭据异常",
    [ResponseCode.USER_ACCOUNT_LOCKED]: "账号被锁定",
    [ResponseCode.PASSWORD_EXPIRED]: "密码已过期"
};
// 根据数字获取具体信息的函数
export function getResponseMessage(code: number): string {
    return ResponseMessage[code as ResponseCode] || "未知错误";
}