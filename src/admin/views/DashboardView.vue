<template>
    <div class="min-h-screen p-6 pt-2 pl-0">
        <div class="grid gap-6 max-w-8xl mx-auto ml-2">
            <!-- 第一行：核心指标 -->
            <div class="grid md:grid-cols-4 gap-6">
                <!-- 判题队列 -->
                <Card class="p-4 shadow-sm">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-inbox text-blue-500"></i>
                            <h3 class="text-lg font-semibold">判题队列</h3>
                        </div>
                    </template>
                    <template #content>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center py-1">
                                <span class="text-gray-600">待判题数</span>
                                <Tag severity="warning" :value="judgeTask.queueLength" />
                            </div>
                            <div class="flex justify-between items-center py-1">
                                <span class="text-gray-600">今日判题总数</span>
                                <Tag severity="warning" :value="judgeTask.judgeCount" />
                            </div>
                            <div class="flex items-center gap-2 text-sm">
                                <i class="pi pi-check text-green-500"></i>
                                <span class="text-gray-600">判题机在线</span>
                                <span class="font-medium">{{ judgeTask.onlineJudgerCount }}/{{
                                    judgeTask.judgerTotalCount
                                    }}</span>
                            </div>
                        </div>
                    </template>
                </Card>
                <Card class="p-4 shadow-sm bg-white rounded-lg">
                    <template #header>
                        <div class="flex items-center gap-2 text-gray-600">
                            <i class="pi pi-chart-line text-blue-400"></i>
                            <h3 class="text-base font-medium">用户概况</h3>
                        </div>
                    </template>
                    <template #content>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center py-2 border-b">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-wifi text-green-500"></i>
                                    <span class="text-sm">当前在线</span>
                                </div>
                                <div class="text-xl font-bold">{{ onlineUsers }}</div>
                            </div>

                            <div class="flex justify-between items-center py-2">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-database text-blue-500"></i>
                                    <span class="text-sm">总用户数</span>
                                </div>
                                <div class="text-xl font-bold">{{ totalUsers }}</div>
                            </div>
                        </div>
                    </template>
                </Card>
                <Card class="p-4 md:col-span-2 shadow-sm">
                    <template #header>
                        <h3 class="text-lg font-semibold">提交统计</h3>
                    </template>
                    <template #content>
                        <div class="flex flex-col md:flex-row gap-4 h-full">
                            <!-- 左侧数据区 -->
                            <div class="flex flex-1 flex-col justify-between gap-4 md:border-r md:pr-4">
                                <div class="space-y-1 text-center">
                                    <div class="text-2xl md:text-xl lg:text-3xl font-bold">{{ totalSubmit }}</div>
                                    <div class="text-xs md:text-sm text-gray-500">今日提交</div>
                                </div>
                                <div class="space-y-1 text-center">
                                    <div v-if="totalSubmit != 0"
                                        class="text-2xl md:text-xl lg:text-3xl font-bold text-green-500">
                                        {{ Math.round(solvedSubmit * 100 / totalSubmit) }}%</div>
                                    <div v-else class="text-2xl md:text-xl lg:text-3xl font-bold text-gray-500">0%</div>
                                    <div class="text-xs md:text-sm text-gray-500">AC率</div>
                                </div>
                            </div>

                            <!-- 右侧图表区 -->
                            <div class="flex-[1.5] h-32 md:h-40">
                                <Chart type="pie" :data="langData" :options="{
                                    ...chartOptions,
                                    plugins: {
                                        ...chartOptions.plugins,
                                        legend: {
                                            position: 'bottom',
                                            labels: {
                                                boxWidth: 12,
                                                padding: 8
                                            }
                                        }
                                    }
                                }" />
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- 第二行：用户与提交 -->
            <div class="grid md:grid-cols-4 gap-6">
                <!-- 数据库状态 -->
                <Card class="p-4 shadow-sm md:col-span-2 ">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-database text-orange-500"></i>
                            <h3 class="text-lg font-semibold truncate">数据库集群 ({{ dbNodes.length }} nodes)</h3>
                        </div>
                    </template>
                    <template #content>
                        <div class="flex flex-col h-full">
                            <!-- 横向布局容器 -->
                            <div class="md:flex md:space-x-4 md:flex-1">
                                <!-- 左侧统计区块 -->
                                <div class="md:w-1/3 md:flex md:flex-col">
                                    <div class="grid grid-cols-3 md:grid-cols-1 md:flex-1 gap-2 mb-4">
                                        <div class="bg-blue-50 p-3 rounded-lg text-center">
                                            <div class="text-xl font-bold text-green-600">{{ healthNodes }}</div>
                                            <div class="text-xs text-gray-500 mt-1">健康节点</div>
                                        </div>
                                        <div class="bg-purple-50 p-3 rounded-lg text-center">
                                            <div class="text-xl font-bold">{{ avgDelay }}ms</div>
                                            <div class="text-xs text-gray-500 mt-1">平均延迟</div>
                                        </div>
                                        <div class="bg-orange-50 p-3 rounded-lg text-center">
                                            <div class="text-xl font-bold">{{ qps }}</div>
                                            <div class="text-xs text-gray-500 mt-1">QPS</div>
                                        </div>
                                    </div>

                                    <!-- 概要信息 -->
                                    <div class="space-y-2 mt-auto">
                                        <div
                                            class="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                                            <span class="text-gray-600">主库负载</span>
                                            <div class="flex items-center gap-2">
                                                <ProgressSpinner style="width:20px;height:20px"
                                                    :class="masterLoad > 80 ? 'text-red-500' : 'text-blue-500'" />
                                                <span>{{ masterLoad }}%</span>
                                            </div>
                                        </div>
                                        <Tag severity="warning" :value="`复制延迟: ${copyDelay}ms`"
                                            class="w-full text-xs justify-center" />
                                    </div>
                                </div>

                                <!-- 右侧表格区块 -->
                                <div class="md:w-2/3 overflow-x-auto">
                                    <DataTable :value="dbNodes" class="p-datatable-sm text-xs" :scrollable="true"
                                        scrollHeight="flex" rowHover>
                                        <Column field="name" header="节点" sortable style="min-width:80px">
                                            <template #body="{ data }">
                                                <div class="flex items-center gap-1">
                                                    <i class="pi" :class="data.role === 1 ? 'pi-star' : 'pi-circle-on'"
                                                        :style="{ color: data.role === 0 ? '#f59e0b' : '#4f46e5' }"></i>
                                                    <span class="truncate">{{ data.name }}</span>
                                                </div>
                                            </template>
                                        </Column>
                                        <Column header="延迟" style="min-width:80px">
                                            <template #body="{ data }">
                                                <span :class="data.latency > 50 ? 'text-red-500' : 'text-gray-700'">
                                                    {{ data.latency }}ms
                                                </span>
                                            </template>
                                        </Column>
                                        <Column field="connection" header="连接数" sortable style="min-width:90px" />
                                        <Column header="同步">
                                            <template #body="{ data }">
                                                <i v-if="data.inSync" class="pi pi-check text-green-500"></i>
                                                <i v-else class="pi pi-clock text-yellow-500"></i>
                                            </template>
                                        </Column>
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
                <!-- 微服务状态 -->
                <Card class="p-4 md:col-span-2 shadow-sm">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-cloud text-green-500"></i>
                            <h3 class="text-lg font-semibold">微服务集群</h3>
                        </div>
                    </template>
                    <template #content>
                        <DataTable :value="services" class="p-datatable-sm" scrollable scrollHeight="300px" :rows="5"
                            responsiveLayout="scroll">
                            <Column field="name" header="服务" sortable>
                                <template #body="{ data }">
                                    <div class="flex items-center gap-2">
                                        <i :class="data.icon" class="text-xs"></i>
                                        <span>{{ data.name }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column header="节点信息">
                                <template #body="{ data }">
                                    <div class="text-xs space-y-1">
                                        <div class="flex items-center gap-1">
                                            <i class="pi pi-desktop text-gray-400"></i>
                                            <span>{{ data.ip }}:{{ data.port }}</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <i class="pi pi-clock text-gray-400"></i>
                                            <span>{{ formatUptime(data.uptime) }}</span>
                                        </div>
                                    </div>
                                </template>
                            </Column>
                            <Column header="性能指标" class="text-right">
                                <template #body="{ data }">
                                    <div class="text-xs space-y-1">
                                        <div>CPU: {{ data.cpu }}%</div>
                                        <div>内存: {{ data.mem }}%</div>
                                    </div>
                                </template>
                            </Column>
                            <Column header="状态">
                                <template #body="{ data }">
                                    <Tag :severity="data.status ? 'success' : 'error'" class="text-xs">
                                        <div class="flex items-center gap-1">
                                            <i :class="data.status ? 'pi-check-circle' : 'pi-exclamation-triangle'"></i>
                                            <span>{{ data.status ? '健康' : '过载' }}</span>
                                        </div>
                                    </Tag>
                                </template>
                            </Column>
                        </DataTable>
                    </template>
                </Card>
            </div>

            <!-- 第三行：日志区域 -->
            <div class="grid lg:grid-cols-3 gap-6">
                <!-- 错误日志（占2/3宽度） -->
                <Card class="p-4 lg:col-span-2 shadow-sm">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">错误日志</h3>
                            <span class="text-red-500 text-sm">最近50条错误记录</span>
                        </div>
                    </template>
                    <template #content>
                        <DataTable :value="errorLogs" class="p-datatable-sm" :rows="5" scrollable scrollHeight="400px">
                            <Column field="time" header="时间" header-class="font-semibold" sortable class="w-28">
                                <template #body="{ data }">
                                    <span class="text-gray-600 text-xs">{{ formatDate(data.date) }}</span>
                                </template>
                            </Column>
                            <Column field="level" header="级别" header-class="font-semibold" class="w-20">
                                <template #body="{ data }">
                                    <Tag :severity="data.errorLevel === 'ERROR' ? 'danger' : 'warning'" rounded>
                                        {{ data.errorLevel }}
                                    </Tag>
                                </template>
                            </Column>
                            <Column field="message" header="错误信息" header-class="font-semibold">
                                <template #body="{ data }">
                                    <div class="font-mono text-sm text-gray-700 truncate hover:text-clip">
                                        {{ data.errorMessage }}
                                    </div>
                                </template>
                            </Column>
                            <Column header-class="w-10">
                                <template #body>
                                    <Button icon="pi pi-ellipsis-h" class="p-button-text p-button-sm" />
                                </template>
                            </Column>
                        </DataTable>
                    </template>
                </Card>

                <!-- 重要操作日志（占1/3宽度） -->
                <Card class="p-4 shadow-sm">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">关键操作</h3>
                            <Tag value="历史记录" severity="info" class="text-xs" />
                        </div>
                    </template>
                    <template #content>
                        <Timeline :value="importantLogs" layout="vertical"
                            class="p-timeline-vertical h-[420px] overflow-y-auto pl-0 -ml-1">
                            <template #marker="{ item }">
                                <div class="flex items-center justify-center w-6 h-6 rounded-full text-white shadow"
                                    :class="{
                                        'bg-green-500': item.type === 'SUCCESS',
                                        'bg-blue-500': item.type === 'INFO',
                                        'bg-purple-500': item.type === 'ADMIN'
                                    }">
                                    <i :class="item.icon" class="text-sm"></i>
                                </div>
                            </template>
                            <template #opposite>

                            </template>
                            <template #content="{ item }">
                                <div class="pl-0"> <!-- 从原先的pl-4调整为pl-3 -->
                                    <div class="text-xs text-gray-500 mb-1">{{ item.time }}</div>
                                    <div class="font-medium text-sm leading-tight">
                                        <span class="block text-gray-900">{{ item.user }}</span>
                                        <span class="text-gray-600 font-normal">{{ item.action }}</span>
                                    </div>
                                    <Divider class="my-3" />
                                </div>
                            </template>
                        </Timeline>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import { type DashboardSpace, getServerInfoMetrics, getJudgeMetrics, getErrorList, getJudgeTask } from '@/admin/api/dashboardAPI';
