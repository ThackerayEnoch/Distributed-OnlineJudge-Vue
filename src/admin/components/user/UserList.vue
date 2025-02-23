<template>
    <div class="bg-white dark:bg-gray-800 mt-1 ml-2 mr-2 p-4 rounded-none shadow-md font-sans">
        <div id="functionArea">
            <!-- 标题 -->
            <div class="p-4 space-x-4 flex items-center">
                <h2 class="text-2xl font-bold text-blue-500">用户列表</h2>
            </div>
            <!-- 操作栏 -->
            <div class="flex items-center space-x-5 p-4">
                <!-- 按钮：创建 -->
                <button @click="onAddUser" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow-md">
                    + 创建
                </button>
                <!-- 搜索框 -->
                <span class="relative">
                    <InputText placeholder="输入关键词" v-model="content" class="p-2 w-64 rounded-md border border-gray-300"
                        @keyup.enter="onSearch" />
                    <i class="pi pi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                        @click="onSearch"></i>
                </span>
            </div>
        </div>
        <div id="DataTableArea">
            <DataTable :value="isloading ? Array(pageLimit).fill({}) : users" stripedRows :paginator="true"
                :rows="pageLimit" lazy :first="first" :totalRecords="totalRecords" @page="onPage">
                <Column field="id" style="text-align: center">
                    <template #header>
                        <span class="flex-1 text-center font-bold">ID</span>
                    </template>
                    <template #body="slotProps">
                        <Skeleton v-if="isloading" width="80px"></Skeleton>
                        <span v-else>{{ slotProps.data.id }}</span>
                    </template>
                </Column>
                <Column field="nickname" style="text-align: center">
                    <template #header>
                        <span class="flex-1 text-center font-bold">昵称</span>
                    </template>
                    <template #body="slotProps">
                        <Skeleton v-if="isloading" width="80px"></Skeleton>
                        <span v-else>{{ slotProps.data.nickname }}</span>
                    </template>
                </Column>
                <Column field="username" style="text-align: center">
                    <template #header>
                        <span class="flex-1 text-center font-bold">用户名</span>
                    </template>
                    <template #body="slotProps">
                        <Skeleton v-if="isloading" width="80px"></Skeleton>
                        <span v-else>{{ slotProps.data.username }}</span>
                    </template>
                </Column>
                <Column field="lastLogin" style="text-align: center">
                    <template #header>
                        <span class="flex-1 text-center font-bold">最后登录</span>
                    </template>
                    <template #body="slotProps">
                        <Skeleton v-if="isloading" width="80px"></Skeleton>
                        <span v-else>{{ slotProps.data.lastLogin }}</span>
                    </template>
                </Column>
                <Column field="signedUp" style="text-align: center">
                    <template #header>
                        <span class="flex-1 text-center font-bold">注册时间</span>
                    </template>
                    <template #body="slotProps">
                        <Skeleton v-if="isloading" width="80px"></Skeleton>
                        <span v-else>{{ slotProps.data.signedUp }}</span>
                    </template>
                </Column>
                <Column field="status" style="text-align: center" class="m-0 p-0">
                    <template #header>
                        <span class="flex-1 text-center font-bold">状态</span>
                    </template>
                    <template #body="slotProps">
                        <div class="flex space-x-2 justify-center">
                            <Skeleton v-if="isloading" width="80px"></Skeleton>
                            <CustomToggleButton v-else class=" text-sm m-0 p-0" v-model="slotProps.data.status"
                                trueLabel="启用" falseLabel="禁用" @click="updateStatus(slotProps.data)" />
                        </div>
                    </template>
                </Column>
                <Column style="text-align: center;">
                    <template #header>
                        <span class="flex-1 text-center font-bold">操作</span>
                    </template>
                    <template #body="slotProps">
                        <Skeleton v-if="isloading" width="80px"></Skeleton>
                        <div v-else class="flex space-x-2 justify-center">
                            <button v-tooltip.top="'编辑昵称'" @click="onEditNickname(slotProps.data)"
                                class="bg-blue-500 hover:bg-blue-700  flex items-center justify-center text-white font-bold p-2 w-14 h-9 rounded">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button
                                class="ml-2 bg-yellow-500 flex items-center justify-center hover:bg-yellow-700 text-white font-bold p-2 w-14 h-9 rounded"
                                v-tooltip.top="'重设密码'" @click="onEditPassword(slotProps.data)">
                                <i class="fas fa-key"></i>
                            </button>
                            <button
                                class="ml-2 bg-green-500 flex items-center justify-center text-white p-2 rounded w-14 h-9 hover:bg-green-700"
                                v-tooltip.top="'设置用户组'" @click="onRoleAssign(slotProps.data)">
                                <i class="fas fa-users-cog"></i>
                            </button>
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
    <Dialog id="nickname" v-model:visible="displayDialog" header="编辑昵称" :modal="true" :closable="false"
        :draggable="false" :style="{ width: '90vw', maxWidth: '28rem' }" :breakpoints="{ '640px': '95vw' }"
        headerClass="font-bold text-xl border-b-2 border-primary-100 pb-2" class="rounded-lg shadow-xl">

        <!-- 主内容区 -->
        <div class="px-6 py-4">
            <InputGroup class="group relative">
                <InputGroupAddon class="!bg-primary-400 !border-primary-100">
                    <i class="pi pi-user-edit text-white"></i>
                </InputGroupAddon>
                <InputText v-model="selectedUser.nickname" placeholder="请输入2-16位字符的新昵称"
                    class="!border-l-0 focus:!ring-primary-100 focus:!border-primary-100 flex-1" autofocus
                    maxlength="16" autocomplete="off" />
            </InputGroup>

            <div class="text-gray-500 text-sm mt-3 ml-1">
                <i class="pi pi-info-circle mr-1"></i>
                支持中文/英文/数字组合
            </div>
        </div>

        <!-- 底部操作 -->
        <template #footer>
            <div class="flex justify-between w-full px-4 pb-4">
                <Button label="取消" icon="pi pi-times" class="p-button-text text-gray-500 hover:bg-gray-100 px-5"
                    @click="displayDialog = false" />

                <Button label="保存修改" icon="pi pi-check" class="px-5 bg-primary-500 hover:bg-primary-600 border-none"
                    :disabled="!selectedUser.nickname?.trim() || loading.edit" :loading="loading.edit"
                    @click="updateUserEvent('edit')" @keyup.enter="updateUserEvent('edit')" />
            </div>
        </template>
    </Dialog>
    <Dialog id="password" v-model:visible="passwordDisplayDialog" header="重设密码" :modal="true" :closable="false"
        :style="{ width: '90vw', maxWidth: '28rem' }" :breakpoints="{ '640px': '95vw' }" :draggable="false"
        headerClass="font-bold text-xl border-b-2 border-primary-100 pb-2" class="rounded-lg shadow-xl">

        <!-- 输入框区域 -->
        <div class="px-6 py-4">
            <InputGroup class="flex items-center">
                <InputGroupAddon class="!bg-primary-400 !border-primary-100">
                    <i class="pi pi-lock text-white"></i>
                </InputGroupAddon>
                <InputText v-model="newPassword" placeholder="请输入6位以上新密码" type="text"
                    class="!border-l-0 focus:!ring-primary-100 focus:!border-primary-100 flex-1"
                    autocomplete="new-password" />
            </InputGroup>

            <div class="text-gray-500 text-sm mt-3 ml-1">
                <i class="pi pi-info-circle mr-1"></i>建议包含字母、数字和特殊字符
            </div>
        </div>

        <!-- 操作按钮 -->
        <template #footer>
            <div class="flex justify-between w-full px-4 pb-4">
                <Button label="取消" icon="pi pi-times" class="p-button-text text-gray-500 hover:bg-gray-100 px-5"
                    @click="passwordDisplayDialog = false" />

                <Button label="确认修改" :loading="loading.password" icon="pi pi-check"
                    class="px-5 bg-primary-500 hover:bg-primary-600 border-none" @click="updateUserEvent('password')"
                    @keyup.enter="updateUserEvent('password')" />
            </div>
        </template>
    </Dialog>
    <Dialog v-model:visible="roleDisplayDialog" :style="{ width: '450px' }" header="分配用户组" :modal="true">
        <div class="p-fluid">
            <!-- 用户信息行 -->
            <div class="field grid mb-4">
                <label class="col-fixed font-medium text-gray-600" style="width: 80px">用户</label>
                <div class="col">
                    <div class="p-inputtext bg-gray-50 border-transparent">
                        {{ selectedUser.nickname }}
                    </div>
                </div>
            </div>

            <!-- 角色选择行 -->
            <div class="field grid mb-4">
                <label class="col-fixed font-medium text-gray-600" style="width: 80px">用户组</label>
                <div class="col">
                    <Dropdown v-model="selectedRoleId" :options="roles" option-label="role" option-value="id"
                        placeholder="选择用户组" class="w-full" :class="{ 'p-invalid': !selectedRoleId }" />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="取消" icon="pi pi-times" @click="roleDisplayDialog = false"
                    class="p-button-text text-gray-600 hover:bg-gray-100" />
                <Button label="确定" :loading="loading.role" icon="pi pi-check"
                    class="bg-blue-500 hover:bg-blue-600 border-blue-500" @click="assignRoleEvent"
                    @keyup.enter="assignRoleEvent" />
            </div>
        </template>
    </Dialog>
    <Dialog v-model:visible="addDialogVisible" header="新建用户" :style="{ width: '520px' }" :modal="true">
        <div class="p-fluid space-y-4">
            <!-- 用户名 -->
            <div class="field grid items-center">
                <label class="col-fixed font-medium text-gray-600" style="width: 90px">用户名 <span
                        class="text-red-500">*</span></label>
                <div class="col">
                    <InputText v-model="form.username" class="w-full" placeholder="输入学号"
                        :class="{ 'p-invalid': usernameError }" />
                    <small v-if="usernameError" class="p-error text-red-500">请输入学号</small>
                </div>
            </div>

            <!-- 密码 -->
            <div class="field grid items-center">
                <label class="col-fixed font-medium text-gray-600" style="width: 90px">密码 <span
                        class="text-red-500">*</span></label>
                <div class="col">
                    <InputText v-model="form.password" :feedback="false" toggleMask class="w-full"
                        :class="{ 'p-invalid': passwordError }" input-class="w-full" />
                    <small v-if="passwordError" class="p-error text-red-500">密码长度需6-20位</small>
                </div>
            </div>

            <!-- 昵称 -->
            <div class="field grid items-center">
                <label class="col-fixed font-medium text-gray-600" style="width: 90px">昵称 <span
                        class="text-red-500">*</span></label>
                <div class="col">
                    <InputText v-model="form.nickname" class="w-full" placeholder="输入显示名称"
                        :class="{ 'p-invalid': nicknameError }" />
                    <small v-if="nicknameError" class="p-error text-red-500">请输入用户昵称</small>
                </div>
            </div>

            <!-- 邮箱 -->
            <div class="field grid items-center">
                <label class="col-fixed font-medium text-gray-600" style="width: 90px">邮箱</label>
                <div class="col">
                    <InputText v-model="form.email" class="w-full" placeholder="example@stu.ujn.edu.cn" type="email" />
                </div>
            </div>

            <!-- 专业 -->
            <div class="field grid items-center">
                <label class="col-fixed font-medium text-gray-600" style="width: 90px">专业</label>
                <div class="col">
                    <InputText v-model="form.major" class="w-full" placeholder="输入专业全称" />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="取消" @click="addDialogVisible = false"
                    class="p-button-text text-gray-500 hover:bg-gray-100" />
                <Button label="创建用户" :loading="loading.add" class="bg-blue-500 hover:bg-blue-600 border-blue-500"
                    icon="pi pi-user-plus" @click="addUser" @keyup.enter="addUser" />
            </div>
        </template>
    </Dialog>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue';
