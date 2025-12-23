import { onUnmounted } from 'vue';
import {type ClarificationSpace,queryNoticeAndConversation  } from '@/homework/api/clarificationAPI'
import { useNoticeStore } from '@/common/utils/store';

export function useNoticePolling() {
    const noticeStore = useNoticeStore();
    let timer: ReturnType<typeof setInterval> | null = null;

    /**
     * 启动轮询
     * @param contestId 比赛ID
     * @param interval 轮询间隔(ms)，默认 60000 (1分钟)
     */
    const startPolling = (contestId: number, interval: number = 60000) => {
        // 先停止之前的定时器防止重复
        stopPolling();

        // 立即执行一次
        const fetchData = async () => {
            try {
                const res = await queryNoticeAndConversation(contestId);
                if (res.data) {
                    noticeStore.updateState(contestId, res.data);
                }
            } catch (error) {
                console.error('公告轮询失败:', error);
            }
        };

        fetchData();
        // 开启定时
        timer = setInterval(fetchData, interval);
    };

    const stopPolling = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };

    // 自动在组件卸载时停止
    onUnmounted(() => {
        stopPolling();
    });

    return { startPolling, stopPolling };
}