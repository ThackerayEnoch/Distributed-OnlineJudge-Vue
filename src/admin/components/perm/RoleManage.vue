<template>
    <ConfirmPopup></ConfirmPopup>
    <div class="rounded-sm mr-4">
        <DataTable v-model:selection="selectedRole" selectionMode="single" :metaKeySelection="false" dataKey="id"
            :value="roles" @rowSelect="onRowSelect" @rowUnselect="unRowSelect" stripedRows scrollable scrollHeight="30%"
            class="m-0 p-0">
            <template #header>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-surface-700 dark:text-surface-0">角色管理</span>
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
    <div class="mr-4 mt-6">
        <TreeTable :value="Roleperms">
            <template #header>
                <div class="flex justify-between items-center">
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-bold text-surface-700 dark:text-surface-0">权限列表</span>
                    </div>
                    <div class="flex items-center">
                        <Button label="添加权限" icon="pi pi-plus" class="p-button-sm p-button-outlined p-button-secondary"
                            @click="addDialogOpen" />
                    </div>
                </div>
            </template>
            <Column field="name" expander header="权限名"></Column>
            <Column field="description" header="描述"></Column>
            <Column field="code" header="权限字符串"></Column>
            <Column field="createTime" header="创建时间"></Column>
            <Column field="updateTime" header="更新时间"></Column>
        </TreeTable>

    </div>
    <Dialog v-model:visible="addDialogVisible" header="添加权限" width="70%" :modal="true" :closable="true">
        <DataTable v-model:selection="selectedPerm" selectionMode="multiple" :metaKeySelection="false" dataKey="id"
            :value="perms" :totalRecords="permTotal" stripedRows paginator :rows="10" sortField="perm" :sortOrder="1"
            class="m-0 p-0">
            <template #header>
                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        <MultiSelect v-model="seletedMenu" :options="permGroups" optionLabel="name" option-value="id"
                            filter placeholder="选择类别" @change="menuChange()" size="small" class="md:w-80 mr-4">
                        </MultiSelect>
                        <IconField>
                            <InputIcon @click="searchPerm()">
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText placeholder="权限搜索" v-model="searchContext2" @keyup.enter="searchPerm()" />
                        </IconField>
                    </div>
                </div>
            </template>
            <Column field="name" header="权限名"></Column>
            <Column field="description" header="描述">
                <template #body="slotProps">
                    <div class="truncate max-w-xs">
                        {{ slotProps.data.description }}
                    </div>
                </template>
            </Column>
            <Column field="perm" sortable header="权限字符串"></Column>
            <Column field="status" header="状态">
                <template #body="slotProps">
                    <span v-if="slotProps.data.status">启用</span>
                    <span v-else class="text-red-500">禁用</span>
                </template>
            </Column>
            <Column field="createTime" header="创建时间"></Column>
            <Column field="updateTime" header="修改时间"></Column>
            <template #footer>
                <div class="flex justify-end items-center">
                    <Button label="保存" icon="pi pi-save" class="p-button-sm" @click="saveRolePerms" />
                    <Button label="取消" icon="pi pi-times" class="ml-2 p-button-sm" severity="danger"
                        @click="addDialogVisible = false" />
                </div>
            </template>
        </DataTable>

    </Dialog>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getRoles, getRolePerms, updateRolePerms, type RoleSpace } from '@/admin/api/roleAPI';
import { getPerm, getPerms, getPermCount, type PermSpace } from '@/admin/api/permAPI';
import globalMessage from '@/common/utils/toast';

const roles = ref<RoleSpace.Role[]>([]);
const Roleperms = ref<RoleSpace.PermInRole[]>([]);
const selectedRole = ref<RoleSpace.Role>({
    id: 0,
    role: '',
    code: '',
    description: '',
    status: 0,
    createTime: '',
    updateTime: ''
});
const parentURL = ref([0]);
const permTotal = ref(0);
const seletedMenu = ref([]);
const selectedPerm = ref<RoleSpace.PermInRoleData[]>([]);
const searchContext2 = ref('');
const addDialogVisible = ref(false);
const perms = ref<PermSpace.PermObject[]>([]);
const permGroups = ref<PermSpace.PermObject[]>([]);
onMounted(() => {
    getRolesFun();
});
async function saveRolePerms() {
    let data: RoleSpace.RolePerm = {
        roleId: selectedRole.value.id,
        permIds: []
    };
    selectedPerm.value.forEach((item) => {
        if (item.id) {
            data.permIds.push(item.id);
        }
    });
    await updateRolePerms(data);
    globalMessage.success("角色", "更新成功");
}
async function addDialogOpen() {
    addDialogVisible.value = true;
    selectedPerm.value = JSON.parse(JSON.stringify(flattenPermInRole(Roleperms.value)));
    // load perm groups
    const res2 = await getPerms("MENU", [0]);
    permGroups.value = res2.data as unknown as PermSpace.PermObject[];
}
async function menuChange() {
    parentURL.value = [...seletedMenu.value];
    if (parentURL.value.length === 0) {
        perms.value = [];
    } else {
        // load perms
        const res = await getPerms("API", parentURL.value);
        perms.value = res.data as unknown as PermSpace.PermObject[];
        loadPermCount();
    }
}
async function searchPerm() {
    // search perm
    const res = await loadSearchPerm(searchContext2.value, "NAME");
    perms.value = [];
    if (res) {
        perms.value = res;
    } else {
        globalMessage.error("未找到权限", "请检查输入");
    }
}
async function loadSearchPerm(context: string, type: string): Promise<PermSpace.PermObject[]> {
    // load single perm
    const res = await getPerm(context, type);
    return res.data as unknown as PermSpace.PermObject[];
}
async function loadPermCount() {
    // load perm count
    const res = await getPermCount("API", parentURL.value);
    permTotal.value = res.data as number;
}
function onRowSelect() {
    getRolePermsFun();
}
function unRowSelect() {
    perms.value = [];
}
async function getRolesFun() {
    const res = await getRoles();
    roles.value = res.data as RoleSpace.Role[];
    if (roles.value.length > 0) {
        selectedRole.value = roles.value[0];
        getRolePermsFun();
    }
}
async function getRolePermsFun() {
    const res = await getRolePerms(selectedRole.value.id);
    Roleperms.value = res.data as RoleSpace.PermInRole[];
}
// 将 PermInRole 数组拆成 PermInRoleData 数组
function flattenPermInRole(roles: RoleSpace.PermInRole[]): RoleSpace.PermInRoleData[] {
    let result: RoleSpace.PermInRoleData[] = [];

    for (const role of roles) {
        // 将当前 role 的 data 添加到 result 中
        result.push(role.data);

        // 如果 role 有子节点，递归处理
        if (role.children && role.children.length > 0) {
            result = result.concat(flattenPermInRole(role.children));
        }
    }

    return result;
}
</script>
<style scoped></style>