import CustomToggleButton from '../contest/CustomToggleButton.vue';
import { type UserSpace, getAdminUserCount, getAdminUsers, getRoles, assignRole, updateUserInfo, createUser } from '@/admin/api/userAPI';
import globalMessage from '@/common/utils/toast';

const addDialogVisible = ref<boolean>(false);
const displayDialog = ref<boolean>(false);
const newPassword = ref<string>('ujn@12345');
const passwordDisplayDialog = ref<boolean>(false);
const roleDisplayDialog = ref<boolean>(false);
const isloading = ref<boolean>(true);
const pageLimit = 15;
const content = ref<string>('');
const first = ref<number>(0);
const totalRecords = ref<number>(0);
const users = ref<UserSpace.UserInfoVO[]>([]);
const selectedUser = ref<UserSpace.UserInfoVO>({
    id: 0,
    username: '',
    nickname: '',
    lastLogin: '',
    signedUp: '',
    status: false,
});
const form = reactive({
    username: '',
    password: 'ujn@12345',
    nickname: '',
    email: '',
    major: '',
});
const loading = reactive({
    add: false,
    edit: false,
    password: false,
    role: false,
});
const selectedRoleId = ref<number>(0);
const roles = ref<UserSpace.Role[]>([]);

// 验证逻辑保持相同
const usernameError = computed(() => !form.username.trim());
const passwordError = computed(() => form.password.length < 6 || form.password.length > 20);
const nicknameError = computed(() => !form.nickname.trim());
function onAddUser() {
    addDialogVisible.value = true;
}
function onEditNickname(user: UserSpace.UserInfoVO) {
    displayDialog.value = true;
    selectedUser.value = user;
}
function onEditPassword(user: UserSpace.UserInfoVO) {
    passwordDisplayDialog.value = true;
    selectedUser.value = user;
}
function onRoleAssign(user: UserSpace.UserInfoVO) {
    selectedRoleId.value = 0;
    loadRoles()
    roleDisplayDialog.value = true;
    selectedUser.value = user;
}
function onPage(event: { first: number }) {
    first.value = event.first;
    loadUsers();
}
function onSearch() {
    first.value = 0;
    loadUsers();
    loadUsersCount();
}
onMounted(() => {
    loadUsers();
    loadUsersCount();
});
async function addUser() {
    if (usernameError.value || passwordError.value || nicknameError.value) {
        return;
    }
    loading.add = true;
    await createUser(form).then(() => {
        globalMessage.success('操作成功', '用户创建成功');
        addDialogVisible.value = false;
        loading.add = false;
    }).catch(() => {
        globalMessage.error('操作失败', '用户创建失败');
        loading.add = false;
    });
}
async function updateUserEvent(type: string) {
    let dto: UserSpace.AdminUpdateUserDTO = {
        id: selectedUser.value.id,
        nickname: selectedUser.value.nickname,
        status: selectedUser.value.status,
    };
    if (type == 'password') {
        if (newPassword.value.length < 6) {
            globalMessage.error('操作失败', '密码长度需6位以上');
            return;
        }
        if (newPassword.value.length > 20) {
            globalMessage.error('操作失败', '密码长度需20位以下');
            return;
        }
        dto.password = newPassword.value;
        loading.password = true;
    } else if (type == 'edit') {
        loading.edit = true;
    }
    await updateUserInfo(dto).then(() => {
        globalMessage.success('操作成功', '用户信息更新成功');
        displayDialog.value = false;
        passwordDisplayDialog.value = false;
        loading.edit = false;
        loading.password = false;
    }).catch(() => {
        globalMessage.error('操作失败', '用户信息更新失败');
        loading.edit = false;
        loading.password = false;
    });
}
async function assignRoleEvent() {
    if (!selectedRoleId.value) {
        globalMessage.error('操作失败', '请选择用户组');
        return;
    }
    loading.role = true;
    await assignRole({ username: selectedUser.value.username, roleId: selectedRoleId.value }).then(() => {
        globalMessage.success('操作成功', '用户组分配成功');
        roleDisplayDialog.value = false;
        loading.role = false;
    }).catch(() => {
        globalMessage.error('操作失败', '用户组分配失败');
        loading.role = false;
    });
}
async function loadRoles() {
    await getRoles().then(res => {
        roles.value = res.data as UserSpace.Role[];
    }).catch(() => {
        globalMessage.error('加载数据失败', '获取用户组列表失败');
    });
}
async function updateStatus(user: UserSpace.UserInfoVO) {
    selectedUser.value = user;
    updateUserEvent('status');
}
async function loadUsers() {
    isloading.value = true;
    await getAdminUsers(first.value, pageLimit, content.value).then(res => {
        users.value = res.data as UserSpace.UserInfoVO[];
        // 将status取反
        users.value.forEach(user => {
            user.status = !user.status;
        });
        isloading.value = false;
    }).catch(() => {
        globalMessage.error('加载数据失败', '获取用户列表失败');
    });
}
async function loadUsersCount() {
    await getAdminUserCount(content.value).then(res => {
        totalRecords.value = res.data as number;
    }).catch(() => {
        globalMessage.error('加载数据失败', '获取用户总数失败');
    });
}
</script>
<style lang="css" scoped></style>