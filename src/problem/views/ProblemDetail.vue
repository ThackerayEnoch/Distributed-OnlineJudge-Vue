<template>
    <AccessDenied v-if="isAccessDenied" :message="message" btnLabel="返回题库" btnTo="/problems" btnIcon="pi pi-book" />
    <div v-else class="w-full h-full flex flex-col items-start">
        <div class="w-[70%] p-4 shadow-lg bg-white dark:bg-gray-800">

            <h1 class="text-3xl font-bold mb-4" v-html="problemDetail?.title"></h1>
            <div class="mb-4 flex items-center">
                <Tag class="mr-2" severity="info">
                    题目ID: {{ problemDetail?.displayId }}
                </Tag>
                <Tag class="mr-2" severity="success">
                    时间限制: {{ (problemDetail?.timeLimit ?? 0) % 1000 === 0 ? ((problemDetail?.timeLimit ?? 0) / 1000) :
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
                <Tag class="mr-2" severity="success">
                    难度: {{ difficultyMap(problemDetail?.difficulty as Number) }}
                </Tag>
                <Tag class="mr-2" severity="info">
                    判题模式: {{ judgeModeMap(problemDetail?.judgeMode as string) }}
                </Tag>
            </div>
            <div class="mb-4">
                <h2 class="text-xl font-semibold mb-2 text-blue-500">题目描述</h2>
                <div v-if="problemDetail.id <= 2493" class="ml-4 contain-math-html-css"
                    v-html="problemDetail.description"></div>
                <div v-else>
                    <MdPreview :theme="layoutConfig.darkTheme ? 'dark' : 'light'"
                        :modelValue="problemDetail.description" />
                </div>
            </div>
            <div class="mb-4">
                <h2 class="text-xl font-semibold mb-2 text-blue-500">输入格式</h2>
                <div v-if="problemDetail.id <= 2493" class="ml-4 contain-math-html-css" v-html="problemDetail.input">
                </div>
                <div v-else>
                    <MdPreview :theme="layoutConfig.darkTheme ? 'dark' : 'light'" :modelValue="problemDetail.input" />
                </div>
            </div>
            <div class="mb-4">
                <h2 class="text-xl font-semibold mb-2 text-blue-500">输出格式</h2>
                <div v-if="problemDetail.id <= 2493" class="ml-4 contain-math-html-css" v-html="problemDetail.output">
                </div>
                <div v-else>
                    <MdPreview :theme="layoutConfig.darkTheme ? 'dark' : 'light'" :modelValue="problemDetail.output" />
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
                            <Button icon="pi pi-copy" class="p-button-text" @click="copyToClipboard(outputs[index])" />
                        </div>
                        <pre class="p-3 bg-gray-100 dark:bg-black rounded-md border">{{ outputs[index] }}</pre>
                    </div>
                </div>
            </div>
            <div v-if="problemDetail.hint" class="mb-4">
                <h2 class="text-xl font-semibold mb-2 text-blue-500">提示</h2>
                <div v-if="problemDetail.id <= 2493" class="ml-4 contain-math-html-css" v-html="problemDetail.hint">
                </div>
                <MdPreview v-else :theme="layoutConfig.darkTheme ? 'dark' : 'light'" :modelValue="problemDetail.hint" />
            </div>
        </div>
        <!-- ...existing code... -->
        <div class="fixed top-22 right-10 w-[25%] shadow-lg h-auto p-4 bg-white dark:bg-gray-800 rounded-lg">
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
            <div class="flex justify-between items-center mb-6">
                <span class="text-gray-600 font-semibold font-medium">最高得分</span>
                <span class="text-green-500 font-semibold">100</span>
            </div>
            <!-- 按钮组区域 -->
            <div class="mt-4 space-y-2">
                <!-- 主要操作按钮 -->
                <Button class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium" @click="visible = true">
                    提交解答
                </Button>

                <!-- 辅助操作按钮组 -->
                <div class="flex flex-wrap gap-2">
                    <Button v-if="contestId != null"
                        class="flex-1 text-purple-500 hover:text-purple-700 border border-gray-200 font-medium"
                        outlined>
                        排行榜
                    </Button>
                    <Button class="flex-1 text-gray-600 hover:text-gray-800 border border-gray-200 font-medium"
                        outlined>
                        提交记录
                    </Button>
                    <Button v-if="contestId != null"
                        class="flex-1 text-green-500 hover:text-green-700 border border-gray-200 font-medium" outlined>
                        返回竞赛
                    </Button>
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
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, watch } from 'vue';
import { getProblemDetail, submitProblem, type Problem, type Judge } from '../problemAPI';
import { number } from 'yup';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useRouter, useRoute } from 'vue-router';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import { layoutConfig } from '@/common/views/layout/layout'
import { languageOptions } from '@/common/constant/AllConstant'
import CodeMirror from 'vue-codemirror6';
import { oneDark } from '@codemirror/theme-one-dark'
import { cpp } from '@codemirror/lang-cpp';
import globalMessage from '@/common/utils/toast';
import { ProblemStatus } from '../status/problemStatus'
import AccessDenied from '@/common/components/AccessDenied.vue'
const extensions = [oneDark];
const router = useRouter();
const route = useRoute();
const visible = ref(false);

