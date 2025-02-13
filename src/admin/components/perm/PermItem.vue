<template>
    <ConfirmPopup></ConfirmPopup>
    <div class="rounded-sm mr-4">
        <DataTable :value="permGroups" stripedRows :first="menuFirst" :totalRecords="menuTotal" paginator :rows="5"
            class="m-0 p-0">
            <template #header>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-surface-700 dark:text-surface-0">权限类别管理</span>
                    <div class="flex items-center">
                        <IconField>
                            <InputIcon @click="searchPermGroup()">
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText placeholder="权限类别名搜索" v-model="searchContext1" class="mr-4"
                                @keyup.enter="searchPermGroup()" />
                        </IconField>
                        <Button label="添加权限类别" icon="pi pi-plus"
                            class="p-button-sm p-button-outlined p-button-secondary"
                            @click="createPermGroupDialogVisible = true" />
                    </div>
                </div>
            </template>
            <Column field="name" header="权限类别名"></Column>
            <Column field="description" header="描述">
                <template #body="slotProps">
                    <div class="truncate max-w-xs">
                        {{ slotProps.data.description }}
                    </div>
                </template>
            </Column>
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
                    <button @click="deleteMenuConfirm($event, slotProps.data)"
                        class="bg-secondary ml-2 text-xs p-1 rounded-full">
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
                    <span class="col-span-2 text-gray-900">{{ selectedPermGroup?.name }}</span>

                    <label class="font-semibold text-gray-700">描述:</label>
                    <span class="col-span-2 text-gray-900">{{ selectedPermGroup?.description }}</span>

                    <label class="font-semibold text-gray-700">创建时间:</label>
                    <span class="col-span-2 text-gray-600">{{ selectedPermGroup?.createTime }}</span>

                    <label class="font-semibold text-gray-700">修改时间:</label>
                    <span class="col-span-2 text-gray-600">{{ selectedPermGroup?.updateTime }}</span>
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
                    <Button label="保存" severity="primary" @click="saveMenuConfirm($event)" />
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
                    <Button label="创建" severity="primary" @click="addPermMenuEvent()" />
                </div>
            </template>
        </Dialog>
    </div>
    <div class="rounded-sm mt-5 mr-4">
        <DataTable :value="perms" :totalRecords="permTotal" stripedRows paginator :rows="10" sortField="perm"
            :sortOrder="1" class="m-0 p-0">
            <template #header>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-surface-700 dark:text-surface-0">权限管理</span>
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
                        <Button label="添加权限" icon="pi pi-plus" class="p-button-sm p-button-outlined p-button-secondary"
                            @click="createDialogVisible = true" />
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
            <Column header="操作">
                <template #body="slotProps">
                    <button @click="showViewDialog(slotProps.data)" class="bg-secondary text-xs p-1 rounded-full">
                        <i class="pi pi-eye"></i>
                    </button>
                    <button @click="showEditDialog(slotProps.data)" class="bg-secondary ml-2 text-xs p-1 rounded-full">
                        <i class="pi pi-pencil"></i>
                    </button>
                    <button @click="deleteConfirm($event, slotProps.data)"
                        class="bg-secondary ml-2 text-xs p-1 rounded-full">
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
                    <span class="col-span-2 text-gray-900">{{ selectedPerm?.name }}</span>

                    <label class="font-semibold text-gray-700">权限串:</label>
                    <span class="col-span-2 text-gray-900">{{ selectedPerm?.perm }}</span>

                    <label class="font-semibold text-gray-700">状态:</label>
                    <span class="col-span-2 text-gray-900">{{ selectedPerm?.type }}</span>

                    <label class="font-semibold text-gray-700">描述:</label>
                    <span class="col-span-2 text-gray-900">{{ selectedPerm?.description }}</span>

                    <label class="font-semibold text-gray-700">创建时间:</label>
                    <span class="col-span-2 text-gray-600">{{ selectedPerm?.createTime }}</span>

                    <label class="font-semibold text-gray-700">修改时间:</label>
                    <span class="col-span-2 text-gray-600">{{ selectedPerm?.updateTime }}</span>
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
                    <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="label" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">描述:</label>
                    <InputText v-model="selectedPerm.description" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">创建时间:</label>
                    <span class="text-gray-600">{{ selectedPerm?.createTime }}</span>
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">修改时间:</label>
                    <span class="text-gray-600">{{ selectedPerm?.updateTime }}</span>
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
                    <InputText v-model="newPermData.name" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">权限串:</label>
                    <InputText v-model="newPermData.perm" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">隶属菜单:</label>
                    <Select v-model="newPermData.parentId" :options="permGroups" option-label="name" option-value="id"
                        placeholder="请选择隶属菜单" class="w-full md:w-56" />
                </div>
                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">状态:</label>
                    <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="label" class="w-full" />
                </div>

                <div class="flex items-center space-x-2">
                    <label class="font-semibold w-24">描述:</label>
                    <InputText v-model="newPermData.description" class="w-full" />
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end space-x-2 p-2">
                    <Button label="取消" severity="secondary" @click="createDialogVisible = false" />
                    <Button label="创建" severity="primary" @click="addPermEvent()" />
                </div>
            </template>
        </Dialog>
    </div>

