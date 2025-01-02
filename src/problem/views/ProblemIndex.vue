<template>
    <div class="w-full h-full flex">
        <!-- Left Container -->
        <div class="w-[75%] h-full flex flex-col">
            <!-- Search Area -->
            <!-- Search Area -->
            <div class="w-full p-4 mb-4 shadow-lg bg-white dark:bg-gray-800">
                <!-- Search Area -->
                <div class="flex justify-between items-center mb-4">
                    <h1 class="text-2xl font-bold">题目列表</h1>
                    <InputGroup style="max-width: 75%;">
                        <InputText v-model="text1" placeholder="题目名" style="border-radius: 0;" />
                        <InputGroupAddon style="margin: 0;padding: 0;border-radius: 0;">
                            <Button icon="pi pi-search" severity="secondary" style="border-radius: 0;" variant="text"
                                @click="toggle" />
                        </InputGroupAddon>
                    </InputGroup>
                    <Button icon="pi pi-sync" rounded @click="getProblems" />
                    <Button icon="fa-solid fa-shuffle" label="随机一题" />
                </div>
                <div class="flex flex-col mb-4">
                    <div class="flex items-center mb-4">
                        <span class="mr-2 text-lg font-bold">题库</span>
                        <div class="ml-2">
                            <Button label="全部" class="p-button-outlined custom-button p-button-md mr-3"
                                @click="filterBySource('all')" />
                            <Button label="主题库" class="p-button-outlined custom-button mr-3"
                                @click="filterBySource('theme')" />
                            <Button label="HDU" class="p-button-outlined custom-button mr-3"
                                @click="filterBySource('hdu')" />
                            <Button label="POJ" class="p-button-outlined custom-button"
                                @click="filterBySource('poj')" />
                        </div>
                    </div>
                    <div class="flex items-center">
                        <span class="mr-2 text-lg font-bold">难度</span>
                        <div class="ml-2">
                            <Button label="全部" class="p-button-outlined custom-buttonm mr-3"
                                @click="filterByDifficulty('all')" />
                            <Button label="简单" class="p-button-outlined custom-button mr-3"
                                @click="filterByDifficulty('easy')" />
                            <Button label="中等" class="p-button-outlined custom-button mr-3"
                                @click="filterByDifficulty('medium')" />
                            <Button label="困难" class="p-button-outlined custom-button"
                                @click="filterByDifficulty('hard')" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-full h-[75%] p-4 shadow-lg bg-white dark:bg-gray-800">
                <!-- DataTable with PrimeVue -->
                <DataTable :value="problems" stripedRows paginator :rows="30" tableStyle="min-width: 60%"
                    responsiveLayout="scroll" size="large" :totalRecords="totalRecords" lazy :first="first"
                    @page="onPage" @mouseover="selectRow">

                    <Column field="hasDo" header="状态" style="width: 7%"></Column>
                    <!-- ID Column -->
                    <Column field="problemId" header="题目ID" style="width: 8%"></Column>

                    <!-- Title Column -->
                    <Column field="title" header="题目名称">
                        <template #body="slotProps">
                            <a :href="`/problem/${slotProps.data.id}`">
                                {{ slotProps.data.title }}
                            </a>
                        </template>
                    </Column>

                    <!-- Difficulty Column -->
                    <Column field="difficulty" header="难度" style="width: 10%">
                        <template #body="slotProps">
                            <Tag :value="!slotProps.data.difficulty ? '简单' : slotProps.data.difficulty == 1 ? '中等' : '困难'"
                                :severity="getTagSeverity(slotProps.data.difficulty)"
                                class="text-xs font-bold rounded-lg" />
                        </template>
                    </Column>

                    <Column field="submissionCount" header="总提交" style="width: 10%">
                        <template #body="slotProps">
                            {{ slotProps.data.submissionCount }}
                        </template>
                    </Column>
                    <!-- Accuracy Column -->
                    <Column field="accuracy" header="通过率" style="width: 20%">
                        <template #body="slotProps">
                            <ProgressBar
                                :value="parseFloat(((slotProps.data.acCount / (slotProps.data.submissionCount || 1)) * 100).toFixed(2))"
                                :class="getProgressBarColor(((slotProps.data.acCount / slotProps.data.submissionCount) * 100).toFixed(2))">
                            </ProgressBar>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="fixed top-22 right-10 w-[22%] h-auto fixed-card card p-4 bg-white dark:bg-gray-800">
            <h2 class="text-xl font-bold text-center mb-4">{{ selectedProblem.title }}</h2>
            <div class="flex flex-col space-y-4">
                <div class="flex items-center justify-between">
                    <Tag value="AC" severity="success" class="mr-2 w-12 text-center" />
                    <ProgressBar :value="selectedProblem.acPercentage" class="w-full progress-80" />
                </div>
                <div class="flex items-center justify-between">
                    <Tag value="WA" severity="danger" class="mr-2 w-12 text-center" />
                    <ProgressBar :value="selectedProblem.waPercentage" class="w-full progress-20" />
                </div>
                <div class="flex items-center justify-between">
                    <Tag value="TLE" severity="danger" class="mr-2 w-12 text-center" />
                    <ProgressBar :value="selectedProblem.tlePercentage" class="w-full progress-20" />
                </div>
                <div class="flex items-center justify-between">
                    <Tag value="MLE" severity="danger" class="mr-2 w-12 text-center" />
                    <ProgressBar :value="selectedProblem.mlePercentage" class="w-full progress-20" />
                </div>
                <div class="flex items-center justify-between">
                    <Tag value="RE" severity="warn" class="mr-2 w-12 text-center" />
                    <ProgressBar :value="selectedProblem.rePercentage" class="w-full progress-40" />
                </div>
                <div class="flex items-center justify-between">
                    <Tag value="CE" severity="warn" class="mr-2 w-12 text-center" />
                    <ProgressBar :value="selectedProblem.cePercentage" class="w-full progress-40" />
                </div>
                <div class="flex items-center justify-between">
                    <Tag value="Other" severity="warn" class="mr-2 w-12 text-center" />
                    <ProgressBar :value="selectedProblem.oePercentage" class="w-full progress-40" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { getProblemPage, getProblemCount, type Problem } from '../problemAPI';
