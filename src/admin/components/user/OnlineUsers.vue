<template>
    <div class="p-4">
        <Toast />
        <ConfirmDialog />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between border-l-4 border-blue-500">
                <div>
                    <span class="block text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">当前在线人数</span>
                    <span class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.totalOnline }}</span>
                </div>
                <div
                    class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300">
                    <i class="pi pi-users text-xl"></i>
                </div>
            </div>
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between border-l-4 border-red-500">
                <div>
                    <span class="block text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">在线管理员</span>
                    <span class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.adminOnline }}</span>
                </div>
                <div
                    class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-500 dark:text-red-300">
                    <i class="pi pi-shield text-xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 class="text-lg font-semibold text-gray-800 dark:text-white">在线用户列表</h2>
                <Button icon="pi pi-refresh" label="刷新数据" @click="loadData" :loading="loading" size="small" text />
            </div>

            <DataTable :value="users" :loading="loading" stripedRows paginator lazy :rows="pageSize"
                :first="(currentPage - 1) * pageSize" :totalRecords="total" :rowsPerPageOptions="[10, 20, 50]"
                tableStyle="min-width: 50rem" @page="onPage">
                <template #empty>
                    <div class="text-center p-4">暂无在线用户</div>
                </template>

                <Column field="id" header="ID" style="width: 6%"></Column>

                <Column field="username" header="用户名" style="width: 18%">
                    <template #body="slotProps">
                        <div class="flex items-center gap-2">
                            <span class="font-medium">{{ slotProps.data.username }}</span>
                            <Tag v-if="getRoleTag(slotProps.data.roleId)"
                                :value="getRoleTag(slotProps.data.roleId)?.value"
                                :severity="getRoleTag(slotProps.data.roleId)?.severity" rounded class="text-xs">
                            </Tag>
                        </div>
                    </template>
                </Column>

                <Column field="nickname" header="昵称" style="width: 15%"></Column>

                <Column field="loginTime" header="登录时间" style="width: 16%">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.loginTime) }}
                    </template>
                </Column>

                <Column field="ip" header="登录IP" style="width: 12%">
                    <template #body="slotProps">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-globe text-gray-400"></i>
                            <span>{{ slotProps.data.ip }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="tokenRemainingTime" header="Token剩余时间" style="width: 20%">
                    <template #body="slotProps">
                        <div class="flex flex-col gap-1">
                            <span :class="getTokenTimeClass(slotProps.data.tokenRemainingTime)">
                                {{ formatDuration(slotProps.data.tokenRemainingTime) }}
                            </span>
                            <ProgressBar :value="calculateProgress(slotProps.data.tokenRemainingTime)"
                                :showValue="false" style="height: 4px" :pt="{
                                    value: { class: getTokenProgressClass(slotProps.data.tokenRemainingTime) }
                                }" />
                        </div>
                    </template>
                </Column>

                <Column header="操作" style="width: 5%" align="center">
                    <template #body="slotProps">
                        <Button icon="pi pi-trash" severity="danger" rounded text v-tooltip.top="'删除Token'"
                            @click="confirmDeleteToken(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ConfirmDialog from 'primevue/confirmdialog';
import { Role } from '@/common/constant/Role';
import { listOnlineUsers, kickOutOnlineUser } from '@/admin/api/onlineUsetAPI';

const confirm = useConfirm();
const toast = useToast();

// --- Interfaces ---
interface OnlineUser {
    id: string;
    username: string;
    nickname: string;
    loginTime: string; // ISO string
    ip: string;
    tokenRemainingTime: number; // seconds
    roleId: number;
}

interface OnlineStats {
    totalOnline: number;
    adminOnline: number;
}

// --- State ---
const loading = ref(false);
const users = ref<OnlineUser[]>([]);
const tokenMaxDuration = ref(3600); // 60 minutes
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const stats = computed<OnlineStats>(() => {
    return {
        totalOnline: users.value.length,
        adminOnline: users.value.filter(u => u.roleId !== Role.STUDENT).length
    };
});

// --- Methods ---
const loadData = async () => {
    loading.value = true;
    try {
        const res = await listOnlineUsers({
            offset: pageSize.value,
            page: currentPage.value
        });
        const list = res.data?.list ?? [];
        users.value = list.map((item) => ({
            id: String(item.uid),
            username: item.username,
            nickname: item.nickname,
            loginTime: item.loginTime,
            ip: item.loingIp,
            tokenRemainingTime: item.tokenTtlSeconds,
            roleId: item.roleId
        }));
        total.value = res.data?.total ?? users.value.length;
    } catch (error) {
        console.error('Failed to load online users', error);
    } finally {
        loading.value = false;
    }
};

const confirmDeleteToken = (user: OnlineUser) => {
    confirm.require({
        message: `确定要删除用户 ${user.username} 的所有 Token 吗？这将强制该用户下线。`,
        header: '确认操作',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
            deleteToken(user);
        },
        reject: () => {
            // do nothing
        }
    });
};

const onPage = (event: { page: number; rows: number }) => {
    currentPage.value = event.page + 1;
    pageSize.value = event.rows;
    loadData();
};

const deleteToken = async (user: OnlineUser) => {
    await kickOutOnlineUser(Number(user.id));
    users.value = users.value.filter(u => u.id !== user.id);
    toast.add({ severity: 'success', summary: '操作成功', detail: `用户 ${user.username} 的 Token 已删除`, life: 3000 });
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}小时 ${m}分`;
    return `${m}分钟`;
};

const calculateProgress = (remaining: number) => {
    return (remaining / tokenMaxDuration.value) * 100;
};

const getTokenTimeClass = (seconds: number) => {
    if (seconds < 300) return 'text-red-500 font-bold'; // < 5 mins
    if (seconds < 900) return 'text-orange-500'; // < 15 mins
    return 'text-green-600 dark:text-green-400';
};

const getTokenProgressClass = (seconds: number) => {
    if (seconds < 300) return 'bg-red-500';
    if (seconds < 900) return 'bg-orange-500';
    return 'bg-green-500';
};

const getRoleTag = (roleId: number) => {
    switch (roleId) {
        case Role.SYSADMIN: return { value: 'SysAdmin', severity: 'danger' };
        case Role.ADMIN: return { value: 'Admin', severity: 'warning' };
        case Role.TEACHER: return { value: 'Teacher', severity: 'info' };
        case Role.COLLBORATOR: return { value: 'Collaborator', severity: 'success' };
        default: return null;
    }
};

// --- Lifecycle ---
onMounted(() => {
    loadData();
});
</script>

<style scoped>
/* Add any specific overrides here if Tailwind is not enough */
</style>
