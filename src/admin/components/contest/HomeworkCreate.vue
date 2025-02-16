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
            <MdEditor class="prose max-w-full shadow-md mt-2" v-model="homework.description" />
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
        <div class="mt-4">
            <label class="text-gray-500">
                作业题目在作业列表处编辑
            </label>
        </div>
        <div class="flex flex-col space-y-2 mt-4">
            <label class="text-gray-500"><span class="text-red-500">*</span> 允许提交语言:</label>
            <div class="flex flex-wrap gap-4">
                <div v-for="option in languageOptions " :key="option.id" class="flex items-center mr-2 gap-2">
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
                <div v-if="homework.auth == 2" class="flex flex-col">
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
            <ToggleSwitch class="mt-2" v-model="homework.duplicateCheck" />
        </div>
        <div v-if="homework.auth !== 0" class="mt-6">
            <label class="text-gray-500">
                <span class="text-red-500">*</span> 参与班级
            </label>
        </div>
        <div v-if="homework.auth !== 0" class="p-0 mt-4 space-y-4">
            <Select v-model="homework.selectedClasses" :options="filteredClasses" optionLabel="name"
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
</template>
<script lang="ts">
import { languageOptions } from '@/common/constant/AllConstant'
import CustomToggleButton from './CustomToggleButton.vue';
import { reactive, ref, defineComponent, onMounted } from 'vue'
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { parseUsers, getHomeworkGroup, createHomework, getHomeworkDetail, updateHomework, type ContestSpace } from '@/admin/api/contestAPI'
import globalMessage from '@/common/utils/toast';

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
        }
    },
    setup(props) {
        const authOptions = ref([
            { label: '公开作业', value: 0 },
            { label: '私有作业', value: 1 },
            { label: '保护作业', value: 2 },
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
            selectedClasses: { id: -1, name: '' },
            startTime: new Date(),
            endTime: new Date()
        })
        onMounted(() => {
            loadClasses();
            if (props.type === 'edit') {
                loadHomeworkDetail(props.id as number);
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
                users: stu,
                groupId: homework.selectedClasses.id,
                startTime: homework.startTime.getTime(),
                endTime: homework.endTime.getTime()
            }
            await createHomework(homeworkDTO).then(() => {
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
                homework.selectedClasses = { id: data.groupId, name: '' };
                homework.startTime = new Date(data.startTime);
                homework.endTime = new Date(data.endTime);
                studentInput.value = data.users.join('\n');

                console.log(res.data);
            }).catch(err => {
                globalMessage.error("加载数据失败", err.message);
            });
        }
        async function updateHomeworkFun() {
            const stu: string[] = studentInput.value.split('\n');
            const homeworkDTO: ContestSpace.CreateHomeworkDTO = {
                id: props.id as number,
                title: homework.title,
                description: homework.description,
                auth: homework.auth,
                type: 0,
                password: homework.password,
                visible: homework.visible,
                duplicateCheck: homework.duplicateCheck,
                languages: homework.languages,
                users: stu,
                groupId: homework.selectedClasses.id,
                startTime: homework.startTime.getTime(),
                endTime: homework.endTime.getTime()
            }
            await updateHomework(homeworkDTO).then(() => {
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
        return {
            homework, authOptions, languageOptions, visibleOptions, searchContent, onlyMyClasses, filteredClasses, studentInput, students,
            onOwnClassesChange, parseButtonEvent, createHomeworkFun, onSubmitEvent
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