</template>
<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { getPermCount, getPerm, getPerms, updatePerm, deletePerm, addPerm, type PermSpace } from '@/admin/api/permAPI'
import globalMessage from '@/common/utils/toast';
const confirm = useConfirm();
const viewDialogVisible = ref(false);
const editDialogVisible = ref(false);
const createDialogVisible = ref(false);
const viewPermGroupDialogVisible = ref(false);
const editPermGroupDialogVisible = ref(false);
const createPermGroupDialogVisible = ref(false);

const parentURL = ref([0]);
const permTotal = ref(0);
const menuFirst = ref(0);
const menuTotal = ref(0);

const statusOptions = ref([
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 }
]);
const newPermData = reactive<PermSpace.newPermObject>({
    name: '',
    perm: '',
    type: 'API',
    status: true,
    description: '', // 可选字段提供默认值
    parentId: 0, // 可选字段提供默认值
});
const newPermGroup = reactive<PermSpace.newPermObject>({
    name: '',
    perm: '',
    type: 'MENU',
    status: true,
    description: '',
    parentId: 0,
});
const searchContext1 = ref('');
const searchContext2 = ref('');
const perms = ref<PermSpace.PermObject[]>([]);
const permGroups = ref<PermSpace.PermObject[]>([]);
const selectedStatus = ref(statusOptions.value[0])
const seletedMenu = ref<number[]>([]);
const selectedPerm = reactive<PermSpace.PermObject>({
    id: 0,
    name: '',
    description: '',
    perm: '',
    type: '',
    parentId: 0,
    status: false,
    createTime: new Date(),
    updateTime: new Date(),
});

const selectedPermGroup = reactive<PermSpace.PermObject>({
    id: 0,
    name: '',
    description: '',
    perm: '',
    type: '',
    parentId: 0,
    status: false,
    createTime: new Date(),
    updateTime: new Date(),
});

