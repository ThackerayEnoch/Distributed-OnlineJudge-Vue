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
                                @click="selectedFilter = filter.value" />
                        </div>

                        <!-- Issues列表 -->
                        <div v-for="issue in filteredIssues" :key="issue.id"
                            class="border-b pb-4 hover:bg-gray-50 p-2 rounded transition-colors">
                            <div class="flex gap-4">
                                <!-- 状态图标 -->
                                <div class="pt-1">
                                    <i v-if="issue.status === 'open'" class="pi pi-check-circle text-green-500"></i>
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
                                        <span v-if="issue.assignee" class="flex items-center gap-1">
                                            <i class="pi pi-user"></i>
                                            {{ issue.assignee }}
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
                                        <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="label"
                                            optionValue="value" class="w-full" />
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium mb-2">排序方式</label>
                                        <Dropdown v-model="selectedSort" :options="sortOptions" optionLabel="label"
                                            optionValue="value" class="w-full" />
                                    </div>
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { useRouter } from 'vue-router';
const router = useRouter();
interface Issue {
    id: number
    title: string
    status: 'open' | 'closed' | 'inprogress' | 'resolved' | 'pending'
    author: string
    date: Date
    comments: number
    labels: string[]
    assignee?: string
}

// Mock数据
const issues = ref<Issue[]>([
    {
        id: 123,
        title: '登录页面在移动端显示异常',
        status: 'open',
        author: 'zhangsan',
        date: new Date(2024, 2, 15),
        comments: 3,
        labels: ['bug', 'mobile'],
        assignee: 'lisi'
    },
    {
        id: 124,
        title: '课程推荐算法需要优化',
        status: 'closed',
        author: 'wangwu',
        date: new Date(2024, 2, 14),
        comments: 5,
        labels: ['enhancement']
    }
])

const filters = [
    { label: '全部', value: 'all' },
    { label: '已提交', value: 'open' },
    { label: '待解决', value: 'pending' },
    { label: '解决中 ', value: 'inprogress' },
    { label: '已解决', value: 'resolved' },
    { label: '已关闭', value: 'closed' }
]

const statusOptions = [
    { label: '全部', value: 'all' },
    { label: '已提交', value: 'open' },
    { label: '待解决', value: 'pending' },
    { label: '解决中 ', value: 'inprogress' },
    { label: '已解决', value: 'resolved' },
    { label: '已关闭', value: 'closed' }
]

const sortOptions = [
    { label: '最新创建', value: 'newest' },
    { label: '最近更新', value: 'recent' },
    { label: '最多评论', value: 'comments' }
]

const selectedFilter = ref('all')
const selectedStatus = ref('all')
const selectedSort = ref('newest')
function routePush(path: string) {
    router.push(path);
}
const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd HH:mm')
}

const filteredIssues = computed(() => {
    return issues.value.filter(issue => {
        return selectedFilter.value === 'all' ||
            issue.status === selectedFilter.value
    }).sort((a, b) => {
        // 排序逻辑根据selectedSort的值处理
        return b.id - a.id
    })
})
</script>