const services = ref<DashboardSpace.ServiceVO[]>([]);
// 图表配置
const chartOptions = ref({
    plugins: {
        legend: {
            position: 'right',
            labels: {
                usePointStyle: true,
                padding: 16,
                font: {
                    size: 14
                }
            }
        }
    },
    maintainAspectRatio: false,
    responsive: true
});

// 图表数据
const totalSubmit = ref(0);
const solvedSubmit = ref(0);
const langData = ref({
    labels: ['C', 'C++', 'Java', 'Python', 'Other'],
    datasets: [
        {
            data: [35, 28, 20, 17, 10],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EF4444'],
            hoverBackgroundColor: ['#2563EB', '#059669', '#D97706', '#4F46E5', '#DC2626']
        }
    ]
});
const judgeTask = reactive<DashboardSpace.JudgeTaskVO>({
    queueLength: 0,
    judgeCount: 0,
    onlineJudgerCount: 0,
    judgerTotalCount: 0,
})
const onlineUsers = ref(0);
const totalUsers = ref(0);
onMounted(() => {
    loadServerData();
    loadJudgeData();
    loadErrorLogs();
    loadJudgeTaskInfo();
});
async function loadJudgeTaskInfo() {
    await getJudgeTask().then((res) => {
        const data = res.data as DashboardSpace.JudgeTaskVO;
        judgeTask.queueLength = data.queueLength;
        judgeTask.judgeCount = data.judgeCount;
        judgeTask.onlineJudgerCount = data.onlineJudgerCount;
        judgeTask.judgerTotalCount = data.judgerTotalCount;
    });
}
async function loadErrorLogs() {
    await getErrorList().then((res) => {
        errorLogs.value = res.data as DashboardSpace.ErrorVO[];
    });
}
async function loadJudgeData() {
    await getJudgeMetrics().then((res) => {
        const data = res.data as DashboardSpace.JudgeMonitorVO;
        // 更新数据
        totalSubmit.value = data.submitCount;
        solvedSubmit.value = data.solvedCount;
        langData.value.datasets[0].data = data.languageCount;
        onlineUsers.value = data.userCount;
        totalUsers.value = data.totalUserCount;
    });
}
async function loadServerData() {
    await getServerInfoMetrics().then((res) => {
        const data = res.data as DashboardSpace.ServerInfoMetricsVO;
        services.value = data.serviceVOS;
        dbNodes.value = data.dbNodes;
        qps.value = data.qps;
        healthNodes.value = data.healthyNodes;
        masterLoad.value = data.masterLoad;
        copyDelay.value = data.copyDelay;
        // 计算平均延迟
        avgDelay.value = dbNodes.value.reduce((acc, cur) => acc + cur.latency, 0) / dbNodes.value.length;
    });
}
function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let result = '';
    if (days > 0) {
        result += `${days}天 `;
    }
    if (hours > 0) {
        result += `${hours}小时 `;
    }
    if (minutes > 0) {
        result += `${minutes}分钟 `;
    }
    result += `${secs}秒`;

    return result;
}
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}
const dbNodes = ref<DashboardSpace.DbNode[]>([]);
const qps = ref(0);
const healthNodes = ref(0);
const masterLoad = ref(0);
const copyDelay = ref(0);
const avgDelay = ref(0);
const errorLogs = ref<DashboardSpace.ErrorVO[]>([
]);

const importantLogs = ref([
    {
        time: '2024-03-20 09:15',
        type: 'ADMIN',
        icon: 'pi pi-server',
        user: 'sysadmin',
        action: '测试'
    }
]);
// 其他数据保持不变...
</script>
<style scoped>
/* 自定义表格样式 */
::v-deep(.p-timeline-event-opposite) {
    flex: none;
}

.p-datatable-sm .p-datatable-thead>tr>th {
    @apply px-3 py-2 text-sm;
}

.p-datatable-sm .p-datatable-tbody>tr>td {
    @apply px-3 py-2 text-sm;
}

/* 时间线样式 */
.p-timeline-vertical .p-timeline-event-marker {
    @apply shadow-md;
}

.p-timeline-vertical .p-timeline-event-connector {
    @apply bg-gray-200;
}
</style>