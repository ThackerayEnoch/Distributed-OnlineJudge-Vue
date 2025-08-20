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
                        <InputText placeholder="题目名" @keyup.enter="onSearch" v-model:modelValue="searchContent"
                            style="border-radius: 0;" />
                        <InputGroupAddon style="margin: 0;padding: 0;border-radius: 0;">
                            <Button icon="pi pi-search" @click="onSearch" severity="secondary" style="border-radius: 0;"
                                variant="text" />
                        </InputGroupAddon>
                    </InputGroup>
                    <Button icon="pi pi-sync" @click="onSearch" rounded />
                    <Button icon="fa-solid fa-shuffle" @click="randomProblem" label="随机一题" />
                </div>
                <div class="flex flex-col mb-0">
                    <div class="flex items-center mb-0">
                        <span class="mr-2 text-lg font-bold">题库</span>
                        <div class="ml-2">
                            <Button label="全部" class="p-button-outlined custom-button p-button-md mr-3" />
                            <Button label="主题库" class="p-button-outlined custom-button mr-3" />
                            <Button label="HDU" class="p-button-outlined custom-button mr-3" />
                            <Button label="POJ" class="p-button-outlined custom-button" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-full h-[75%] p-4 shadow-lg bg-white dark:bg-gray-800">
                <!-- DataTable with PrimeVue -->
                <DataTable :value="problems" stripedRows paginator :rows="30" tableStyle="min-width: 60%"
                    responsiveLayout="scroll" size="large" :totalRecords="totalRecords" lazy :first="first"
                    @page="onPage" @mouseover="selectRow">

                    <Column field="hasDo" header="状态" style="width: 5%;">
                        <template #body="slotProps">
                            <div class="flex-1 text-center font-bold">
                                <Tag v-if="slotProps.data.hasDo" severity=" success" value="AC"></Tag>
                                <Tag v-if="slotProps.data.hasDo != null && !slotProps.data.hasDo" severity="danger"
                                    value="WA"></Tag>
                            </div>
                        </template>
                    </Column>
                    <!-- ID Column -->
                    <Column field="displayId" header="题目ID" style="width: 8%"></Column>

                    <!-- Title Column -->
                    <Column field="title" header="题目名称">
                        <template #body="slotProps">
                            <router-link :to="`/problem/${slotProps.data.id}`">
                                {{ slotProps.data.title }}

                            </router-link>
                        </template>
                    </Column>

                    <Column field="tags" header="题目标签">
                        <template #body="slotProps">
                            <div class="flex overflow-x-hidden gap-1 max-w-[250px]">
                                <template v-for="(tag, index) in slotProps.data.tags" :key="index">
                                    <span :style="{ backgroundColor: tag.color }" class="text-sm font-bold rounded px-2 py-1 
                 text-white shadow-sm whitespace-nowrap
                 transition-colors hover:brightness-110">
                                        {{ tag.name }}
                                    </span>
                                </template>
                            </div>
                        </template>
                    </Column>

                    <Column field="submissionCount" header="总提交" style="width: 8%;">
                        <template #body="slotProps">
                            {{ slotProps.data.submissionCount }}
                        </template>
                    </Column>
                    <Column field="acCount" header="通过次数" style="width: 9%;">
                        <template #body="slotProps">
                            {{ slotProps.data.acCount }}
                        </template>
                    </Column>
                    <!-- Accuracy Column -->
                    <Column field="accuracy" header="通过率" style="width: 7%;">
                        <template #body="slotProps">
                            <span v-if="slotProps.data.submissionCount != null && slotProps.data.submissionCount >
                                0">
                                {{ parseFloat(((slotProps.data.acCount / (slotProps.data.submissionCount || 1)) *
                                    100).toFixed(2)) }}%
                            </span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <div class="fixed top-22 right-10 w-[22%] flex flex-col max-h-[calc(100vh-5.5rem)] overflow-y-auto">
            <!-- 原统计卡片保持原有结构 -->
            <div class="card p-4 mb-4 bg-white dark:bg-gray-800 shadow-md">
                <!-- 原有所有进度条内容保持不变 -->
                <h2 class="text-xl font-bold text-center mb-4">{{ selectedProblem.title }}</h2>
                <div class="flex flex-col space-y-4">
                    <!-- 所有统计项... -->
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
                </div>
            </div>
            <!-- 自适应标签展示区域 -->
            <div class="card mt-0 mb-4 p-4 bg-white dark:bg-gray-800 shadow-md">
                <h3 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">当前题目标签</h3>
                <div class="flex flex-wrap gap-2">
                    <template v-for="(tag, index) in selectedProblem.tags" :key="index">
                        <span :style="{ backgroundColor: tag.color }" class="inline-flex items-center text-sm font-bold rounded px-3 py-1
                           text-white shadow-sm transition-colors hover:brightness-110
                           max-w-full truncate">
                            {{ tag.name }}
                        </span>
                    </template>
                </div>
            </div>

            <!-- 标签卡片新结构 -->
            <div class="card mt-0 mb-4 p-4 bg-white dark:bg-gray-800 shadow-md">
                <h3 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">全部标签</h3>
                <div class="flex flex-wrap gap-2">
                    <template v-for="(tag, index) in Tags" :key="index">
                        <span @click="tagFilter(index)" :style="{ backgroundColor: tag.color }" class="inline-flex items-center text-sm font-bold rounded px-3 py-1
                           text-white shadow-sm transition-colors hover:brightness-110
                           max-w-full truncate">
                            {{ tag.name }}
                        </span>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { getProblemPage, getProblemCount, getAllTags, type Problem } from '../problemAPI';
