<template>
    <div class="w-full h-full flex flex-col items-start">
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
                <MdPreview :theme="layoutConfig.darkTheme ? 'dark' : 'light'" :modelValue="problemDetail.hint" />
            </div>
        </div>
        <!-- ...existing code... -->
        <div class="fixed top-22 right-10 w-[25%] shadow-lg h-auto p-4 bg-white dark:bg-gray-800 rounded-lg">
            <!-- 卡片布局 -->
            <!-- 标题部分 -->
            <div class="flex justify-between items-center mb-4">
                <span class="text-gray-600 font-semibold  font-medium">题目提供者</span>
                <span class="text-gray-800 ml-2">{{ problemDetail?.nickname }}</span>
            </div>

            <!-- 难度 -->
            <div class="flex justify-between items-center mb-4">
                <span class="text-gray-600 font-semibold font-medium">难度</span>
                <span class="text-orange-500 font-semibold">普及-</span>
            </div>

            <!-- 历史分数 -->
            <div class="flex justify-between items-center mb-6">
                <span class="text-gray-600 font-semibold font-medium">历史分数</span>
                <span class="text-green-500 font-semibold">100</span>
            </div>

            <!-- 底部按钮 -->
            <div class="flex justify-between">
                <!-- 提交记录 -->
                <button class="text-blue-500 hover:text-blue-700 font-medium flex items-center">
                    <i class="pi pi-chart-bar mr-2"></i> 提交记录
                </button>

                <!-- 查看题解 -->
                <button class="text-blue-500 hover:text-blue-700 font-medium flex items-center">
                    <i class="pi pi-book mr-2"></i> 查看题解
                </button>
            </div>
            <div class="mt-4">
                <Button class="text-blue-500 hover:text-blue-700 font-medium flex items-center" @click="visible = true">
                    提交
                </Button>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="visible" header="代码提交" :modal="true" :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
        :style="{ width: '50vw' }" :draggable="false">
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- 语言选择 -->
            <div class="flex justify-between items-center">
                <label class="text-gray-600 font-medium">编程语言</label>
                <Dropdown v-model="selectedLanguage" :options="languages" optionLabel="name" placeholder="选择语言"
                    class="w-48" :filter="true" required />
            </div>

            <!-- 代码编辑区 -->
            <div class="">
                <CodeMirror v-model="code" :dark="true" :extensions="extensions" basic :lang="lang"
                    style="height: 400px;background-color: #282C34;" :tab-size="40" />
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-end space-x-3 pt-4">
                <Button label="取消" @click="closeDialog"
                    class="px-5 py-2 text-gray-600 hover:bg-gray-100 transition-colors" text />
                <Button type="submit" label="提交代码"
                    class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors" />
            </div>
        </form>
    </Dialog>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, watch, reactive } from 'vue';
import { getProblemDetail, type Problem } from '../problemAPI';
import { Judge, submitProblem } from '@/common/api/judgeAPI'
import { number } from 'yup';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useRouter } from 'vue-router';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import { layoutConfig } from '@/common/views/layout/layout'

import CodeMirror from 'vue-codemirror6';
import { oneDark } from '@codemirror/theme-one-dark'
import { cpp } from '@codemirror/lang-cpp';
const extensions = [oneDark];
const router = useRouter();
const visible = ref(false);
const code = ref("Hello World");
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
// 提交代码
async function handleSubmit() {
    visible.value = false;
    const dto: Judge.SubmitReqData = {
        pid: props.pid as unknown as number,
        code: code.value,
        language: selectedLanguage.value.value,
        cid: 0,
        tid: 0,
        gid: 0,
        isRemote: false
    }
    submitProblem(dto).then(() => {
        router.push('/statuses');
    })
}
// 语言选择定义
interface LanguageOption {
    label: string;
    value: Judge.Language;
}
// 语言选择
const selectedLanguage = ref<LanguageOption>({ label: 'C', value: Judge.Language.C });
const languages = ref([
    { name: 'Python', value: 'py' },
    { name: 'JavaScript', value: 'js' },
    { name: 'Java', value: 'java' },
    { name: 'C++', value: 'cpp' },
    { name: 'HTML', value: 'html' },
]);
const languageOptions: LanguageOption[] = [
    { label: 'C', value: Judge.Language.C },
    { label: 'C++', value: Judge.Language.Cpp },
    { label: 'Java', value: Judge.Language.Java },
    { label: 'Python2', value: Judge.Language.PyPy2 },
    { label: 'Python3', value: Judge.Language.PyPy3 }
];

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
    spjCode: '',
    spjLanguage: '',
    userExtraFile: '',
    judgeExtraFile: '',
    isRemoveEndBlank: 0,
    openCaseResult: 0,
    caseversion: '',
    isUploadCase: 0,
    modifiedUser: 0,
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
    if (problemDetail.value && problemDetail.value.description) {
        problemDetail.value.description = renderMath(problemDetail.value.description);
        problemDetail.value.input = renderMath(problemDetail.value.input);
        problemDetail.value.output = renderMath(problemDetail.value.output);
        problemDetail.value.inputExamples = renderMath(problemDetail.value.inputExamples);
        problemDetail.value.outputExamples = renderMath(problemDetail.value.outputExamples);
        problemDetail.value.hint = renderMath(problemDetail.value.hint);
    }
});
// 异步获取题目详情数据
const getProblemDetailData = async () => {
    const result = await getProblemDetail(props.pid as unknown as number);
    problemDetail.value = result.data as Problem.ProblemResData;
    handleInputOutput()
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