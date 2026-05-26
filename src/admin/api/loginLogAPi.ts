import request from "@/common/utils/api";

export namespace LoginLogSpace {
	export interface LoginLogQueryDTO {
		size: number;
		cursor?: number;
		searchContent?: string;
		status?: number;
	}

	export interface AdminLoginLogVO {
		id: number;
		userId: number;
		username: string;
		loginTime: string;
		loginIp: string;
		ipRegion: string;
		success: boolean;
		reason: string;
		device: string;
	}

	export interface AdminLoginLogResultVO {
		list: AdminLoginLogVO[];
		nextCursor: number;
		hasMore: boolean;
		total: number;
	}

	export interface AdminLoginLogsStatVO {
		success: number;
		failure: number;
	}
}

export const getAdminLoginLogs = (dto: LoginLogSpace.LoginLogQueryDTO) => {
	return request.post<LoginLogSpace.AdminLoginLogResultVO>("/api/u/admin/login-logs",dto);
};

export const getAdminLoginLogsStat = () => {
	return request.get<LoginLogSpace.AdminLoginLogsStatVO>("/api/u/admin/login-logs", {});
};