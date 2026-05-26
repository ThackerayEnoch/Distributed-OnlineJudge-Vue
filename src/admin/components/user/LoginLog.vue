<template>
    <div class="p-4">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500 flex items-center justify-between">
                <div>
                    <span class="block text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">今日登录总数</span>
                    <span class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.todayTotal }}</span>
                </div>
                <div
                    class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500">
                    <i class="pi pi-sign-in text-lg"></i>
                </div>
            </div>
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-green-500 flex items-center justify-between">
                <div>
                    <span class="block text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">登录成功率</span>
                    <span class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.successRate }}%</span>
                </div>
                <div
                    class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-500">
                    <i class="pi pi-check-circle text-lg"></i>
                </div>
            </div>
            <div
                class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-red-500 flex items-center justify-between">
                <div>
                    <span class="block text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">今日异常/失败</span>
                    <span class="text-2xl font-bold text-gray-800 dark:text-white">{{ stats.todayFail }}</span>
                </div>
                <div
                    class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-500">
                    <i class="pi pi-exclamation-circle text-lg"></i>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <!-- 工具栏 -->
            <div
                class="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div class="flex gap-2 w-full md:w-auto">
                    <IconField iconPosition="left">
                        <InputIcon class="pi pi-search" />
                        <InputText v-model="searchContent" placeholder="搜索用户名/IP..." class="w-full md:w-64" />
                    </IconField>
                    <Dropdown v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value"
                        placeholder="状态" class="w-32" />
                </div>
                <div class="flex gap-2">
                    <Button icon="pi pi-refresh" label="刷新" text @click="loadData" :loading="loading" />
                    <Button icon="pi pi-download" label="导出" severity="secondary" text @click="exportCSV" />
                </div>
            </div>

            <!-- 数据表格 -->
            <DataTable ref="dt" :value="logs" :loading="loading" stripedRows paginator lazy :rows="pageSize"
                :totalRecords="total" :first="cursor" :rowsPerPageOptions="[10, 20, 50]" tableStyle="min-width: 60rem"
                @page="onPage">
                <template #empty>
                    <div class="text-center p-8 text-gray-500">暂无登录日志数据</div>
                </template>

                <Column field="id" header="ID" style="width: 8%"></Column>

                <Column field="username" header="用户" style="width: 20%">
                    <template #body="slotProps">
                        <div class="flex flex-col">
                            <span class="font-medium text-gray-800 dark:text-gray-200">{{ slotProps.data.username
                                }}</span>
                            <span class="text-xs text-gray-500">ID: {{ slotProps.data.userId }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="ip" header="登录IP" style="width: 18%">
                    <template #body="slotProps">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-globe text-gray-400"></i>
                            <div>
                                <div class="font-mono text-sm">{{ slotProps.data.ip }}</div>
                                <div class="text-xs text-gray-500" v-if="slotProps.data.location">{{
                                    slotProps.data.location }}</div>
                            </div>
                        </div>
                    </template>
                </Column>

                <Column field="status" header="状态" style="width: 12%" align="center">
                    <template #body="slotProps">
                        <Tag :severity="slotProps.data.status ? 'success' : 'danger'"
                            :value="slotProps.data.status ? '成功' : '失败'"
                            :icon="slotProps.data.status ? 'pi pi-check' : 'pi pi-times'" rounded>
                        </Tag>
                    </template>
                </Column>

                <Column field="message" header="详情/原因" style="width: 22%">
                    <template #body="slotProps">
                        <span
                            :class="{ 'text-red-500': !slotProps.data.status, 'text-gray-600': slotProps.data.status }">
                            {{ slotProps.data.message }}
                        </span>
                        <div class="text-xs text-gray-400 mt-1" v-if="slotProps.data.device">
                            {{ slotProps.data.device }}
                        </div>
                    </template>
                </Column>

                <Column field="loginTime" header="登录时间" style="width: 20%">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.loginTime) }}
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';
import { getAdminLoginLogs, getAdminLoginLogsStat, type LoginLogSpace } from '@/admin/api/loginLogAPi';

// --- Interfaces ---
interface LoginLog {
    id: number;
    userId: number;
    username: string;
    ip: string;
    location?: string;
    status: boolean;
    message: string;
    loginTime: string;
    device?: string;
}

interface LogStats {
    todayTotal: number;
    todayFail: number;
    successRate: number;
}

// --- State ---
const loading = ref(false);
const logs = ref<LoginLog[]>([]);
const dt = ref();
const searchContent = ref('');
const statusFilter = ref(-1);
const pageSize = ref(10);
const cursor = ref(0);
const total = ref(0);

const statusOptions = [
    { label: '全部', value: -1 },
    { label: '成功', value: 1 },
    { label: '失败', value: 0 }
];

const stats = ref<LogStats>({
    todayTotal: 0,
    todayFail: 0,
    successRate: 0
});

const mapLogItem = (item: LoginLogSpace.AdminLoginLogVO): LoginLog => {
    return {
        id: item.id,
        userId: item.userId,
        username: item.username,
        ip: item.loginIp,
        location: item.ipRegion,
        status: item.success,
        message: item.reason || (item.success ? '登录成功' : '登录失败'),
        loginTime: item.loginTime,
        device: item.device
    };
};

// --- Methods ---
const loadData = async () => {
    loading.value = true;
    try {
        const dto: LoginLogSpace.LoginLogQueryDTO = {
            size: pageSize.value,
            cursor: cursor.value,
            searchContent: searchContent.value.trim() || undefined,
            status: statusFilter.value
        };
        const result = await getAdminLoginLogs(dto);
        const data = result.data;
        logs.value = data?.list ? data.list.map(mapLogItem) : [];
        total.value = data?.total ?? 0;
    } catch (error) {
        console.error('Failed to load login logs', error);
    } finally {
        loading.value = false;
    }
};

const loadStats = async () => {
    try {
        const result = await getAdminLoginLogsStat();
        const data = result.data;
        const success = data?.success ?? 0;
        const failure = data?.failure ?? 0;
        const totalCount = success + failure;
        stats.value = {
            todayTotal: totalCount,
            todayFail: failure,
            successRate: totalCount > 0 ? Math.round((success / totalCount) * 100) : 0
        };
    } catch (error) {
        console.error('Failed to load login stats', error);
    }
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

const exportCSV = () => {
    dt.value.exportCSV();
};

const onPage = (event: { first: number; rows: number }) => {
    cursor.value = event.first;
    pageSize.value = event.rows;
    loadData();
};

watch([searchContent, statusFilter], () => {
    cursor.value = 0;
    loadData();
});

// --- Lifecycle ---
onMounted(() => {
    loadData();
    loadStats();
});
</script>

<style scoped>
/* Add any specific overrides here if Tailwind is not enough */
</style>
