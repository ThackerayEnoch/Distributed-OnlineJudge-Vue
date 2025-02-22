<template>
    <div v-show="isloading" class="flex flex-col items-center justify-center h-screen">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
            aria-label="Custom ProgressSpinner" />
        <span class="mt-2 text-gray-500">加载统计信息中...</span>
    </div>

    <div v-show="!isloading" class="p-6 space-y-6">
        <!-- 作业整体统计 -->
        <div class="grid grid-cols-4 gap-4">
            <Card v-for="stat in stats" :key="stat.label" class="p-0 shadow-md rounded">
                <template #content>
                    <div class="text-xl font-bold" :class="stat.color">{{ stat.value }}</div>
                    <div class="text-gray-500">{{ stat.label }}</div>
                </template>
            </Card>
        </div>

        <!-- 题目统计表格 -->
        <DataTable :value="problems" sortField="displayId" :sortOrder="1" class="shadow-md rounded">
            <Column field="id" header="ID"></Column>
            <Column field="displayId" header="题号" sortable>
                <template #body="{ data }">
                    <span>{{ convertToLetter(data.displayId) }}</span>
                </template>
            </Column>
            <Column field="title" header="题目">
                <template #body="slotProps">
                    <router-link :to="'/problem/' + slotProps.data.id">{{ slotProps.data.title
                        }}</router-link>
                </template>
            </Column>

            <Column field="submissions" header="总提交次数" sortable />
            <Column field="passRate" header="通过率" sortable>
                <template #body="{ data }">
                    <span :class="data.passRate > 50 ? 'text-green-500' : 'text-red-500'">
                        {{ data.passRate }}%
                    </span>
                </template>
            </Column>
        </DataTable>

        <!-- 可视化图表 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Chart type="bar" :data="barChartData" :options="countOptions"
                class="shadow-md p-4 rounded-2xl h-[25rem] w-full" />
            <Chart type="line" :data="lineChartData" :options="submitCountOptions"
                class="shadow-md rounded-2xl p-4 h-[25rem] w-full" />
        </div>

        <!-- 学生个人表现 -->
        <DataTable :value="students" sortField="solved" :sortOrder="-1" class="shadow-md rounded-2xl">
            <template #header>
                <div class="flex justify-between items-center">
                    <div class="text-lg font-bold">学生数据</div>
                    <Button icon="pi pi-plus" class="p-button-rounded p-button-sm p-button-text" />
                </div>

            </template>
            <Column field="id" header="#" />
            <Column field="nickname" header="姓名" />
            <Column field="solved" header="通过题数" sortable />
            <Column field="passRate" header="完成率" sortable>
                <template #body="slotProps">
                    <span
                        :class="slotProps.data.solved * 100.0 / problems.length > 50 ? 'text-green-500' : 'text-red-500'">
                        {{ (slotProps.data.solved * 100.0 / problems.length).toFixed(2) }}%
                    </span>
                </template>
            </Column>
            <Column field="attempts" header="提交次数" sortable />
            <Column header="操作">
                <template #body>
                    <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, defineProps, onMounted } from 'vue';
import { getHomeworkStat, type ContestSpace } from '@/admin/api/contestAPI';
import globalMessage from '@/common/utils/toast';

const props = defineProps<{
    id: number;
}>();


const stats = ref([
    { label: '提交率', value: '85%', color: 'text-green-500' },
    { label: '通过率', value: '65%', color: 'text-green-500' },
    { label: '平均提交次数', value: '2.3', color: 'text-blue-500' },
    { label: '最难题目', value: '链表基础操作', color: 'text-red-500' }
]);

