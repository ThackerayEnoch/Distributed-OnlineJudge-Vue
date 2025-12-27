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
                        <InputText v-model="filters.global.value" placeholder="搜索用户名/IP..." class="w-full md:w-64" />
                    </IconField>
                    <Dropdown v-model="filters.status.value" :options="statusOptions" optionLabel="label"
                        optionValue="value" placeholder="状态" showClear class="w-32" />
                </div>
                <div class="flex gap-2">
                    <Button icon="pi pi-refresh" label="刷新" text @click="loadData" :loading="loading" />
                    <Button icon="pi pi-download" label="导出" severity="secondary" text @click="exportCSV" />
                </div>
            </div>

            <!-- 数据表格 -->
            <DataTable ref="dt" :value="logs" :loading="loading" stripedRows paginator :rows="10"
                :rowsPerPageOptions="[10, 20, 50]" :filters="filters" tableStyle="min-width: 60rem">
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
                        <span :class="{ 'text-red-500': !slotProps.data.status, 'text-gray-600': slotProps.data.status }">
                            {{ slotProps.data.message }}
                        </span>
                        <div class="text-xs text-gray-400 mt-1" v-if="slotProps.data.browser">
                            {{ slotProps.data.os }} / {{ slotProps.data.browser }}
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
import { ref, onMounted, computed } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';

// --- Interfaces ---
interface LoginLog {
    id: string;
    userId: string;
    username: string;
    ip: string;
    location?: string;
    status: boolean; // true success, false fail
    message: string;
    loginTime: string; // ISO string
    browser?: string;
    os?: string;
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
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const statusOptions = [
    { label: '成功', value: true },
    { label: '失败', value: false }
];

const stats = computed<LogStats>(() => {
    // In a real app, these stats might come from a separate API endpoint
    const today = new Date().toDateString();
    const todayLogs = logs.value.filter(l => new Date(l.loginTime).toDateString() === today);
    const total = todayLogs.length;
    const fail = todayLogs.filter(l => !l.status).length;

    return {
        todayTotal: total,
        todayFail: fail,
        successRate: total > 0 ? Math.round(((total - fail) / total) * 100) : 100
    };
});

// --- Mock Data & API ---
const generateMockData = (): LoginLog[] => {
    const mockLogs: LoginLog[] = [];
    const users = [
        { id: '1001', name: 'admin' },
        { id: '2045', name: 'student_a' },
        { id: '2046', name: 'student_b' },
        { id: '2047', name: 'teacher_wang' },
        { id: '3001', name: 'guest_01' }
    ];
    const ips = ['192.168.1.1', '10.0.0.5', '172.16.0.100', '202.106.0.20', '114.114.114.114'];
    const locations = ['局域网', '学校机房', '教职工网络', '北京', '江苏南京'];
    const browsers = ['Chrome 120', 'Firefox 118', 'Edge 119', 'Safari 17'];
    const osList = ['Windows 11', 'Windows 10', 'macOS', 'Linux'];
    const failReasons = ['密码错误', '验证码错误', '账户被锁定', 'IP不在白名单'];

    for (let i = 0; i < 50; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const isSuccess = Math.random() > 0.2; // 80% success rate
        const ipIndex = Math.floor(Math.random() * ips.length);

        mockLogs.push({
            id: (10000 + i).toString(),
            userId: user.id,
            username: user.name,
            ip: ips[ipIndex],
            location: locations[ipIndex],
            status: isSuccess,
            message: isSuccess ? '登录成功' : failReasons[Math.floor(Math.random() * failReasons.length)],
            loginTime: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 48).toISOString(), // Past 48 hours
            browser: browsers[Math.floor(Math.random() * browsers.length)],
            os: osList[Math.floor(Math.random() * osList.length)]
        });
    }

    // Sort by time desc
    return mockLogs.sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
};

const fetchLogsAPI = async (): Promise<LoginLog[]> => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(generateMockData());
        }, 600);
    });
};

// --- Methods ---
const loadData = async () => {
    loading.value = true;
    try {
        logs.value = await fetchLogsAPI();
    } catch (error) {
        console.error('Failed to load login logs', error);
    } finally {
        loading.value = false;
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

// --- Lifecycle ---
onMounted(() => {
    loadData();
});
</script>

<style scoped>
/* Add any specific overrides here if Tailwind is not enough */
</style>
