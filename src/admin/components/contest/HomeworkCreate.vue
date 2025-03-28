<template>
    <Panel>
        <template #header>
            <div class="flex justify-between items-center text-2xl font-bold text-blue-500">
                <span>创建作业</span>
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
            <label class="text-gray-500">作业描述</label>
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
                <Calendar v-model="homework.startTime" showTime hourFormat="24" class="mt-2 w-full" />
            </div>

            <!-- 结束时间 -->
            <div class="flex flex-col">
                <label class="text-gray-500">
                    <span class="text-red-500">*</span> 结束时间
                </label>
                <Calendar v-model="homework.endTime" showTime hourFormat="24" class="mt-2 w-full" />
            </div>
        </div>
        <div class="mt-4 flex flex-col space-y-2 w-[20%]">
            <label class="text-gray-500">
                <span class="text-red-500">*</span> 作业题目
            </label>
            <Button severity="secondary" label="点击编辑作业题目" @click="onListPageOpen" />
        </div>
        <div class="flex flex-col space-y-2 mt-4">
            <label class="text-gray-500"><span class="text-red-500">*</span> 允许提交语言:</label>
            <div class="flex flex-wrap gap-4">
                <div v-for="option in languageOptions" :key="option.id" class="flex items-center mr-2 gap-2">
                    <Checkbox v-model="homework.languages" :inputId="option.id.toString()" :value="option.id" />
                    <label :for="option.id.toString()">{{ option.name }}</label>
                </div>
            </div>
        </div>
        <div class="mt-6 max-w-3xl space-y-4">
            <div class="grid grid-cols-3 gap-4">
                <!-- 作业权限 -->
                <div class="flex flex-col">
                    <label class="text-gray-500">
                        <span class="text-red-500">*</span> 作业权限
                        <i class="ml-1 fa-regular fa-circle-question text-blue-500 cursor-pointer"
                            v-tooltip.top="'公开模式: 任何人都可参与\n私有模式: 允许设定参与者\n保护模式: 允许设定参与者, 其他参与者需要密码'"></i>
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
                        <span class="text-red-500">*</span> 是否可见
                        <i class="ml-1 fa-regular fa-circle-question text-blue-500 cursor-pointer"
                            v-tooltip.top="'不可见: 参与用户不可见'"></i>
                    </label>
                    <CustomToggleButton class="text-sm mt-2" v-model="homework.visible" />
                </div>
            </div>
        </div>
        <!-- 是否开启查重 -->
        <div class="flex flex-col mt-6">
            <label class="text-gray-500">
                <span class="text-red-500">*</span> 是否开启查重
                <i class="ml-1 fa-regular fa-circle-question text-blue-500 cursor-pointer"
                    v-tooltip.top="'代码查重结果详见统计信息'"></i>
            </label>
            <ToggleSwitch class="mt-2" disible v-tooltip.top="'正在开发中'" v-model="homework.duplicateCheck" />
        </div>
        <div v-if="homework.auth !== 0" class="mt-6">
            <label class="text-gray-500">
                <span class="text-red-500">*</span> 参与班级
            </label>
        </div>
        <div v-if="homework.auth !== 0" class="p-0 mt-4 space-y-4">
            <Select v-model="homework.selectedClasses" :options="filteredClasses" optionLabel="name" optionValue="id"
                placeholder="选择班级..." class="w-[150px]">
                <template #header>
                    <div class="flex items-center gap-2 p-2">
                        <InputText v-model="searchContent" placeholder="搜索班级..." class="w-full p-2 border rounded-lg" />
                        <div class="flex items-center gap-1">
                            <ToggleSwitch v-tooltip.top="'仅显示我创建的'" id="myClasses" v-model="onlyMyClasses"
                                @change="onOwnClassesChange" />
                        </div>
                    </div>
                </template>
            </Select>
        </div>
        <div v-if="homework.auth !== 0" class="mt-6">
            <label class="text-gray-500">
                <span class="text-red-500">*</span> 参与用户
            </label>
        </div>
        <div v-if="homework.auth !== 0" class="flex gap-4 p-4 items-center">
            <!-- 左侧输入框 -->
            <textarea v-model="studentInput" class="w-1/4 h-96 p-2 border border-gray-300 rounded-md resize-none"
                placeholder="粘贴学号，每行一个"></textarea>

            <!-- 中间解析按钮和箭头 -->
            <div class="flex flex-col items-center">
                <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    @click="parseButtonEvent">
                    解析
                </button>
                <span class="text-2xl mt-2">→</span>
            </div>

            <!-- 右侧 DataTable -->
            <div class="w-1/4 border border-gray-300 rounded-md min-h-96 overflow-auto">
                <DataTable :value="students" class="w-full" scrollable scrollHeight="400px">
                    <Column field="studentId" header="学号"></Column>
                    <Column field="nickname" header="昵称"></Column>
                </DataTable>
            </div>
        </div>

        <div>
            <Button label="保存" @click="onSubmitEvent" icon="pi pi-check" class="w-full mt-4" />
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
        <DataTable :value="contestProblems" class="mt-2" :sortOrder="1" sortField="number" removableSort scrollable
            scrollHeight="400px">
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
                        variant="filled" :step="1" :min="0" :max="100" :allow-empty="false" class="w-full" fluid>
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
                    <span class="flex-1 text-center">{{ convertToLetter(slotProps.data.number + 1) }}</span>
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
            <Column field="createTime" header="添加时间"></Column>
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
            <Column field="tags" header="标签"></Column>
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
import { languageOptions } from '@/common/constant/AllConstant'
import CustomToggleButton from './CustomToggleButton.vue';
import { reactive, ref, defineComponent, onMounted } from 'vue'
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { parseUsers, getHomeworkGroup, createHomework, uploadFile, getHomeworkDetail, updateHomework, getAdminAllProblems, getAdminProblems, getAdminProblemsCount, type ContestSpace } from '@/admin/api/contestAPI'
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
            { label: '公开作业', value: 0 },
            { label: '私有作业', value: 2 },
            { label: '保护作业', value: 1 },
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
        const homework = reactive({
            title: '',
            description: '',
            auth: 0,
            password: '',
            visible: true,
            duplicateCheck: false,
            languages: [1, 2, 3, 4, 9, 10],
            users: '',
            selectedClasses: -1,
            startTime: new Date(),
            endTime: new Date()
        })
        // problem
        const contestProblemsDialog = ref(false);
        const addProblemDialog = ref(false);

        const contestProblems = ref<ContestSpace.AdminProblemVO[]>([]);
        const selectedProblems = ref<ContestSpace.AdminAllProblemVO[]>([]);
        const allProblems = ref<ContestSpace.AdminAllProblemVO[]>([]);
        const problemTotalRecords = ref<number>(0);
        const problemFirst = ref<number>(0);
        const filterType = ref<boolean>(false);
        const problemSearchContent = ref<string>('');

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
        function problemFinalSaveEvent() {
            contestProblemsDialog.value = false;
        }
        function selectedProblemSaveEvent() {
            addProblemDialog.value = false;
            saveSelectedProblems();
        }
        function onAddPageOpen() {
            selectedProblems.value = [];
            addProblemDialog.value = true;
            loadAllProblems();
            loadAllProblemCount();
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
        }
        async function saveSelectedProblems() {
            let lastNumber = contestProblems.value.length;
            selectedProblems.value.forEach(problem => {
                contestProblems.value.push({
                    id: problem.id,
                    title: problem.title,
                    difficulty: problem.difficulty,
                    createTime: '',
                    updateTime: '',
                    number: lastNumber++
                });
            });
        }
        async function loadAllProblems() {
            const type = filterType.value ? 'own' : 'all';
            await getAdminAllProblems(problemFirst.value, type, problemSearchContent.value).then(res => {
                allProblems.value = res.data as ContestSpace.AdminAllProblemVO[];
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
            await getAdminProblemsCount(type, problemSearchContent.value).then(res => {
                problemTotalRecords.value = res.data as number;
            }).catch(err => {
                globalMessage.error("加载题目失败", err.message);
            });
        }
        // event
        onMounted(() => {
            loadClasses();
            if (props.type !== undefined && props.type === 'edit') {
                loadHomeworkDetail(Number(props.id));
            } else if (props.copyId !== undefined && props.copyId != '') {
                loadHomeworkDetail(Number(props.copyId));
            }
        })
        const parseButtonEvent = () => {
            parseUsersFun();
        }
        const onOwnClassesChange = () => {
            loadClasses();
        }
        const parseUsersFun = async () => {
            // 解析学生
            const stu: string[] = studentInput.value.split('\n');
            await parseUsers(stu).then(res => {
                students.value = res.data as ContestSpace.AdminParseUsers[];
            }).catch(err => {
                globalMessage.error("解析失败", err.message);
            });
        }
        const loadClasses = async () => {
            const type = onlyMyClasses.value ? 'own' : 'all';
            await getHomeworkGroup(type).then(res => {
                filteredClasses.value = res.data as ContestSpace.AdminHomeworkGroupVO[];
            }).catch(err => {
                globalMessage.error("加载班级失败", err.message);
            });
        }
        const createHomeworkFun = async () => {
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
                password: homework.password,
                visible: homework.visible,
                duplicateCheck: homework.duplicateCheck,
                languages: homework.languages,
                problems: problemTmp,
                users: stu,
                groupId: homework.selectedClasses,
                startTime: homework.startTime.getTime(),
                endTime: homework.endTime.getTime()
            }
            await createHomework(homeworkDTO).then(() => {
                router.push("/admin/homeworks/list")
                globalMessage.success("创建作业", "操作成功");
            }).catch(err => {
                globalMessage.error("创建失败", err.message);
            });
        }
        async function loadHomeworkDetail(id: number) {
            await getHomeworkDetail(id).then(res => {
                const data = res.data as ContestSpace.HomeworkDetailVO;
                homework.title = data.title;
                homework.description = data.description;
                homework.auth = data.auth;
                homework.password = data.password;
                homework.visible = data.visible;
                homework.duplicateCheck = data.duplicateCheck;
                homework.languages = data.languages;
                homework.selectedClasses = data.groupId;
                homework.startTime = new Date(data.startTime);
                homework.endTime = new Date(data.endTime);
                studentInput.value = data.users.join('\n');

                contestProblems.value = data.problems.map(problem => ({
                    id: problem.problemId,
                    title: problem.title as string,
                    difficulty: 0,
                    createTime: '',
                    updateTime: '',
                    number: problem.displayId
                }));
            }).catch(err => {
                globalMessage.error("加载数据失败", err.message);
            });
        }
        async function updateHomeworkFun() {
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
                password: homework.password,
                visible: homework.visible,
                duplicateCheck: homework.duplicateCheck,
                languages: homework.languages,
                problems: problemTmp,
                users: stu,
                groupId: homework.selectedClasses,
                startTime: homework.startTime.getTime(),
                endTime: homework.endTime.getTime()
            }
            await updateHomework(homeworkDTO).then(() => {
                router.push("/admin/homeworks/list")
                globalMessage.success("更新作业", "操作成功");
            }).catch(err => {
                globalMessage.error("加载数据失败", err.message);
            });
        }
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
                            let url = res.data as unknown as string[];
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
            homework, authOptions, languageOptions, visibleOptions, searchContent, onlyMyClasses, filteredClasses, studentInput, students,
            onOwnClassesChange, parseButtonEvent, createHomeworkFun, onSubmitEvent, contestProblemsDialog, contestProblems, addProblemDialog,
            allProblems, selectedProblems, problemTotalRecords, problemFirst, onProblemPage, onAddPageOpen, onListPageOpen, problemFinalSaveEvent,
            selectedProblemSaveEvent, filterType, problemSearchContent, searchProblemInAllEvent, convertToLetter, deleteContestProblems,
            onUploadImg
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