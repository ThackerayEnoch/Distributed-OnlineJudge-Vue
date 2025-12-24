<template>
    <Panel>
        <template #header>
            <div class="flex justify-between items-center text-2xl font-bold text-blue-500">
                <span>创建比赛</span>
            </div>
        </template>
        <Divider />
        <div class="w-full">
            <label class="text-gray-500">
                <span class="text-red-500">*</span> 标题
            </label>
            <InputText v-model="homework.title" class="mt-2 w-full" placeholder="标题" />
        </div>
        <div class="w-full mt-6">
            <label class="text-gray-500">比赛描述</label>
            <MdEditor class="prose max-w-full shadow-md mt-2" @on-upload-img="onUploadImg"
                v-model="homework.description" />
        </div>
        <!-- 开始时间 & 结束时间 -->
        <div class="grid grid-cols-2 gap-4 mt-6">
            <!-- 开始时间 -->
            <div class="flex flex-col">
                <label class="text-gray-500">
                    <span class="text-red-500">*</span> 开始时间
                </label>
                <Calendar v-model="homework.startTime" showTime dateFormat="yy/mm/dd" hourFormat="24"
                    class="mt-2 w-full" />
            </div>

            <!-- 结束时间 -->
            <div class="flex flex-col">
                <label class="text-gray-500">
                    <span class="text-red-500">*</span> 结束时间
                </label>
                <Calendar v-model="homework.endTime" dateFormat="yy/mm/dd" showTime hourFormat="24"
                    class="mt-2 w-full" />
            </div>
        </div>
        <div class="mt-4 flex flex-col space-y-2 w-[20%]">
            <label class="text-gray-500">
                <span class="text-red-500">*</span> 比赛题目
            </label>
            <Button severity="secondary" label="点击编辑比赛题目" @click="onListPageOpen" />
        </div>
        <div class="flex flex-col space-y-2 mt-4">
            <label class="text-gray-500"><span class="text-red-500">*</span> 允许提交语言:</label>
            <div class="flex flex-wrap gap-4">
                <div v-for="option in localSupportLanguages" :key="option.id" class="flex items-center mr-2 gap-2">
                    <Checkbox v-model="homework.languages" :inputId="option.id.toString()" :value="option.id" />
                    <label :for="option.id.toString()">{{ option.name }}</label>
                </div>
            </div>
        </div>
        <!-- 远程 OJ 语言配置（基于后端已经加载的 OJ 列表） -->
        <div class="flex flex-col space-y-2 mt-6" style="display: none;">
            <label class="text-gray-500"> 远程 OJ 语言设置</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div v-for="oj in supprotRemoteOJList" :key="oj" class="p-4 border rounded-lg bg-white shadow-sm">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <Checkbox :inputId="`enable-${oj}`" v-model="enabledRemoteOJs" :value="oj"
                                @change="() => onRemoteOjToggle(oj)" />
                            <label :for="`enable-${oj}`" class="font-medium">{{ oj }}</label>
                        </div>
                        <div v-if="enabledRemoteOJs.includes(oj)" class="text-sm text-green-600">已启用</div>
                    </div>
                    <div v-if="enabledRemoteOJs.includes(oj)"
                        class="mt-3 grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                        <div v-if="!(remoteLanguagesByOj[oj] && remoteLanguagesByOj[oj].length)">正在加载或暂无语言</div>
                        <div v-else v-for="lang in remoteLanguagesByOj[oj]" :key="lang.id"
                            class="flex items-center gap-2">
                            <Checkbox :inputId="`remote-${oj}-${lang.id}`" :value="lang.id"
                                v-model="homework.languages" />
                            <label :for="`remote-${oj}-${lang.id}`">{{ lang.name }}</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 删除重复的远程 OJ 区块 -->
        <div class="mt-6 max-w-3xl space-y-4">
            <div class="grid grid-cols-3 gap-4">
                <!-- 比赛权限 -->
                <div class="flex flex-col">
                    <label class="text-gray-500">
                        <span class="text-red-500">*</span> 比赛权限
                        <i class="ml-1 fa-regular fa-circle-question text-blue-500 cursor-pointer"
                            v-tooltip.top="'公开模式：任何人均可参与。\n私有模式：仅允许预先设定的参与者，此比赛对非参与者不可见。\n保护模式：允许预先设定参与者，其他参与者需通过密码加入。'"></i>
                    </label>
                    <Select v-model="homework.auth" :options="authOptions" optionLabel="label" optionValue="value"
                        class="mt-2 w-full" />
                </div>

                <!-- 密码 -->
                <div v-if="homework.auth == 1" class="flex flex-col">
                    <label class="text-gray-500">
                        <span class="text-red-500">*</span> 密码
                    </label>
                    <InputText v-model="homework.password" class="mt-2 w-full" placeholder="密码" />
                </div>

                <!-- 是否可见 -->
                <div class="flex flex-col">
                    <label class="text-gray-500">
                        <span class="text-red-500">*</span> 用户是否可见
                    </label>
                    <CustomToggleButton class="text-sm mt-2" v-model="homework.visible" />
                </div>
            </div>
        </div>
        <!-- 是否开启查重 -->
        <!--<div class="flex flex-col mt-6">
            <label class="text-gray-500">
                <span class="text-red-500">*</span> 是否开启查重
                <i class="ml-1 fa-regular fa-circle-question text-blue-500 cursor-pointer"
                    v-tooltip.top="'代码查重结果详见统计信息'"></i>
            </label>
            <ToggleSwitch class="mt-2" disible v-tooltip.top="'正在开发中'" v-model="homework.duplicateCheck" />
        </div>-->
        <!-- 是否在排行榜中隐藏管理用户 -->
        <div class="flex flex-col mt-6">
            <label class="text-gray-500">
                <span class="text-red-500">*</span> 是否在排行榜中隐藏管理人员
            </label>
            <ToggleSwitch class="mt-2" v-model="isHideAdminUser" />
        </div>
        <!-- 是否开启查重 -->
        <div class="flex flex-col mt-6">
            <label class="text-gray-500">
                协助用户(可为空)
                <i class="ml-1 fa-regular fa-circle-question text-blue-500 cursor-pointer"
                    v-tooltip.top="'与其他用户共同管理比赛'"></i>
            </label>
            <MultiSelect v-model="collaborators" :options="collaboratorOptions" optionLabel="nickname" optionValue="id"
                placeholder="选择班级..." lazy class="w-[30%] mt-2">
                <template #header>
                    <div class="flex items-center gap-2 p-2">
                        <InputGroup>
                            <InputText v-model="collaboratorContent" placeholder="搜索用户(昵称或用户名)..."
                                @keyup.enter="searchCollaborators" class="w-full p-2 border rounded-lg" />
                            <Button icon="pi pi-search" class="!px-3" @click="searchCollaborators" v-tooltip="'搜索'" />
                        </InputGroup>
                    </div>
                </template>
                <template #option="slotProps">
                    <div class="flex items-center">
                        <span class="font-medium">{{ slotProps.option.nickname }}</span>
                        <span class="ml-2 text-gray-500 text-sm">#{{ slotProps.option.studentId }}</span>
                    </div>
                </template>
            </MultiSelect>
        </div>
        <div v-if="homework.auth !== 0" class="mt-4">
            <label class="text-gray-500">
                参与班级(可为空)
            </label>
        </div>
        <div v-if="homework.auth !== 0" class="p-0 mt-4 space-y-4">
            <MultiSelect v-model="homework.selectedClasses" :options="filteredClasses" optionLabel="name"
                optionValue="id" placeholder="选择班级..." class="w-[40%]">
                <template #header>
                    <div class="flex items-center gap-2 p-2">
                        <InputText v-model="searchContent" placeholder="搜索班级..." class="w-full p-2 border rounded-lg" />
                        <div class="flex items-center gap-1">
                            <ToggleSwitch v-tooltip.top="'仅显示我创建的'" id="myClasses" v-model="onlyMyClasses"
                                @change="onOwnClassesChange" />
                        </div>
                    </div>
                </template>
            </MultiSelect>
        </div>
        <div v-if="homework.auth !== 0" class="flex gap-4 p-0 mt-3 items-center">
            <!-- 学生名单模块 -->
            <div class="space-y-2 w-full">
                <label class="block font-medium text-gray-700">
                    学生名单
                    <span class="text-sm text-gray-500">（每行输入一个学号，解析仅用于确认名单）</span>
                </label>
                <div class="flex gap-4 h-64">
                    <!-- 输入区 -->
                    <div class="flex-1">
                        <Textarea v-model="studentInput" class="w-full h-full font-mono" placeholder="示例：
