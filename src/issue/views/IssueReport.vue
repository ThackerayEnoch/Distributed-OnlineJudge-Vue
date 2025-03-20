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
                        <div v-else v-for="issue in filteredIssues" :key="issue.id"
                            class="border-b pb-4 hover:bg-gray-50 p-2 rounded transition-colors">
                            <div class="flex gap-4">
                                <!-- 状态图标 -->
                                <div class="pt-1">
                                    <i v-if="issue.status === -1" class="pi pi-check-circle text-green-500"></i>
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
                                        <label class="block text-sm font-medium mb-2">状态</label>
                                        <Dropdown v-model:model-value="selectedStatus" :options="statusOptions"
                                            optionLabel="label" optionValue="value" class="w-full"
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
                        共 {{ totalItems }} 条反馈，当前显示 {{ startIndex }}-{{ endIndex }}
                    </div>

                    <div class="flex justify-center w-full">
                        <Paginator :rows="pageSize" :totalRecords="filteredIssues.length" @page="onPageChange"
                            :currentPageReportTemplate="currentPageTemplate" :row="20" />
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
import { type IssueSpace, getAllIssues } from '@/issue/api/IssueAPI'
import globalMessage from '@/common/utils/toast';
const router = useRouter();

// Mock数据
const issues = ref<IssueSpace.IssuesVO[]>([])
const pageSize = ref(20)
const currentPage = ref(1)
const isloading = ref(false)
onMounted(() => {
    loadAllIssues();
})
const filterClick1 = (filter: number) => {
    selectedFilter.value = filter
    selectedStatus.value = filter
    loadAllIssues()
}

const loadAllIssues = async () => {
    isloading.value = true
    await getAllIssues((currentPage.value - 1) * pageSize.value, selectedPriority.value, selectedStatus.value).then((res) => {
        issues.value = res.data as unknown as IssueSpace.IssuesVO[];
    }).catch((err) => {
        globalMessage.error("获取问题列表错误", err.message)
    })
    isloading.value = false
}
const priorityOptions = [
    { label: '全部', value: -1 },
    { label: '低', value: 0 },
    { label: '中', value: 1 },
    { label: '高', value: 2 }
]
const filters = [
    { label: '全部', value: -1 },
    { label: '已提交', value: 0 },
    { label: '待解决', value: 1 },
    { label: '解决中 ', value: 2 },
    { label: '已解决', value: 3 },
    { label: '已关闭', value: 4 }
]

const statusOptions = [
    { label: '全部', value: -1 },
    { label: '已提交', value: 0 },
    { label: '待解决', value: 1 },
    { label: '解决中 ', value: 2 },
    { label: '已解决', value: 3 },
    { label: '已关闭', value: 4 }
]


const selectedFilter = ref(-1)
const selectedStatus = ref(-1)
const selectedPriority = ref(-1)

function routePush(path: string) {
    router.push(path);
}
const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd HH:mm')
}

const filteredIssues = computed(() => {
    return issues.value.filter(issue => {
        return selectedFilter.value === -1 ||
            issue.status === selectedFilter.value
    }).sort((a, b) => {
        // 排序逻辑根据selectedSort的值处理
        return b.id - a.id
    })
})
//
// 新增分页相关状态


// 当前显示条目范围
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const endIndex = computed(() => {
    const end = currentPage.value * pageSize.value
    return end > filteredIssues.value.length ? filteredIssues.value.length : end
})
const totalItems = computed(() => filteredIssues.value.length)

const currentPageTemplate = ref('{currentPage}/{totalPages}')

// 分页事件处理
const onPageChange = (event: { page: number; rows: number }) => {
    currentPage.value = event.page + 1    // Paginator的page从0开始
    pageSize.value = event.rows
}

// 原v-for需要改为使用paginatedIssues
// 在过滤条件变化时自动回到第一页
watch([selectedFilter], () => {
    currentPage.value = 1
})
</script>
