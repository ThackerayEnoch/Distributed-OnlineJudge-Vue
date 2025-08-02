import request from "@/common/utils/api";
export namespace WhitelistSpace {
// 枚举定义
export enum IpType {
    IPv4 = 'IPv4',
    IPv6 = 'IPv6'
}

export enum IpScope {
    ALL = 'ALL',
    PRIVATE_ONLY = 'PRIVATE_ONLY',
    PUBLIC_ONLY = 'PUBLIC_ONLY'
}

export enum IpMode {
    ALLOW_ALL = 'ALLOW_ALL',
    DENY_ALL = 'DENY_ALL',
    WHITELIST = 'WHITELIST'
}

// 接口定义
export interface IpWhitelistEntry {
    ipType: IpType;
    ipCidr: string;
}

export interface SearchUsersVO {
    id: number;
    username: string;
    nickname: string;
}

export interface UserIpStrategyVO {
    userId: number;
    createdUserId: number;
    createdUsername: string;
    username: string;
    nickname: string;
    isEnabled: boolean;
    ipv4Mode: IpMode;
    ipv6Mode: IpMode;
    ipScope: IpScope;
    updateTime: Date;
    expireTime: Date;
    remark: string;
    whitelist: IpWhitelistEntry[];
}

export interface UserWhitelistDTO {
    id: number;
    ipv4Mode: IpMode;
    ipv6Mode: IpMode;
    ipScope: IpScope;
    ipv4?: string[];
    ipv6?: string[];
    remark?: string;
    expireTime?: number;
}

// API 调用函数
/**
 * 获取用户IP白名单列表
 * @param offset 分页偏移量
 * @param status 状态筛选 0-禁用 1-启用 2-全部
 * @param searchContent 搜索内容 昵称或学号
 */
export const getUserWhitelists = (offset: number, status: number, filter: string, searchContent?: string) => {
    return request.get<UserIpStrategyVO[]>('/api/u/admin/user/whitelist', { offset, status, filter, searchContent });
}

/**
 * 获取用户IP白名单数量(用于分页)
 * @param status 状态筛选 0-禁用 1-启用 2-全部
 * @param searchContent 搜索内容
 */
export const getUserWhitelistCount = (status: number, filter: string, searchContent?: string) => {
    return request.get<number>('/api/u/admin/user/whitelist/count', { status, filter, searchContent });
}

/**
 * 创建用户IP白名单
 * @param dto 用户IP策略
 */
export const createUserWhitelist = (dto: UserWhitelistDTO) => {
    return request.post<string>('/api/u/admin/user/whitelist', dto);
}

/**
 * 更新用户IP白名单状态
 * @param userId 用户ID
 * @param status 状态 0-禁用 1-启用
 */
export const updateUserWhitelistStatus = (userId: number, status: number) => {
    return request.put<string>(`/api/u/admin/user/whitelist/${userId}`, { status });
}

/**
 * 更新用户IP白名单
 * @param dto 用户IP策略
 */
export const updateUserWhitelist = (dto: UserWhitelistDTO) => {
    return request.put<string>('/api/u/admin/user/whitelist', dto);
}

/**
 * 删除用户IP策略
 * @param userId 用户ID
 */
export const deleteUserWhitelist = (userId: number) => {
    return request.delete<string>(`/api/u/admin/user/whitelist/${userId}`, {});
}

/**
 * 搜索用户
 * @param searchContent 搜索内容
 */
export const searchUserWhitelist = (searchContent: string) => {
    return request.get<SearchUsersVO[]>('/api/u/admin/user/whitelist/parse', {searchContent} );
}
}
