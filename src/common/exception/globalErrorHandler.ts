// src/plugins/globalErrorHandler.ts
import type { ToastServiceMethods } from 'primevue/toastservice'; // 引入 ToastService 类型
import { APIError } from '@/common/exception/APIException';

// 接受 ToastService 实例的参数
const globalErrorHandler = (toast: ToastServiceMethods) => {
    return (err: unknown, instance: any, info: string) => {
        if (err instanceof APIError) {
            toast.add({
                severity: 'error',
                summary: err.msg,
                detail: err.message,
                life: 3000,
            });
        } else {
            toast.add({
                severity: 'error',
                summary: '未知错误',
                detail: '发生一个未知错误',
                life: 3000,
            });
            console.error(`未知错误: ${err}, 信息: ${info}`);
        }
    };
};

export default globalErrorHandler;
