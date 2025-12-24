<template>
    <div v-if="isloading" class="flex flex-col items-center justify-center h-screen">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
            aria-label="Custom ProgressSpinner" />
        <span class="mt-2 text-gray-500">加载数据中...</span>
    </div>
    <div v-else class="w-full">
        <AccessDenied v-if="isAccessDenied" :message="message" btnLabel="返回题库" btnTo="/problems" btnIcon="pi pi-book" />
        <div v-else class="w-full h-full flex flex-col items-start">
            <div class="w-[70%] p-4 shadow-lg bg-white dark:bg-gray-800">

                <h1 class="text-3xl font-bold mb-4" v-html="problemDetail?.title"></h1>
                <div class="mb-4 flex items-center">
                    <Tag class="mr-2" severity="info">
                        题目ID: {{ problemDetail?.displayId }}
                    </Tag>
                    <Tag class="mr-2" severity="success">
                        时间限制: {{ (problemDetail?.timeLimit ?? 0) % 1000 === 0 ? ((problemDetail?.timeLimit ?? 0) / 1000)
                            :
                            ((problemDetail?.timeLimit ?? 0) / 1000).toFixed(3) }} S
                    </Tag>
                    <Tag class="mr-2" severity="danger">
                        空间限制: {{ problemDetail?.memoryLimit }}MiB
                    </Tag>
                    <Tag class="mr-2" severity="warn">
                        类型: {{ problemDetail?.type == 0 ? 'ACM' : 'OI' }}
                    </Tag>
                    <Tag v-if="problemDetail?.type" class="mr-2" severity="danger">
                        OI分数: {{ problemDetail?.ioScore }}
                    </Tag>
                    <Tag class="mr-2" severity="info">
                        判题模式: {{ judgeModeMap(problemDetail?.judgeMode as string) }}
                    </Tag>
                    <Tag v-if="problemDetail?.isRemote" class="mr-2" severity="danger">
                        远程判题
                    </Tag>
                </div>
                <div class="mb-4">
                    <h2 class="text-xl font-semibold mb-2 text-blue-500">题目描述</h2>
                    <div v-if="problemDetail.id <= 2501" class="ml-4 contain-math-html-css"
                        v-html="problemDetail.description"></div>
                    <div v-else>
                        <MdPreview :theme="layoutConfig.darkTheme ? 'dark' : 'light'"
                            :modelValue="problemDetail.description" />
                    </div>
                </div>
                <div class="mb-4">
                    <h2 class="text-xl font-semibold mb-2 text-blue-500">输入格式</h2>
                    <div v-if="problemDetail.id <= 2501" class="ml-4 contain-math-html-css"
                        v-html="problemDetail.input">
                    </div>
                    <div v-else>
                        <MdPreview :theme="layoutConfig.darkTheme ? 'dark' : 'light'"
                            :modelValue="problemDetail.input" />
                    </div>
                </div>
                <div class="mb-4">
                    <h2 class="text-xl font-semibold mb-2 text-blue-500">输出格式</h2>
                    <div v-if="problemDetail.id <= 2501" class="ml-4 contain-math-html-css"
                        v-html="problemDetail.output">
                    </div>
                    <div v-else>
                        <MdPreview :theme="layoutConfig.darkTheme ? 'dark' : 'light'"
                            :modelValue="problemDetail.output" />
                    </div>
                </div>
                <div class="mb-4">
                    <!-- 输入输出样例 标题 -->
                    <h2 class="text-xl font-semibold mb-2 text-blue-500">输入输出样例</h2>

                    <div v-for="(input, index) in inputs" :key="index" class="flex items-start p-4 pb-0 pt-0 rounded">
                        <!-- 输入样例 -->
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm text-gray-500 font-bold">输入样例 #{{ index + 1 }}</span>
                                <Button icon="pi pi-copy" class="p-button-text" @click="copyToClipboard(input)" />
                            </div>
                            <pre class="p-3 bg-gray-100 dark:bg-black rounded-md border">{{ input }}</pre>
                        </div>

                        <!-- 输出样例 -->
                        <div class="flex-1 ml-4">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm text-gray-500 font-bold">输出样例 #{{ index + 1 }}</span>
                                <Button icon="pi pi-copy" class="p-button-text"
                                    @click="copyToClipboard(outputs[index])" />
                            </div>
                            <pre class="p-3 bg-gray-100 dark:bg-black rounded-md border">{{ outputs[index] }}</pre>
                        </div>
                    </div>
                </div>
                <div v-if="problemDetail.hint" class="mb-4">
                    <h2 class="text-xl font-semibold mb-2 text-blue-500">提示</h2>
                    <div v-if="problemDetail.id <= 2501" class="ml-4 contain-math-html-css" v-html="problemDetail.hint">
                    </div>
                    <MdPreview v-else :theme="layoutConfig.darkTheme ? 'dark' : 'light'"
                        :modelValue="problemDetail.hint" />
                </div>
            </div>
            <!-- ...existing code... -->
            <div class="fixed top-22 right-10 w-[25%] h-auto">
                <div class="p-4 bg-white dark:bg-gray-800 shadow-lg">
                    <!-- 卡片其他内容保持原样 -->
                    <!-- 标题部分 -->
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600 font-semibold font-medium">题目提供者</span>
                        <span class="text-gray-800 ml-2">{{ problemDetail.nickname }}</span>
                    </div>
                    <!-- 难度 -->
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600 font-semibold font-medium">难度等级</span>
                        <span class="text-orange-500 font-semibold">{{ difficultyMap(problemDetail.difficulty) }}</span>
                    </div>
                    <!-- 统计信息组 -->
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600 font-semibold font-medium">提交总数</span>
                        <span class="text-gray-800 font-semibold">{{ totalSubmissions }}</span>
                    </div>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600 font-semibold font-medium">正确提交</span>
                        <span class="text-green-500 font-semibold">{{ passedSubmissions }}</span>
                    </div>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600 font-semibold font-medium">通过率</span>
                        <span class="text-blue-500 font-semibold">
                            {{ (passedSubmissions / totalSubmissions * 100 || 0).toFixed(1) }}%
                        </span>
                    </div>
                    <!-- 题目元数据 -->
                    <div v-if="problemDetail.type === 1" class="flex justify-between items-center mb-6">
                        <span class="text-gray-600 font-semibold font-medium">最高得分</span>
                        <span class="text-green-500 font-semibold">{{ score }}</span>
                    </div>
                    <div v-if="problemDetail.type === 0" class="flex justify-between items-center mb-6">
                        <span class="text-gray-600 font-semibold font-medium">是否AC</span>
                        <span class="text-green-500 font-semibold">{{ isSolved ? 'AC' : '' }}</span>
                    </div>
                    <!-- 按钮组区域 -->
                    <div class="mt-4 space-y-2">
                        <!-- 主要操作按钮 -->
                        <Button class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
                            @click="visible = true">
                            提交解答
                        </Button>

                        <!-- 辅助操作按钮组 -->
                        <div class="flex flex-wrap gap-2">
                            <Button v-if="contestId != null" @click="routePush(`/homework/${contestId}/ranking`)"
                                class="flex-1 text-purple-500 hover:text-purple-700 border border-gray-200 font-medium"
                                outlined>
                                排行榜
                            </Button>
                            <Button v-if="contestId != null"
                                @click="routePush(`/homework/${contestId}/submit?problemId=${props.pid}&contestId=${contestId}`)"
                                class="flex-1 text-gray-600 hover:text-gray-800 border border-gray-200 font-medium"
                                outlined>
                                提交记录
                            </Button>
                            <Button v-if="contestId == null" @click="routePush(`/statuses?problemId=${props.pid}`)"
                                class="flex-1 text-gray-600 hover:text-gray-800 border border-gray-200 font-medium"
                                outlined>
                                提交记录
                            </Button>
                            <Button v-if="contestId != null" @click="routePush(`/homework/${contestId}/problems`)"
                                class="flex-1 text-green-500 hover:text-green-700 border border-gray-200 font-medium"
                                outlined>
                                返回竞赛
                            </Button>
                        </div>
                    </div>
                </div>
                <!-- 题目标签区域 -->
                <div class="card mt-4 mb-4 p-4 bg-white dark:bg-gray-800 shadow-md rounded-none">
                    <h3 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">当前题目标签</h3>
                    <div class="flex flex-wrap gap-2">
                        <template v-for="(tag, index) in problemDetail.tags" :key="index">
                            <span :style="{ backgroundColor: tag.color }" class="inline-flex items-center text-sm font-bold rounded px-3 py-1
                           text-white shadow-sm transition-colors hover:brightness-110
                           max-w-full truncate">
                                {{ tag.name }}
                            </span>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="visible" header="代码提交" :modal="true" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        :style="{ width: '50vw' }" :draggable="false">
        <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
            <!-- 语言选择 -->
            <div class="flex justify-between items-center">
                <label class="text-gray-600 font-medium">编程语言</label>
                <Dropdown v-model="selectedLanguage" :options="allowLanguagesList" placeholder="选择语言" class="w-48"
                    :filter="true" required />
            </div>

            <!-- 代码编辑区（允许扩展） -->
            <div class="flex flex-col w-full">
                <CodeMirror v-model:model-value="code" :dark="true" :extensions="extensions" basic :lang="lang"
                    class="w-full min-h-[400px] bg-[#282C34]" style="height: auto;" :tab-size="40" />
            </div>

            <!-- 操作按钮（保持在底部） -->
            <div class="flex justify-end space-x-3 pt-4">
                <Button label="取消" @click="closeDialog"
                    class="px-5 py-2 text-gray-600 hover:bg-gray-100 transition-colors" text />
                <Button type="submit" label="提交代码" :loading="isSubmtting"
                    class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors" />
            </div>
        </form>

    </Dialog>

    <Dialog v-model:visible="showStatusDialog" header="提交状态" :modal="true" :closable="false" :style="{ width: '450px' }"
        :draggable="false">
        <div class="flex flex-col items-center justify-center p-4 space-y-6">
            <div v-if="submissionStatus" class="text-center w-full">
                <div class="mb-6">
                    <span :class="getStatusClass(submissionStatus.status)"
                        class="p-3 px-8 text-xl font-bold inline-block rounded-md shadow-sm transition-all duration-300">
                        {{ statusMap[String(submissionStatus.status) as keyof typeof statusMap] || 'Unknown' }}
                    </span>
                </div>

                <div v-if="isPending(submissionStatus.status)" class="mb-4 flex flex-col items-center justify-center">
                    <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
                    <span v-if="submissionStatus.queueSize > 0" class="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                        当前队列位置: {{ submissionStatus.queueSize }}
                    </span>
                </div>

                <div v-if="!isPending(submissionStatus.status)" class="grid grid-cols-2 gap-4 w-full mt-2">
                    <div
                        class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                        <span
                            class="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">运行时间</span>
                        <span class="text-xl font-mono font-bold text-gray-800 dark:text-gray-100">{{
                            submissionStatus.time
                        }}ms</span>
                    </div>
                    <div
                        class="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                        <span
                            class="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-bold">运行内存</span>
                        <span class="text-xl font-mono font-bold text-gray-800 dark:text-gray-100">{{
                            formatMemory(submissionStatus.memory) }}</span>
                    </div>
                </div>
            </div>
            <div v-else class="flex flex-col items-center py-8">
                <ProgressSpinner style="width: 40px; height: 40px" />
                <span class="mt-2 text-gray-500">获取状态中...</span>
            </div>

            <div class="flex flex-col w-full space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div class="flex space-x-2">
                    <Button label="提交记录" class="flex-1" severity="info" outlined @click="goToStatus" />
                    <Button label="题目列表" class="flex-1" severity="warning" outlined @click="goToProblemList" />
                    <Button v-if="contestId != null" label="查看榜单" class="flex-1" severity="help" outlined
                        @click="goToRanking" />
                    <Button label="查看详情" class="flex-1" severity="success" outlined @click="goToDetail" />
                </div>
                <Button label="返回题目" severity="secondary" text @click="closeStatusDialog" class="w-full" />
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { number } from 'yup';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import CodeMirror from 'vue-codemirror6';
import { oneDark } from '@codemirror/theme-one-dark';
import { cpp } from '@codemirror/lang-cpp';

