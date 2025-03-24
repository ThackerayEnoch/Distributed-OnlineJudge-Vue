<template>
    <div class="w-full p-1 ">
        <Panel header="新建班级" class="shadow-lg">
            <form @submit.prevent="handleSubmit" class="space-y-6 p-4">
                <!-- 基本信息行 -->
                <div class="grid gap-6 md:grid-cols-2">
                    <!-- 班级名称 -->
                    <div class="space-y-2 w-full">
                        <label class="block font-medium text-gray-700">班级名称 <span class="text-red-500">*</span></label>
                        <InputText v-model="classData.name" class="w-full" placeholder="请输入班级名称" required />
                    </div>

                    <!-- 可见性设置 -->
                    <div class="space-y-2 w-full">
                        <label class="block font-medium text-gray-700">可见性 <span class="text-red-500">*</span></label>
                        <Dropdown v-model="classData.auth" :options="visibilityOptions" class="w-full"
                            optionLabel="label" optionValue="value" placeholder="请选择可见性" />
                        <!-- 新增密码输入 -->
                        <div v-if="classData.auth === 1" class="pt-2 animate-fadein">
                            <label class="block text-sm font-medium text-gray-700">
                                加入密码 <span class="text-red-500">*</span>
                                <span class="text-gray-400 text-xs">（至少6位字符）</span>
                            </label>
                            <InputText v-model="classData.password" class="w-full mt-1" placeholder="设置加入密码" toggleMask
                                required />
                        </div>
                    </div>

                </div>

                <!-- 时间行 -->
                <div class="grid gap-6 md:grid-cols-2">
                    <div class="space-y-2 w-full">
                        <label class="block font-medium text-gray-700">开始时间 <span class="text-red-500">*</span></label>
                        <DatePicker v-model="startTime" class="w-full" dateFormat="yy-mm-dd" />
                    </div>

                    <div class="space-y-2 w-full">
                        <label class="block font-medium text-gray-700">结束时间 <span class="text-red-500">*</span></label>
                        <DatePicker v-model="endTime" class="w-full" dateFormat="yy-mm-dd" />
                    </div>
                </div>

                <!-- 描述 -->
                <div class="space-y-2 w-full">
                    <label class="block font-medium text-gray-700">班级描述</label>
                    <InputText v-model="classData.description" class="w-full" placeholder="请输入班级描述（可选）" />
                </div>

                <!-- 学生名单模块 -->
                <div class="space-y-2 w-full">
                    <label class="block font-medium text-gray-700">
                        学生名单
                        <span class="text-sm text-gray-500">（每行输入一个学生信息，格式：学号/用户名）</span>
                    </label>
                    <div class="flex gap-4 h-64">
                        <!-- 输入区 -->
                        <div class="flex-1">
                            <Textarea v-model="studentNamesRaw" class="w-full h-full font-mono" placeholder="示例：
