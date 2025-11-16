<template>
    <div v-if="isloading" class="flex flex-col items-center justify-center h-screen">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
            aria-label="Custom ProgressSpinner" />
        <span class="mt-2 text-gray-500">加载排行榜中...</span>
    </div>
    <div v-else class="rankings">
        <DataTable ref="dataTableRef" :key="rankData.cacheStartTime" :value="rankData.users"
            tableStyle="width: 1000px;min-height:60px" showGridlines paginator v-model:first="first"
            :rows="currentPageSize" :rowsPerPageOptions="[10, 20, 50]" :rowClass="getRowClass" @page="onPageChange">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <span class="text-xl font-bold text-gray-700">排行榜</span>
                        <div v-if="countdown > 0" class="flex items-center gap-2">
                            <span class="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                数据更新倒计时: {{ countdown }}秒
                            </span>
                            <Button label="刷新" icon="pi pi-refresh" size="small" @click="refreshRanking"
                                :disabled="true" class="p-button-sm" severity="secondary" />
                            <Button label="定位到我" icon="pi pi-map-marker" size="small" @click="openScroll"
                                :disabled="isloading || !currentUserFound" class="p-button-sm" severity="info" />
                        </div>
                        <div v-else class="flex items-center gap-2">
                            <span class="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">可获取最新数据</span>
                            <Button label="刷新" icon="pi pi-refresh" size="small" @click="refreshRanking"
                                :disabled="isloading" class="p-button-sm" severity="secondary" />
                            <Button label="定位到我" icon="pi pi-map-marker" size="small" @click="scrollToCurrentUser"
                                :disabled="isloading || !currentUserFound" class="p-button-sm" severity="info" />
                        </div>
                    </div>
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
            <Column field="username" style="text-align: center;min-width: 100px;"
                headerStyle="background-color: #F8F8F9">
                <template #header>
                    <span class="flex-1 text-center font-bold">用户名</span>
                </template>
                <template #body="slotProps">
                    <span>{{ slotProps.data.username }}</span>
                </template>
            </Column>
            <Column field="nickname" style="text-align: center; min-width: 150px"
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
                    <router-link v-if="slotProps.data.solvedCount != 0" class="text-blue-500 hover:text-blue-700"
                        :to="`/homework/${props.homeworkId}/submit?contestId=${props.homeworkId}&userId=${slotProps.data.userId}`">{{
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
import { ref, defineProps, onMounted, onUnmounted } from 'vue';
import { getHomeworkRankingById, type RankingSpace } from '../api/homeworkRankingAPI';
import { exportToExcel, type ExportHeader } from '@/common/utils/excel';
import { ProblemStatus } from '../status/homeworkStatus';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/common/utils/store';
import globalMessage from '@/common/utils/toast';
import { is } from 'date-fns/locale';

const props = defineProps<{
    homeworkId: string;
    title: string;
}>();
const isloading = ref(true);
const router = useRouter();
const userStore = useUserStore();

// 当前用户相关状态
const currentUserFound = ref(false);
const currentUserRank = ref(0);
// 页面大小跟踪
const currentPageSize = ref(20);
// 当前页索引（0 基），通过 DataTable 的 @page 事件更新
const currentPageIndex = ref(0);
const first = ref(0); // 用于绑定 DataTable 的 first 属性
// 标记是否需要在数据加载完成后自动定位
const shouldAutoLocateAfterLoad = ref(false);
// 倒计时相关
const countdown = ref(0);
let countdownTimer: number | null = null;
let isLoadingData = false; // 防止重复请求的标志

// 启动倒计时
const startCountdown = (cacheStartTime: number) => {
    // 清除之前的定时器
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }

    const cacheExpireTime = cacheStartTime + 5000; // 缓存5秒后过期

    const updateCountdown = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((cacheExpireTime - now) / 1000));
        countdown.value = remaining;

        if (remaining === 0) {
            if (countdownTimer) {
                clearInterval(countdownTimer);
                countdownTimer = null;
            }
        }
    };

    updateCountdown(); // 立即更新一次
    countdownTimer = setInterval(updateCountdown, 1000);
};

