<template>
    <div>
        <Panel>
            <template #header>
                <div class="flex justify-between items-center text-2xl font-bold text-blue-500">
                    <span v-if="props.type === 'edit'">
                        编辑题目
                        <span v-if="isRemote" class="text-red-500">远程题目</span>
                    </span>
                    <span v-else>创建题目</span>
                </div>
            </template>
            <Divider />
            <div class=" w-full mt-2">
                <label class="text-gray-500">
                    <span class="text-red-500">*</span> 题目标题
                </label>
                <InputText :disabled="isRemote" v-model="title" class="mt-2 w-full" placeholder="题目标题" />
            </div>
            <div class="w-full mt-2 flex space-x-4">
                <div class="flex-1">
                    <label class="text-gray-500"><span class="text-red-500">*</span> 时间限制(ms)</label>
                    <InputNumber :disabled="isRemote" v-model="timeLimit" suffix="ms" class="mt-2 w-full"
                        placeholder="时间限制" />
                </div>
                <div class="flex-1">
                    <label class="text-gray-500"><span class="text-red-500">*</span> 内存限制(MiB)</label>
                    <InputNumber :disabled="isRemote" v-model="memoryLimit" suffix="MiB" class="mt-2 w-full"
                        placeholder="内存限制" />
                </div>
                <div class="flex-1">
                    <label class="text-gray-500"><span class="text-red-500">*</span> 栈限制(MiB)</label>
                    <InputNumber :disabled="isRemote" v-model="stackLimit" suffix="MiB" class="mt-2 w-full"
                        placeholder="栈限制" />
                </div>
                <div class="flex-1">
                    <label class="text-gray-500"><span class="text-red-500">*</span> 难度</label>
                    <Select class="mt-2 w-full" v-model="selectedDifficulty" :options="difficulty" optionLabel="label"
                        optionValue="value" placeholder="难度" />
                </div>
            </div>
            <div class="w-full mt-6">
                <label class="text-gray-500"><span class="text-red-500">*</span> 题目描述</label>
                <MdEditor class="prose max-w-full shadow-md mt-2" @on-upload-img="onUploadImg" v-model="problemDesc" />
            </div>
            <div class="w-full mt-8">
                <label class="text-gray-500"><span class="text-red-500">*</span> 输入描述</label>
                <MdEditor class="prose max-w-full shadow-md max-h-[250px] mt-2" @on-upload-img="onUploadImg"
                    v-model="inputDesc" />
            </div>
            <div class="w-full mt-8">
                <label class="text-gray-500"><span class="text-red-500">*</span> 输出描述</label>
                <MdEditor class="prose max-w-full shadow-md max-h-[250px] mt-2" @on-upload-img="onUploadImg"
                    v-model="outputDesc" />
            </div>
            <div class="w-full mt-8">
                <label class="text-gray-500"> 提示</label>
                <MdEditor class="prose max-w-full shadow-md max-h-[250px] mt-2" @on-upload-img="onUploadImg"
                    v-model="hintDesc" />
            </div>
            <div class="mt-6 flex space-x-3 justify-start max-w-3xl">
                <div class="flex-1 min-w-[200px]">
                    <label class="text-gray-500"> 可见性</label>
                    <Select suffix="ms" v-model="selectedAuth" :options="authOptions" optionLabel="label"
                        optionValue="value" class="mt-2 w-full" />
                </div>
                <div v-if="!isRemote" class="flex-1 min-w-[200px]">
                    <label class="text-gray-500"> 类型</label>
                    <div class="flex flex-row flex-wrap gap-4 mt-4">
                        <div class="flex items-center gap-2">
                            <RadioButton v-model="problemType" inputId="type1" name="type" :value="0" />
                            <label for="ingredient1">ACM</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <RadioButton v-model="problemType" disabled inputId="type2" name="type" :value="1" />
                            <label for="ingredient2" v-tooltip.top="'正在开发中'">OI</label>
                        </div>
                    </div>
                </div>
                <div class="flex-1 flex flex-col justify-center min-w-[200px]">
                    <label for="share" class="text-gray-500 block">代码是否可分享</label>
                    <ToggleSwitch inputId="share" v-model="share" class="mt-4" />
                </div>
            </div>
            <div v-if="!isRemote" class="flex flex-col space-y-2 mt-4">
                <label class="text-gray-500"><span class="text-red-500">*</span> 允许提交语言:</label>
                <div class="flex flex-wrap gap-4">
                    <div v-for="option in languageOptions" :key="option.id" class="flex items-center mr-2 gap-2">
                        <Checkbox v-model="selectedLanguages" :inputId="option.id.toString()" :value="option.id" />
                        <label v-tooltip.top="option.description" :for="option.id.toString()">{{ option.name
                        }}</label>
                    </div>
                </div>
            </div>
            <div class="flex flex-col space-y-2 mt-4">
                <label class="text-gray-500"> 题目标签:</label>
                <div class="flex flex-wrap gap-4">
                    <div class="flex flex-wrap gap-2">
                        <template v-for="(tag, index) in tags" :key="index">
                            <span :style="{ backgroundColor: tag.color }"
                                class="inline-flex items-center text-sm font-medium rounded px-3 py-1 text-white shadow-sm max-w-full gap-1">
                                <span class="truncate">{{ tag.name }}</span>
                                <button @click="removeProblemTag(index)"
                                    class="flex items-center justify-center w-5 h-5 text-white/80 hover:text-white transition-colors duration-150">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        </template>
                        <button @click="onTagDialogOpen"
                            class="flex items-center px-3 py-1 rounded bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 ml-2">
                            添加标签
                        </button>
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
                            <Button :disabled="isRemote" @click="removeSample(sample.id)" severity="danger"
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
                                <Textarea :disabled="isRemote" v-model="sample.input" class="w-full p-2 border rounded"
                                    rows="5" />
                            </FloatLabel>
                        </div>
                        <div class="w-1/2">
                            <FloatLabel>
                                <label for="output" class="block text-sm font-semibold"><span
                                        class="text-red-500">*</span>
                                    样例输出</label>
                                <Textarea :disabled="isRemote" v-model="sample.output" class="w-full p-2 border rounded"
                                    rows="5" />
                            </FloatLabel>
                        </div>
                    </div>
                    <Button @click="toggleSample(index)" severity="secondary" class="w-full p-4 pb-2 pl-6 pr-6">
                        {{ sample.collapsed ? '展开' : '折叠' }}
                    </Button>
                </div>
                <Button :disabled="isRemote" @click="addSample" class="w-full mb-4">添加样例</Button>
            </div>
            <div v-if="!isRemote" class="flex justify-between mt-6 items-center text-2xl font-bold text-blue-500">
                <span v-tooltip="'1. 选手程序：给选手程序提供额外的库文件\n2. 特殊或交互额外库文件：给特殊或交互程序提供额外的库文件'">评测额外文件 <i
                        class="ml-1 fa-regular fa-circle-question"></i></span>
            </div>
            <div v-if="!isRemote" class="p-4">
                <div class="flex flex-wrap gap-4">
                    <div class="flex items-center mr-2 gap-2 w-1/2">
                        <Checkbox v-model="userJudgeFile" binary />
                        <label for="checkbox1">选手程序</label>
                    </div>
                    <div class="flex items-center mr-2 gap-2" v-if="judgeMode === 1 || judgeMode === 2">
                        <Checkbox v-model="spjJudgeFile" binary />
                        <label for="checkbox2">特殊或交互额外库文件</label>
                    </div>
                </div>
            </div>
            <div v-if="userJudgeFile && !isRemote" class="p-4 w-1/2">
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
            <div v-if="spjJudgeFile && !isRemote" class="p-4 w-1/2">
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
            <div v-if="!isRemote" class="flex justify-between mt-6 items-center text-2xl font-bold text-blue-500">
                <span
                    v-tooltip="'1. 普通判题：选手程序读取题目标准输入文件，执行代码逻辑得到选手输出，对比题目标准输出文件内容得到判题结果\n2. 特殊判题：题目要求的输出结果可能不唯一，允许不同结果存在，所以需要一个特殊程序读取标准输出、选手输出和标准输入，进行对比得出最终判题结果\n3. 交互判题：交互程序的标准输出通过交互通道写到选手程序标准输入，选手程序的标准输出通过交互通道写到交互程序的标准输入，两者需要刷新输出缓冲区'">判题模式
                    <i class="ml-1 fa-regular fa-circle-question"></i></span>
            </div>
            <div v-if="!isRemote" class="p-4">
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
                <div v-if="judgeMode === 1 || judgeMode === 2" class="mt-4">
                    <Button @click="judgeCodeDialogVisible = true; hasInteractedWithJudgeCode = true;"
                        :label="judgeMode === 1 ? '添加/编辑特殊判题代码' : '添加/编辑交互判题代码'" icon="pi pi-pencil" severity="info" />
                    <span v-if="isJudgeCodeCompiled" class="ml-4 text-green-500 flex items-center">
                        <i class="pi pi-check-circle mr-2"></i>
                        编译成功
                    </span>
                </div>
            </div>
            <div v-if="!isRemote && judgeMode == 0"
                class="flex justify-between mt-6 items-center text-2xl font-bold text-blue-500">
                <span v-tooltip="'测试点评测评模式。'">评测数据 <i class="ml-1 fa-regular fa-circle-question"></i></span>
            </div>
            <div v-if="problemType === 0 && !isRemote && judgeMode == 0" class="p-4 mt-4">
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
            <div v-else-if="!isRemote && problemType === 1 && judgeMode == 0" class="p-4 mt-4">
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
                <span class="text-bg-blue-500">自动移除输出数据行末的无效空格</span>
            </div>
            <div class="flex-1 p-4 pt-0 pb-0">
                <ToggleSwitch inputId="autoRemove" v-tooltip="'关闭此项可能导致选手在提交代码时因格式问题触发格式错误'" v-model="removeBlank"
                    class="mt-4" />
            </div>
            <div class="p-4 mt-0 pb-0">
                <span class="text-bg-blue-500">允许查看评测点测评结果</span>
            </div>
            <div class="flex-1 p-4 pt-0">
                <ToggleSwitch inputId="autoRemove" v-model="judgeCaseStatus" class="mt-4" />
            </div>
            <div>
                <Button label="保存" @click="saveProblem" :loading="isSaving" :disabled="isSaveDisabled"
                    icon="pi pi-check" class="w-full mt-4" />
            </div>
        </Panel>
    </div>
    <!-- PrimeVue Dialog -->
    <Dialog v-model:visible="dialogVisible" header="添加新文件-User" :modal="true" :style="{ width: '50vw' }">
        <div class="p-4 flex flex-col gap-4">
            <div>
                <label class="pl-0 font-bold"><span class="text-red-500">*</span> 文件名</label>
                <InputText v-model="newTag" placeholder="example.h" class="w-full mb-3" />
            </div>
            <div>
                <label class="pl-0 font-bold"><span class="text-red-500">*</span> 代码 </label>
                <CodeMirror v-model:model-value="newCode" :dark="true" :extensions="extensions" basic :lang="lang"
                    class="w-full min-h-[400px] bg-[#282C34] mt-2" style="height: auto;" :tab-size="4" />
            </div>
            <div class="flex justify-end space-x-2 mt-2">
                <Button label="编译" icon="pi pi-cog" @click="compileUserFile" severity="secondary"
                    :loading="isCompiling" />
                <Button label="确认添加" icon="pi pi-check" @click="addTag(userFiles)" :disabled="!isCompiled" />
            </div>
        </div>
    </Dialog>
    <!-- PrimeVue Dialog -->
    <Dialog v-model:visible="spjDialogVisible" header="添加新文件-SPJ" :modal="true" :style="{ width: '50vw' }">
        <div class="p-4 flex flex-col gap-4">
            <div>
                <label class="pl-0 font-bold"><span class="text-red-500">*</span> 代码 (因testlib.h文件较大，编译平均耗时8s，请耐心等待)
                </label>
                <CodeMirror v-model:model-value="newCode" :dark="true" :extensions="extensions" basic :lang="lang"
                    class="w-full min-h-[400px] bg-[#282C34] mt-2" style="height: auto;" :tab-size="4" />
            </div>
            <div class="flex justify-end space-x-2 mt-2">
                <Button label="编译" icon="pi pi-cog" @click="compileSpjFile" severity="secondary"
                    :loading="isCompiling" />
                <Button label="确认添加" icon="pi pi-check" @click="addTag(spjFiles)" :disabled="!isCompiled" />
            </div>
        </div>
    </Dialog>
    <!-- 新增的判题代码Dialog -->
    <Dialog v-model:visible="judgeCodeDialogVisible" :header="judgeMode === 1 ? '编辑特殊判题(SPJ)代码' : '编辑交互判题代码'"
        :modal="true" :style="{ width: '50vw' }">
        <div class="p-4 flex flex-col gap-4">
            <div>
                <label class="pl-0 font-bold"><span class="text-red-500">*</span> 判题代码 (因testlib.h文件较大，编译平均耗时8s，请耐心等待)
                </label>
                <CodeMirror v-model:model-value="judgeCode" :dark="true" :extensions="extensions" basic :lang="lang"
                    class="w-full min-h-[400px] bg-[#282C34] mt-2" style="height: auto;" :tab-size="4" />
            </div>
            <div class="flex justify-end space-x-2 mt-2">
                <Button label="编译" icon="pi pi-cog" @click="compileJudgeCode" severity="secondary"
                    :loading="isCompiling" />
                <Button label="确认" icon="pi pi-check" @click="judgeCodeDialogVisible = false"
                    :disabled="!isJudgeCodeCompiled" />
            </div>
        </div>
    </Dialog>
    <!-- 编译错误 Dialog -->
    <Dialog v-model:visible="compileErrorDialogVisible" header="编译错误" :modal="true" :style="{ width: '60vw' }">
        <div class="p-4 bg-gray-900 text-white rounded">
            <pre class="whitespace-pre-wrap break-words">{{ compileErrorMessage }}</pre>
        </div>
    </Dialog>
    <Dialog v-model:visible="tagDialogVisible" header="标签管理" :modal="true" class="min-w-[360px]">
        <!-- 搜索与新建区域 -->
        <div class="space-y-4 p-4">
            <div class="flex gap-2">
                <InputText v-model="searchText" placeholder="搜索标签..." class="flex-1" />
                <Button icon="pi pi-plus" @click="showCreate = !showCreate"
                    class="!px-3 !py-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700" />
            </div>

            <!-- 新建标签表单 -->
            <div v-if="showCreate" class="space-y-3 border-t pt-4">
                <InputText v-model="newTagName" placeholder="新标签名称" class="w-full !text-sm" />
                <div class="flex flex-wrap gap-2">
                    <div v-for="(color, index) in colorPalette" :key="index" @click="selectedColor = color"
                        class="w-6 h-6 rounded-full cursor-pointer border-2 transition-all"
                        :class="[selectedColor === color ? 'scale-110 ring-2 ring-blue-500' : 'hover:scale-105']"
                        :style="{ backgroundColor: color }" />
                </div>
                <Button label="添加新标签" @click="createTagEvent"
                    class="!text-sm !px-3 !py-1.5 w-full bg-blue-500 hover:bg-blue-600 text-white"
                    :disabled="!newTagName || !selectedColor" />
            </div>
        </div>

        <!-- 标签选择列表 -->
        <div class="max-h-[50vh] overflow-y-auto border-t">
            <div v-if="filteredTags.length" class="p-4 grid gap-3">
                <div v-for="tag in filteredTags" :key="tag.name" @click="toggleTag(tag)"
                    class="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors" :class="[isTagSelected(tag)
                        ? 'bg-blue-50 dark:bg-blue-900/50'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]">
                    <span class="w-4 h-4 rounded-full shadow-inner" :style="{ backgroundColor: tag.color }" />
                    <span class="text-sm">{{ tag.name }}</span>
                    <i v-if="isTagSelected(tag)" class="pi pi-check ml-auto text-blue-500" />
                </div>
            </div>
            <div v-else class="p-6 text-center text-gray-400 text-sm">
                未找到相关标签
            </div>
        </div>
    </Dialog>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue'