202231222024
202231222062
202231222107" />
                        </div>

                        <!-- 操作按钮列 -->
                        <div class="flex flex-col justify-center gap-2">
                            <Button icon="pi pi-arrow-right" severity="secondary" @click="parseStudents" class="!px-3"
                                v-tooltip="'解析名单'" :loading="parsing" />
                            <Button icon="pi pi-replay" severity="secondary" @click="clearStudents" class="!px-3"
                                v-tooltip="'重置名单'" />
                        </div>

                        <!-- 解析结果区 -->
                        <div class="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                            <div v-if="parsedStudents.length === 0"
                                class="text-gray-400 h-full flex items-center justify-center">
                                <i class="pi pi-info-circle mr-2"></i>
                                <span>等待解析结果...</span>
                            </div>
                            <div v-else class="space-y-2">
                                <div v-for="(student, index) in parsedStudents" :key="index"
                                    class="flex items-center p-3 bg-white rounded shadow-sm hover:shadow transition">
                                    <Avatar icon="pi pi-user" class="!bg-primary-100 !text-primary-600 mr-3" />
                                    <div>
                                        <div class="font-medium">{{ student.username }}</div>
                                        <div class="text-sm text-gray-500">{{ student.nickname || '未设置昵称' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 按钮组 -->
                <div class="flex justify-end gap-4 w-full pt-6">
                    <Button label="取消" severity="secondary" class="min-w-[120px]" @click="handleCancel" />
                    <Button :label="props.type === 'edit' ? '更新班级' : '创建班级'" :loading="isLoading" type="submit"
                        severity="primary" icon="pi pi-check" class="min-w-[160px]" />
                </div>
            </form>
        </Panel>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { type GroupSpace, getAdminGroupDetail, createAdminGroup, updateAdminGroup } from '@/group/api/groupAPI';
import { type ContestSpace, parseUsers } from '@/admin/api/contestAPI';
import globalMessage from '@/common/utils/toast';
import { useRouter } from 'vue-router';
const router = useRouter();
const props = defineProps({
    type: String,
    id: String
});
const startTime = ref(new Date());
const endTime = ref(new Date());
const classData = ref<GroupSpace.AdminCreateGroupDTO>({
    name: '',
    description: '',
    auth: 0,
    startTime: 0,
    endTime: 0,
    password: '',
    studentNames: []
});

const studentNamesRaw = ref('');

const visibilityOptions = [
    { label: '公开（所有人可参加）', value: 0 },
    { label: '受保护（凭密码可加入）', value: 1 },
    { label: '私有（仅支持导入）', value: 2 }
];
// 新增状态
const parsedStudents = ref<Array<{ username: string; nickname?: string }>>([]);

// 解析方法
const parsing = ref(false);

const parseStudents = async () => {
    parsing.value = true;
    await parseUsers(studentNamesRaw.value.split('\n')).then(response => {
        const data = response.data as ContestSpace.AdminParseUsers[];
        parsedStudents.value = data.map(user => ({
            username: user.studentId,
            nickname: user.nickname
        }));

    }).catch(err => {
        globalMessage.error('解析学生名单失败', err.message);
    }).finally(() => {
        parsing.value = false;
    });
};

// 重置方法
const clearStudents = () => {
    studentNamesRaw.value = '';
    parsedStudents.value = [];
};
const handleSubmit = () => {
    // 处理学生名单格式
    const processedStudentNames = studentNamesRaw.value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

    const submitData = {
        ...classData.value,
        studentNames: processedStudentNames
    };
    submitData.startTime = startTime.value.getTime();
    submitData.endTime = endTime.value.getTime();
    if (props.type === 'edit') {
        // 编辑班级
        return updateClass(submitData);
    }
    createClass(submitData);
};
const isLoading = ref(false);
const createClass = async (data: GroupSpace.AdminCreateGroupDTO) => {
    isLoading.value = true;
    await createAdminGroup(data).then(() => {
        globalMessage.success('提示', '创建班级成功');
        router.push('/admin/groups/list');
    }).catch(err => {
        globalMessage.error('创建班级失败', err.message);
    }).finally(() => {
        isLoading.value = false;
    });
};
const updateClass = async (data: GroupSpace.AdminCreateGroupDTO) => {
    isLoading.value = true;
    data.id = Number(props.id);
    await updateAdminGroup(data).then(() => {
        globalMessage.success('提示', '更新班级成功');
        router.push('/admin/groups/list');
    }).catch(err => {
        globalMessage.error('更新班级失败', err.message);
    }).finally(() => {
        isLoading.value = false;
    });
};
const loadGroup = async () => {
    if (props.id && props.type === 'edit') {
        await getAdminGroupDetail(Number(props.id)).then(response => {
            const data = response.data as GroupSpace.AdminGroupInfoVO;
            classData.value = {
                id: data.id,
                name: data.name,
                description: data.description,
                auth: data.auth,
                startTime: new Date(data.startTime).getTime(),
                endTime: new Date(data.endTime).getTime(),
                password: data.password,
                studentNames: data.students
            };
            studentNamesRaw.value = data.students.join('\n');
            startTime.value = new Date(data.startTime);
            endTime.value = new Date(data.endTime);
        }).catch(err => {
            globalMessage.error('加载班级信息失败', err.message);
        });
    }
};
const handleCancel = () => {
    router.push('/admin/groups/list');
};
onMounted(() => {
    if (props.type === 'edit') {
        loadGroup();
    }
});
</script>

<style scoped>
/* 可以添加自定义样式 */
.p-panel-header {
    @apply text-2xl font-bold text-gray-800;
}
</style>