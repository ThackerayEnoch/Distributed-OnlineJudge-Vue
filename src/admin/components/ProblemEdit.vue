<template>
    <div>
        <Panel>
            <template #header>
                <div class="flex justify-between items-center text-2xl font-bold text-blue-500">
                    <span>创建题目</span>
                </div>
            </template>
            <Divider />
            <div class="w-full">
                <label class="text-gray-500">
                    <span class="text-red-500">*</span> 展示ID
                </label>
                <InputText v-model="displayId" class="mt-2 w-full" placeholder="展示ID" />
            </div>
            <div class="w-full mt-2">
                <label class="text-gray-500">
                    <span class="text-red-500">*</span> 题目标题
                </label>
                <InputText v-model="title" class="mt-2 w-full" placeholder="题目标题" />
            </div>
            <div class="w-full mt-2 flex space-x-4">
                <div class="flex-1">
                    <label class="text-gray-500"><span class="text-red-500">*</span> 时间限制(ms)</label>
                    <InputNumber v-model="timeLimit" suffix="ms" class="mt-2 w-full" placeholder="时间限制" />
                </div>
                <div class="flex-1">
                    <label class="text-gray-500"><span class="text-red-500">*</span> 内存限制(MiB)</label>
                    <InputNumber v-model="memoryLimit" suffix="MiB" class="mt-2 w-full" placeholder="内存限制" />
                </div>
                <div class="flex-1">
                    <label class="text-gray-500"><span class="text-red-500">*</span> 栈限制(MiB)</label>
                    <InputNumber v-model="stackLimit" suffix="MiB" class="mt-2 w-full" placeholder="栈限制" />
                </div>
                <div class="flex-1">
                    <label class="text-gray-500"><span class="text-red-500">*</span> 难度</label>
                    <Select class="mt-2 w-full" v-model="selectedDifficulty" :options="difficulty" optionLabel="label"
                        optionValue="value" placeholder="难度" />
                </div>
            </div>
            <div class="w-full mt-6">
                <label class="text-gray-500"><span class="text-red-500">*</span> 题目描述</label>
                <MdEditor class="prose max-w-full shadow-md mt-2" v-model="problemDesc" />
            </div>
            <div class="w-full mt-8">
                <label class="text-gray-500"><span class="text-red-500">*</span> 输入描述</label>
                <MdEditor class="prose max-w-full shadow-md max-h-[250px] mt-2" v-model="inputDesc" />
            </div>
            <div class="w-full mt-8">
                <label class="text-gray-500"><span class="text-red-500">*</span> 输出描述</label>
                <MdEditor class="prose max-w-full shadow-md max-h-[250px] mt-2" v-model="outputDesc" />
            </div>
            <div class="w-full mt-8">
                <label class="text-gray-500"> 提示</label>
                <MdEditor class="prose max-w-full shadow-md max-h-[250px] mt-2" v-model="hintDesc" />
            </div>
            <div class="mt-6 flex space-x-3 justify-start max-w-3xl">
                <div class="flex-1 min-w-[200px]">
                    <label class="text-gray-500"> 权限</label>
                    <Select suffix="ms" class="mt-2 w-full" />
                </div>
                <div class="flex-1 min-w-[200px]">
                    <label class="text-gray-500"> 类型</label>
                    <div class="flex flex-row flex-wrap gap-4 mt-4">
                        <div class="flex items-center gap-2">
                            <RadioButton v-model="problemType" inputId="type1" name="type" :value="0" />
                            <label for="ingredient1">ACM</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <RadioButton v-model="problemType" inputId="type2" name="type" :value="1" />
                            <label for="ingredient2">OI</label>
                        </div>
                    </div>
                </div>
                <div class="flex-1 flex flex-col justify-center min-w-[200px]">
                    <label for="share" class="text-gray-500 block">代码是否可分享</label>
                    <ToggleSwitch inputId="share" v-model="share" class="mt-4" />
                </div>
            </div>
            <div class="flex flex-col space-y-2 mt-4">
                <label class="text-gray-500"><span class="text-red-500">*</span> 允许提交语言:</label>
                <div class="flex flex-wrap gap-4">
                    <div v-for="option in languageOptions " :key="option.id" class="flex items-center mr-2 gap-2">
                        <Checkbox v-model="selectedLanguages" :inputId="option.id.toString()" :value="option.id" />
                        <label :for="option.id.toString()">{{ option.name }}</label>
                    </div>
                </div>
            </div>
            <div class="flex justify-between mt-6 items-center text-2xl font-bold text-blue-500">
                <span v-tooltip="'题目样例：请最好不要超过2个题目样例，题面样例不纳入评测数据。 '">题面样例<i
                        class="ml-1 fa-regular fa-circle-question"></i></span>
            </div>
            <div class="p-4">
                <div v-for="(sample, index) in samples" :key="sample.id" class="mb-4  border border-gray-300">
                    <!-- 样例头部 -->
                    <div class="flex justify-between items-center border-b border-gray-300 bg-gray-100 pb-4">
                        <span class="p-4 pb-2 font-bold text-lg">样例 {{ index + 1 }}</span>
                        <div class="flex items-center gap-2">
                            <Button @click="removeSample(sample.id)" severity="danger"
                                class="p-4 pb-2 pl-6 pr-6">删除</Button>
                        </div>
                    </div>

                    <!-- 样例输入输出区域 -->
                    <div v-if="!sample.collapsed" class="flex space-x-4 mt-8 pl-4 mb-4">
                        <div class="w-1/2">
                            <FloatLabel>
                                <label for="input" class="block text-sm font-semibold"><span
                                        class="text-red-500">*</span>
                                    样例输入</label>
                                <Textarea v-model="sample.input" class="w-full p-2 border rounded" rows="5" />
                            </FloatLabel>
                        </div>
                        <div class="w-1/2">
                            <FloatLabel>
                                <label for="output" class="block text-sm font-semibold"><span
                                        class="text-red-500">*</span>
                                    样例输出</label>
                                <Textarea v-model="sample.output" class="w-full p-2 border rounded" rows="5" />
                            </FloatLabel>
                        </div>
                    </div>
                    <Button @click="toggleSample(index)" severity="secondary" class="w-full p-4 pb-2 pl-6 pr-6">
                        {{ sample.collapsed ? '展开' : '折叠' }}
                    </Button>
                </div>
                <Button @click="addSample" class="w-full mb-4">添加样例</Button>
            </div>
            <div class="flex justify-between mt-6 items-center text-2xl font-bold text-blue-500">
                <span v-tooltip="'1. 选手程序：给选手程序提供额外的库文件\n2. 特殊或交互程序：给特殊或交互程序提供额外的库文件'">评测额外文件 <i
                        class="ml-1 fa-regular fa-circle-question"></i></span>
            </div>
            <div class="p-4">
                <div class="flex flex-wrap gap-4">
                    <div class="flex items-center mr-2 gap-2 w-1/2">
                        <Checkbox v-model="userJudgeFile" binary />
                        <label for="checkbox1">选手程序</label>
                    </div>
                    <div class="flex items-center mr-2 gap-2">
                        <Checkbox v-model="spjJudgeFile" binary />
                        <label for="checkbox2">特殊或交互程序</label>
                    </div>
                </div>
            </div>
            <div v-if="userJudgeFile" class="p-4 w-1/2">
                <!-- Tag 列表 -->
                <div class="flex flex-wrap gap-2 border border-gray-300 mt-4 p-2 rounded">
                    <div v-for="(tag, index) in userFiles" :key="index"
                        class="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm border border-blue-300">
                        <i class="pi pi-file pr-1"></i>
                        {{ tag.name }}
                        <button @click="removeTag(index, userFiles)" class="ml-2 text-blue-700 hover:text-blue-500">
                            ✖
                        </button>
                    </div>
                    <!-- 添加按钮 -->
                    <button @click="dialogVisible = true"
                        class="flex items-center px-3 py-1 rounded bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 ml-2">
                        添加文件
                    </button>
                </div>
            </div>
            <div v-if="spjJudgeFile" class="p-4 w-1/2">
                <!-- Tag 列表 -->
                <div class="flex flex-wrap gap-2 border border-gray-300 mt-4 p-2 rounded">
                    <div v-for="(tag, index) in spjFiles" :key="index"
                        class="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm border border-blue-300">
                        <i class="pi pi-file pr-1"></i>
                        {{ tag.name }}
                        <button @click="removeTag(index, spjFiles)" class="ml-2 text-blue-700 hover:text-blue-500">
                            ✖
                        </button>
                    </div>
                    <!-- 添加按钮 -->
                    <button @click="spjDialogVisible = true"
                        class="flex items-center px-3 py-1 rounded bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 ml-2">
                        添加文件
                    </button>
                </div>
            </div>
            <div class="flex justify-between mt-6 items-center text-2xl font-bold text-blue-500">
                <span
                    v-tooltip="'1. 普通判题：选手程序读取题目标准输入文件，执行代码逻辑得到选手输出，对比题目标准输出文件内容得到判题结果\n2. 特殊判题：题目要求的输出结果可能不唯一，允许不同结果存在，所以需要一个特殊程序读取标准输出、选手输出和标准输入，进行对比得出最终判题结果\n3. 交互判题：交互程序的标准输出通过交互通道写到选手程序标准输入，选手程序的标准输出通过交互通道写到交互程序的标准输入，两者需要刷新输出缓冲区'">判题模式
                    <i class="ml-1 fa-regular fa-circle-question"></i></span>
            </div>
            <div class="p-4">
                <div class="flex items-center gap-4 mt-4">
                    <div class="flex items-center gap-2">
                        <RadioButton v-model="judgeMode" inputId="judgeMode1" name="judgeMode" :value="0" />
                        <label for="mode1">普通判题</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioButton v-model="judgeMode" inputId="judgeMode2" name="judgeMode" :value="1" />
                        <label for="mode2">特殊判题</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioButton v-model="judgeMode" inputId="judgeMode3" name="judgeMode" :value="2" />
                        <label for="mode3">交互判题</label>
                    </div>
                </div>
            </div>
            <div class="flex justify-between mt-6 items-center text-2xl font-bold text-blue-500">
                <span v-tooltip="'测试点评测模式。'">评测数据 <i class="ml-1 fa-regular fa-circle-question"></i></span>
            </div>
            <div v-if="problemType === 0" class="p-4 mt-4">
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <RadioButton v-model="acmJudgeCaseMode" inputId="judgeCaseMode1" name="judgeCaseMode"
                            :value="0" />
                        <label for="mode1">全部评测</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioButton v-model="acmJudgeCaseMode" inputId="judgeCaseMode2" name="judgeCaseMode"
                            :value="1" />
                        <label for="mode2">遇错停判(顺序测评)</label>
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="flex items-center gap-4 mt-4">
                    <div class="flex items-center gap-2">
                        <RadioButton v-model="oiJudgeCaseMode" inputId="oiJudgeCaseMode1" name="oiJudgeCaseMode"
                            :value="0" />
                        <label for="mode1">全部评测(得分相加)</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioButton v-model="oiJudgeCaseMode" inputId="oiJudgeCaseMode2" name="oiJudgeCaseMode"
                            :value="1" />
                        <label for="mode2">子任务(最低得分)</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <RadioButton v-model="oiJudgeCaseMode" inputId="oiJudgeCaseMode3" name="oiJudgeCaseMode"
                            :value="2" />
                        <label for="mode3">子任务(平均得分)</label>
                    </div>
                </div>
            </div>
            <div class="flex justify-between mt-6 items-center text-2xl font-bold text-blue-500">
                <span>其他</span>
            </div>
            <div class="p-4 mt-4 pb-0">
                <span class="text-bg-blue-500">自动去除代码每行末尾空白符</span>
            </div>
            <div class="flex-1 p-4 pt-0 pb-0">
                <ToggleSwitch inputId="autoRemove" v-model="removeBlank" class="mt-4" />
            </div>
            <div class="p-4 mt-0 pb-0">
                <span class="text-bg-blue-500">允许查看评测点测评结果</span>
            </div>
            <div class="flex-1 p-4 pt-0">
                <ToggleSwitch inputId="autoRemove" v-model="judgeCaseStatus" class="mt-4" />
            </div>
            <div>
                <Button label="保存" icon="pi pi-check" class="w-full mt-4" />
            </div>
        </Panel>
    </div>
    <!-- PrimeVue Dialog -->
    <Dialog v-model:visible="dialogVisible" header="添加新文件" :modal="true">
        <div class="p-4">
            <InputText v-model="newTag" placeholder="输入文件名" class="w-full mb-3" />
            <Button label="确认添加" icon="pi pi-check" @click="addTag(userFiles)" class="w-full" />
        </div>
    </Dialog>
    <!-- PrimeVue Dialog -->
    <Dialog v-model:visible="spjDialogVisible" header="添加新文件" :modal="true">
        <div class="p-4">
            <label class="pl-0 font-bold"><span class="text-red-500">*</span> 文件名</label>
            <InputText v-model="newTag" placeholder="example.h" class="w-full mb-3 mt-1" />
            <Button label="确认添加" icon="pi pi-check" @click="addTag(spjFiles)" class="w-full" />
        </div>
    </Dialog>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { languageOptions } from '@/common/constant/AllConstant'
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

