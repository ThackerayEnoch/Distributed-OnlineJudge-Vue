<template>
    <div class="w-full h-full flex flex-col">

        <div class="w-[70%] h-full p-4 shadow-lg bg-white dark:bg-gray-800 flex-glow">
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
                <div class="ml-4 contain-math-html-css" v-html="problemDetail?.description"></div>
            </div>
            <div class="mb-4">
                <h2 class="text-xl font-semibold mb-2 text-blue-500">输入格式</h2>
                <div class="ml-4 contain-math-html-css" v-html="problemDetail?.input"></div>
            </div>
            <div class="mb-4">
                <h2 class="text-xl font-semibold mb-2 text-blue-500">输出格式</h2>
                <div class="ml-4 contain-math-html-css" v-html="problemDetail?.output"></div>
            </div>
            <div class="mb-4 flex">
                <div class="mr-4">
                    <h2 class="text-xl font-semibold mb-2 text-blue-500">输入样例</h2>
                    <pre class="ml-4 contain-math-html-css bg-gray-100 dark:bg-gray-900 p-4 rounded-md inline-block"
                        v-html="problemDetail?.inputExamples"></pre>
                </div>
                <div>
                    <div class="flex items-center">
                        <h2 class="text-xl font-semibold mb-2 text-blue-500">输出样例</h2>
                        <button @click="copyToClipboard(problemDetail?.outputExamples as string)"
                            class="mt-2 mr-2 bg-blue-500 text-white px-2 py-1 rounded">Copy</button>
                    </div>
                    <pre class="ml-4 contain-math-html-css bg-gray-100 dark:bg-gray-900 p-4 rounded-md inline-block"
                        v-html="problemDetail?.outputExamples"></pre>
                </div>
            </div>
            <div v-if="problemDetail?.hint" class="mb-4">
                <h2 class="text-xl font-semibold mb-2 text-blue-500">提示</h2>
                <div class="ml-4 contain-math-html-css" v-html="problemDetail?.hint"></div>
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
    <Dialog v-model:visible="visible" header="提交代码" :modal="true" :closable="false">
        <div class="p-4">
            <form @submit.prevent="handleSubmit">
                <div class="mb-4">
                    <label for="code" class="block text-sm font-medium text-gray-700">代码</label>
                    <textarea id="code" v-model="code" rows="5"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                        required></textarea>
                </div>
                <div class="flex justify-end">
                    <Button type="submit" label="提交" class="mr-2" />
                    <Button label="取消" @click="closeDialog" class="p-button-secondary" />
                </div>
                <div class="flex justify-end mt-2">
                    <Dropdown v-model="selectedLanguage" :options="languageOptions" optionLabel="label"
                        placeholder="选择语言" class="w-full md:w-14rem" />
                </div>

            </form>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, watch } from 'vue';
import { getProblemDetail, type Problem } from '../problemAPI';
import { Judge, submitProblem } from '@/common/api/judgeAPI'
import { number } from 'yup';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { useRouter } from 'vue-router';

const router = useRouter();
const visible = ref(false);
const code = ref('');

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
const languageOptions: LanguageOption[] = [
    { label: 'C', value: Judge.Language.C },
    { label: 'C++', value: Judge.Language.Cpp },
    { label: 'Java', value: Judge.Language.Java },
    { label: 'Python2', value: Judge.Language.PyPy2 },
    { label: 'Python3', value: Judge.Language.PyPy3 }
];

// 题目详情数据
const problemDetail = ref<Problem.ProblemResData | null>(null);
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
</style>