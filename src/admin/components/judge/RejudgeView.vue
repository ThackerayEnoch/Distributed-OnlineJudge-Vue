<template>
    <div class="container mx-auto p-2 pl-0 space-y-8">
        <!-- 整场比赛重判 -->
        <Card class="shadow-lg">
            <template #title> 比赛整场重判 </template>
            <template #content>
                <div class="grid grid-cols-3 gap-4 items-end">
                    <div class="col-span-2">
                        <label class="block text-sm font-medium mb-2">选择比赛</label>
                        <!-- 比赛选择部分添加filter -->
                        <Dropdown v-model="selectedContest" :options="contests" optionLabel="title" placeholder="请选择比赛"
                            class="w-full" filter :showClear="true" @filter="onContestFilter" :loading="contestLoading">
                            <template #option="slotProps">
                                <div class="flex items-center">
                                    <span class="font-medium">{{ slotProps.option.title }}</span>
                                    <span class="ml-2 text-gray-500 text-sm">#{{ slotProps.option.id }}</span>
                                </div>
                            </template>
                        </Dropdown>
                    </div>
                    <Button label="开始比赛重判" severity="danger" @click="rejudgeContest"
                        :disabled="!selectedContest || rejudgeLoading" class="h-[42px]" :loading="rejudgeLoading" />
                </div>
            </template>
        </Card>

        <!-- 比赛题目重判 -->
        <Card class="shadow-lg">
            <template #title> 比赛题目重判 </template>
            <template #content>
                <div class="grid grid-cols-4 gap-4 items-end">
                    <div class="col-span-2">
                        <label class="block text-sm font-medium mb-2">选择比赛</label>
                        <!-- 题目关联比赛选择 -->
                        <Dropdown v-model="selectedProblemContest" :options="contests" optionLabel="title"
                            :loading="contestLoading" class="w-full" filter @filter="onContestFilter"
                            @change="loadProblems" :showClear="true" placeholder="请选择比赛" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">选择题目</label>
                        <Dropdown v-model="selectedProblem" :options="problems" optionLabel="title"
                            :disabled="!selectedProblemContest"
                            :placeholder="selectedProblemContest ? '请选择题目' : '请先选择比赛'" class="w-full"
                            :loading="problemLoading" />
                    </div>
                    <Button label="开始题目重判" severity="danger" @click="rejudgeProblem"
                        :disabled="!selectedProblem || rejudgeLoading" class="h-[42px]" :loading="rejudgeLoading" />
                </div>
            </template>
        </Card>

        <!-- 单提交重判 -->
        <Card class="shadow-lg">
            <template #title> 提交重判 </template>
            <template #content>
                <div class="flex gap-4 items-end">
                    <div class="flex-1">
                        <label class="block text-sm font-medium mb-2">提交ID</label>
                        <InputText v-model="submitId" placeholder="请输入提交ID" class="w-full" />
                    </div>
                    <Button label="开始提交重判" :loading="rejudgeLoading" severity="danger" @click="rejudgeSubmit"
                        :disabled="!submitId || rejudgeLoading" class="h-[42px]" />
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type RejudgeSpace, rejudge, getContestProblems, getContests } from '@/admin/api/rejudgeAPI';
import globalMessage from '@/common/utils/toast';
import { useDebounceFn } from '@vueuse/core';
// 示例数据
const contests = ref<RejudgeSpace.ContestVO[]>([]);
const problems = ref<RejudgeSpace.ContestProblemVO[]>([]);
const selectedContest = ref<RejudgeSpace.ContestVO>();
const selectedProblemContest = ref<RejudgeSpace.ContestVO>();
const selectedProblem = ref<RejudgeSpace.ContestProblemVO>();
const submitId = ref<string>('');

// API函数示例
const problemLoading = ref(false);
const loadProblems = async () => {
    // 这里调用API获取题目列表
    if (selectedProblemContest.value) {
        problemLoading.value = true;
        await getContestProblems(selectedProblemContest.value.id).then((res) => {
            problems.value = res.data as RejudgeSpace.ContestProblemVO[];
        }).catch((err) => {
            problems.value = [];
            globalMessage.error('获取题目列表错误', err.message);
        }).finally(() => {
            problemLoading.value = false;
        });
    }
};
const rejudgeLoading = ref(false);
const rejudgeContest = async () => {
    if (selectedContest.value) {
        // 调用比赛重判API
        rejudgeLoading.value = true;
        const dto: RejudgeSpace.RejudgeDTO = {
            type: 'contest',
            contestId: selectedContest.value.id
        };
        await rejudge(dto).then(() => {
            globalMessage.success('提示', '比赛重判成功');
        }).catch((err) => {
            globalMessage.error('比赛重判失败', err.message);
        }).finally(() => {
            rejudgeLoading.value = false;
        });
    }
};

const rejudgeProblem = async () => {
    if (selectedProblem.value && selectedProblemContest.value) {
        // 调用题目重判API
        rejudgeLoading.value = true;
        const dto: RejudgeSpace.RejudgeDTO = {
            type: 'problem',
            contestId: selectedProblemContest.value.id,
            problemId: selectedProblem.value.id
        };
        await rejudge(dto).then(() => {
            globalMessage.success('提示', '题目重判成功');
        }).catch((err) => {
            globalMessage.error('题目重判失败', err.message);
        }).finally(() => {
            rejudgeLoading.value = false;
        });
    }
};

const rejudgeSubmit = async () => {
    if (submitId.value) {
        // 调用提交重判API
        rejudgeLoading.value = true;
        const dto: RejudgeSpace.RejudgeDTO = {
            type: 'submitId',
            submitId: Number(submitId.value)
        };
        await rejudge(dto).then(() => {
            globalMessage.success('提示', '提交重判成功');
        }).catch((err) => {
            globalMessage.error('提交重判失败', err.message);
        }).finally(() => {
            rejudgeLoading.value = false;
        });
    }
};
const contestLoading = ref(false);
// 防抖处理搜索（300ms延迟）
const searchContests = useDebounceFn(async (query: string) => {
    try {
        contestLoading.value = true;
        // 替换为实际API调用，示例数据：
        await getContests(query).then((res) => {
            contests.value = res.data as RejudgeSpace.ContestVO[];
        }).catch((err) => {
            contests.value = [];
            globalMessage.error('获取比赛列表错误', err.message);
        });
    } finally {
        contestLoading.value = false;
    }
}, 500);
const onContestFilter = (event: any) => {
    searchContests(event.value);
};
</script>

<style scoped>
.container {
    max-width: 1200px;
}

.p-card-title {
    @apply text-xl font-bold text-gray-800 border-b-2 border-gray-100 pb-3 mb-4;
}

.p-button {
    @apply transition-colors duration-200;
}
</style>