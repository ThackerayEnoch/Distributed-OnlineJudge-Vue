<template>
    <ConfirmPopup></ConfirmPopup>
    <div class="rounded-sm mr-4">
        <DataTable :value="permGroups" stripedRows paginator :rows="20" class="m-0 p-0">
            <template #header>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-surface-700 dark:text-surface-0">权限类别管理</span>
                    <div class="flex items-center">
                        <InputText placeholder="权限类别搜索" class="mr-4" />
                        <Button label="添加权限类别" icon="pi pi-plus"
                            class="p-button-sm p-button-outlined p-button-secondary"
                            @click="createPermGroupDialogVisible = true" />
                    </div>
                </div>
            </template>
            <Column field="name" header="权限类别名"></Column>
            <Column field="description" header="描述"></Column>
            <Column field="createTime" header="创建时间"></Column>
            <Column field="updateTime" header="修改时间"></Column>
            <Column header="操作">
                <template #body="slotProps">
                    <button @click="showViewPermGroupDialog(slotProps.data)"
                        class="bg-secondary text-xs p-1 rounded-full">
                        <i class="pi pi-eye"></i>
                    </button>
                    <button @click="showEditPermGroupDialog(slotProps.data)"
                        class="bg-secondary ml-2 text-xs p-1 rounded-full">
                        <i class="pi pi-pencil"></i>
                    </button>
                    <button @click="deleteConfirm($event)" class="bg-secondary ml-2 text-xs p-1 rounded-full">
                        <i class="pi pi-trash"></i>
                    </button>
                </template>
            </Column>
        </DataTable>

        <Dialog header="查看权限类别" v-model:visible="viewPermGroupDialogVisible" :modal="true" :closable="true"
            class="w-[400px] md:w-[500px] rounded-xl">
            <div class="p-4 space-y-3">
                <div class="grid grid-cols-3 gap-2">
                    <label class="font-semibold text-gray-700">权限类别名:</label>
                    <span class="col-span-2 text-gray-900">{{ selectedPermGroup.name }}</span>

                    <label class="font-semibold text-gray-700">描述:</label>
                    <span class="col-span-2 text-gray-900">{{ selectedPermGroup.description }}</span>

                    <label class="font-semibold text-gray-700">创建时间:</label>
                    <span class="col-span-2 text-gray-600">{{ selectedPermGroup.createTime }}</span>

                    <label class="font-semibold text-gray-700">修改时间:</label>
                    <span class="col-span-2 text-gray-600">{{ selectedPermGroup.updateTime }}</span>
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end space-x-2 p-2">
                    <Button label="关闭" severity="secondary" @click="viewPermGroupDialogVisible = false" />
                </div>
            </template>
        </Dialog>

        <Dialog header="修改权限类别" v-model:visible="editPermGroupDialogVisible" :modal="true" :closable="true"
            class="w-[400px] md:w-[500px] rounded-xl">
            <div class="p-4 space-y-4">
                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">权限类别名:</label>
                    <InputText v-model="selectedPermGroup.name" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">描述:</label>
                    <InputText v-model="selectedPermGroup.description" class="w-full" />
                </div>
            </div>
            <template #footer>
                <div class="flex justify-end space-x-2 p-2">
                    <Button label="取消" severity="secondary" @click="editPermGroupDialogVisible = false" />
                    <Button label="保存" severity="primary" @click="saveConfirm($event)" />
                </div>
            </template>
        </Dialog>
        <Dialog header="新建权限类别" v-model:visible="createPermGroupDialogVisible" :modal="true" :closable="true"
            class="w-[400px] md:w-[500px] rounded-xl">
            <div class="p-4 space-y-4">
                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">类别名:</label>
                    <InputText v-model="newPermGroup.name" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">描述:</label>
                    <InputText v-model="newPermGroup.description" class="w-full" />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end space-x-2 p-2">
                    <Button label="取消" severity="secondary" @click="createPermGroupDialogVisible = false" />
                    <Button label="创建" severity="primary" />
                </div>
            </template>
        </Dialog>
    </div>
    <div class="rounded-sm mt-8 mr-4">
        <DataTable :value="perms" stripedRows paginator :rows="20" class="m-0 p-0">
            <template #header>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-surface-700 dark:text-surface-0">权限管理</span>
                    <div class="flex items-center">
                        <MultiSelect v-model="selectedMenu" :options="menus" optionLabel="name" filter
                            placeholder="选择类别" size="small" class="md:w-80 mr-4">
                        </MultiSelect>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText placeholder="权限搜索" />
                        </IconField>
                        <Button label="添加权限" icon="pi pi-plus" class="p-button-sm p-button-outlined p-button-secondary"
                            @click="createDialogVisible = true" />
                    </div>
                </div>
            </template>
            <Column field="name" header="权限名"></Column>
            <Column field="perm" header="权限字符串"></Column>
            <Column field="type" header="状态"></Column>
            <Column field="createTime" header="创建时间"></Column>
            <Column field="updateTime" header="修改时间"></Column>
            <Column header="操作">
                <template #body="slotProps">
                    <button @click="showViewDialog(slotProps.data)" class="bg-secondary text-xs p-1 rounded-full">
                        <i class="pi pi-eye"></i>
                    </button>
                    <button @click="showEditDialog(slotProps.data)" class="bg-secondary ml-2 text-xs p-1 rounded-full">
                        <i class="pi pi-pencil"></i>
                    </button>
                    <button @click="deleteConfirm($event)" class="bg-secondary ml-2 text-xs p-1 rounded-full">
                        <i class="pi pi-trash"></i>
                    </button>
                </template>
            </Column>
        </DataTable>
        <Dialog header="查看权限" v-model:visible="viewDialogVisible" :modal="true" :closable="true"
            class="w-[400px] md:w-[500px] rounded-xl">
            <div class="p-4 space-y-3">
                <div class="grid grid-cols-3 gap-2">
                    <label class="font-semibold text-gray-700">权限名:</label>
                    <span class="col-span-2 text-gray-900">{{ selectedPerm.name }}</span>

                    <label class="font-semibold text-gray-700">权限串:</label>
                    <span class="col-span-2 text-gray-900">{{ selectedPerm.perm }}</span>

                    <label class="font-semibold text-gray-700">状态:</label>
                    <span class="col-span-2 text-gray-900">{{ selectedPerm.type }}</span>

                    <label class="font-semibold text-gray-700">描述:</label>
                    <span class="col-span-2 text-gray-900">{{ selectedPerm.description }}</span>

                    <label class="font-semibold text-gray-700">创建时间:</label>
                    <span class="col-span-2 text-gray-600">{{ selectedPerm.createTime }}</span>

                    <label class="font-semibold text-gray-700">修改时间:</label>
                    <span class="col-span-2 text-gray-600">{{ selectedPerm.updateTime }}</span>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end space-x-2 p-2">
                    <Button label="关闭" severity="secondary" @click="viewDialogVisible = false" />
                </div>
            </template>
        </Dialog>

        <Dialog header="修改权限" v-model:visible="editDialogVisible" :modal="true" :closable="true"
            class="w-[400px] md:w-[500px] rounded-xl">
            <div class="p-4 space-y-4">
                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">权限名:</label>
                    <InputText v-model="selectedPerm.name" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">权限串:</label>
                    <InputText v-model="selectedPerm.perm" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">状态:</label>
                    <Dropdown v-model="selectedPerm.type" :options="statusOptions" optionLabel="label" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">描述:</label>
                    <InputText v-model="selectedPerm.description" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">创建时间:</label>
                    <span class="text-gray-600">{{ selectedPerm.createTime }}</span>
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">修改时间:</label>
                    <span class="text-gray-600">{{ selectedPerm.updateTime }}</span>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end space-x-2 p-2">
                    <Button label="取消" severity="secondary" @click="editDialogVisible = false" />
                    <Button label="保存" severity="primary" @click="saveConfirm($event)" />
                </div>
            </template>
        </Dialog>
        <Dialog header="新建权限" v-model:visible="createDialogVisible" :modal="true" :closable="true"
            class="w-[400px] md:w-[500px] rounded-xl">
            <div class="p-4 space-y-4">
                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">权限名:</label>
                    <InputText v-model="newPerm.name" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">权限串:</label>
                    <InputText v-model="newPerm.perm" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">状态:</label>
                    <Dropdown v-model="newPerm.type" :options="statusOptions" optionLabel="label" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">描述:</label>
                    <InputText v-model="newPerm.description" class="w-full" />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end space-x-2 p-2">
                    <Button label="取消" severity="secondary" @click="createDialogVisible = false" />
                    <Button label="创建" severity="primary" />
                </div>
            </template>
        </Dialog>
    </div>

