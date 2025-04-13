<template>
    <div class="w-full mx-auto p-0">
        <Card>
            <template #title>
                <div class="flex justify-between items-center">
                    <span class="text-2xl font-bold">问题反馈</span>
                    <Button label="新建反馈" @click="routePush('/issues/new')" icon="pi pi-plus" class="p-button-sm" />
                </div>
            </template>

            <template #content>
                <!-- 侧边栏筛选 -->
                <div class="grid md:grid-cols-12 gap-4">
                    <!-- 主内容区域 -->
                    <div class="md:col-span-8 space-y-4">
                        <!-- 筛选条 -->
                        <div class="flex items-center gap-2 text-sm">
                            <span class="font-medium">筛选：</span>
                            <Button label="全部" class="p-button-text p-button-sm"
                                :class="{ 'font-bold text-primary': selectedFilter === -1 }" @click="filterAll" />
                            <Button v-for="filter in filters" :key="filter.value" :label="filter.label"
                                class="p-button-text p-button-sm"
                                :class="{ 'font-bold text-primary': selectedFilter === filter.value }"
                                @click="filterClick1(filter.value)" />
                        </div>
                        <div v-if="isloading" class="flex flex-col items-center justify-center">
                            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
                                animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                            <span class="mt-2 text-gray-500">加载数据中...</span>
                        </div>
                        <!-- Issues列表 -->
                        <div v-else v-for="issue in issues" :key="issue.id"
                            class="border-b pb-4 hover:bg-gray-50 p-2 rounded transition-colors">
                            <div class="flex gap-4">
                                <!-- 状态图标 -->
                                <div class="pt-1">
                                    <i v-if="issue.status !== 4" class="pi pi-check-circle text-green-500"></i>
                                    <i v-else class="pi pi-lock text-red-500"></i>
                                </div>

                                <!-- 主要内容 -->
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <router-link :to="`/issue/${issue.id}`"
                                            class="text-lg font-semibold hover:text-primary">
                                            {{ issue.title }}
                                        </router-link>
                                        <Tag v-for="label in issue.labels" :key="label" :value="label" severity="info"
                                            class="text-xs" />
                                        <!-- 反馈状态标签 -->
                                        <Tag v-if="statusTagMap.has(issue.status)"
                                            :value="statusTagMap.get(issue.status)?.label"
                                            :severity="statusTagMap.get(issue.status)?.severity" class="text-xs" />
                                        <!-- 反馈优先级标签 -->
                                        <Tag v-if="issue.priority !== -1"
                                            :value="issue.priority == 0 ? '低' : issue.priority == 1 ? '中' : '高'"
                                            :severity="issue.priority === 0 ? 'info' : issue.priority === 1 ? 'warning' : 'danger'"
                                            class="text-xs" />

                                    </div>

                                    <div class="mt-1 text-sm text-gray-600">
                                        #{{ issue.id }} 由 {{ issue.author }} 提交于 {{ formatDate(issue.date) }}
                                    </div>

                                    <!-- 评论等信息 -->
                                    <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                        <span class="flex items-center gap-1">
                                            <i class="pi pi-comment"></i>
                                            {{ issue.comments }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 侧边栏 -->
                    <div class="md:col-span-4">
                        <Card class="shadow-none border">
                            <template #title>筛选</template>
                            <template #content>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium mb-2">标签</label>
                                        <Dropdown v-model:model-value="selectedLabels" :options="availableLabels"
                                            optionLabel="name" optionValue="value" class="w-full"
                                            @change="loadAllIssues" />
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">状态(多选)</label>
                                        <MultiSelect v-model:model-value="selectedStatus" :options="statusOptions"
                                            optionLabel="label" optionValue="value" display="chip" class="w-full"
                                            @change="loadAllIssues" />

                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium mb-2">优先级</label>
                                        <Dropdown v-model:model-value="selectedPriority" :options="priorityOptions"
                                            optionLabel="label" optionValue="value" class="w-full"
                                            @change="loadAllIssues" />
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
                <div class="mt-4 flex justify-between items-center relative">
                    <div class="text-sm text-gray-600 absolute left-0">
                        共 {{ totalRecords }} 条反馈，当前显示 {{ startIndex }}-{{ endIndex }}
                    </div>

                    <div class="flex justify-center w-full">
                        <Paginator :rows="pageSize" :totalRecords="totalRecords" @page="onPageChange"
                            :currentPageReportTemplate="currentPageTemplate" />
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { format } from 'date-fns'
import { useRouter } from 'vue-router';
import { type IssueSpace, getAllIssues, getIssuesCount } from '@/issue/api/IssueAPI'
import globalMessage from '@/common/utils/toast';
const router = useRouter();

// Mock数据
const issues = ref<IssueSpace.IssuesVO[]>([])
const pageSize = ref(10)
const totalRecords = ref(0)
const currentPage = ref(1)
const isloading = ref(false)
onMounted(() => {
    loadAllIssues();
    loadIssuesCount();
})
const statusTagMap = new Map<number, { label: string; severity: string }>([
    [0, { label: '已提交', severity: 'info' }],
    [1, { label: '待解决', severity: 'warn' }],
    [2, { label: '解决中', severity: 'secondary' }],
    [3, { label: '已解决', severity: 'success' }],
    [4, { label: '已关闭', severity: 'danger' }]
]);
const filterClick1 = (filter: number) => {
    selectedStatus.value = [filter]
    loadAllIssues()
    loadIssuesCount()
}
const filterAll = () => {
    selectedStatus.value = [0, 1, 2, 3]
    loadAllIssues()
    loadIssuesCount()
}

const loadAllIssues = async () => {
    isloading.value = true
    if (selectedStatus.value.length === 0) {
        selectedStatus.value = [0, 1, 2, 3]
    }
    await getAllIssues((currentPage.value - 1) * pageSize.value, selectedPriority.value, selectedStatus.value, selectedLabels.value).then((res) => {
        issues.value = res.data as unknown as IssueSpace.IssuesVO[];
    }).catch((err) => {
        globalMessage.error("获取问题列表错误", err.message)
    })
    isloading.value = false
}
const loadIssuesCount = async () => {
    if (selectedStatus.value.length === 0) {
        selectedStatus.value = [0, 1, 2, 3]
    }
    await getIssuesCount(selectedPriority.value, selectedStatus.value, selectedLabels.value).then((res) => {
        totalRecords.value = res.data as number;
    }).catch((err) => {
        globalMessage.error("获取问题列表错误", err.message)
    })
}
const availableLabels = [
    { name: '全部', value: -1 },
    { name: '功能请求', value: 1 },
    { name: 'BUG', value: 2 },
    { name: '性能问题', value: 3 },
    { name: '其他', value: 4 }
]
const priorityOptions = [
    { label: '全部', value: -1 },
    { label: '低', value: 0 },
    { label: '中', value: 1 },
    { label: '高', value: 2 }
]
const filters = [
    { label: '已提交', value: 0 },
    { label: '待解决', value: 1 },
    { label: '解决中 ', value: 2 },
    { label: '已解决', value: 3 },
    { label: '已关闭', value: 4 }
]

const statusOptions = [
    { label: '已提交', value: 0 },
    { label: '待解决', value: 1 },
    { label: '解决中 ', value: 2 },
    { label: '已解决', value: 3 },
    { label: '已关闭', value: 4 }
]


const selectedFilter = ref(-1)
const selectedStatus = ref([0, 1, 2, 3])
const selectedLabels = ref(-1)
const selectedPriority = ref(-1)

function routePush(path: string) {
    router.push(path);
}
const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd HH:mm')
}

//
// 新增分页相关状态


// 当前显示条目范围
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => {
    const end = currentPage.value * pageSize.value
    return end > totalRecords.value ? totalRecords.value : end
})
const currentPageTemplate = ref('{currentPage}/{totalPages}')

// 分页事件处理
const onPageChange = (event: { page: number; rows: number }) => {
    currentPage.value = event.page + 1    // Paginator的page从0开始
    pageSize.value = event.rows
    loadAllIssues();
}

// 原v-for需要改为使用paginatedIssues
// 在过滤条件变化时自动回到第一页
watch([selectedFilter], () => {
    currentPage.value = 1
})
</script>