import { useRoute, useRouter } from 'vue-router';
export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        // Problem data
        const problems = ref([]);
        const totalRecords = ref(30);
        const first = ref((parseInt(route.query.currentPage as string || '1') - 1) * 30 || 0);

        // 统计数据
        const statTitle = ref('请点击或悬停鼠标至问题行查看提交状态');
        const selectedProblem = reactive({
            title: statTitle.value,
            acPercentage: 0,
            waPercentage: 0,
            tlePercentage: 0,
            mlePercentage: 0,
            rePercentage: 0,
            cePercentage: 0,
            oePercentage: 0,
        });
        onMounted(() => {
            getCount();
            getProblems(first.value);
        });
        const getProblems = async (page: number) => {
            const response = await getProblemPage(page);
            problems.value = response.data as any;
        };
        const getCount = async () => {
            const response = await getProblemCount();
            if (response.data) {
                totalRecords.value = response.data.count;
            }
        };
        const onPage = (event: any) => {
            getProblems(event.first);
            first.value = event.first;
            router.push({ query: { currentPage: event.page + 1 } });
            scrollToTop();
        };
        const selectRow = (event: MouseEvent) => {
            const rowElement = (event.target as HTMLElement).closest('tr');
            if (rowElement) {
                const rowIndex = Array.from(rowElement.parentNode!.children).indexOf(rowElement);
                const problem: Problem.ProblemListJSONObject = problems.value[rowIndex];
                if (problem) {
                    selectedProblem.title = problem.title;
                    selectedProblem.acPercentage = parseFloat(((problem.acCount / (problem.submissionCount || 1)) * 100).toFixed(2));
                    selectedProblem.waPercentage = parseFloat(((problem.waCount / (problem.submissionCount || 1)) * 100).toFixed(2));
                    selectedProblem.tlePercentage = parseFloat(((problem.tleCount / (problem.submissionCount || 1)) * 100).toFixed(2));
                    selectedProblem.mlePercentage = parseFloat(((problem.mleCount / (problem.submissionCount || 1)) * 100).toFixed(2));
                    selectedProblem.rePercentage = parseFloat(((problem.reCount / (problem.submissionCount || 1)) * 100).toFixed(2));
                    selectedProblem.cePercentage = parseFloat(((problem.ceCount / (problem.submissionCount || 1)) * 100).toFixed(2));
                    selectedProblem.oePercentage = parseFloat(((problem.otherCount / (problem.submissionCount || 1)) * 100).toFixed(2));
                }
            }
        };
        const getTagSeverity = (difficulty: number) => {
            switch (difficulty) {
                case 0:
                    return 'success';
                case 1:
                    return 'info';
                case 2:
                    return 'danger';
                default:
                    return 'success';
            }
        };
        const getProgressBarColor = (accuracy: number) => {
            if (accuracy < 40) return 'progress-20';
            if (accuracy < 60) return 'progress-40';
            if (accuracy < 80) return 'progress-60';
            return 'progress-80';
        };
        const scrollToTop = () => {
            window.scrollTo({
                top: 0, // 回到顶部
                left: 0,
                behavior: 'smooth', // 平滑滚动
            });
        };
        return { problems, selectRow, getProgressBarColor, getTagSeverity, totalRecords, first, onPage, statTitle, selectedProblem };
    },
};
</script>

<style scoped>
/* 自定义前景色 */
/* 确保使用高优先级选择器覆盖默认样式 */
.progress-20 ::v-deep(.p-progressbar-value) {
    background-color: #F56C6C !important;
}

.progress-40 ::v-deep(.p-progressbar-value) {
    background-color: #E6A23C !important;
}

.progress-60 ::v-deep(.p-progressbar-value) {
    background-color: #1989FA !important;
}

.progress-80 ::v-deep(.p-progressbar-value) {
    background-color: #10B981 !important;
}

.custom-button {
    padding: 0.38rem 0.6rem;
    font-size: 0.975rem;
}

@media (max-width: 1000px) {
    .fixed-card {
        display: none;
    }
}
</style>
