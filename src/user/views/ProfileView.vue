<template>
    <Card class="w-full mx-auto shadow-lg">
        <!-- 头部区域增强 -->
        <template #title>
            <div class="flex flex-col space-y-4">
                <div class="flex items-center gap-4">
                    <Avatar icon="pi pi-user" size="xlarge" shape="circle" class="bg-ujn-red text-white" />
                    <div>
                        <div class="flex items-center gap-2">
                            <h1 class="text-3xl font-bold text-gray-800">{{ user.nickname }}</h1>
                            <Tag v-if="user.tag === 'SysAdmin'" value="SysAdmin" severity="danger" />
                            <Tag v-else-if="user.tag === 'Admin'" value="Admin" severity="warn" />
                            <Tag v-else-if="user.tag === 'Teacher'" value="Teacher" severity="info" />
                        </div>
                        <span class="text-gray-500">济南大学</span>
                    </div>
                </div>

                <!-- 统计卡片 -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <i class="pi pi-inbox text-blue-500 text-3xl"></i>
                        <div class="ml-4">
                            <div class="text-sm text-gray-500">总提交</div>
                            <div class="text-2xl font-bold">{{ problemStats.submitCount }}</div>
                        </div>
                    </div>
                    <div class="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <i class="pi pi-check-circle text-green-500 text-3xl"></i>
                        <div class="ml-4">
                            <div class="text-sm text-gray-500">已解决</div>
                            <div class="text-2xl font-bold">{{ problemStats.solvedCount }}</div>
                        </div>
                    </div>
                    <div class="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <i class="pi pi-percentage text-purple-500 text-3xl"></i>
                        <div class="ml-4">
                            <div class="text-sm text-gray-500">解决率</div>
                            <div class="text-2xl font-bold">{{ solveRate }}%</div>
                        </div>
                    </div>
                    <div class="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <i class="pi pi-sort-numeric-up text-ujn-red text-3xl"></i>
                        <div class="ml-4">
                            <div class="text-sm text-gray-500">当前排名</div>
                            <div class="text-2xl font-bold">#{{ currentRank }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template #content>
            <!-- 导航菜单 -->
            <TabMenu :model="menuItems" class="mb-8" />
            <!-- 基本信息区域 -->
            <section v-if="activeTab === 0" class="space-y-6 px-6">
                <div class="grid grid-cols-2 gap-6">
                    <div v-if="userStore.currentUser.userId !== user.id">
                        <label class="block text-gray-600 mb-2">用户名</label>
                        <div
                            class="w-full bg-gray-100 dark:bg-gray-800 p-2 bg-gray-100 rounded text-gray-800 dark:text-white">
                            {{
                                user.nickname }}</div>
                    </div>
                    <div v-else>
                        <label class="block text-gray-600 mb-2">用户名</label>
                        <InputText v-model="user.nickname" class="w-full"
                            :disabled="!editMode || !(userStore.currentUser.roleId < Role.STUDENT)" />
                    </div>
                    <div v-if="userStore.currentUser.userId !== user.id">
                        <label class="block text-gray-600 mb-2">电子邮箱</label>
                        <div class="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-white">{{
                            user.email }}
                        </div>
                    </div>
                    <div v-else>
                        <label class="block text-gray-600 mb-2">电子邮箱</label>
                        <InputText v-model="user.email" class="w-full" type="email" :disabled="!editMode" />
                    </div>
                </div>

                <div v-if="userStore.currentUser.userId === user.id" class="flex gap-4 justify-end">
                    <Button v-if="!editMode" label="编辑资料" icon="pi pi-pencil" @click="editMode = true" />
                    <Button v-if="editMode" label="取消修改" severity="secondary" @click="cancelEdit" />
                    <Button v-if="editMode" :loading="loading" label="保存更改" severity="success" icon="pi pi-check"
                        @click="saveProfile" />
                </div>
            </section>

            <!-- 修改密码区域 -->
            <section v-if="activeTab === 1 && userStore.currentUser.userId === user.id" class="space-y-6 px-6">
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-600 mb-2">当前密码</label>
                        <Password v-model="password.current" toggleMask :feedback="false" />
                    </div>
                    <div>
                        <label class="block text-gray-600 mb-2">新密码</label>
                        <Password v-model="password.new" toggleMask :feedback="false" />
                    </div>
                    <div>
                        <label class="block text-gray-600 mb-2">确认新密码</label>
                        <Password v-model="password.confirm" toggleMask :feedback="false" />
                    </div>
                </div>

                <Button label="修改密码" :loading="loading" severity="warning" icon="pi pi-lock" :disabled="loading"
                    @click="changePassword" />
            </section>
        </template>
    </Card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useUserStore } from '@/common/utils/store';
