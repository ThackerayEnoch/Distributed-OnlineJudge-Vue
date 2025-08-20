<template>
    <div class="rounded-sm mr-4">
        <DataTable v-model:selection="selectedRole" selectionMode="single" :metaKeySelection="false" dataKey="id"
            :value="roles" @rowSelect="onRowSelect" @rowUnselect="unRowSelect" stripedRows scrollable scrollHeight="30%"
            class="m-0 p-0">
            <template #header>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-surface-700 dark:text-surface-0">角色列表</span>
                </div>
            </template>
            <Column field="role" header="角色名"></Column>
            <Column field="description" header="描述">
                <template #body="slotProps">
                    <div class="truncate max-w-xs">
                        {{ slotProps.data.description }}
                    </div>
                </template>
            </Column>
            <Column field="code" header="角色字符串"></Column>
            <Column field="createTime" header="创建时间"></Column>
            <Column field="updateTime" header="更新时间"></Column>
        </DataTable>
    </div>
    <div class="mt-6 mr-4">

    </div>
    <div class="mt-6 mr-4">
        <DataTable :value="users" :totalRecords="totalRecords" lazy :first="first" @page="onPage" stripedRows paginator
            :rows="10" responsiveLayout="scroll">
            <template #header>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-surface-700 dark:text-surface-0">用户角色管理</span>
                    <div class="flex items-center">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText placeholder="用户名搜索" v-model="searchContext" class="mr-4" />
                        </IconField>
                        <Button label="添加用户" icon="pi pi-plus" class="p-button-sm p-button-outlined p-button-secondary"
                            @click="AddUserFun" />
                    </div>
                </div>
            </template>
            <Column field="username" header="用户名"></Column>
            <Column field="nickname" header="昵称"></Column>
            <Column field="status" header="状态">
                <template #body="slotProps">
                    <span v-if="!slotProps.data.status" class="text-green-500">正常</span>
                    <span v-else class="text-red-500">禁用</span>
                </template>
            </Column>
            <Column field="createTime" header="创建时间"></Column>
            <Column field="updateTime" header="更新时间"></Column>
            <Column header="操作">
                <template #body="slotProps">
                    <button class="bg-secondary ml-2 text-xs p-1 rounded-full"
                        @click="deleteUserFun(selectedRole.id, slotProps.data.id)">
                        <i class="pi pi-trash"></i>
                    </button>
                </template>
            </Column>
        </DataTable>
    </div>
    <Dialog v-model:visible="addVisible" header="分配用户" width="30%" :closable="true">
        <div class="flex items-center gap-4 mb-4">
            <label for="username" class="font-semibold w-24">用户名</label>
            <InputText v-model="newUser.username" class="flex-auto" autocomplete="off" />
        </div>
        <div class="flex items-center gap-4 mb-8">
            <label for="email" class="font-semibold w-24">Email</label>
            <Select v-model="newUser.roleId" :options="roles" optionLabel="role" optionValue="id" placeholder="请选择角色"
                class="flex-auto" />
        </div>
        <div class="flex justify-end gap-2">
            <Button type="button" label="取消" severity="secondary" @click="addVisible = false"></Button>
            <Button type="button" label="确认" @click="assignUser"></Button>
        </div>
    </Dialog>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRoles, type RoleSpace } from '@/admin/api/roleAPI';
import { getRoleUsers, addUser, getUserCount, deleteUser, type UserSpace } from '@/admin/api/assignAPI';
import globalMessage from '@/common/utils/toast';
import { APIError } from '@/common/entity/exception/APIException';

const addVisible = ref(false)
const selectedRole = ref<RoleSpace.Role>({
    id: 0,
    role: '',
    code: '',
    description: '',
    status: 0,
    createTime: '',
    updateTime: ''
})
const totalRecords = ref(0)
const first = ref(0)
const searchContext = ref('')
const roles = ref<RoleSpace.Role[]>([])
const users = ref<UserSpace.User[]>([])
const newUser = ref({
    username: '',
    roleId: 0
})
function assignUser() {
    addUserFun(selectedRole.value.id, newUser.value.username);
    addVisible.value = false;
}
function onRowSelect() {
    loadUsers();
    getUsersCount();
}
function unRowSelect() {
    users.value = [];
    totalRecords.value = 0;
    first.value = 0;
}
function onPage(event: { first: number }) {
    first.value = event.first;
    loadUsers();
}
async function init() {
    await getRoles().then(res => {
        roles.value = res.data as RoleSpace.Role[];
        if (roles.value.length > 0) {
            selectedRole.value = roles.value[0];
            loadUsers();
        }
    }).catch((e: APIError) => {
        globalMessage.error("加载角色列表失败", e.message);
    })
}
async function loadUsers() {
    await getRoleUsers(selectedRole.value.id, first.value).then(res => {
        users.value = res.data as UserSpace.User[];
    }).catch((e: APIError) => {
        globalMessage.error("加载角色用户失败", e.message);
    })

}
async function getUsersCount() {
    await getUserCount(selectedRole.value.id).then(res => {
        totalRecords.value = res.data as number;
    }).catch((e: APIError) => {
        globalMessage.error("加载用户数量失败", e.message);
    })

}
async function deleteUserFun(roleId: number, userId: number) {
    await deleteUser({ userId, roleId }).then(() => {
        globalMessage.success("删除成功", "删除用户成功");
        users.value = users.value.filter(user => user.id !== userId);
    }).catch((e: APIError) => {
        globalMessage.error("删除用户失败", e.message);
    })
}
async function addUserFun(roleId: number, username: string) {
    await addUser(roleId, username).then(() => {
        globalMessage.success("分配成功", "添加用户成功");
        loadUsers();
    }).catch((e: APIError) => {
        globalMessage.error("添加用户失败", e.message);
    })
}
onMounted(() => {
    init();
})
function AddUserFun() {
    addVisible.value = true;
}
</script>
<style scoped></style>