// 刷新排行榜
const refreshRanking = () => {
    // 重置自动定位标记
    shouldAutoLocateAfterLoad.value = false;

    // 如果用户点击刷新时正在查看自己的位置，刷新后自动重新定位
    const currentUserId = userStore.currentUser.userId;
    if (currentUserId && currentUserFound.value) {
        shouldAutoLocateAfterLoad.value = true;
    }
    loadRankingData(Number(props.homeworkId));
};// 页面变化事件处理
const onPageChange = (event: any) => {
    currentPageSize.value = event.rows;
    // event.page 是 0 基当前页
    if (typeof event.page === 'number') {
        currentPageIndex.value = event.page;
    }


};
const isOpenScollToCurrentUser = ref(false);
const openScroll = () => {
    isOpenScollToCurrentUser.value = true;
    scrollToCurrentUser();
}
// 定位到当前用户
const scrollToCurrentUser = () => {

    if (!isOpenScollToCurrentUser.value) {
        return
    }

    const currentUserId = userStore.currentUser.userId;

    if (!currentUserId) {
        globalMessage.warn('提示', '请先登录');
        return;
    }

    // 如果正在加载数据，提示用户等待
    if (isloading.value) {
        shouldAutoLocateAfterLoad.value = true;
        globalMessage.info('提示', '正在加载数据，加载完成后将自动定位');
        return;
    }

    // 查找当前用户在排行榜中的位置
    const userIndex = rankData.value.users.findIndex(user => user.userId === currentUserId);

    if (userIndex === -1) {
        globalMessage.info('提示', '您不在当前排行榜中');
        return;
    }

    // 使用当前页面大小计算用户所在的页面
    const pageSize = currentPageSize.value;
    const targetPage = Math.floor(userIndex / pageSize);
    const rowIndexInPage = userIndex % pageSize;

    // 使用 currentPageIndex（由 @page 事件维护）作为当前页
    let currentPage = currentPageIndex.value || 0;

    // 如果用户就在当前页，直接高亮
    if (targetPage === currentPage) {
        setTimeout(() => {
            highlightCurrentUser(rowIndexInPage);
            globalMessage.success('定位成功', `已定位到第 ${currentUserRank.value} 名：${rankData.value.users[userIndex].nickname}`);
        }, 100);
        return;
    }

    // 需要跳转到其他页面
    const dataTableRef = document.querySelector('.p-datatable');
    if (dataTableRef) {
        setTimeout(() => {
            const paginatorLinks = Array.from(document.querySelectorAll('.p-paginator-page')) as HTMLElement[];
            const targetLabel = String(targetPage + 1);
            const matchBtn = paginatorLinks.find(el => (el.textContent || '').trim() === targetLabel);

            if (matchBtn) {
                matchBtn.click();
                // 等待 @page 更新 currentPageIndex
                const waitForPage = () => {
                    if (currentPageIndex.value === targetPage) {
                        setTimeout(() => {
                            highlightCurrentUser(rowIndexInPage);
                            globalMessage.success('定位成功', `已定位到第 ${currentUserRank.value} 名：${rankData.value.users[userIndex].nickname}`);
                        }, 100);
                        return;
                    }
                    setTimeout(waitForPage, 150);
                };
                waitForPage();
                return;
            }

            // 否则，使用 next/prev 循环依赖 @page 更新 currentPageIndex


            const nextBtn = document.querySelector('.p-paginator-next') as HTMLElement | null;
            const prevBtn = document.querySelector('.p-paginator-prev') as HTMLElement | null;
            if (!nextBtn && !prevBtn) {
                globalMessage.warn('定位失败', '无法定位到目标页面，请尝试手动查找');
                return;
            }

            const maxNavAttempts = Math.max(10, Math.abs(targetPage - currentPage) + 10);
            let navAttempts = 0;

            const doNavStep = () => {
                navAttempts++;
                if (navAttempts > maxNavAttempts) {

                    globalMessage.warn('定位失败', '自动翻页失败，请尝试手动翻页后再次定位');
                    return;
                }



                if (currentPageIndex.value < targetPage) {
                    nextBtn?.click();
                } else if (currentPageIndex.value > targetPage) {
                    prevBtn?.click();
                } else {
                    setTimeout(() => {
                        highlightCurrentUser(rowIndexInPage);
                        globalMessage.success('定位成功', `已定位到第 ${currentUserRank.value} 名：${rankData.value.users[userIndex].nickname}`);
                    }, 100);
                    return;
                }

                setTimeout(() => {
                    if (currentPageIndex.value === targetPage) {
                        setTimeout(() => {
                            highlightCurrentUser(rowIndexInPage);
                            globalMessage.success('定位成功', `已定位到第 ${currentUserRank.value} 名：${rankData.value.users[userIndex].nickname}`);
                        }, 100);
                    } else {
                        doNavStep();
                    }
                }, 250);
            };

            doNavStep();
        }, 100);
    }
};

