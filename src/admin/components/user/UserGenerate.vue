<template>
    <div class="w-full p-4 lg:p-6 bg-white">
        <!-- 标题 -->
        <h1 class="text-xl lg:text-2xl font-semibold text-gray-800 mb-4 lg:mb-6">
            批量账号生成器
        </h1>

        <!-- 输入区域 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
            <!-- 用户名输入 -->
            <div class="flex flex-col h-full space-y-1">
                <label class="text-sm font-medium text-gray-700 px-1">用户名</label>
                <Textarea v-model="usernameInput" rows="10" :disabled="isloading"
                    class="flex-grow p-2 text-sm border rounded-lg focus:ring-2 ring-blue-100 focus:border-blue-400"
                    placeholder="每行一个用户名" />
            </div>

            <!-- 密码设置 -->
            <div class="flex flex-col h-full space-y-1">
                <div class="flex justify-between items-center px-1">
                    <label class="text-sm font-medium text-gray-700">密码设置</label>
                    <Dropdown v-model="passwordMode" :options="passwordOptions" @change="passwordModeChange"
                        optionLabel="label" optionValue="value" class="w-32 text-sm [&_.p-dropdown-label]:py-2" />
                </div>
                <Textarea v-model="passwordInput" :disabled="passwordMode !== 'manual' || isloading" rows="10"
                    class="flex-grow p-2 text-sm border rounded-lg disabled:bg-gray-50/50"
                    :placeholder="passwordPlaceholder" />
            </div>

            <!-- 昵称输入 -->
            <div class="flex flex-col h-full space-y-1">
                <label class="text-sm font-medium text-gray-700 px-1">昵称</label>
                <Textarea v-model="nicknameInput" :rows="10" :disabled="isloading"
                    class="flex-grow p-2 text-sm border rounded-lg focus:ring-2 ring-blue-100 focus:border-blue-400"
                    placeholder="每行对应昵称" />
            </div>
        </div>
        <div class="flex items-center gap-2 mt-2 mb-6">
            <span class="text-gray-700">过期时间</span>
            <DatePicker v-model="expireTime" dateFormat="yy/mm/dd" />
        </div>

        <!-- 结果展示 -->
        <!-- 结果展示部分 -->
        <div class="border-t pt-4 lg:pt-6">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                <h2 class="text-base lg:text-lg font-medium text-gray-800">
                    生成结果 · 共 {{ generatedAccounts.length }} 个账号
                </h2>
                <div class="flex space-x-2 mt-2 lg:mt-0">
                    <Button label="复制JSON" icon="pi pi-copy" class="p-button-sm !text-sm !px-3 !py-1.5" severity="info"
                        @click="copyToClipboard" />
                    <Button label="导出数据" icon="pi pi-download" class="p-button-sm !text-sm !px-3 !py-1.5"
                        severity="secondary" @click="exportData" />
                    <Button label="保存用户" icon="pi pi-save" :loading="isloading"
                        class="p-button-sm !text-sm !px-3 !py-1.5" severity="success" @click="saveBatch" />
                </div>
            </div>

            <!-- 双栏布局 -->
            <div class="grid lg:grid-cols-2 gap-4">
                <!-- DataTable 表格 -->
                <div class="bg-white rounded-lg border overflow-hidden">
                    <DataTable :value="generatedAccounts" :paginator="true" :rows="10" class="text-sm" scrollable
                        scrollHeight="flex">
                        <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header"
                            :style="col.style">
                            <template #body="{ data, field }">
                                <span v-if="field === 'index'" class="text-gray-500">
                                    {{ data.index + 1 }}
                                </span>
                                <span v-else>
                                    {{ typeof field === 'string' && data[field] ? data[field] : '-' }}
                                </span>
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <!-- JSON预览 -->
                <div class="relative">
                    <div class="absolute right-2 top-2 flex space-x-2 z-10">
                        <Button icon="pi pi-copy" class="!w-8 !h-8 !p-0" severity="secondary"
                            @click="copyToClipboard" />
                    </div>
                    <pre
                        class="p-4 h-[480px] text-xs lg:text-sm bg-gray-50 rounded-lg border overflow-auto leading-relaxed">
        {{ JSON.stringify(generatedAccounts, null, 2) }}
    </pre>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import Dropdown from 'primevue/dropdown';
import globalMessage from '@/common/utils/toast';
import { createUserBatch } from '@/admin/api/userAPI';
import { exportToExcel, type ExportHeader } from '@/common/utils/excel';

const usernameInput = ref('');
const passwordInput = ref('');
const nicknameInput = ref('');
const passwordMode = ref('random');
const expireTime = ref<Date>(new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000));
const isloading = ref(false);

const passwordOptions = ref([
    { label: '随机生成', value: 'random' },
    { label: '默认密码', value: 'default' },
    { label: '手动输入', value: 'manual' }
]);
// 表格列配置
const columns = ref([
    { field: 'index', header: '序号', style: {} },
    { field: 'username', header: '用户名', style: {} },
    { field: 'nickname', header: '昵称', style: {} },
    { field: 'password', header: '密码', style: {} }
]);

// 导出函数占位
const exportData = () => {
    const header: ExportHeader[] = [{
        key: 'index',
        title: '序号',
        width: 10
    },
    {
        key: 'username',
        title: '用户名',
        width: 20
    },
    {
        key: 'nickname',
        title: '昵称',
        width: 20
    },
    {
        key: 'password',
        title: '密码',
        width: 20
    }];
    exportToExcel(generatedAccounts.value, header, '生成账号数据', false).then(() => {
        globalMessage.success('提示', '导出成功');
    }).catch(err => {
        console.error('导出失败:', err);
        globalMessage.error('错误', '导出失败');
    });
};
const saveBatch = async () => {
    isloading.value = true;
    try {
        await createUserBatch(generatedAccounts.value);
        globalMessage.success('提示', '保存成功');
        isloading.value = false;
    } catch (err) {
        globalMessage.error('错误', '保存失败');
        isloading.value = false;
    }
};
const defaultPassword = 'Ujn@12345';
const passwordPlaceholder = ref<string>('随机生成密码');
const passwordModeChange = () => {
    switch (passwordMode.value) {
        case 'random':
            passwordPlaceholder.value = '随机生成密码';
            break;
        case 'default':
            passwordPlaceholder.value = '默认密码：' + defaultPassword;
            break;
        case 'manual':
            passwordPlaceholder.value = '每行一个密码';
            break;
        default:
            return '';
    }
};
const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array(8)
        .fill(null)
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join('');
};

const generatedAccounts = computed(() => {
    const usernames = usernameInput.value.split('\n').filter(Boolean);
    const nicknames = nicknameInput.value.split('\n').filter(Boolean);

    return usernames.map((username, index) => ({
        index: index,
        username: username.trim(),
        password: getPasswordForIndex(index),
        nickname: (nicknames[index] || '').trim(),
        expireTime: expireTime.value.getTime()
    }));
});

const getPasswordForIndex = (index: number) => {
    switch (passwordMode.value) {
        case 'random':
            return generatePassword();
        case 'default':
            return defaultPassword;
        case 'manual':
            return passwordInput.value.split('\n')[index]?.trim() || '';
        default:
            return '';
    }
};

const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(JSON.stringify(generatedAccounts.value, null, 2));
        globalMessage.success('提示', '复制成功');
    } catch (err) {
        console.error('复制失败:', err);
    }
};
</script>
