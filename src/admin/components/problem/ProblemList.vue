<template>
    <div class="bg-white dark:bg-gray-800 mt-1 ml-2 mr-2 p-4 rounded-none shadow-md">
        <div id="functionArea">
            <!-- 题目列表标题 -->
            <div class="p-4 space-x-4 flex items-center">
                <h2 class="text-2xl font-bold text-blue-500">题目列表</h2>
                <ToggleSwitch v-tooltip.top="'只显示自己创建的题目'" @change="modeChange" v-model="displayMode" />
            </div>
            <!-- 操作栏 -->
            <div class="flex items-center space-x-5 p-4">
                <!-- 按钮：创建 -->
                <router-link to="/admin/problem/create"
                    class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow-md">
                    + 创建
                </router-link>
                <!-- 按钮：添加远程OJ题目 -->
                <button @click="showRemoteImportDialog = true"
                    class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded shadow-md transition-colors">
                    + 添加远程OJ题目
                </button>
                <!-- 搜索框 -->
                <span class="relative">
                    <InputText placeholder="输入关键词" v-model:model-value="searchContent"
                        class="p-2 w-64 rounded-md border border-gray-300" @keyup.enter="modeChange" />
                    <i @click="modeChange"
                        class="pi pi-search absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </span>
                <!-- 下拉框：全部题目 -->
                <Select class="w-48" v-model="selectedStatus" :options="showOptions" optionLabel="label"
                    optionValue="value" @change="modeChange" />
            </div>
        </div>
        <div class="border-b border-gray-300 dark:border-gray-700 p-0 m-0 md-4" />
        <div id="tableArea">
            <DataTable :value="problems" stripedRows size="large" :paginator="true" :rows="10" lazy :first="first"
                :totalRecords="totalRecords" @page="onPage" tableClass="text-sm p-4">
                <Column field="id" header="ID"></Column>
                <Column field="displayId" header="展示ID"></Column>
                <Column field="title" header="标题">
                    <template #body="slotProps">
                        <router-link :to="'/problem/' + slotProps.data.id">{{ slotProps.data.title
                        }}</router-link>
                    </template>
                </Column>
                <Column field="creator" header="创建者"></Column>
                <Column field="createTime" header="创建时间"></Column>
                <Column field="modifier" header="最近修改者"></Column>
                <Column field="updateTime" header="修改时间"></Column>
                <Column field="status" header="状态">
                    <template #body="slotProps">
                        <Select v-model="slotProps.data.status" :options="statusOptions" optionLabel="label"
                            optionValue="value" @change="onStatusChange(slotProps)" />
                    </template>
                </Column>
                <Column header="操作">
                    <template #body="{ data }">
                        <div class="space-y-2">
                            <div class="flex space-x-2">
                                <router-link :to="`/admin/problem/edit/${data.id}`"
                                    class="bg-blue-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-blue-600"
                                    v-tooltip.top="'编辑题目'">
                                    <i class="fas fa-edit"></i>
                                </router-link>
                                <router-link v-if="!data.isRemote" :to="`/admin/problem/testcases/${data.id}`"
                                    class="bg-green-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-green-600"
                                    v-tooltip.top="'编辑测试点'">
                                    <i class="fas fa-edit"></i>
                                </router-link>
                            </div>
                        </div>
                    </template>
                </Column>


            </DataTable>
        </div>

        <!-- 远程题目导入弹窗 -->
        <Dialog v-model:visible="showRemoteImportDialog" :modal="true" header="添加远程OJ题目" :style="{ width: '500px' }"
            :closable="true" :dismissableMask="false" @hide="resetRemoteImportForm">
            <div class="space-y-4 pt-4">
                <!-- OJ选择 -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">选择OJ平台</label>
                    <Select v-model="remoteImportForm.ojName" :options="ojOptions" optionLabel="label"
                        optionValue="value" placeholder="请选择OJ平台" class="w-full"
                        :class="{ 'p-invalid': remoteImportErrors.ojName }" />
                    <small v-if="remoteImportErrors.ojName" class="text-red-500">{{ remoteImportErrors.ojName }}</small>
                </div>

                <!-- 题目ID输入 -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">题目ID（支持批量）</label>
                    <InputText v-model="remoteImportForm.problemId" placeholder="请输入题目ID，多个ID用英文逗号分隔" class="w-full"
                        :class="{ 'p-invalid': remoteImportErrors.problemId }" @keyup.enter="submitRemoteImport" />
                    <small v-if="remoteImportErrors.problemId" class="text-red-500">{{ remoteImportErrors.problemId
                    }}</small>
                    <small class="text-gray-500">示例：1000,1001,1002 或单个题目：1000</small>
                </div>

                <!-- 导入结果显示 -->
                <div v-if="importResults.length > 0" class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">导入结果</label>
                    <div class="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                        <div v-for="result in importResults" :key="result.title"
                            class="flex items-center justify-between py-1 px-2 rounded mb-1"
                            :class="result.result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            <div class="flex-1">
                                <span class="font-medium">{{ result.title || '未知题目' }}</span>
                                <p v-if="result.message && !result.result" class="text-xs mt-1 text-red-600">{{
                                    result.message
                                }}</p>
                            </div>
                            <span class="text-xs ml-2">{{ result.result ? '✓ 成功' : '✗ 失败' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end space-x-3 pt-4">
                    <Button label="取消" severity="secondary" @click="cancelRemoteImport" :disabled="isImporting" />
                    <Button label="导入" @click="submitRemoteImport" :loading="isImporting"
                        :disabled="!isFormValid || isImporting" icon="pi pi-download" />
                </div>
            </template>
        </Dialog>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getAdminProblems, getAdminProblemCount, updateAdminProblem, type ProblemSpace } from '@/admin/api/problemAPI';
import { importRemoteProblem, type importSpace } from '@/admin/api/problemImport';
import globalMessage from '@/common/utils/toast';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const problems = ref<ProblemSpace.ProblemVO[]>([]);
const first = ref<number>(0);
const totalRecords = ref<number>(0);
const displayMode = ref(false);
const searchContent = ref('');

// 远程题目导入相关
const showRemoteImportDialog = ref(false);
const isImporting = ref(false);
const remoteImportForm = ref<importSpace.ImportRemoteProblemDTO>({
    ojName: '',
    problemId: ''
});
const remoteImportErrors = ref({
    ojName: '',
    problemId: ''
});
const importResults = ref<importSpace.ProblemImportResultVO[]>([]);

// OJ平台选项
const ojOptions = ref([
    { label: 'HDU - 杭州电子科技大学', value: 'HDU' },
    { label: 'POJ - 北京大学', value: 'POJ' }
]);

const statusOptions = ref([
    { label: '公开题目', value: 1 },
    { label: '隐藏题目', value: 0 },
]);
const showOptions = ref([
    { label: '全部题目', value: 0 },
    { label: '公开题目', value: 1 },
    { label: '隐藏题目', value: 2 },
]);
const selectedStatus = ref(0);

// 表单验证计算属性
const isFormValid = computed(() => {
    return remoteImportForm.value.ojName.trim() !== '' &&
        remoteImportForm.value.problemId.trim() !== '';
});
onMounted(() => {
    loadProblems();
    loadProblemsCount();
});
function onStatusChange(event: any) {
    updateListProblem(event.data);
}
function onPage(event: any) {
    first.value = event.first;
    loadProblems();
}
function modeChange() {
    loadProblems();
    loadProblemsCount();
}
async function updateListProblem(event: ProblemSpace.ProblemVO) {
    await updateAdminProblem(event.id, event.status).then((res) => {
        globalMessage.success("更新成功", res.message);
    }).catch((err) => {
        globalMessage.error('更新题目状态失败', err.msg);
    });
}
async function loadProblems() {
    await getAdminProblems(first.value, displayMode.value, selectedStatus.value, searchContent.value).then((res) => {
        problems.value = res.data as ProblemSpace.ProblemVO[];
    }).catch((err) => {
        globalMessage.error('加载题目列表失败', err.msg);
    });
}
async function loadProblemsCount() {
    await getAdminProblemCount(first.value, displayMode.value, selectedStatus.value, searchContent.value).then((res) => {
        totalRecords.value = res.data as number;
    }).catch((err) => {
        globalMessage.error('加载题目数量失败', err.msg);
    });
}

// 远程题目导入相关函数
function validateForm(): boolean {
    remoteImportErrors.value = {
        ojName: '',
        problemId: ''
    };

    let isValid = true;

    if (!remoteImportForm.value.ojName.trim()) {
        remoteImportErrors.value.ojName = '请选择OJ平台';
        isValid = false;
    }

    if (!remoteImportForm.value.problemId.trim()) {
        remoteImportErrors.value.problemId = '请输入题目ID';
        isValid = false;
    } else {
        // 支持逗号分隔的多个题目ID
        const problemIds = remoteImportForm.value.problemId.split(',').map(id => id.trim()).filter(id => id);

        if (problemIds.length === 0) {
            remoteImportErrors.value.problemId = '请输入有效的题目ID';
            isValid = false;
        } else {
            // 检查每个题目ID是否有效
            for (const id of problemIds) {
                if (!/^[a-zA-Z0-9]+$/.test(id)) {
                    remoteImportErrors.value.problemId = `题目ID "${id}" 格式不正确，只能包含字母和数字`;
                    isValid = false;
                    break;
                }
            }
        }
    }

    return isValid;
}

async function submitRemoteImport() {
    if (!validateForm()) {
        return;
    }

    isImporting.value = true;
    importResults.value = [];

    try {
        // 解析逗号分隔的题目ID
        const problemIds = remoteImportForm.value.problemId.split(',').map(id => id.trim()).filter(id => id);

        // 为每个题目ID创建导入数据
        const importData: importSpace.ImportRemoteProblemDTO[] = problemIds.map(problemId => ({
            ojName: remoteImportForm.value.ojName,
            problemId: problemId
        }));

        const response = await importRemoteProblem(importData);
        importResults.value = response.data || [];

        const successCount = importResults.value.filter(r => r.result).length;
        const failCount = importResults.value.length - successCount;
        const totalCount = problemIds.length;

        if (successCount > 0) {
            globalMessage.success('导入完成', `成功导入 ${successCount}/${totalCount} 道题目${failCount > 0 ? `，失败 ${failCount} 道` : ''}`);
            // 刷新题目列表
            loadProblems();
            loadProblemsCount();
        } else {
            globalMessage.warn('导入失败', `所有 ${totalCount} 道题目导入失败，请检查题目ID是否正确`);
        }
    } catch (error: any) {
        globalMessage.error('导入失败', error.msg || '网络错误，请稍后重试');
        importResults.value = [];
    } finally {
        isImporting.value = false;
    }
}

function cancelRemoteImport() {
    showRemoteImportDialog.value = false;
    resetRemoteImportForm();
}

function resetRemoteImportForm() {
    remoteImportForm.value = {
        ojName: '',
        problemId: ''
    };
    remoteImportErrors.value = {
        ojName: '',
        problemId: ''
    };
    importResults.value = [];
}
</script>
<style lang="css" scoped></style>