function menuChange() {
    parentURL.value = [...seletedMenu.value];
    if (parentURL.value.length === 0) {
        perms.value = [];
    } else {
        loadPerms();
        loadPermCount();
    }
}
onMounted(() => {
    loadPerms();
    loadPermMenus();
    loadPermCount();
    loadMenuCount();
});
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
async function searchPermGroup() {
    // search perm group
    const res = await loadSearchPerm(searchContext1.value, "NAME");
    permGroups.value = [];
    if (res) {
        permGroups.value = res;
    } else {
        globalMessage.error("未找到权限类别", "请检查输入");
    }
}
async function loadSearchPerm(context: string, type: string): Promise<PermSpace.PermObject[]> {
    // load single perm
    const res = await getPerm(context, type);
    return res.data as unknown as PermSpace.PermObject[];
}
async function loadPerms() {
    // load perms
    const res = await getPerms("API", parentURL.value);
    perms.value = res.data as unknown as PermSpace.PermObject[];
}
async function loadPermCount() {
    // load perm count
    const res = await getPermCount("API", parentURL.value);
    permTotal.value = res.data as number;
}
async function loadMenuCount() {
    // load menus
    const res = await getPermCount("MENU", [0]);
    menuTotal.value = res.data as number;
}
async function loadPermMenus() {
    // load perm groups
    const res = await getPerms("MENU", [0]);
    permGroups.value = res.data as unknown as PermSpace.PermObject[];
}
async function addPermEvent() {
    // add perm
    newPermData.status = selectedStatus.value.value === 1;
    const res = await addPerm(newPermData);
    const newPerm = await loadSearchPerm(newPermData.perm, "PERM");
    perms.value.push(newPerm[0]);
    createDialogVisible.value = false;
    globalMessage.success("添加成功", res.data as unknown as string);
}
async function updatePermEvent() {
    // update perm
    selectedPerm.status = selectedStatus.value.value === 1;
    const res = await updatePerm(selectedPerm);
    perms.value = perms.value.map((perm) => {
        if (perm.id === selectedPerm.id) {
            return selectedPerm;
        }
        return perm;
    });
    selectedPerm.status = selectedStatus.value.value === 1;
    globalMessage.success("更新成功", res.data as unknown as string);
}
async function deletePermEvent(id: number) {
    // delete perm
    const res = await deletePerm(id);
    perms.value = perms.value.filter((perm) => perm.id !== id);
    globalMessage.success("删除成功", res.data as unknown as string);
}
async function addPermMenuEvent() {
    // add perm
    const res = await addPerm(newPermGroup);
    const newPerm = await loadSearchPerm(newPermGroup.name, "NAME");
    permGroups.value.push(newPerm[0]);
    createPermGroupDialogVisible.value = false
    globalMessage.success("添加成功", res.data as unknown as string);
}
async function updatePermMenuEvent() {
    // update perm
    const res = await updatePerm(selectedPermGroup);
    permGroups.value = permGroups.value.map((perm) => {
        if (perm.id === selectedPermGroup.id) {
            return selectedPermGroup;
        }
        return perm;
    });
    globalMessage.success("更新成功", res.data as unknown as string);
}
async function deletePermMenuEvent(id: number) {
    // delete perm
    const res = await deletePerm(id);
    permGroups.value = permGroups.value.filter((perm) => perm.id !== id);
    globalMessage.success("删除成功", res.data as unknown as string);
}

function showViewDialog(perm: PermSpace.PermObject) {
    Object.assign(selectedPerm, perm); // 浅拷贝
    viewDialogVisible.value = true;
}

function showEditDialog(perm: PermSpace.PermObject) {
    Object.assign(selectedPerm, JSON.parse(JSON.stringify(perm))); // 深拷贝
    editDialogVisible.value = true;
}
function showViewPermGroupDialog(permGroup: PermSpace.PermObject) {
    Object.assign(selectedPermGroup, JSON.parse(JSON.stringify(permGroup))); // 深拷贝
    viewPermGroupDialogVisible.value = true;
}
function showEditPermGroupDialog(permGroup: PermSpace.PermObject) {
    Object.assign(selectedPermGroup, JSON.parse(JSON.stringify(permGroup))); // 深拷贝
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
            updatePermEvent();
        },
        reject: () => {
            //reject action
            editDialogVisible.value = false;
        }
    });
};
const saveMenuConfirm = (event: any) => {
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
            editPermGroupDialogVisible.value = false;
            updatePermMenuEvent();
        },
        reject: () => {
            //reject action
            editPermGroupDialogVisible.value = false;
        }
    });
};
const deleteConfirm = (event: any, slotProps: any) => {
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
            deletePermEvent(slotProps.id);
        },
        reject: () => {
            //reject action
        }
    });
};
const deleteMenuConfirm = (event: any, slotProps: any) => {
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
            deletePermMenuEvent(slotProps.id);
        },
        reject: () => {
            //reject action
        }
    });
};
</script>
<style scoped></style>