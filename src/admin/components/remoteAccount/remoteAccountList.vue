<template>
    <div class="bg-white dark:bg-gray-800 mt-1 ml-2 mr-2 p-4 rounded-none shadow-md">
        <div id="functionArea">
            <!-- 页面标题 -->
            <div class="p-4 space-x-4 flex items-center">
                <h2 class="text-2xl font-bold text-blue-500">远程账号管理</h2>
            </div>

            <!-- 操作栏 -->
            <div class="flex items-center space-x-5 p-4">
                <!-- 按钮：新建账号 -->
                <Button @click="showAddDialog" icon="pi pi-plus" label="新建账号" severity="info" />

                <!-- OJ筛选 -->
                <Select v-model="filters.oj" :options="ojOptions" optionLabel="label" optionValue="value"
                    placeholder="选择OJ" class="w-32" @change="onFilterChange" />

                <!-- 用户名搜索 -->
                <span class="relative">
                    <InputText placeholder="搜索用户名" v-model="filters.username"
                        class="p-2 w-64 rounded-md border border-gray-300" @keyup.enter="onFilterChange" />
                    <i @click="onFilterChange"
                        class="pi pi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"></i>
                </span>

                <!-- 启用状态筛选 -->
                <Select v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value"
                    placeholder="启用状态" class="w-32" @change="onFilterChange" />

                <!-- 私有状态筛选 -->
                <Select v-model="filters.privateStatus" :options="privateOptions" optionLabel="label"
                    optionValue="value" placeholder="私有状态" class="w-32" @change="onFilterChange" />

                <!-- 重置筛选 -->
                <Button @click="resetFilters" icon="pi pi-refresh" label="重置" severity="secondary" />
            </div>
        </div>

        <div class="border-b border-gray-300 dark:border-gray-700 p-0 m-0 mb-4" />

        <!-- 数据表格 -->
        <div id="tableArea">
            <DataTable :value="accounts" stripedRows size="large" :paginator="true" :rows="PAGE_SIZE" lazy
                :first="first" :totalRecords="totalRecords" @page="onPage" tableClass="text-sm p-4" :loading="loading"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="显示 {first} 到 {last} 条，共 {totalRecords} 条">
                <Column field="id" header="ID" style="width: 80px"></Column>
                <Column field="oj" header="OJ平台" style="width: 120px">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.oj"
                            :class="slotProps.data.oj === 'HDU' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'" />
                    </template>
                </Column>
                <Column field="username" header="用户名" style="width: 180px"></Column>
                <Column field="status" header="判题状态" style="width: 120px">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.status ? '空闲' : '判题中'"
                            :severity="slotProps.data.status ? 'success' : 'danger'" />
                    </template>
                </Column>
                <Column field="isValid" header="可用状态" style="width: 120px">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.isValid ? '可用' : '不可用'"
                            :severity="slotProps.data.isValid ? 'success' : 'warning'" />
                    </template>
                </Column>
                <Column field="isPrivate" header="私有状态" style="width: 100px">
                    <template #body="slotProps">
                        <div class="flex items-center">
                            <i :class="slotProps.data.isPrivate ? 'pi pi-lock text-red-500' : 'pi pi-globe text-green-500'"
                                v-tooltip.top="slotProps.data.isPrivate ? '私有账号' : '公共账号'"></i>
                            <span class="ml-2 text-sm">{{ slotProps.data.isPrivate ? '私有' : '公共' }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="creator" header="创建者" style="width: 120px"></Column>
                <Column field="createTime" header="创建时间" style="width: 160px"></Column>
                <Column header="操作" style="width: 180px">
                    <template #body="{ data }">
                        <div class="flex space-x-2">
                            <Button @click="showEditDialog(data)" icon="pi pi-pencil" size="small" v-tooltip.top="'编辑'"
                                severity="info" />
                            <Button @click="testAccount(data)" icon="pi pi-check-circle" size="small"
                                v-tooltip.top="'测试连接'" severity="success" :loading="testing[data.id]" />
                            <Button @click="confirmDelete(data)" icon="pi pi-trash" size="small" v-tooltip.top="'删除'"
                                severity="danger" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- 新建/编辑账号对话框 -->
        <Dialog v-model:visible="showDialog" :modal="true" :header="dialogMode === 'add' ? '新建远程账号' : '编辑远程账号'"
            :style="{ width: '500px' }" :closable="true" @hide="resetForm">
            <div class="space-y-4 pt-4">
                <!-- OJ平台选择 -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                        <span class="text-red-500">*</span> OJ平台
                    </label>
                    <Select v-model="form.oj" :options="ojFormOptions" optionLabel="label" optionValue="value"
                        placeholder="请选择OJ平台" class="w-full" :class="{ 'p-invalid': errors.oj }" />
                    <small v-if="errors.oj" class="text-red-500">{{ errors.oj }}</small>
                </div>

                <!-- 用户名 -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                        <span class="text-red-500">*</span> 用户名
                    </label>
                    <InputText v-model="form.username" placeholder="请输入用户名" class="w-full"
                        :class="{ 'p-invalid': errors.username }" />
                    <small v-if="errors.username" class="text-red-500">{{ errors.username }}</small>
                </div>

                <!-- 密码 -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">
                        <span class="text-red-500">*</span>
                        {{ dialogMode === 'add' ? '密码' : '新密码' }}
                    </label>
                    <Password v-model="form.password" :placeholder="dialogMode === 'add' ? '请输入密码' : '请输入新密码（留空则不修改）'"
                        class="w-full" :class="{ 'p-invalid': errors.password }" :feedback="false" toggleMask />
                    <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
                    <small v-if="dialogMode === 'edit'" class="text-gray-500">留空则保持原密码不变</small>
                </div>

                <!-- 状态设置 -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">启用状态</label>
                        <ToggleSwitch v-model="form.isValid" />
                        <small class="text-gray-500">{{ form.isValid ? '启用' : '禁用' }}</small>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">私有账号</label>
                        <ToggleSwitch v-model="form.isPrivate" />
                        <small class="text-gray-500">{{ form.isPrivate ? '私有' : '公共' }}</small>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end space-x-3 pt-4">
                    <Button label="取消" severity="secondary" @click="showDialog = false" />
                    <Button :label="dialogMode === 'add' ? '创建' : '更新'" @click="submitForm" :loading="submitting"
                        :disabled="submitting" />
                </div>
            </template>
        </Dialog>

        <!-- 删除确认对话框 -->
        <ConfirmDialog />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import globalMessage from '@/common/utils/toast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import ToggleSwitch from 'primevue/toggleswitch';
import ConfirmDialog from 'primevue/confirmdialog';

// 导入API
import type { RemoteAccountSpace } from '@/admin/api/remoteAccountAPI';
import {
    getAdminRemoteJudgeAccounts,
    getAdminRemoteJudgeAccountsCount,
    createRemoteJudgeAccount,
    updateRemoteJudgeAccount,
    deleteRemoteJudgeAccount,
    testRemoteJudgeAccount
} from '@/admin/api/remoteAccountAPI';

// 使用API接口类型
type RemoteAccount = RemoteAccountSpace.RemoteJudgeAccountVO;

interface AccountForm {
    id?: number;
    oj: string;
    username: string;
    password: string;
    isValid: boolean;
    isPrivate: boolean;
}

// 响应式数据
const accounts = ref<RemoteAccount[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const submitting = ref(false);
const first = ref(0);
const totalRecords = ref(0);
const testing = ref<Record<number, boolean>>({});
const confirm = useConfirm();

// 分页常量
const PAGE_SIZE = 20;

// 表单数据
const form = reactive<AccountForm>({
    oj: '',
    username: '',
    password: '',
    isValid: true,
    isPrivate: false
});

// 表单验证错误
const errors = reactive({
    oj: '',
    username: '',
    password: ''
});

// 筛选条件
const filters = reactive({
    oj: '',
    username: '',
    status: '',
    privateStatus: ''
});

// 选项数据
const ojOptions = ref([
    { label: '全部', value: '' },
    { label: 'HDU', value: 'HDU' },
    { label: 'POJ', value: 'POJ' }
]);

const ojFormOptions = ref([
    { label: 'HDU', value: 'HDU' },
    { label: 'POJ', value: 'POJ' }
]);

const statusOptions = ref([
    { label: '全部状态', value: '' },
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 }
]);

const privateOptions = ref([
    { label: '全部', value: '' },
    { label: '公共账号', value: 0 },
    { label: '私有账号', value: 1 }
]);

// 初始化
onMounted(() => {
    loadAccounts();
});

// 加载账号列表
async function loadAccounts() {
    loading.value = true;
    try {
        // offset 是分页偏移量，表示跳过的记录数
        const offset = first.value;
        const username = filters.username || '';
        const oj = filters.oj || '';
        const status = filters.status !== '' ? Number(filters.status) : 2;
        const privateStatus = filters.privateStatus !== '' ? Number(filters.privateStatus) : 2;

        // 获取数据和总数
        // getAdminRemoteJudgeAccounts: 获取当前页的数据（每页20条）
        // getAdminRemoteJudgeAccountsCount: 获取满足条件的总记录数
        const [accountsRes, countRes] = await Promise.all([
            getAdminRemoteJudgeAccounts(offset, username, oj, status, privateStatus),
            getAdminRemoteJudgeAccountsCount(username, oj, status, privateStatus)
        ]);
        accounts.value = accountsRes.data || [];
        totalRecords.value = countRes.data || 0;


    } catch (error) {
        console.error('加载远程账号列表失败:', error);
        globalMessage.error('加载失败', '无法加载远程账号列表');
    } finally {
        loading.value = false;
    }
}

// 分页处理
function onPage(event: any) {
    first.value = event.first;
    // 如果用户改变了每页条数，更新 PAGE_SIZE（这里我们保持常量，但可以根据需要调整）
    loadAccounts();
}

// 筛选条件改变时的处理函数（重置分页到第一页）
function onFilterChange() {
    first.value = 0;
    loadAccounts();
}

// 显示新建对话框
function showAddDialog() {
    dialogMode.value = 'add';
    resetForm();
    showDialog.value = true;
}

// 显示编辑对话框
function showEditDialog(account: RemoteAccount) {
    dialogMode.value = 'edit';
    form.id = account.id;
    form.oj = account.oj;
    form.username = account.username;
    form.password = ''; // 编辑时不预填充密码
    form.isValid = account.isValid;
    form.isPrivate = account.isPrivate;
    showDialog.value = true;
}

// 重置表单
function resetForm() {
    Object.assign(form, {
        id: undefined,
        oj: '',
        username: '',
        password: '',
        isValid: true,
        isPrivate: false
    });

    Object.assign(errors, {
        oj: '',
        username: '',
        password: ''
    });
}

// 表单验证
function validateForm(): boolean {
    let isValid = true;

    // 重置错误
    Object.assign(errors, {
        oj: '',
        username: '',
        password: ''
    });

    if (!form.oj) {
        errors.oj = '请选择OJ平台';
        isValid = false;
    }

    if (!form.username.trim()) {
        errors.username = '请输入用户名';
        isValid = false;
    }

    // 密码验证：新建时必填，编辑时可选
    if (dialogMode.value === 'add' && !form.password.trim()) {
        errors.password = '请输入密码';
        isValid = false;
    }

    return isValid;
}

// 提交表单
async function submitForm() {
    if (!validateForm()) {
        return;
    }

    submitting.value = true;
    try {
        if (dialogMode.value === 'add') {
            const createData: RemoteAccountSpace.CreateRemoteAccountDTO = {
                oj: form.oj,
                username: form.username,
                password: form.password,
                isValid: form.isValid,
                isPrivate: form.isPrivate
            };

            await createRemoteJudgeAccount(createData);
            globalMessage.success('创建成功', '远程账号创建成功');
        } else {
            const updateData: RemoteAccountSpace.UpdateRemoteAccountDTO = {
                id: form.id!,
                username: form.username,
                isValid: form.isValid,
                isPrivate: form.isPrivate
            };

            // 只有密码不为空时才传递密码
            if (form.password.trim()) {
                updateData.password = form.password;
            }

            await updateRemoteJudgeAccount(updateData);
            globalMessage.success('更新成功', '远程账号更新成功');
        }

        showDialog.value = false;
        loadAccounts();

    } catch (error: any) {
        globalMessage.error('操作失败', error.message || '请稍后重试');
    } finally {
        submitting.value = false;
    }
}

// 测试账号连接
async function testAccount(account: RemoteAccount) {
    testing.value[account.id] = true;
    try {
        await testRemoteJudgeAccount(account.id);
        globalMessage.success('测试成功', `${account.oj} 账号连接正常`);
    } catch (error: any) {
        globalMessage.error('测试失败', error.message || '账号连接失败');
    } finally {
        testing.value[account.id] = false;
    }
}

// 确认删除
function confirmDelete(account: RemoteAccount) {
    confirm.require({
        message: `确定要删除账号 "${account.username}" 吗？此操作不可撤销。`,
        header: '删除确认',
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
        accept: () => deleteAccount(account.id)
    });
}

// 删除账号
async function deleteAccount(id: number) {
    try {
        await deleteRemoteJudgeAccount(id);
        globalMessage.success('删除成功', '远程账号已删除');
        loadAccounts();
    } catch (error: any) {
        globalMessage.error('删除失败', error.message || '请稍后重试');
    }
}

// 重置筛选条件
function resetFilters() {
    Object.assign(filters, {
        oj: '',
        username: '',
        status: '',
        privateStatus: ''
    });
    // 重置分页到第一页
    first.value = 0;
    loadAccounts();
}
</script>

<style scoped>
/* 自定义样式 */
.p-dialog-maximized {
    width: 100vw !important;
    height: 100vh !important;
    max-height: none !important;
    top: 0 !important;
    left: 0 !important;
}
</style>
