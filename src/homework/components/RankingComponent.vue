<template>
    <div v-if="isloading" class="flex flex-col items-center justify-center h-screen">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
            aria-label="Custom ProgressSpinner" />
        <span class="mt-2 text-gray-500">加载排行榜中...</span>
    </div>
    <div v-else class="rankings">
        <DataTable :value="rankData.users" tableStyle="width: 1000px;min-height:60px" showGridlines paginator :rows="20"
            :rowsPerPageOptions="[10, 20, 50]">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <span class="text-xl font-bold text-gray-700">排行榜</span>
                    <div class="flex gap-3">
                        <Button label="导出已做名单" icon="pi pi-file-excel" severity="success" @click="exportExcel('solved')"
                            class="p-button-sm bg-green-500 hover:bg-green-600 border-green-500"
                            :disabled="isloading || parsing" :loading="parsing" />
                        <Button label="导出未做名单" icon="pi pi-file-excel" severity="warning"
                            @click="exportExcel('unsolved')" :disabled="isloading || parsing" :loading="parsing"
                            class="p-button-sm bg-orange-500 hover:bg-orange-600 border-orange-500" />
                        <Button label="导出全部名单" icon="pi pi-file-excel" severity="info" @click="exportExcel('all')"
                            class="p-button-sm bg-blue-500 hover:bg-blue-600 border-blue-500"
                            :disabled="isloading || parsing" :loading="parsing" />
                    </div>
                </div>
            </template>
            <Column field="ranking" style="text-align: center;" headerStyle="background-color: #F8F8F9"
                headerClass="bg-red-400">
                <template #header>
                    <span class="flex-1 text-center font-bold">排名</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.rank }}</span>
                </template>
            </Column>
            <Column field="username" style="text-align: center;min-width: 200px;"
                headerStyle="background-color: #F8F8F9">
                <template #header>
                    <span class="flex-1 text-center font-bold">用户名</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.username }}</span>
                </template>
            </Column>
            <Column field="nickname" style="text-align: center; min-width: 200px"
                headerStyle="background-color: #F8F8F9;">
                <template #header>
                    <span class="flex-1 text-center font-bold">姓名</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.nickname }}</span>
                </template>
            </Column>
            <Column field="totalPenalty" style="text-align: center;" headerStyle="background-color: #F8F8F9">
                <template #header>
                    <span class="flex-1 text-center font-bold">总时间</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.totalPenalty }}</span>
                </template>
            </Column>
            <Column field="solvedCount" style="text-align: center;" headerStyle="background-color: #F8F8F9">
                <template #header>
                    <span class="flex-1 text-center font-bold">AC</span>
                </template>
                <template #body="slotProps">
                    <router-link
                        :to="`/homework/${props.homeworkId}/status?contestId=${props.homeworkId}&userId=${slotProps.data.userId}`">{{
                            slotProps.data.solvedCount }}</router-link>
                </template>
            </Column>

            <Column v-for="(problem, index) in rankData.problems" :key="problem.problemId"
                headerStyle="background-color: #F8F8F9" style="text-align: center;padding: 0;min-width: 50px;">
                <template #header>
                    <span class="flex-1 text-center font-bold">{{ convertToLetter(problem.displayId + 1) }}</span>
                </template>
                <template #body="{ data }">
                    <div v-if="data.problems[index] != null" class="h-20 w-full flex flex-col justify-center
                        bg-opacity-75"
                        :class="getBackgroundClass(data.problems[index].isSolved, data.problems[index].tries)">
                        <div v-show="data.problems[index].tries != null && data.problems[index].tries != 0">
                            <div v-show="data.problems[index].isFirst" class="font-bold">
                                ※1st
                            </div>
                            <div v-show="data.problems[index].isSolved">
                                {{ data.problems[index].solvedTime }}
                            </div>
                            <div v-show="data.problems[index].tries == 1">
                                1 try
                            </div>
                            <div v-show="data.problems[index].tries > 1">{{
                                data.problems[index].tries }} tries
                            </div>
                        </div>
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
<script lang="ts" setup>
import { ref, defineProps } from 'vue';
import { onMounted } from 'vue';
import { getHomeworkRankingById, type RankingSpace } from '../api/homeworkRankingAPI';
import { exportToExcel, type ExportHeader } from '@/common/utils/excel';

const props = defineProps<{
    homeworkId: string;
    title: string;
}>();
const isloading = ref(true);
// 排行榜数据
const rankData = ref<RankingSpace.RankVO>(
    {
        problems: [],
        users: [],
    },
);
// AC颜色
const acColor = [
    'bg-green-400',
    'bg-green-500',
    'bg-green-600',
    'bg-green-700',
];
const waColor = [
    'bg-red-400',
    'bg-red-500',
    'bg-red-600',
    'bg-red-700',
];
// 背景颜色缓存
const backgroundCache = new Map<string, string>();