import { type LanguageSpace, getAllLanguages } from '@/common/api/languageAPI';
import { getProblemDetail, submitProblem, getProblemStatistics, type Problem, type Judge } from '../problemAPI';
import { getStatBySubmitid, type Status } from '../StatusAPI';
import { statusMap, statusClassMap } from '@/common/constant/AllConstant';
import { layoutConfig } from '@/common/views/layout/layout';
import globalMessage from '@/common/utils/toast';
import { ProblemStatus } from '../status/problemStatus';
import AccessDenied from '@/common/components/AccessDenied.vue';
import { useNoticePolling } from '@/common/utils/useNoticePolling';
const { startPolling } = useNoticePolling();

const extensions = [oneDark];
const router = useRouter();
const route = useRoute();
const visible = ref(false);

// 从URL中获取contestId
const contestId = route.query.contestId ? Number(route.query.contestId) : null;
const totalSubmissions = ref(0);
const passedSubmissions = ref(0);
const isSolved = ref(false);
const score = ref(0);
const code = ref<string>('');
const lang = cpp();
const inputs = ref([]);
const outputs = ref([]);
function handleInputOutput() {
    const inputExamples = problemDetail.value.inputExamples;
    const outputExamples = problemDetail.value.outputExamples;

    try {
        const inputJson = JSON.parse(inputExamples);
        const outputJson = JSON.parse(outputExamples);
        inputs.value = Object.values(inputJson);
        outputs.value = Object.values(outputJson);
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
}
function routePush(path: string) {
    router.push(path);
}
function closeDialog() {
    visible.value = false;
}

// 提交状态弹窗相关
const showStatusDialog = ref(false);
const currentSubmitId = ref<number>(0);
const submissionStatus = ref<Status.StatusItem | null>(null);
let pollingInterval: any = null;

const startPollingQuery = (submitId: number) => {
    currentSubmitId.value = submitId;
    submissionStatus.value = null;
    fetchStatus();
    pollingInterval = setInterval(fetchStatus, 1000);
};

const fetchStatus = async () => {
    if (!currentSubmitId.value) return;
    try {
        const res = await getStatBySubmitid(currentSubmitId.value);
        submissionStatus.value = res.data || null;
        if (submissionStatus.value) {
            const status = submissionStatus.value.status;
            // Polling statuses: Not Submitted, Submitting, Compiling, Judging, Pending, No Status
            const pendingStatuses = [-10, 9, 6, 7, 5, 15];
            if (!pendingStatuses.includes(status)) {
                stopPolling();
            }
        }
    } catch (err) {
        console.error(err);
        stopPolling();
    }
};

const stopPolling = () => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
};