import { Role } from '@/common/constant/Role';
import { type UserSpace, getUserInfoById, updatePassword, updateUserInfo } from '@/user/userAPI';
import globalMessage from '@/common/utils/toast';
const userStore = useUserStore();
const props = defineProps<{ id: String }>();

interface PasswordForm {
    current: string;
    new: string;
    confirm: string;
}

// 用户信息
const user = reactive<UserSpace.UserInfoVO>({
    id: Number(props.id),
    nickname: '',
    course: '',
    tag: '',
    email: '',
    totalSubmitCount: 0,
    solvedCount: 0,
    rank: 0
});
// 密码表单
const password = reactive<PasswordForm>({
    current: '',
    new: '',
    confirm: ''
});

// 表单编辑状态
const editMode = ref(false);
const originalUser = ref({ ...user });
// 密码验证逻辑
const passwordValid = computed(() => {
    return password.new.length >= 6 && password.new.length <= 20 &&
        password.new === password.confirm &&
        password.current.length > 0;
});

// 保存资料
const loading = ref(false);
const saveProfile = async () => {
    loading.value = true;
    const dto: UserSpace.UserInfoUpdateDTO = {
        nickname: user.nickname,
        email: user.email
    };
    await updateUserInfo(dto).then(() => {
        editMode.value = false;
        globalMessage.success('提示', '保存成功');
    }).catch((err) => {
        globalMessage.error('错误', err.message);
    }).finally(() => {
        loading.value = false;
    });
};

// 取消编辑
const cancelEdit = () => {
    Object.assign(user, originalUser.value);
    editMode.value = false;
};

// 修改密码
const changePassword = async () => {
    // 这里添加实际密码修改逻辑
    if (password.new !== password.confirm) {
        globalMessage.warn('警告', '两次输入的密码不一致');
        return;
    }
    if (!passwordValid.value) {
        globalMessage.warn('警告 ', '密码不符合要求');
        return;
    }
    loading.value = true;
    await updatePassword({ oldPassword: password.current, newPassword: password.new }).then(() => {
        password.current = '';
        password.new = '';
        password.confirm = '';
        globalMessage.success('提示', '密码修改成功');
    }).catch((err) => {
        globalMessage.error('错误', err.message);
    }).finally(() => {
        loading.value = false;
    });
};
const loadUserInfo = async () => {
    await getUserInfoById(Number(props.id)).then((res) => {
        Object.assign(user, res.data);
        Object.assign(originalUser.value, res.data);
        problemStats.submitCount = user.totalSubmitCount;
        problemStats.solvedCount = user.solvedCount;
        currentRank.value = user.rank;
        user.id = Number(props.id);
        originalUser.value.id = Number(props.id);
    }).catch((err) => {
        globalMessage.error('错误', err.message);
    });
};
onMounted(() => {
    loadUserInfo();
});
interface ProblemStats {
    submitCount: number;
    solvedCount: number;
}

const problemStats = reactive<ProblemStats>({
    submitCount: 142,
    solvedCount: 89
});
const currentRank = ref(15);

const menuItems = ref([
    { label: '基本信息', command: () => (activeTab.value = 0) },
    { label: '安全设置', command: () => (activeTab.value = 1) },
]);

const solveRate = computed(() => {
    return ((problemStats.solvedCount / problemStats.submitCount) * 100).toFixed(1);
});
const activeTab = ref(0);
</script>