// 获取背景颜色（带缓存）
const getBackgroundClass = (isSolved: boolean, tries: number) => {
    const key = `${isSolved}-${tries}`;
    if (backgroundCache.has(key)) {
        return backgroundCache.get(key);
    }

    let className = '';
    if (isSolved) {
        const greenIndex = Math.min(tries - 1, acColor.length - 1);
        className = acColor[greenIndex];
    } else {
        if (tries === 0) {
            className = '';
        } else {
            const redIndex = Math.min(tries - 1, waColor.length - 1);
            className = waColor[redIndex];
        }
    }

    backgroundCache.set(key, className);
    return className;
};



// 加载排行榜数据
async function loadRankingData(homeworkId: number) {
    isloading.value = true;

    getHomeworkRankingById(homeworkId).then((res: any) => {
        let tmpData = res.data as RankingSpace.RankVO;
        // 题目排序
        tmpData.problems.sort((a, b) => a.displayId - b.displayId);
        // 名次排序(先solvedCount,再totalPenalty)
        tmpData.users.sort((a, b) => {
            if (a.solvedCount !== b.solvedCount) {
                // 首先按 solvedCount 从大到小排序
                return b.solvedCount - a.solvedCount;
            }
            if (a.solvedCount === 0 && b.solvedCount === 0) {
                // 当双方 solvedCount 都为 0 时，按 totalTries 从大到小排序
                if (a.totalTries !== b.totalTries) {
                    return b.totalTries - a.totalTries;
                }
            }
            // 其他情况下按 totalPenalty 从小到大排序
            return a.totalPenalty - b.totalPenalty;
        });
        // 用户题目排序
        // 创建一个映射关系：ProblemId -> displayId
        const problemDisplayMap = new Map<number, number>();
        tmpData.problems.forEach(problem => {
            problemDisplayMap.set(problem.problemId, problem.displayId);
        });

        // 用户题目排序，按照 displayId 排序题目
        tmpData.users.forEach(user => {
            user.problems.sort((a, b) => {
                // 通过 ProblemId 查找 displayId
                const displayIdA = problemDisplayMap.get(a.problemId);
                const displayIdB = problemDisplayMap.get(b.problemId);
                return (displayIdA ?? 0) - (displayIdB ?? 0); // 按照 displayId 排序
            });
        });
        // 添加排名
        tmpData.users.forEach((user, index) => {
            user.rank = index + 1;
        });
        rankData.value = tmpData // 解除深层响应式
        isloading.value = false;
    });
}
function convertToLetter(num: number) {
    let str = '';
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
interface RankExportType {
    rank: number;
    username: string;
    nickname: string;
    solvedCount: number;
    totalPenalty: number;
    [key: string]: number | string;
}
const header: ExportHeader[] = [
    {
        title: 'Rank',
        key: 'rank',
        width: 5
    },
    {
        title: 'Username',
        key: 'username',
        width: 12
    },
    {
        title: 'Nickname',
        key: 'nickname',
        width: 18
    },
    {
        title: 'Solved',
        key: 'solvedCount',
        width: 7
    },
    {
        title: 'Penalty',
        key: 'totalPenalty',
        width: 8
    }
]
const parsing = ref(false);
let isAppended = false;
async function exportExcel(type: string) {
    parsing.value = true;
    // 添加题目到标题数组
    if (!isAppended) {
        header.push(...rankData.value.problems.map((problem) => {
            return {
                title: convertToLetter(problem.displayId + 1),
                key: `problem${problem.displayId}`,
                width: 10
            }
        }));
        isAppended = true;
    }
    // 转换用户数据到一个数组。
    const data: RankExportType[] = rankData.value.users
        .map((user) => {
            // 条件：跳过满足某些条件的用户，例如 solvedCount 为 0 的用户
            if (type === 'solved' && user.solvedCount === 0) {
                return null; // 跳过该用户
            } else if (type === 'unsolved' && user.solvedCount !== 0) {
                return null;
            }
            const userExport: RankExportType = {
                rank: user.rank as number,
                username: user.username,
                nickname: user.nickname,
                solvedCount: user.solvedCount,
                totalPenalty: user.totalPenalty
            };
            user.problems.forEach((problem, index) => {
                if (problem.tries != 0) {
                    userExport[`problem${index}`] = problem.solvedTime + '(' + problem.tries + ')';
                } else {
                    userExport[`problem${index}`] = '';
                }
            });
            return userExport;
        })
        .filter((userExport): userExport is RankExportType => userExport !== null); // 过滤掉 null 值
    // 导出Excel
    let typeStr = '';
    if (type === 'solved') {
        typeStr = '-已做';
    } else if (type === 'unsolved') {
        typeStr = '-未做';
    } else {
        typeStr = '-全部';
    }
    await exportToExcel(data, header, props.title + typeStr + '-排行榜');
    parsing.value = false;
}
onMounted(async () => {
    loadRankingData(Number(props.homeworkId));
});
</script>