import { useRoute, useRouter } from 'vue-router';
import globalMessage from '@/common/utils/toast';
export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        // Problem data
        const searchContent = ref('');
        const totalProblems = ref(0);
        const problems = ref([]);
        const selectedTagIds = ref<number[]>(
            route.query.tagId
                ? (Array.isArray(route.query.tagId)
                    ? route.query.tagId
                    : [route.query.tagId]
                ).map(id => parseInt(id as string))
                : []
        );
        const totalRecords = ref(30);
        const first = ref((parseInt(route.query.currentPage as string || '1') - 1) * 30 || 0);
        // Tags
        const Tags = ref<Problem.TagVO[]>([]);
        // 统计数据
        const statTitle = ref('请点击或悬停鼠标至问题行查看提交状态');
        // 选中的问题
        const selectedProblem = reactive<Problem.AsideProblem>({
            title: statTitle.value,
            acPercentage: 0,
            waPercentage: 0,
            tlePercentage: 0,
            mlePercentage: 0,
            rePercentage: 0,
            cePercentage: 0,
            oePercentage: 0,
            tags: [],
        });
        // onMounted钩子，请求API加载数据
        onMounted(() => {
            getCount();
            getTags();
            getProblems(first.value);
        });
        const onSearch = () => {
            first.value = 0;
            getCount();
            getProblems(0);
        };
        const randomProblem = () => {
            // 从1000开始到1000+totalProblems中随机选取一个题目
            const randomId = Math.floor(Math.random() * totalProblems.value) + 1000;
            router.push({ path: '/problem/' + randomId });

        };
        // 获取所有标签
        const getTags = async () => {
            await getAllTags().then((response) => {
                Tags.value = response.data as Problem.TagVO[];
            }).catch((error) => {
                globalMessage.error('获取标签失败', error.message);
            });
        };
        // 题目筛选
        const tagFilter = (index: number) => {
            const tag = Tags.value[index];
            selectedTagIds.value = [tag.id];
            // 更新 URL 中的 selectedTagIds 参数
            router.push({
                query: {
                    ...route.query,
                    TagId: selectedTagIds.value,
                },
            });
            // 选中标签后，搜索框显示标签名
            if (selectedTagIds.value.length > 0) {
                getCount();
                getProblems(0);
            }
        };
        // 获取题目列表
        const getProblems = async (page: number) => {
            const response = await getProblemPage(page, searchContent.value, selectedTagIds.value);
            problems.value = response.data as any;
        };
        // 获取题目总数
        const getCount = async () => {
            const response = await getProblemCount(searchContent.value, selectedTagIds.value);
            if (response.data) {
                totalRecords.value = response.data.count;
                totalProblems.value = response.data.totalProblems;
            }
        };
        // 分页的页面切换
        const onPage = (event: any) => {
            getProblems(event.first);
            first.value = event.first;
            router.push({
                query: {
                    ...route.query,
                    currentPage: event.page + 1,
                },
            });
            scrollToTop();
        };
        // 选择行，在右侧显示 统计信息
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
                    selectedProblem.tags = problem.tags;
                }
            }
        };
        // 获取标签的颜色
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
        // 获取进度条的颜色
        const getProgressBarColor = (accuracy: number) => {
            if (accuracy < 40) return 'progress-20';
            if (accuracy < 60) return 'progress-40';
            if (accuracy < 80) return 'progress-60';
            return 'progress-80';
        };
        // 平滑滚回顶部
        const scrollToTop = () => {
            window.scrollTo({
                top: 0, // 回到顶部
                left: 0,
                behavior: 'smooth', // 平滑滚动
            });
        };
        return { problems, tagFilter, randomProblem, Tags, onSearch, searchContent, selectRow, getProgressBarColor, getTagSeverity, totalRecords, first, onPage, statTitle, selectedProblem };
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

.pe-2::-webkit-scrollbar {
    @apply w-2;
}

.pe-2::-webkit-scrollbar-thumb {
    @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}
</style>