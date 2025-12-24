import { reactive } from 'vue'
import { defineStore } from 'pinia'
import { User } from '@/common/entity/user'
import { ref } from 'vue';
import {type ClarificationSpace } from '@/homework/api/clarificationAPI'
import app from '@/main';
const toast = app.config.globalProperties.$toast;

export const useUserStore = defineStore('user', () => {
  
  // 当前登录用户
  const currentUser = reactive(new User())
  // 设置用户
  function setUser(user: User) {
    Object.assign(currentUser, user);
  }
  // 重置用户
  function resetUser() {
    Object.assign(currentUser, new User());
  }
  return { currentUser, setUser, resetUser }
},{
  persist: true // 启用持久化
});


export const useNoticeStore = defineStore('notice', () => {
    const serverNoticeIds = ref<number[]>([]);
    const existUnreadMessage = ref(false);

    // 获取特定比赛的本地存储 Key
    const getLocalKey = (contestId: number) => `seen_notice_ids_c${contestId}`;

    // 更新状态逻辑
    function updateState(contestId: number, data: ClarificationSpace.QueryNoticeAndConversationVO) {
        const localKey = getLocalKey(contestId);
        
        // 1. 实时读取本地已读记录（用于多标签页去重）
        const localSeenIdsRaw = localStorage.getItem(localKey);
        const localSeenIds: number[] = localSeenIdsRaw ? JSON.parse(localSeenIdsRaw) : [];

        // 2. 找出真正需要弹窗的新公告
        const trulyNewIds = data.notifications.filter(id => !localSeenIds.includes(id));

        if (trulyNewIds.length > 0) {
            // 3. 立即抢占持久化记录，防止其他标签页重复弹窗
            const updatedIds = Array.from(new Set([...localSeenIds, ...data.notifications])).slice(-100);
            localStorage.setItem(localKey, JSON.stringify(updatedIds));

            // 4. 触发 PrimeVue Toast
            toast.add({ severity: 'warn', summary: '新公告', detail: '您有新的公告，请注意查看。在比赛页面点击提交记录右边的公告查看。', life: 999999999, group: 'bl' });
        }
        if(data.existUnreadMessage){
          // 4. 触发 PrimeVue Toast
          toast.add({ severity: 'warn', summary: '新答疑消息', detail: '您有新的答疑消息，请注意查看。', life: 999999999, group: 'bl' });
        }
        // 5. 更新响应式数据（驱动 UI 红点）
        serverNoticeIds.value = data.notifications;
        existUnreadMessage.value = data.existUnreadMessage;
    }

    return { serverNoticeIds, existUnreadMessage, updateState };
});