// 高亮当前用户行
const highlightCurrentUser = (rowIndex: number) => {
    // 添加重试机制，因为DOM可能还没有完全更新
    const tryHighlight = (attempts = 0) => {
        const tableBody = document.querySelector('.p-datatable-tbody');
        if (tableBody) {
            const rows = tableBody.querySelectorAll('tr');
            const targetRow = rows[rowIndex] as HTMLElement;

            if (targetRow && targetRow.children.length > 0) {
                // 移除之前的高亮
                rows.forEach(row => row.classList.remove('bg-blue-100', 'border-blue-300'));

                // 添加高亮样式
                targetRow.classList.add('bg-blue-100', 'border-blue-300');
                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // 3秒后移除高亮
                setTimeout(() => {
                    targetRow.classList.remove('bg-blue-100', 'border-blue-300');
                }, 3000);
            } else if (attempts < 5) {
                // 如果行还没有渲染完成，重试
                setTimeout(() => tryHighlight(attempts + 1), 100);
            }
        } else if (attempts < 5) {
            // 如果表格还没有渲染完成，重试
            setTimeout(() => tryHighlight(attempts + 1), 100);
        }
    };

    tryHighlight();
};

// 获取行样式类
const getRowClass = (data: any) => {
    const currentUserId = userStore.currentUser.userId;
    if (currentUserId && data.userId === currentUserId) {
        return 'current-user-row';
    }
    return '';
};

// 停止倒计时
const stopCountdown = () => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
};
// 排行榜数据
const rankData = ref<RankingSpace.RankVO>(
    {
        problems: [],
        users: [],
        cacheStartTime: 0,
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
    // 防止重复请求
    if (isLoadingData) {

        return;
    }

    isLoadingData = true;
    isloading.value = true;

    // 在每次加载数据时重置跟踪状态（除了shouldAutoLocateAfterLoad，它需要保持用于自动定位）
    // currentPageSize.value = 20; // 不在这里重置，让DataTable自己管理分页状态

    try {
        const res = await getHomeworkRankingById(homeworkId);
        let tmpData = res.data as RankingSpace.RankVO;

        // 获取cacheStartTime来启动倒计时
        if (tmpData.cacheStartTime) {
            startCountdown(tmpData.cacheStartTime);
        }

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

        // 检查当前用户是否在排行榜中
        const currentUserId = userStore.currentUser.userId;
        if (currentUserId) {
            const currentUser = tmpData.users.find(user => user.userId === currentUserId);
            if (currentUser) {
                currentUserFound.value = true;
                currentUserRank.value = currentUser.rank as number;
            } else {
                currentUserFound.value = false;
                currentUserRank.value = 0;
            }
        } else {
            currentUserFound.value = false;
            currentUserRank.value = 0;
        }

        rankData.value = tmpData // 解除深层响应式
        isloading.value = false;

        // 确保DataTable的页面大小与我们的状态同步，并同步当前页索引
        setTimeout(() => {
            // 检查DataTable实际的分页文本，例如 "1 to 20 of 100" 或 "21 to 40 of 100"
            const paginatorCurrent = document.querySelector('.p-paginator-current');
            if (paginatorCurrent) {
                const currentText = (paginatorCurrent.textContent || '').trim();
                const m = currentText.match(/(\d+)\s*to\s*(\d+)\s*of\s*(\d+)/i);
                if (m) {
                    const start = parseInt(m[1], 10);
                    const end = parseInt(m[2], 10);
                    const actualPageSize = Math.max(1, end - start + 1);
                    if (actualPageSize !== currentPageSize.value) {

                        currentPageSize.value = actualPageSize;
                    }
                    // 计算并同步当前页索引（0 基）
                    const pageIndex = Math.floor((start - 1) / actualPageSize);
                    if (currentPageIndex.value !== pageIndex) {
                        currentPageIndex.value = pageIndex;

                    }
                }
            }
        }, 300); // 延长等待以提高 DOM 同步可靠性

        // 如果需要在数据加载完成后自动定位
        if (shouldAutoLocateAfterLoad.value && currentUserFound.value) {
            shouldAutoLocateAfterLoad.value = false;
            // 延迟一点时间确保DOM完全更新和页面大小同步
            setTimeout(() => {
                scrollToCurrentUser();
            }, 500);
        }
    } catch (error: any) {
        isloading.value = false;
        if (error.code === ProblemStatus.ACCESS_DENIED || error.code === ProblemStatus.CONTEST_NOT_START) {
            // 导航回到作业详情页面，让父组件处理错误状态
            router.push(`/homework/${props.homeworkId}/intro`);
            // 可以选择显示全局错误消息
            console.error('排行榜访问被拒绝:', error.message);
        } else {
            console.error('加载排行榜失败:', error.message);
        }
    } finally {
        isLoadingData = false; // 重置加载标志
    }
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

onUnmounted(() => {
    stopCountdown();
});
</script>

<style scoped>
/* 当前用户行的样式 */
:deep(.current-user-row) {
    background-color: rgba(59, 130, 246, 0.1) !important;
    border-left: 3px solid #3b82f6 !important;
}

:deep(.current-user-row:hover) {
    background-color: rgba(59, 130, 246, 0.15) !important;
}
</style>