const closeStatusDialog = () => {
    showStatusDialog.value = false;
    stopPolling();
};

const getStatusClass = (status: number) => {
    return statusClassMap[String(status) as keyof typeof statusClassMap] || 'bg-gray-500 text-white';
};

const isPending = (status: number) => {
    return [-10, 9, 6, 7, 5, 15].includes(status);
};

const formatMemory = (memory: number) => {
    if (memory < 1024) {
        return `${memory} KiB`;
    } else {
        if (memory % 1024 === 0) {
            return `${(memory / 1024).toFixed(0)} MiB`;
        }
        return `${(memory / 1024).toFixed(2)} MiB`;
    }
};

const openInNewTab = (path: string) => {
    const routeUrl = router.resolve(path);
    window.open(routeUrl.href, '_blank');
}

const goToRanking = () => {
    if (contestId != null) {
        openInNewTab(`/homework/${contestId}/ranking`);
    }
};

const goToStatus = () => {
    if (contestId != null) {
        openInNewTab(`/homework/${contestId}/submit?problemId=${props.pid}&contestId=${contestId}`);
    } else {
        openInNewTab(`/statuses?problemId=${props.pid}`);
    }
};

const goToDetail = () => {
    if (submissionStatus.value?.submitId) {
        if (contestId != null) {
            openInNewTab(`/status/${submissionStatus.value.submitId}?contestId=${contestId}`);
        } else {
            openInNewTab(`/status/${submissionStatus.value.submitId}`);
        }
    }
};

