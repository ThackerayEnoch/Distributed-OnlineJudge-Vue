import request from "@/common/utils/api";

export namespace OnlineUserSpace {
	export interface OnlineUserDTO {
		offset?: number;
		page?: number;
	}

	export interface AdminTokenVO {
		uid: number;
		username: string;
		nickname: string;
		roleId: number;
		loginTime: string;
		loingIp: string;
		tokenTtlSeconds: number;
	}

	export interface AdminTokenListVO {
		list: AdminTokenVO[];
		total: number;
	}
}

export const listOnlineUsers = (dto: OnlineUserSpace.OnlineUserDTO) => {
	return request.post<OnlineUserSpace.AdminTokenListVO>(
		"/api/u/admin/online-users",
		dto
	);
};

export const kickOutOnlineUser = (uid: number) => {
	return request.delete<string>(`/api/u/admin/online-users/${uid}`, {});
};