import { type LanguageSpace, getLocalLanguages } from '@/common/api/languageAPI';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import CodeMirror from 'vue-codemirror6';
import { oneDark } from '@codemirror/theme-one-dark';
import { cpp } from '@codemirror/lang-cpp';

import { type CompileSpace, compileCode } from '@/admin/api/compileAPI';
import { createProblem, uploadFile, getProblem, updateProblem, getProblemLanguages, type ProblemSpace } from '@/admin/api/problemAPI'
import { type TagsSpace, getTags, createTag } from '@/admin/api/tagAPI';
import globalMessage from '@/common/utils/toast';
import router from '@/common/utils/router';

export default defineComponent({
    name: 'ProblemEdit',
    components: { MdEditor, CodeMirror },
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
    setup(props) {
        const extensions = [oneDark];
        const lang = cpp();
        const isRemote = ref(false);
        const displayId = ref("");
        const title = ref("");
        const timeLimit = ref(1000);
        const memoryLimit = ref(512);
        const stackLimit = ref(512);
        const problemDesc = ref("");
        const inputDesc = ref("");
        const outputDesc = ref("");
        const hintDesc = ref("");
        const problemType = ref(0);
        const share = ref(false);
        // Tag区域--Start
        const tagDialogVisible = ref(false);
        const allTags = ref<TagsSpace.TagVO[]>([]);
        const searchText = ref('')
        const newTagName = ref('')
        const selectedColor = ref('#3B82F6')
        const showCreate = ref(false)
        const tags = ref<TagsSpace.TagVO[]>([]);
        const colorPalette = [
            "#8b5cf6",  // 深紫
            "#6366f1",  // 靛蓝
            "#d946ef",  // 紫红
            "#a855f7",  // 学士服紫
            "#ef4444",  // 警戒红
            "#64748b",  // 石板灰
            "#f472b6",  // 粉红
            "#14b8a6",  // 蓝绿
            "#06b6d4",  // 青色
            "#10b981",  // 翡翠绿
            "#22c55e",  // 成功绿
            "#0ea5e9",  // 天空蓝
            "#f59e0b",  // 琥珀黄
            "#eab308",  // 黄金黄
            "#84cc16"   // 酸橙绿
        ];
        const onTagDialogOpen = () => {
            tagDialogVisible.value = true;
            loadAllTags();
        };
        const loadAllTags = async () => {
            await getTags(searchText.value).then((res) => {
                allTags.value = res.data as TagsSpace.TagVO[];
            }).catch((err) => {
                globalMessage.error('获取标签列表失败', err.message);
            });
        };
        const removeProblemTag = (index: number) => {
            tags.value.splice(index, 1);
        };
        const createTagEvent = async () => {
            if (!newTagName.value) {
                globalMessage.error('错误', '标签名称不能为空');
                return;
            }
            const newTagData = {
                name: newTagName.value,
                color: selectedColor.value
            };
            await createTag(newTagData).then(() => {
                loadAllTags();
            }).catch((err) => {
                globalMessage.error('创建标签失败', err.message);
            });
            newTagName.value = '';
        };
        // 搜索过滤
        const filteredTags = computed(() => {
            if (!searchText.value) {
                return allTags.value;
            }
            return allTags.value.filter(tag =>
                tag.name.toLowerCase().includes(searchText.value.toLowerCase())
            )
        })

        // 标签选择逻辑
        const isTagSelected = (tag: TagsSpace.TagVO) =>
            tags.value.some(t => t.name === tag.name)

        const toggleTag = (tag: TagsSpace.TagVO) => {
            const index = tags.value.findIndex(t => t.name === tag.name)
            index === -1 ? tags.value.push(tag) : tags.value.splice(index, 1)
        }
        // Tag区域--End
        const selectedLanguages = ref<number[]>([1, 2, 3, 4, 5, 6, 9, 10]); // 绑定选中的值
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
        const newCode = ref("");
        const dialogVisible = ref(false);
        const spjDialogVisible = ref(false);
        const judgeMode = ref(0);
        const isCompiled = ref(false);
        const isCompiling = ref(false);
        const isEditLoadingData = ref(false);

        const judgeCodeDialogVisible = ref(false);
        const judgeCode = ref("");
        const isJudgeCodeCompiled = ref(false);
        const hasInteractedWithJudgeCode = ref(false);

        const compileErrorDialogVisible = ref(false);
        const compileErrorMessage = ref("");

        const isSaveDisabled = computed(() => {
            if (props.type === 'edit') {
                return hasInteractedWithJudgeCode.value && !isJudgeCodeCompiled.value;
            } else {
                return (judgeMode.value === 1 || judgeMode.value === 2) && !isJudgeCodeCompiled.value;
            }
        });

        watch(newCode, () => {
            if (props.type === 'edit' && isEditLoadingData.value) {
                // If we are in edit mode and still loading data, do not reset the judge code state.
                return;
            }
            isCompiled.value = false;
        });

        watch(judgeCode, (newValue, oldValue) => {
            if (props.type === 'edit' && isEditLoadingData.value) {
                // If we are in edit mode and still loading data, do not reset the judge code state.
                return;
            }
            // This watcher is triggered when judgeCode changes.
            // We only want to lock the save button if the user *manually* changes the code.
            // The initial population from getProblemById should not lock the save button.
            // So, if oldValue is not undefined (meaning it's not the very first initial set), we consider it a manual change.
            if (oldValue !== undefined) {
                isJudgeCodeCompiled.value = false;
                hasInteractedWithJudgeCode.value = true;
            }
        });

        watch(judgeMode, () => {
            if (props.type === 'edit' && isEditLoadingData.value) {
                // If we are in edit mode and still loading data, do not reset the judge code state.
                return;
            }
            isJudgeCodeCompiled.value = false;
            judgeCode.value = "";
            hasInteractedWithJudgeCode.value = false;
        });

        const acmJudgeCaseMode = ref(1);
        const oiJudgeCaseMode = ref(0);
        const removeBlank = ref(true);
        const judgeCaseStatus = ref(true);
        // 语言选项
        const difficulty = [
            { label: '简单', value: 0 },
            { label: '中等', value: 1 },
            { label: '困难', value: 2 }
        ];
        const authOptions = [
            { label: '公开', value: 1 },
            { label: '隐藏', value: 0 }
        ];
        const selectedAuth = ref(0);
        const selectedDifficulty = ref(0);
        // 添加新 Tag
        const addTag = (files: { name: string; code: string }[]) => {
            if (newTag.value.trim() && !files.some(tag => tag.name === newTag.value.trim())) {
                files.push({ name: newTag.value.trim(), code: newCode.value });
            }
            newTag.value = "";
            newCode.value = "";
            isCompiled.value = false;
            dialogVisible.value = false;
            spjDialogVisible.value = false;
        };

        // 删除 Tag
        const removeTag = (index: number, files: { name: string; code: string }[]) => {
            files.splice(index, 1);
        };

        const compileUserFile = () => {
            const dto: CompileSpace.CompileDTO = {
                code: newCode.value,
                type: "user"
            }
            compileFile(dto);
        }

        const compileSpjFile = () => {
            // TODO: Implement SPJ file compilation API call
            const dto: CompileSpace.CompileDTO = {
                code: newCode.value,
                type: judgeMode.value === 1 ? "spj" : "interactive"
            }
            compileFile(dto);
        }

        const compileJudgeCode = () => {
            isCompiling.value = true;
            const dto: CompileSpace.CompileDTO = {
                code: judgeCode.value,
                type: judgeMode.value === 1 ? "spj" : "interactive",
                id: props.id ? props.id : undefined
            }
            compileCode(dto).then(res => {
                globalMessage.success('判题代码编译成功', res.data as string);
                isJudgeCodeCompiled.value = true;
            }).catch(err => {
                compileErrorMessage.value = err.message;
                compileErrorDialogVisible.value = true;
                isJudgeCodeCompiled.value = false;
            }).finally(() => {
                isCompiling.value = false;
            });
        }

        const compileFile = async (dto: CompileSpace.CompileDTO) => {
            isCompiling.value = true;
            await compileCode(dto).then(res => {
                globalMessage.success(dto.type + '编译成功', res.data as string);
                isCompiled.value = true;
            }).catch(err => {
                compileErrorMessage.value = err.message;
                compileErrorDialogVisible.value = true;
                isCompiled.value = false;
            }).finally(() => {
                isCompiling.value = false;
            });
        }
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
        const isSaving = ref(false);
        async function saveProblem() {
            isSaving.value = true;
            let userFileDTO: ProblemSpace.AdminCreateProblemFileDTO[] = [];
            let spjFileDTO: ProblemSpace.AdminCreateProblemFileDTO[] = [];
            let sampleDTO: ProblemSpace.AdminCreateProblemSampleDTO[] = [];
            userFiles.value.forEach(file => {
                userFileDTO.push({
                    name: file.name,
                    code: file.code
                })
            })
            spjFiles.value.forEach(file => {
                spjFileDTO.push({
                    name: file.name,
                    code: file.code
                })
            })
            samples.value.forEach(sample => {
                sampleDTO.push({
                    id: sample.id,
                    input: sample.input,
                    output: sample.output,
                    score: 0,
                    subtask: 0,
                    collapsed: sample.collapsed
                })
            })
            let tagIds = tags.value.map(tag => tag.id);
            let problem: ProblemSpace.AdminCreateProblemDTO = {
                displayId: displayId.value,
                title: title.value,
                timeLimit: timeLimit.value,
                memoryLimit: memoryLimit.value,
                stackLimit: stackLimit.value,
                problemDesc: problemDesc.value,
                inputDesc: inputDesc.value,
                outputDesc: outputDesc.value,
                hintDesc: hintDesc.value,
                problemType: problemType.value,
                share: share.value,
                userJudgeFile: userJudgeFile.value,
                spjJudgeFile: spjJudgeFile.value,
                judgeMode: judgeMode.value,
                acmJudgeCaseMode: acmJudgeCaseMode.value,
                oiJudgeCaseMode: oiJudgeCaseMode.value,
                removeBlank: removeBlank.value,
                judgeCaseStatus: judgeCaseStatus.value,
                selectedDifficulty: selectedDifficulty.value,
                auth: selectedAuth.value,
                selectedLanguages: selectedLanguages.value,
                userFiles: userFileDTO,
                spjFiles: spjFileDTO,
                spjCode: judgeCode.value,
                spjLanguage: judgeCode.value === "spj" ? "C++" : "",
                samples: sampleDTO,
                tags: tagIds,
            }
            if (props.type === 'edit') {
                if (!props.id) {
                    globalMessage.error("编辑失败", "题目ID不存在")
                    return
                }
                // 编辑题目
                await updateProblem(props.id, problem).then(res => {
                    globalMessage.success("题目更新", res.message)
                    router.push("/admin/problems/list");
                }).catch(err => {
                    globalMessage.error("更新失败", err.message)
                })

            } else {
                // 创建题目
                await createProblem(problem).then(res => {
                    globalMessage.success("题目创建", res.message)
                    router.push("/admin/problems/list");
                }).catch(err => {
                    globalMessage.error("创建失败", err.message)
                })
            }
            isSaving.value = false;
        }
        async function loadProblemLanguages() {
            if (!props.id) {
                return
            }
            // 获取题目支持的语言
            await getProblemLanguages(props.id).then(res => {
                selectedLanguages.value = res.data as unknown as number[]
            }).catch(err => {
                globalMessage.error("获取语言失败", err.message)
            })
        }
        async function getProblemById() {
            if (!props.id) {
                return
            }
            await getProblem(props.id).then(res => {
                let data = res.data as ProblemSpace.Problem;
                title.value = data.title;
                displayId.value = data.displayId;
                timeLimit.value = data.timeLimit;
                memoryLimit.value = data.memoryLimit;
                stackLimit.value = data.stackLimit;
                problemDesc.value = data.description;
                inputDesc.value = data.input;
                outputDesc.value = data.output;
                isRemote.value = data.isRemote;
                hintDesc.value = data.hint;
                problemType.value = data.type;
                share.value = data.codeShare;
                selectedDifficulty.value = data.difficulty;
                selectedAuth.value = data.auth;
                tags.value = data.tags ? data.tags : [];
                if (data.userExtraFile !== null && data.userExtraFile !== "") {
                    const userExtraFiles = JSON.parse(data.userExtraFile);
                    userFiles.value = [];
                    Object.entries(userExtraFiles).forEach(([name, code]) => {
                        userFiles.value.push({ name, code: code as string });
                    });
                }
                if (data.judgeExtraFile !== null && data.userExtraFile !== "") {
                    const judgeExtraFiles = JSON.parse(data.judgeExtraFile);
                    spjFiles.value = [];
                    Object.entries(judgeExtraFiles).forEach(([name, code]) => {
                        spjFiles.value.push({ name, code: code as string });
                    });
                }
                const inputSamples = JSON.parse(data.inputExamples);
                const outputSamples = JSON.parse(data.outputExamples);
                samples.value = [];
                Object.entries(inputSamples).forEach(([key, input]) => {
                    samples.value.push({
                        id: Number(key),
                        input: input as string,
                        output: "",
                        collapsed: false
                    });
                });

                Object.entries(outputSamples).forEach(([key, output]) => {
                    let index = samples.value.findIndex(s => s.id === Number(key));
                    if (index !== -1) {
                        samples.value[index].output = output as string;
                    }
                });

                userJudgeFile.value = data.userExtraFile !== null && data.userExtraFile !== "";
                spjJudgeFile.value = data.judgeExtraFile !== null && data.userExtraFile !== "";
                judgeMode.value = data.judgeMode === "default" ? 0 : data.judgeMode === "spj" ? 1 : 2;
                if (data.type === 0) {
                    acmJudgeCaseMode.value = data.judgeCaseMode === "default" ? 0 : 1;
                } else {
                    oiJudgeCaseMode.value = data.judgeCaseMode === "default" ? 0 : data.judgeCaseMode === "subtask_lowest" ? 1 : 2;
                }
                removeBlank.value = data.isRemoveEndBlank
                judgeCaseStatus.value = data.openCaseResult
                judgeCode.value = data.spjCode;
                if (judgeCode.value && judgeCode.value !== "") {
                    isJudgeCodeCompiled.value = true;
                    hasInteractedWithJudgeCode.value = true;
                }
            }).catch(err => {
                globalMessage.error("获取题目失败", err.message)
            }).finally(() => {
                isEditLoadingData.value = false;
            });
        }
        const onUploadImg = async (files: any, callback: any) => {
            const res = await Promise.all(
                files.map((file: File) => {
                    return new Promise((rev, rej) => {
                        const form = new FormData();
                        form.append('files', file);
                        uploadFile(form, {
                            headers: {
                                "Content-Type": "multipart/form-data"
                            },
                        }).then((res) => {
                            rev(res)
                        }).catch((err) => {
                            rej(err)
                        })
                    });
                })
            );

            callback(res.map((item) => item.data[0]));
        };
        const languageOptions = ref<LanguageSpace.LanguageVO[]>([]);
        // 获取本地语言列表
        const loadLocalLanguages = async () => {
            await getLocalLanguages().then(res => {
                languageOptions.value = res.data as LanguageSpace.LanguageVO[];
            }).catch(err => {
                globalMessage.error("获取语言失败", err.message)
            })
        }
        onMounted(() => {
            loadLocalLanguages();
            if (props.type === 'edit') {
                isEditLoadingData.value = true;
                getProblemById()
                loadProblemLanguages()
            }
        })
        return {
            displayId,
            difficulty,
            selectedDifficulty,
            title,
            timeLimit,
            memoryLimit,
            stackLimit,
            share,
            problemDesc,
            inputDesc,
            outputDesc,
            hintDesc,
            problemType,
            selectedLanguages,
            languageOptions,
            samples,
            addSample,
            removeSample,
            toggleSample,
            userJudgeFile,
            spjJudgeFile,
            userFiles,
            spjFiles,
            newTag,
            spjDialogVisible,
            dialogVisible,
            addTag,
            removeTag,
            judgeMode,
            oiJudgeCaseMode,
            acmJudgeCaseMode,
            removeBlank,
            judgeCaseStatus,
            saveProblem,
            authOptions,
            selectedAuth,
            newCode,
            isSaving,
            onUploadImg,
            tags,
            allTags,
            colorPalette,
            tagDialogVisible,
            showCreate,
            searchText,
            newTagName,
            selectedColor,
            filteredTags,
            isTagSelected,
            toggleTag,
            createTagEvent,
            onTagDialogOpen,
            removeProblemTag,
            props,
            isRemote,
            extensions,
            lang,
            compileUserFile,
            compileSpjFile,
            isCompiled,
            judgeCodeDialogVisible,
            judgeCode,
            isJudgeCodeCompiled,
            compileJudgeCode,
            isCompiling,
            isSaveDisabled,
            hasInteractedWithJudgeCode,
            compileErrorDialogVisible,
            compileErrorMessage
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