const goToProblemList = () => {
    if (contestId != null) {
        openInNewTab(`/homework/${contestId}/problems`);
    } else {
        openInNewTab(`/problems`);
    }
};

const isSubmtting = ref(false);
// 提交代码
async function handleSubmit() {
    if (isSubmtting.value) return;
    isSubmtting.value = true;
    const dto: Judge.SubmitReqData = {
        pid: Number(props.pid as unknown as string),
        code: code.value,
        language: selectedLanguage.value,
        cid: contestId as number ?? 0,
        tid: 0,
        gid: 0,
        isRemote: problemDetail.value.isRemote
    }
    await submitProblem(dto).then((res) => {
        globalMessage.success('提交成功', '您的代码已提交成功');
        visible.value = false;
        // 后端返回的可能是Long类型，这里作为number处理，如果过大可能需要转string
        const submitId = Number(res.data);
        showStatusDialog.value = true;
        startPollingQuery(submitId);
    }).catch((err) => {
        globalMessage.error('提交失败', err.message);
    }).finally(() => {
        isSubmtting.value = false;
    })
}
// 语言选择
async function getAllLanguagesList() {
    try {
        const res = await getAllLanguages();
        if (res.data) {
            LanguageList.value = res.data;
        }
    } catch (error) {
        globalMessage.error('获取语言列表失败', (error as Error).message);
    }
}
const LanguageList = ref<LanguageSpace.LanguageVO[]>([]);
const selectedLanguage = ref<string>('C');
const allowLanguagesList = ref<string[]>([]);
async function languageOptionsHandle(languageIds: number[]) {
    while (LanguageList.value.length === 0) {
        //等待语言列表加载完成
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (languageIds != null && languageIds.length > 0) {
        allowLanguagesList.value = LanguageList.value.filter((item) => languageIds.includes(item.id)).map((item) => item.name);
    } else {
        allowLanguagesList.value = LanguageList.value.map((item) => item.name);
    }
    selectedLanguage.value = allowLanguagesList.value[0] || '';
}
// 题目详情数据
const problemDetail = ref<Problem.ProblemResData>({
    id: 0,
    displayId: '',
    judgeMode: '',
    title: '',
    type: 0,
    timeLimit: 0,
    memoryLimit: 0,
    stackLimit: 0,
    description: '',
    input: '',
    output: '',
    inputExamples: '',
    outputExamples: '',
    source: 0,
    difficulty: 0,
    hint: '',
    auth: 0,
    ioScore: 0,
    codeShare: 0,
    userExtraFile: '',
    isRemoveEndBlank: 0,
    openCaseResult: 0,
    modifiedUser: 0,
    allowLanguages: [],
    nickname: '',
    createTime: new Date(),
    updateTime: new Date(),
    isRemote: false,
    tags: [],
});
// 定义props，获取URL中的pid参数
const props = defineProps({
    pid: number
});
// 获取题目详情数据
onMounted(() => {
    getProblemDetailData();
    getAllLanguagesList()
    loadProblemStatistics();
    if (contestId != null && contestId >= 1000) {
        startPolling(contestId);
    }
});
// 当异步请求得到数据后，渲染数学公式
watch(problemDetail, () => {
    if (problemDetail.value.id <= 2501 && problemDetail.value && problemDetail.value.description) {
        problemDetail.value.description = renderMath(problemDetail.value.description);
        problemDetail.value.input = renderMath(problemDetail.value.input);
        problemDetail.value.output = renderMath(problemDetail.value.output);
        problemDetail.value.inputExamples = renderMath(problemDetail.value.inputExamples);
        problemDetail.value.outputExamples = renderMath(problemDetail.value.outputExamples);
        problemDetail.value.hint = renderMath(problemDetail.value.hint);
    }
});
const message = ref<string>('您没有权限查看此题目');
const isAccessDenied = ref<boolean>(false);
// 异步获取题目详情数据
const loadProblemStatistics = async () => {
    await getProblemStatistics(props.pid as unknown as number, contestId as unknown as number).then((res) => {
        const data = res.data as Problem.ProblemStatistics;
        totalSubmissions.value = data.totalSubmission;
        passedSubmissions.value = data.solvedCount;
        isSolved.value = data.isSolved;
        score.value = data.userScore;
    }).catch((error) => {
        console.error('获取题目统计数据失败', error);
    });
}
// 异步获取题目详情数据
const isloading = ref<boolean>(false);
const getProblemDetailData = async () => {
    if (!props.pid) return;
    isloading.value = true;
    await getProblemDetail(props.pid as unknown as number, contestId as number).then((res) => {
        const data = res.data as Problem.ProblemResData;
        problemDetail.value = data;
        languageOptionsHandle(data.allowLanguages);
        handleInputOutput();
    }).catch((error) => {
        if (error.code === ProblemStatus.ACCESS_DENIED) {
            isAccessDenied.value = true;
            message.value = '您没有权限查看此题目, 可能是题目未开放';
            globalMessage.warn('提示', '您没有权限查看此题目');
            return;
        } else
            if (error.code === ProblemStatus.CONTEST_NOT_START) {
                isAccessDenied.value = true;
                message.value = '比赛未开始';
                globalMessage.warn('提示', '比赛未开始');
                return;
            } else
                if (error.code === ProblemStatus.CONTEST_PROBLEM_USED) {
                    isAccessDenied.value = true;
                    message.value = '题目已被用于比赛中';
                    globalMessage.warn('提示', '题目已被用于比赛中');
                    return;
                }
        globalMessage.error('题目详情数据获取失败', error.message);
    }).finally(() => {
        isloading.value = false;
    });

}
// 解码HTML实体字符，同时保留HTML标签（如 <img>）
const decodeHtmlEntities = (str: string): string => {
    if (!str) return '';

    // 使用 DOMParser 保留 HTML 结构
    const parser = new DOMParser();
    const dom = parser.parseFromString(`<body>${str}</body>`, 'text/html');

    // 递归解码节点中的文本内容
    const decodeNode = (node: Node): void => {
        if (node.nodeType === Node.TEXT_NODE) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = node.textContent || '';
            node.textContent = tempDiv.textContent || '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 保留 <img> 和其他标签的属性
            const element = node as Element;
            Array.from(element.attributes).forEach(attr => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = attr.value;
                attr.value = tempDiv.textContent || attr.value;
            });
            // 递归处理子节点
            node.childNodes.forEach(decodeNode);
        }
    };

    decodeNode(dom.body);
    // 返回 body 的 innerHTML，保留所有标签
    return dom.body.innerHTML;
};

