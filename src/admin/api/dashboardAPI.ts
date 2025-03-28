import request from "@/common/utils/api";
export namespace DashboardSpace{
    export interface DbNode {
        name: string;
        role: number;
        latency: number;
        connection: number;
        inSync: boolean;
    }
    
    export interface ServiceVO {
        name: string;
        ip: string;
        port: number;
        uptime: string;
        cpu: number;
        mem: number;
        status: boolean;
    }
    
    export interface ServerInfoMetricsVO {
        masterLoad: number;
        qps: number;
        healthyNodes: number;
        copyDelay: number;
        dbNodes: DbNode[];
        serviceVOS: ServiceVO[];
    }
    export interface JudgeMonitorVO {
        totalUserCount: number;
        userCount: number;
        submitCount: number;
        solvedCount: number;
        languageCount: number[];
    }
    export interface ErrorVO {
        date: string;
        errorLevel: string;
        errorMessage: string;
    }
    export interface LogError {
        id: number;
        timestamp: Date;
        errorLevel: string;
        exceptionClass: string;
        errorMessage: string;
        requestUri: string;
        httpMethod: string;
        clientIp: string;
    }
    export interface JudgeTaskVO {
        queueLength: number;
        judgeCount: number;
        onlineJudgerCount: number;
        judgerTotalCount: number;
    }
}
export const getServerInfoMetrics = () => {
    return request.get<DashboardSpace.ServerInfoMetricsVO>('/api/m/dashboard/metrics/server',{})
}
export const getJudgeMetrics = () => {
    return request.get<DashboardSpace.JudgeMonitorVO>('/api/m/dashboard/metrics/judge',{})
}
export const getErrorList = () => {
    return request.get<DashboardSpace.ErrorVO[]>('/api/m/dashboard/errors',{})
}
export const getErrorDetail = (id: number) => {
    return request.get<DashboardSpace.LogError>('/api/m/dashboard/error',{id})
}
export const getJudgeTask = () => {
    return request.get<DashboardSpace.JudgeTaskVO>('/api/m/dashboard/judgeTask',{})
}