202231222024
202231222062
202231222107" />
                    </div>

                    <!-- 操作按钮列 -->
                    <div class="flex flex-col justify-center gap-2">
                        <Button icon="pi pi-arrow-right" severity="secondary" @click="parseButtonEvent" class="!px-3"
                            v-tooltip="'解析名单'" :loading="parsing" />
                        <Button icon="pi pi-replay" severity="secondary" @click="clearStudents" class="!px-3"
                            v-tooltip="'重置名单'" />
                    </div>

                    <!-- 解析结果区 -->
                    <div class="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                        <div v-if="students.length === 0" class="text-gray-400 h-full flex items-center justify-center">
                            <i class="pi pi-info-circle mr-2"></i>
                            <span>等待解析结果...</span>
                        </div>
                        <div v-else class="space-y-2">
                            <div v-for="(student, index) in students" :key="index"
                                class="flex items-center p-3 bg-white rounded shadow-sm hover:shadow transition">
                                <Avatar icon="pi pi-user" class="!bg-primary-100 !text-primary-600 mr-3" />
                                <div>
                                    <div class="font-medium">{{ student.studentId }}</div>
                                    <div class="text-sm text-gray-500">{{ student.nickname || '未设置昵称' }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <Button label="保存" @click="onSubmitEvent" :loading="isSubmiting" icon="pi pi-check" class="w-full mt-4" />
        </div>
    </Panel>
    <Dialog v-model:visible="contestProblemsDialog" header="选择题目" :modal="true" :style="{ width: '80%' }">
        <div id="functionArea">
            <!-- 操作栏 -->
            <div class="flex items-center space-x-5 p-4">
                <!-- 搜索框 -->
                <span class="relative">
                    <InputText placeholder="输入关键词" class="p-2 w-64 rounded-md border border-gray-300" />
                    <i class="pi pi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </span>
                <!-- 按钮：创建 -->
                <button class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow-md"
                    @click="onAddPageOpen">
                    + 添加题目
                </button>
            </div>
        </div>
        <DataTable :value="contestProblems" class="mt-2" removableSort scrollable scrollHeight="400px">
            <Column field="id">
                <template #header>
                    <span class="flex-1 text-center font-bold">ID</span>
                </template>
            </Column>
            <Column field="title">
                <template #header>
                    <span class="flex-1 text-center font-bold">标题</span>
                </template>
            </Column>
            <Column class="w-48">
                <template #header>
                    <span class="flex-1 text-center font-bold">题号</span>
                </template>
                <template #body="slotProps">
                    <InputNumber v-model="slotProps.data.number" inputId="numIn" showButtons buttonLayout="horizontal"
                        variant="filled" :min="0" :max="100" :allow-empty="false" class="w-full" fluid>
                        <template #incrementicon>
                            <span class="pi pi-plus" />
                        </template>
                        <template #decrementicon>
                            <span class="pi pi-minus" />
                        </template>
                    </InputNumber>
                </template>
            </Column>
            <Column field="number" class="text-center" style="text-align: center;" sortable>
                <template #header>
                    <span class="flex-1 text-center font-bold">实际显示题号</span>
                </template>
                <template #body="slotProps">
                    <span :class="{ 'text-red-600 font-bold': isDuplicateNumber(slotProps.data.number) }"
                        class="flex-1 text-center">
                        {{ convertToLetter(slotProps.data.number + 1) }}
                    </span>
                </template>
            </Column>
            <Column field="difficulty">
                <template #header>
                    <span class="flex-1 text-center font-bold">难度</span>
                </template>
                <template #body="slotProps">
                    <span v-if="slotProps.data.difficulty === 0"
                        class="bg-green-100 text-green-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">简单</span>
                    <span v-else-if="slotProps.data.difficulty === 1"
                        class="bg-yellow-100 text-yellow-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">中等</span>
                    <span v-else
                        class="bg-red-100 text-red-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">困难</span>
                </template>
            </Column>
            <Column field="operation" header="操作">
                <template #body="slotProps">
                    <button
                        class="bg-red-500 text-white p-1 rounded flex items-center justify-center w-12 h-8 hover:bg-red-600"
                        v-tooltip.top="'删除题目'" @click="deleteContestProblems(slotProps.data.id)">
                        <i class="fas fa-trash"></i>
                    </button>
                </template>
            </Column>
        </DataTable>
        <Button label="保存" class="mt-4 w-full" @click="problemFinalSaveEvent" />
    </Dialog>
    <Dialog v-model:visible="addProblemDialog" class="mt-2" :style="{ width: '60%' }" scrollable>
        <DataTable v-model:selection="selectedProblems" selectionMode="multiple" :metaKeySelection="false" dataKey="id"
            :value="allProblems" stripedRows scrollable class="m-0 p-0" lazy paginator :rows="20"
            :totalRecords="problemTotalRecords" :first="problemFirst" @page="onProblemPage">
            <template #header>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-surface-700 dark:text-surface-0">题目列表</span>
                    <span class="text-base font-bold text-surface-400 dark:text-surface-0">保存按钮在最底下</span>
                    <div class="flex items-center space-x-2">
                        <span class="relative">
                            <MultiSelect v-model:model-value="problemTagIds" :options="problemTagOptions"
                                option-label="name" option-value="id" filter placeholder="请选择标签" class="w-[50%] md:w-40"
                                @change="searchProblemInAllEvent" />
                        </span>
                        <span class="relative">
                            <InputText placeholder="输入关键词" class="p-2 w-64 rounded-md border border-gray-300"
                                v-model="problemSearchContent" @keyup.enter="searchProblemInAllEvent" />
                            <i class="pi pi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                                @click="searchProblemInAllEvent"></i>
                        </span>
                        <div class="flex items-center gap-1">
                            <ToggleSwitch v-tooltip.top="'仅显示我创建的'" @change="searchProblemInAllEvent" id="myProblems"
                                v-model="filterType" />
                            <label for="myProblems" class="text-gray-500">仅显示我创建的</label>
                        </div>
                    </div>
                </div>
            </template>
            <Column field="id" header="题目ID"></Column>
            <Column field="title" header="标题"></Column>
            <Column field="difficulty" header="难度">
                <template #body="slotProps">
                    <span v-if="slotProps.data.difficulty === 0"
                        class="bg-green-100 text-green-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">简单</span>
                    <span v-else-if="slotProps.data.difficulty === 1"
                        class="bg-yellow-100 text-yellow-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">中等</span>
                    <span v-else
                        class="bg-red-100 text-red-800 text-sm font-semibold mr-2 px-2.5 py-2 rounded">困难</span>
                </template>
            </Column>
            <Column field="tags" header="标签">
                <template #body="slotProps">
                    <div class="flex flex-wrap gap-2">
                        <template v-for="(tag, index) in slotProps.data.tags" :key="index">
                            <span :style="{ backgroundColor: tag.color }" class="inline-flex items-center text-sm font-bold rounded px-3 py-1
                           text-white shadow-sm transition-colors hover:brightness-110
                           max-w-full truncate">
                                {{ tag.name }}
                            </span>
                        </template>
                    </div>
                </template>
            </Column>
            <Column field="total" header="总提交">
                <template #body="slotProps">
                    <span v-if="slotProps.data.total">{{ slotProps.data.total }}</span>
                    <span v-else>0</span>
                </template>
            </Column>
            <Column header="通过率">
                <template #body="slotProps">
                    <span>{{ isNaN(slotProps.data.solved * 100 / slotProps.data.total) ? '0' : (slotProps.data.solved
                        * 100 / slotProps.data.total).toFixed(2) }}%</span>
                </template>
            </Column>
        </DataTable>
        <Button label="保存" class="w-full" @click="selectedProblemSaveEvent" />
    </Dialog>
</template>
<script lang="ts">
import { type LanguageSpace, getLocalLanguages, getRemoteLanguages } from '@/common/api/languageAPI';
import CustomToggleButton from './CustomToggleButton.vue';
import { reactive, ref, defineComponent, onMounted, nextTick } from 'vue'
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { parseUsers, getHomeworkGroup, getCollaborators, createHomework, uploadFile, getHomeworkDetail, updateHomework, getAdminAllProblems, getAdminProblems, getAdminProblemsCount, type ContestSpace } from '@/admin/api/contestAPI'
import { type TagsSpace, getTags } from '@/admin/api/tagAPI'
import globalMessage from '@/common/utils/toast';
import router from '@/common/utils/router';

export default defineComponent({
    name: 'HomeworkCreate',
    components: { MdEditor, CustomToggleButton },
    props: {
        id: {
            type: Number,
            required: false
        },
        type: {
            type: String,
            required: true
        },
        copyId: {
            type: String,
            required: false
        }
    },
    setup(props) {
        const authOptions = ref([
            { label: '公开比赛', value: 0 },
            { label: '私有比赛', value: 2 },
            { label: '保护比赛', value: 1 },
        ])
        const visibleOptions = ref([
            { label: '可见', value: 1 },
            { label: '不可见', value: 0 }
        ])
        const searchContent = ref('');
        const onlyMyClasses = ref(true);
        const filteredClasses = ref<ContestSpace.AdminHomeworkGroupVO[]>([
        ]);
        const studentInput = ref('');
        const students = ref<ContestSpace.AdminParseUsers[]>([]);
        const collaborators = ref<number[]>([]);
        const isHideAdminUser = ref(true);
        const collaboratorContent = ref('');
        const collaboratorOptions = ref<ContestSpace.AdminParseUsers[]>([]);
        const searchCollaborators = async () => {
            if (collaboratorContent.value.length < 2) {
                globalMessage.warn("提示", "请输入至少两个字符进行搜索");
                return;
            }
            await getCollaborators(collaboratorContent.value).then(res => {
                collaboratorOptions.value.push(...(res.data as ContestSpace.AdminParseUsers[]));
            }).catch(err => {
                globalMessage.error("搜索用户失败", err.message);
            });
        }
        const homework = reactive({
            title: '',
            description: '',
            auth: 0,
            password: '',
            visible: true,
            duplicateCheck: false,
            languages: [1, 3],
            // per-remote-OJ selected language ids, e.g. { HDU: [1,2], POJ: [3] }
            remoteLanguages: {} as Record<string, number[]>,
            users: '',
            selectedClasses: [] as number[],
            startTime: (() => {
                const now = new Date();
                now.setMinutes(0, 0, 0); // 设置分钟、秒和毫秒为 0
                return now;
            })(),
            endTime: (() => {
                const now = new Date();
                now.setMinutes(0, 0, 0); // 设置分钟、秒和毫秒为 0
                return now;
            })(),
        })
        const languageOptions = ref<LanguageSpace.LanguageVO[]>([]);
        const localSupportLanguages = ref<LanguageSpace.LanguageVO[]>([]);
        const RemoteSupportLanguages = ref<LanguageSpace.LanguageVO[]>([]);
        const supprotRemoteOJList = ["HDU", "POJ"];
        // alias for template: some templates may reference supportedRemoteOJs
        const supportedRemoteOJs = supprotRemoteOJList;

        // reactive state for remote OJ UI
        const enabledRemoteOJs = ref<string[]>([])
        const remoteLanguagesByOj = ref<Record<string, Array<{ id: number; name: string }>>>({})

        // helper: build id -> oj map from current local/remote support lists
        const buildIdToOjMap = () => {
            const map = new Map<number, string>()
            localSupportLanguages.value.forEach(l => map.set(l.id, l.oj || 'LOCAL'))
            RemoteSupportLanguages.value.forEach(l => map.set(l.id, l.oj || ''))
            return map
        }

        // when toggling an OJ on/off, load its languages if enabled; if disabled, remove its language ids from homework.languages
        const onRemoteOjToggle = async (oj: string) => {
            // wait nextTick so v-model (enabledRemoteOJs) is updated by the Checkbox
            await nextTick()
            // if disabled, remove all language ids that belong to this oj from homework.languages
            if (!enabledRemoteOJs.value.includes(oj)) {
                const idToOj = buildIdToOjMap()
                homework.languages = homework.languages.filter(id => idToOj.get(id) !== oj)
                return
            }
            // enabled: ensure remote language list is loaded for this oj
            if (remoteLanguagesByOj.value[oj] && remoteLanguagesByOj.value[oj].length) {
                return
            }
            try {
                const res = await getRemoteLanguages(oj)
                const arr = (res && res.data) as LanguageSpace.LanguageVO[]
                remoteLanguagesByOj.value[oj] = arr.map(l => ({ id: l.id, name: l.name }))
            } catch (e) {
                globalMessage.error('加载远程语言失败', (e as Error).message)
            }
        }
        // language
        const loadAllLanguages = () => {
            loadLocalLanguages();
            RemoteSupportLanguages.value = []
            supprotRemoteOJList.forEach(oj => {
                loadRemoteLanguagse(oj);
            });
        }
        const loadRemoteLanguagse = async (ojName: string) => {
            await getRemoteLanguages(ojName).then(res => {
                RemoteSupportLanguages.value.push(...(res.data as LanguageSpace.LanguageVO[]));
            }).catch(err => {
                globalMessage.error("加载远程语言失败", err.message);
            });
        }
        const loadLocalLanguages = async () => {
            await getLocalLanguages().then(res => {
                localSupportLanguages.value = res.data as LanguageSpace.LanguageVO[];
            }).catch(err => {
                globalMessage.error("加载语言失败", err.message);
            });
        }
        // problem
        const contestProblemsDialog = ref(false);
        const addProblemDialog = ref(false);
        const tagContent = ref('');
        const problemTagIds = ref<number[]>([]);
        const problemTagOptions = ref<TagsSpace.TagVO[]>([]);
        const contestProblems = ref<ContestSpace.AdminProblemVO[]>([]);
        const selectedProblems = ref<ContestSpace.AdminAllProblemVO[]>([]);
        const allProblems = ref<ContestSpace.AdminAllProblemVO[]>([]);
        const problemTotalRecords = ref<number>(0);
        const problemFirst = ref<number>(0);
        const filterType = ref<boolean>(false);
        const problemSearchContent = ref<string>('');
        async function loadTags() {
            await getTags(tagContent.value).then(res => {
                problemTagOptions.value = res.data as TagsSpace.TagVO[];
            }).catch(err => {
                globalMessage.error("加载标签失败", err.message);
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
        function searchProblemInAllEvent() {
            loadAllProblems();
            loadAllProblemCount();
        }
        // 检查题号是否重复
        const isDuplicateNumber = (number: number) => {
            const numbers = contestProblems.value.map(problem => problem.number);
            return numbers.filter(n => n === number).length > 1;
        };
        const problemFinalSaveVaildation = () => {
            // 检查displayId重复
            const displayIdSet = new Set<number>();
            for (const problem of contestProblems.value) {
                if (displayIdSet.has(problem.number)) {
                    globalMessage.warn("警告", convertToLetter(problem.number + 1) + "题号重复");
                    return false;
                }
                displayIdSet.add(problem.number);
            }
            return true;
        };
        function problemFinalSaveEvent() {
            // 检查displayId重复
            if (!problemFinalSaveVaildation()) {
                return;
            }
            contestProblemsDialog.value = false;
        }
        function selectedProblemSaveEvent() {
            addProblemDialog.value = false;
            saveSelectedProblems();
        }
        function onAddPageOpen() {
            addProblemDialog.value = true;
            // 初始化 selectedProblems
            selectedProblems.value = contestProblems.value.map(p => ({
                id: p.id,
                title: p.title,
                difficulty: p.difficulty,
                tags: [],
                total: 0,
                solved: 0
            } as any));
            loadAllProblems();
            loadAllProblemCount();
            loadTags();
        }
        function onListPageOpen() {
            if (!props.id === undefined) {
                loadHomeworkProblems();
            }
            contestProblemsDialog.value = true;
        }
        function onProblemPage(event: { first: number, rows: number }) {
            problemFirst.value = event.first;
            loadAllProblems();
        }
        async function deleteContestProblems(pid: number) {
            contestProblems.value = contestProblems.value.filter(problem => problem.id !== pid);
            // 删除题目后，重新计算题号
            contestProblems.value = contestProblems.value
                .sort((a, b) => a.number - b.number)
                .map((problem, index) => ({
                    ...problem,
                    number: index
                }));
        }
        async function saveSelectedProblems() {
            let lastNumber = contestProblems.value.length;
            // 获取 selectedProblems 的 ID 集合
            const selectedIds = new Set(selectedProblems.value.map(problem => problem.id));
            // 需要添加的问题：在 selectedProblems 中但不在 contestProblems 中
            const selectedProblemsToAdd = selectedProblems.value.filter(
                problem => !contestProblems.value.some(p => p.id === problem.id)
            );
            // 需要删除的问题：在 contestProblems 中但不在 selectedIds 中
            const selectedProblemsToDelete = contestProblems.value.filter(
                problem => !selectedIds.has(problem.id)
            );
            // 删除不需要的题目
            selectedProblemsToDelete.forEach(problem => {
                contestProblems.value = contestProblems.value.filter(p => p.id !== problem.id);
            });
            const newProblems = selectedProblemsToAdd.map(problem => ({
                id: problem.id,
                title: problem.title,
                difficulty: problem.difficulty,
                createTime: '',
                updateTime: '',
                number: lastNumber++
            }));
            // 合并操作，减少对 contestProblems.value 的多次更新
            const updatedProblems = [...contestProblems.value, ...newProblems]
                .sort((a, b) => a.number - b.number)
                .map((problem, index) => ({
                    ...problem,
                    number: index
                }));
            contestProblems.value = updatedProblems;
        }
        async function loadAllProblems() {
            const type = filterType.value ? 'own' : 'all';
            await getAdminAllProblems(problemFirst.value, type, problemSearchContent.value, problemTagIds.value).then(res => {
                allProblems.value = res.data as ContestSpace.AdminAllProblemVO[];
                // 更新 selectedProblems 中的引用
                const newProblemsMap = new Map(allProblems.value.map(p => [p.id, p]));
                selectedProblems.value = selectedProblems.value.map(p => {
                    if (newProblemsMap.has(p.id)) {
                        return newProblemsMap.get(p.id)!;
                    }
                    return p;
                });
            }).catch(err => {
                globalMessage.error("加载题目失败", err.message);
            });
        }
        async function loadHomeworkProblems() {
            await getAdminProblems(Number(props.id)).then(res => {
                contestProblems.value = res.data as ContestSpace.AdminProblemVO[];
            }).catch(err => {
                globalMessage.error("加载题目失败", err.message);
            });
        }
        async function loadAllProblemCount() {
            const type = filterType.value ? 'own' : 'all';
            await getAdminProblemsCount(type, problemSearchContent.value, problemTagIds.value).then(res => {
                problemTotalRecords.value = res.data as number;
            }).catch(err => {
                globalMessage.error("加载题目失败", err.message);
            });
        }
        // event
        onMounted(() => {
            loadAllLanguages();
            loadClasses();
            if (props.type !== undefined && props.type === 'edit') {
                loadHomeworkDetail(Number(props.id));
            } else if (props.copyId !== undefined && props.copyId != '') {
                loadHomeworkDetail(Number(props.copyId));
            }
        })
        const parsing = ref(false);
        const parseButtonEvent = () => {
            parseUsersFun();
        }
        const clearStudents = () => {
            studentInput.value = '';
            students.value = [];
        }
        const onOwnClassesChange = () => {
            filteredClasses.value = [];
            loadClasses();
        }
        const parseUsersFun = async () => {
            // 解析学生
            parsing.value = true;
            const stu: string[] = studentInput.value.split('\n');
            await parseUsers(stu).then(res => {
                students.value = res.data as ContestSpace.AdminParseUsers[];
            }).catch(err => {
                globalMessage.error("解析失败", err.message);
            }).finally(() => {
                parsing.value = false;
            });
        }
        const loadClasses = async () => {
            const type = onlyMyClasses.value ? 'own' : 'all';
            await getHomeworkGroup(type).then(res => {
                filteredClasses.value.push(...(res.data as ContestSpace.AdminHomeworkGroupVO[]));
            }).catch(err => {
                globalMessage.error("加载班级失败", err.message);
            });
        }
        const createHomeworkFun = async () => {
            isSubmiting.value = true;
            // 检查displayId重复
            if (!problemFinalSaveVaildation) {
                return;
            }
            const problemTmp: ContestSpace.contestProblem[] = contestProblems.value.map(problem => ({
                problemId: problem.id,
                displayId: problem.number
            }));
            const stu: string[] = studentInput.value.split('\n');
            const homeworkDTO: ContestSpace.CreateHomeworkDTO = {
                title: homework.title,
                description: homework.description,
                auth: homework.auth,
                type: 0,
                isHideAdminUser: isHideAdminUser.value,
                password: homework.password,
                visible: homework.visible,
                duplicateCheck: homework.duplicateCheck,
                languages: homework.languages,
                // build remoteLanguages from unified homework.languages
                remoteLanguages: (() => {
                    const map = buildIdToOjMap();
                    const res: Record<string, number[]> = {};
                    homework.languages.forEach(id => {
                        const oj = map.get(id);
                        if (oj && oj !== 'LOCAL') {
                            if (!res[oj]) res[oj] = [];
                            res[oj].push(id);
                        }
                    });
                    return res;
                })(),
                problems: problemTmp,
                users: stu,
                collaborators: collaborators.value,
                groupIds: homework.selectedClasses,
                startTime: homework.startTime.getTime(),
                endTime: homework.endTime.getTime()
            }
            await createHomework(homeworkDTO).then(() => {
                router.push("/admin/homeworks/list")
                globalMessage.success("创建比赛", "操作成功");
            }).catch(err => {
                globalMessage.error("创建失败", err.message);
            }).finally(() => {
                isSubmiting.value = false;
            });
        }
        async function loadHomeworkDetail(id: number) {
            try {
                const res = await getHomeworkDetail(id);
                const data = res.data as ContestSpace.HomeworkDetailVO;

                // ensure language data is loaded before splitting
                await loadLocalLanguages();
                // reset remote list then load remote languages for each supported oj
                RemoteSupportLanguages.value = [];
                await Promise.all(supprotRemoteOJList.map(async (oj) => await loadRemoteLanguagse(oj)));

                // build id -> oj map from known languages
                const idToOj = new Map<number, string>();
                localSupportLanguages.value.forEach(l => idToOj.set(l.id, l.oj || 'LOCAL'));
                RemoteSupportLanguages.value.forEach(l => idToOj.set(l.id, l.oj || ''));

                // reset remoteLanguagesByOj
                remoteLanguagesByOj.value = {};
                RemoteSupportLanguages.value.forEach(l => {
                    const oj = l.oj || '';
                    if (!remoteLanguagesByOj.value[oj]) remoteLanguagesByOj.value[oj] = [];
                    remoteLanguagesByOj.value[oj].push({ id: l.id, name: l.name });
                });

                // set basic homework fields
                homework.title = data.title;
                homework.description = data.description;
                homework.auth = data.auth;
                homework.password = data.password;
                homework.visible = data.visible;
                homework.duplicateCheck = data.duplicateCheck;
                homework.selectedClasses = data.groupIds;
                homework.startTime = new Date(data.startTime);
                homework.endTime = new Date(data.endTime);
                studentInput.value = data.users.join('\n');
                collaborators.value = data.collaboratorIds;
                isHideAdminUser.value = data.isHideAdminUser;
                collaboratorOptions.value = data.collaborators as ContestSpace.AdminParseUsers[];
                contestProblems.value = data.problems.map(problem => ({
                    id: problem.problemId,
                    title: problem.title as string,
                    difficulty: 0,
                    createTime: '',
                    updateTime: '',
                    number: problem.displayId
                }));
                filteredClasses.value.push(...(data.groups as ContestSpace.AdminHomeworkGroupVO[]));

                // data.languages is a mixed list of local + remote language ids
                const returnedLangIds = data.languages || [];

                // set homework.languages to the returned mixed list (filter unknown ids to avoid stray values)
                const knownIds = new Set([...localSupportLanguages.value, ...RemoteSupportLanguages.value].map(l => l.id))
                homework.languages = returnedLangIds.filter(id => knownIds.has(id));

                // set enabledRemoteOJs based on returned ids
                enabledRemoteOJs.value = [];
                supprotRemoteOJList.forEach(oj => {
                    const idsForOj = returnedLangIds.filter(id => idToOj.get(id) === oj);
                    if (idsForOj.length > 0) {
                        enabledRemoteOJs.value.push(oj);
                    }
                });
            } catch (err: any) {
                globalMessage.error("加载数据失败", err.message);
            }
            isSubmiting.value = false;
        }
        async function updateHomeworkFun() {
            isSubmiting.value = true;
            // 检查displayId重复
            if (!problemFinalSaveVaildation) {
                return;
            }
            const problemTmp: ContestSpace.contestProblem[] = contestProblems.value.map(problem => ({
                problemId: problem.id,
                displayId: problem.number
            }));
            const stu: string[] = studentInput.value.split('\n');
            const homeworkDTO: ContestSpace.CreateHomeworkDTO = {
                id: Number(props.id),
                title: homework.title,
                description: homework.description,
                auth: homework.auth,
                type: 0,
                isHideAdminUser: isHideAdminUser.value,
                password: homework.password,
                visible: homework.visible,
                duplicateCheck: homework.duplicateCheck,
                languages: homework.languages,
                remoteLanguages: (() => {
                    const map = buildIdToOjMap();
                    const res: Record<string, number[]> = {};
                    homework.languages.forEach(id => {
                        const oj = map.get(id);
                        if (oj && oj !== 'LOCAL') {
                            if (!res[oj]) res[oj] = [];
                            res[oj].push(id);
                        }
                    });
                    return res;
                })(),
                problems: problemTmp,
                users: stu,
                collaborators: collaborators.value,
                groupIds: homework.selectedClasses,
                startTime: homework.startTime.getTime(),
                endTime: homework.endTime.getTime()
            }
            await updateHomework(homeworkDTO).then(() => {
                router.push("/admin/homeworks/list")
                globalMessage.success("更新比赛", "操作成功");
            }).catch(err => {
                globalMessage.error("加载数据失败", err.message);
            });
            isSubmiting.value = false;
        }
        const isSubmiting = ref(false);
        function onSubmitEvent() {
            if (props.type === 'edit') {
                updateHomeworkFun();
            } else {
                createHomeworkFun();
            }
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
        return {
            homework, authOptions, RemoteSupportLanguages, localSupportLanguages, languageOptions, visibleOptions, searchContent, onlyMyClasses, filteredClasses, studentInput, students,
            onOwnClassesChange, parseButtonEvent, createHomeworkFun, onSubmitEvent, contestProblemsDialog, contestProblems, addProblemDialog,
            allProblems, selectedProblems, problemTotalRecords, problemFirst, onProblemPage, onAddPageOpen, onListPageOpen, problemFinalSaveEvent,
            selectedProblemSaveEvent, filterType, problemSearchContent, searchProblemInAllEvent, convertToLetter, deleteContestProblems,
            onUploadImg, isSubmiting, isDuplicateNumber, tagContent, problemTagOptions, problemTagIds, collaborators, clearStudents, parsing,
            collaboratorContent, collaboratorOptions, searchCollaborators, isHideAdminUser, parseUsersFun,
            // expose remote OJ helpers
            supprotRemoteOJList, supportedRemoteOJs, enabledRemoteOJs, remoteLanguagesByOj, onRemoteOjToggle
        }
    }
})
</script>
<style scoped>
::v-deep(.p-datatable-tbody > tr.p-datatable-row-selected) {
    background-color: black !important;
    /* 选中变淡蓝色 */
    color: white !important;
    border-color: black !important;
    /* 文字颜色 */
}

::v-deep(svg.md-editor-icon) {
    width: 23px !important;
    height: 23px !important;
}
</style>