// 渲染数学公式
const renderMath = (content: string): string => {
    if (!content) return '';

    // 先解码 HTML 实体，保留标签
    content = decodeHtmlEntities(content);

    // 匹配 LaTeX 公式：块级 ($$...$$ 或 \[...\]) 和行内 ($...$ 或 \(...\))
    const regex = /(?:\$\$(.*?)\$\$|\\\[(.*?)\\\])|(?:\$(.*?)\$|\\\((.*?)\\\))/gs;

    return content.replace(regex, (match, blockLatex, blockLatex2, inlineLatex, inlineLatex2) => {
        // 匹配块级公式
        if (blockLatex || blockLatex2) {
            const latex = blockLatex || blockLatex2;
            try {
                return `< div class= "math-block" > ${katex.renderToString(latex, { displayMode: true })} </div>`;
            } catch (error) {
                console.error('KaTeX rendering error:', error);
                return match; // 保留原始公式
            }
        }
        // 匹配行内公式
        if (inlineLatex || inlineLatex2) {
            const latex = inlineLatex || inlineLatex2;
            try {
                return `<span class="math-inline">${katex.renderToString(latex)}</span>`;
            } catch (error) {
                console.error('KaTeX rendering error:', error);
                return match; // 保留原始公式
            }
        }
        return match;
    });
};
// 复制到剪贴板
const copyToClipboard = (content: string) => {
    const el = document.createElement('textarea');
    el.value = content;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}
// 难度标签
const difficultyMap = (difficulty: Number) => {
    switch (difficulty) {
        case 0:
            return '简单';
        case 1:
            return '中等';
        case 2:
            return '困难';
        default:
            return '未知';
    }
};
// 判题模式标签
const judgeModeMap = (judgeMode: string) => {
    switch (judgeMode) {
        case "default":
            return '传统';
        case "spj":
            return '特判';
        case "interactive":
            return '交互';
        default:
            return '未知';
    }
};
</script>

<style scoped>
/*确保换行正确*/
.contain-math-html-css {
    text-align: left;
    white-space: pre-wrap;
    flex: none;
}

/* required! */
.cm-editor {
    height: 100%;
}
</style>