const problems = ref<ContestSpace.ProblemVO[]>([]);
const students = ref<ContestSpace.StudentsVO[]>([]);
const isloading = ref(true);
const documentStyle = getComputedStyle(document.documentElement);
const textColor = documentStyle.getPropertyValue('--p-text-color');
const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');
const barChartData = reactive({
    labels: [] as string[],
    datasets: [
        {
            type: 'bar',
            label: 'AC',
            backgroundColor: documentStyle.getPropertyValue('--p-green-500'),
            data: [] as number[]
        },
        {
            type: 'bar',
            label: 'WA',
            backgroundColor: documentStyle.getPropertyValue('--p-red-500'),
            data: [] as number[]
        },
        {
            type: 'bar',
            label: 'RE',
            backgroundColor: documentStyle.getPropertyValue('--p-purple-500'),
            data: [] as number[]
        },
        {
            type: 'bar',
            label: 'CE',
            backgroundColor: documentStyle.getPropertyValue('--p-yellow-500'),
            data: [] as number[]
        },
        {
            type: 'bar',
            label: 'TLE',
            backgroundColor: documentStyle.getPropertyValue('--p-blue-900'),
            data: [] as number[]
        },
    ]
});
const lineChartData = reactive({
    labels: ['5%', '10%', '15%', '20%', '25%', '30%', '35%', '40%', '45%', '50%', '55%', '60%', '65%', '70%', '75%', '80%', '85%', '90%', '95%', '100%'],
    datasets: [
        {
            label: '各时间段总提交次数: ',
            data: [] as number[],
            fill: false,
            borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
            tension: 0.4
        }
    ]
})
const countOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
        tooltips: {
            mode: 'index',
            intersect: false
        },
        legend: {
            labels: {
                color: textColor
            }
        }
    },
    scales: {
        x: {
            stacked: true,
            ticks: {
                color: textColorSecondary
            },
            grid: {
                color: surfaceBorder
            }
        },
        y: {
            stacked: true,
            ticks: {
                color: textColorSecondary
            },
            grid: {
                color: surfaceBorder
            }
        }
    }
}
const submitCountOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
        legend: {
            labels: {
                color: textColor
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: textColorSecondary
            },
            grid: {
                color: surfaceBorder
            }
        },
        y: {
            ticks: {
                color: textColorSecondary
            },
            grid: {
                color: surfaceBorder
            }
        }
    }
}
onMounted(() => {
    loadData();
});
async function loadData() {
    isloading.value = true;
    await getHomeworkStat(props.id as number).then(res => {
        const data: ContestSpace.StatVO = res.data as ContestSpace.StatVO;
        // Top 显示数据
        const commonStats = [
            { label: '通过率', value: data.topRateVO.passRate.toString() + '%', color: 'text-green-500' },
            { label: '平均提交次数', value: data.topRateVO.avgRate.toString(), color: 'text-blue-500' },
            { label: '最难题目(通过率最低)', value: data.topRateVO.difficultTitle, color: 'text-red-500' }
        ];

        if (data.auth == 0) {
            stats.value = [
                { label: '参与人数', value: data.totalUser.toString(), color: 'text-green-500' },
                ...commonStats
            ];
        } else {
            stats.value = [
                { label: '提交率', value: data.topRateVO.submitRate.toString() + '%', color: 'text-green-500' },
                ...commonStats
            ];
        }
        // 题目统计数据
        problems.value = data.problemVO;
        // 学生数据
        students.value = data.studentsVO;
        // 题目提交矩形图数据
        barChartData.labels = data.countDataSetVO.map(dataset => convertToLetter(Number(dataset.label)));
        barChartData.datasets[0].data = data.countDataSetVO.map(dataset => dataset.data[0]);
        barChartData.datasets[1].data = data.countDataSetVO.map(dataset => dataset.data[1]);
        barChartData.datasets[2].data = data.countDataSetVO.map(dataset => dataset.data[2]);
        barChartData.datasets[3].data = data.countDataSetVO.map(dataset => dataset.data[3]);
        barChartData.datasets[4].data = data.countDataSetVO.map(dataset => dataset.data[4]);
        // 提交次数折线图数据
        lineChartData.datasets[0].data = data.submitDataSetVO;
        isloading.value = false;
    }).catch(() => {
        globalMessage.error('加载数据失败', '请刷新重试');
    });
}
function convertToLetter(num: number) {
    let str = '';
    num = num + 1;
    while (num > 0) {
        let m = num % 26;
        if (m === 0) {
            m = 26;
        }
        str = String.fromCharCode(m + 64) + str;
        num = (num - m) / 26;
    }
    return str;
}
</script>

<style scoped>
.shadow-md {
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.re-color {
    background-color: #9C3DCD;
}

.tle-color {
    background-color: #052242;
}
</style>