// 从URL中获取contestId
const contestId = route.query.contestId ? Number(route.query.contestId) : null;
const totalSubmissions = ref(0);
const passedSubmissions = ref(0);
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
function closeDialog() {
    visible.value = false;
}
const isSubmtting = ref(false);
// 提交代码
async function handleSubmit() {
    visible.value = false;
    if (isSubmtting.value) return;
    isSubmtting.value = true;
    const dto: Judge.SubmitReqData = {
        pid: props.pid as unknown as number,
        code: code.value,
        language: selectedLanguage.value,
        cid: contestId as number,
        tid: 0,
        gid: 0,
        isRemote: false
    }
    submitProblem(dto).then(() => {
        router.push('/statuses');
    }).finally(() => {
        isSubmtting.value = false;
    })
}
// 语言选择
const selectedLanguage = ref<string>('C 11');
const allowLanguagesList = ref<string[]>([]);
function languageOptionsHandle(languageIds: number[]) {
    if (languageIds != null && languageIds.length > 0) {
        allowLanguagesList.value = languageOptions.filter((item) => languageIds.includes(item.id)).map((item) => item.name);
    } else {
        allowLanguagesList.value = languageOptions.map((item) => item.name);
        console.log(allowLanguagesList.value);
    }
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
    updateTime: new Date()
});
// 定义props，获取URL中的pid参数
const props = defineProps({
    pid: number
});
// 获取题目详情数据
onMounted(() => {
    getProblemDetailData();
});
// 当异步请求得到数据后，渲染数学公式
watch(problemDetail, () => {
    if (problemDetail.value.id <= 2493 && problemDetail.value && problemDetail.value.description) {
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
const getProblemDetailData = async () => {
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
        }
        if (error.code === ProblemStatus.CONTEST_NOT_START) {
            isAccessDenied.value = true;
            message.value = '比赛未开始';
            globalMessage.warn('提示', '比赛未开始');
            return;
        }
        globalMessage.error('题目详情数据获取失败', error.message);
    });

}
// 渲染数学公式
const renderMath = (content: string) => {
    content = decodeHtmlEntities(content);
    if (!content) return '';
    const regex = /(?:\$\$(.*?)\$\$|\\\[(.*?)\\\])|(?:\$(.*?)\$|\\\((.*?)\\\))/g;
    return content.replace(regex, (match, blockLatex, blockLatex2, inlineLatex, inlineLatex2) => {
        // 匹配块级公式
        if (blockLatex || blockLatex2) {
            const latex = blockLatex || blockLatex2;
            try {
                return `<div class="math-block">${katex.renderToString(latex, { displayMode: true })}</div>`;
            } catch (error) {
                console.error('KaTeX rendering error:', error);
                return match;
            }
        }
        // 匹配行内公式
        if (inlineLatex || inlineLatex2) {
            const latex = inlineLatex || inlineLatex2;
            try {
                return `<span class="math-inline">${katex.renderToString(latex)}</span>`;
            } catch (error) {
                console.error('KaTeX rendering error:', error);
                return match;
            }
        }
        return match;
    });
};
// 解码HTML实体字符
const decodeHtmlEntities = (str: string) => {
    const element = document.createElement('div');
    if (str) {
        element.innerHTML = str;
        return element.textContent || element.innerText || '';
    }
    return str;
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