import { createProblem, type ProblemSpace } from '@/admin/api/problemAPI'

export default defineComponent({
    name: 'ProblemEdit',
    components: { MdEditor },
    props: {
        id: {
            type: Number,
            required: false
        },
        type: {
            type: String,
            required: true
        }
    },
    setup() {
        const displayId = ref("");
        const title = ref("");
        const timeLimit = ref(1000);
        const memoryLimit = ref(512);
        const stackLimit = ref(128);
        const problemDesc = ref("");
        const inputDesc = ref("");
        const outputDesc = ref("");
        const hintDesc = ref("");
        const problemType = ref(0);
        const share = ref(false);
        const selectedLanguages = ref([]); // 绑定选中的值
        let sampleId = 0; // 用于生成唯一的样例id
        const samples = ref([
            // 示例数据
            { id: sampleId++, input: '', output: '', collapsed: false },
        ]);
        const userJudgeFile = ref(false);
        const spjJudgeFile = ref(false);
        const userFiles = ref<{ name: string; code: string }[]>([]);
        const spjFiles = ref<{ name: string; code: string }[]>([]);
        const newTag = ref("");
        const dialogVisible = ref(false);
        const spjDialogVisible = ref(false);
        const judgeMode = ref(0);
        const acmJudgeCaseMode = ref(1);
        const oiJudgeCaseMode = ref(0);
        const removeBlank = ref(true);
        const judgeCaseStatus = ref(true);
        // 
        const difficulty = [
            { label: '简单', value: 0 },
            { label: '中等', value: 1 },
            { label: '困难', value: 2 }
        ];
        const selectedDifficulty = ref(0);
        // 添加新 Tag
        const addTag = (files: { name: string; code: string }[]) => {
            if (newTag.value.trim() && !files.some(tag => tag.name === newTag.value.trim())) {
                files.push({ name: newTag.value.trim(), code: '' });
            }
            newTag.value = "";
            dialogVisible.value = false;
        };

        // 删除 Tag
        const removeTag = (index: number, files: { name: string; code: string }[]) => {
            files.splice(index, 1);
        };


        // 添加样例函数
        const addSample = () => {
            samples.value.push({ id: sampleId++, input: '', output: '', collapsed: false });
        };

        // 删除样例函数
        const removeSample = (id: number) => {
            const index = samples.value.findIndex(sample => sample.id === id);
            if (index !== -1) {
                samples.value.splice(index, 1);
            }
        }
        // 切换样例折叠状态
        const toggleSample = (index: number) => {
            samples.value[index].collapsed = !samples.value[index].collapsed;
        };


        return {
            displayId, difficulty, selectedDifficulty, title, timeLimit, memoryLimit, stackLimit, share, problemDesc, inputDesc, outputDesc, hintDesc, problemType, selectedLanguages, languageOptions, samples, addSample, removeSample,
            toggleSample, userJudgeFile, spjJudgeFile, userFiles, spjFiles, newTag, spjDialogVisible, dialogVisible, addTag, removeTag, judgeMode, oiJudgeCaseMode, acmJudgeCaseMode, removeBlank, judgeCaseStatus
        }
    }
})
</script>
<style scoped>
::v-deep(svg.md-editor-icon) {
    width: 23px !important;
    height: 23px !important;
}
</style>