</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useConfirm } from "primevue/useconfirm";
const confirm = useConfirm();
const viewDialogVisible = ref(false);
const editDialogVisible = ref(false);
const createDialogVisible = ref(false);
const viewPermGroupDialogVisible = ref(false);
const editPermGroupDialogVisible = ref(false);
const createPermGroupDialogVisible = ref(false);
const statusOptions = ref([
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 }
]);
interface Perm {
    name: string;
    perm: string;
    type: string;
    description: string;
    createTime: string;
    updateTime: string;
}
interface PermGroup {
    name: string;
    description: string;
    createTime: string;
    updateTime: string;
}
const newPerm = ref<Perm>({
    name: '',
    perm: '',
    type: '',
    description: '',
    createTime: '',
    updateTime: '',
});
const newPermGroup = ref<PermGroup>({
    name: '',
    description: '',
    createTime: '',
    updateTime: '',
});

const perms = ref([
    {
        name: '查看用户',
        perm: 'user:view',
        type: '启用',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
    {
        name: '添加用户',
        perm: 'user:add',
        type: '启用',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
    {
        name: '删除用户',
        perm: 'user:delete',
        type: '启用',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
    {
        name: '修改用户',
        perm: 'user:update',
        type: '启用',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
    {
        name: '查看角色',
        perm: 'role:view',
        type: '启用',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
    {
        name: '添加角色',
        perm: 'role:add',
        type: '启用',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
    {
        name: '删除角色',
        perm: 'role:delete',
        type: '启用',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
    {
        name: '修改角色',
        perm: 'role:update',
        type: '启用',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
]);
const permGroups = ref([
    {
        name: '管理员',
        description: '系统管理员',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
    {
        name: '教师',
        description: '教师角色',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
    {
        name: '学生',
        description: '学生角色',
        createTime: '2021-10-01',
        updateTime: '2021-10-01',
    },
]);
const selectedMenu = ref(0);
const menus = ref([
    { name: 'New York', code: 0 },
    { name: 'Rome', code: 1 },
    { name: 'London', code: 2 },
    { name: 'Istanbul', code: 3 },
    { name: 'Paris', code: 4 }
]);

const selectedPerm = ref<Perm>(
    {
        name: '',
        perm: '',
        type: '',
        description: '',
        createTime: '',
        updateTime: '',
    }
);
const selectedPermGroup = ref({
    name: '',
    description: '',
    createTime: '',
    updateTime: '',
});

function showViewDialog(perm: Perm) {
    selectedPerm.value = perm;
    viewDialogVisible.value = true;
}

function showEditDialog(perm: Perm) {
    selectedPerm.value = perm;
    editDialogVisible.value = true;
}
function showViewPermGroupDialog(permGroup: PermGroup) {
    selectedPermGroup.value = permGroup;
    viewPermGroupDialogVisible.value = true;
}
function showEditPermGroupDialog(permGroup: PermGroup) {
    selectedPermGroup.value = permGroup;
    editPermGroupDialogVisible.value = true;
}
const saveConfirm = (event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: '确定修改？',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: '取消',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: '保存',
            severity: 'danger'
        },
        accept: () => {
            //API call to save
            editDialogVisible.value = false;
        },
        reject: () => {
            //reject action
            editDialogVisible.value = false;
        }
    });
};
const deleteConfirm = (event: any) => {
    confirm.require({
        target: event.currentTarget,
        message: '确定删除？',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: '取消',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: '删除',
            severity: 'danger'
        },
        accept: () => {
            //API call to save
        },
        reject: () => {
            //reject action
        }
    });
};
</script>
<style scoped></style>