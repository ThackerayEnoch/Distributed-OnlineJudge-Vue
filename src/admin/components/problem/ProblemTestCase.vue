<template>
    <ConfirmPopup></ConfirmPopup>
    <DataTable :value="testcases" v-model:selection="selectedTestcase" selectionMode="multiple"
        :metaKeySelection="false" dataKey="id" stripedRows>
        <template #header>
            <div class="flex justify-between items-center p-4 border-b">
                <div class="flex gap-2">
                    <Button label="创建测试点" @click="createTestcase" icon="pi pi-plus"
                        class="p-button-sm p-button-primary" />
                    <Button label="上传测试点" @click="uploadNormal" icon="pi pi-upload"
                        class="p-button-sm p-button-secondary" />
                    <Button label="上传压缩包" @click="uploadZip" icon="pi pi-file-zip"
                        class="p-button-sm p-button-secondary" />
                    <!--添加Tiptool-->
                    <span class="text-red-500" v-tooltip.top="'测试点命名请以数字开头，如1.in 1.out'"><i
                            class="ml-1 fa-regular fa-circle-question"></i></span>
                </div>
            </div>

            <!-- Header 第二行 -->
            <div class="flex justify-between items-center p-4">
                <div class="flex gap-2">
                    <Button label="全选" @click="allTestcaseSelected" icon="pi pi-check-square"
                        class="p-button-sm p-button-secondary" />
                    <Button label="反选" @click="invertSelection" icon="pi pi-clone"
                        class="p-button-sm p-button-secondary" />
                    <Button label="删除" icon="pi pi-trash" class="p-button-sm p-button-danger"
                        @click="deleteConfirm($event, selectedFiles, 'mult')" />
                    <Button label="刷新" @click="refrush" icon="pi pi-refresh" class="p-button-sm p-button-secondary" />
                </div>
            </div>
        </template>
        <Column header="测试点序号">
            <template #body="slotProps">
                <span class="text-center">{{ slotProps.index + 1 }}</span>
            </template>
        </Column>
        <Column field="pid" header="所属题目ID"></Column>
        <Column field="input" header="输入文件"></Column>
        <Column field="output" header="输出文件"></Column>
        <Column field="score" header="分数"></Column>
        <Column field="substack" header="子任务"></Column>
        <Column field="createTime" header="创建时间"></Column>
        <Column field="updateTime" header="最近修改时间"></Column>
        <Column header="操作">
            <template #body="slotProps">
                <div class="space-y-2">
                    <div class="flex space-x-2">
                        <button @click="edit(slotProps.data.id)"
                            class="bg-blue-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-blue-600"
                            v-tooltip.top="'编辑测试点'">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button
                            class="bg-green-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-green-600"
                            v-tooltip.top="'重命名'" @click="open(slotProps.data.id)">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button
                            class="bg-red-500 text-white p-2 rounded flex items-center justify-center w-14 h-9 hover:bg-red-600"
                            v-tooltip.top="'删除测试点'" @click="deleteConfirm($event, slotProps.data.id, 'single')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </template>
        </Column>
    </DataTable>
    <Dialog v-model:visible="editDialog" modal :style="{ width: '60vw' }">
        <template #header>
            <h3 v-if="dialogType === 'create'" class="font-bold">新建测试点</h3>
            <h3 v-else class="font-bold">编辑测试点{{ testcaseInfo.id }}</h3>
        </template>

        <div class="flex flex-col gap-4">
            <!-- 输入/输出框 -->
            <div class="flex gap-4">
                <div class="flex-1">
                    <label for="input-text" class="block mb-2">输入文件</label>
                    <Textarea id="input-text" v-model="testcaseInfo.input" placeholder="输入文件" class="w-full h-96" />
                </div>
                <div class="flex-1">
                    <label for="output-text" class="block mb-2">输出文件</label>
                    <Textarea id="output-text" v-model="testcaseInfo.output" placeholder="输出文件" class="w-full h-96" />
                </div>
            </div>

            <!-- 分数 & 子任务 -->
            <div class="flex gap-4">
                <div class="flex-1">
                    <label for="score" class="block mb-2">分数</label>
                    <InputNumber v-tooltip.top="'如果是ACM判题请忽略'" id="score" v-model="testcaseInfo.score" placeholder="分数"
                        class="w-full" />
                </div>
                <div class="flex-1">
                    <label for="subtask" class="block mb-2">子任务</label>
                    <InputNumber v-tooltip.top="'如果是ACM判题请忽略'" id="subtask" v-model="testcaseInfo.subtask"
                        placeholder="子任务" class="w-full" />
                </div>
            </div>

            <!-- 按钮 -->
            <div class="flex justify-end gap-4">
                <Button label="保存" class="p-button-success" @click="submit" />
                <Button label="取消" class="p-button-danger" @click="editDialog = false" />
            </div>
        </div>
    </Dialog>
    <Dialog v-model:visible="uploadDialog" header="上传文件" modal :style="{ width: '70vw', height: '80vh' }">
        <div class="p-4 space-y-4">
            <div>
                <label v-if="uploadType === 'zip'" class="block font-bold mb-2">上传压缩包</label>
                <label v-else class="block font-bold mb-2">上传.in和.out 文件</label>
                <FileUpload name="inFile" :customUpload="true" @select="handleFileSelect" @uploader="handleFileUpload"
                    :multiple="true" :maxFileSize="104857600" :accept="uploadType === 'zip' ? '.zip' : '.in,.out'">
                    <template #header="{ chooseCallback, uploadCallback, }">
                        <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
                            <div class="flex gap-2">
                                <Button @click="chooseCallback()" label="选择文件" rounded outlined :disabled="isUploading"
                                    severity="secondary"></Button>
                                <Button @click="uploadCallback()" label="上传文件" rounded outlined severity="success"
                                    :disabled="!selectedFiles || selectedFiles.length === 0 || isUploading"></Button>
                                <Button @click="clearAllFiles" label="清空文件" rounded outlined severity="danger"
                                    :disabled="!selectedFiles || !uploadedFiles
                                        || selectedFiles.length === 0 && uploadedFiles.length === 0
                                        || isUploading"></Button>
                            </div>
                        </div>
                    </template>

                    <template #content="{ files, removeFileCallback, messages }">
                        <div class="flex flex-col gap-8 pt-4">
                            <Message v-for="message of messages" :key="message"
                                :class="{ 'mb-8': !files.length && !uploadedFiles.length }" severity="error">
                                {{ message }}
                            </Message>
                            <!-- 上传进度条 -->
                            <ProgressBar v-if="uploadProgress > 0" :value="uploadProgress">
                                <span class="whitespace-nowrap">{{ uploadProgress }}%</span>
                            </ProgressBar>
                            <div v-if="selectedFiles.length > 0">
                                <h5 class="text-lg font-semibold mb-4">待上传文件</h5>
                                <div class="flex flex-wrap gap-4">
                                    <div v-for="(file, index) of selectedFiles" :key="file.name + file.type + file.size"
                                        class="p-4 rounded-lg border border-gray-200 flex flex-col items-center gap-2">
                                        <span
                                            class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{
                                                file.name }}</span>
                                        <div class="text-sm text-gray-500">{{ formatSize(file.size) }}
                                        </div>
                                        <Badge v-if="isUploading" value="上传中" severity="info" />
                                        <Badge v-else value="待上传" severity="warn" />
                                        <Button label="移除" @click="removeFileCallback(index)" outlined rounded
                                            severity="danger" :disabled="isUploading" />
                                    </div>
                                </div>
                            </div>

                            <div v-if="uploadedFiles.length > 0">
                                <h5 class="text-lg font-semibold mb-4">已上传文件</h5>
                                <div class="flex flex-wrap gap-4">
                                    <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size"
                                        class="p-4 rounded-lg border border-gray-200 flex flex-col items-center gap-2">
                                        <span
                                            class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{
                                                file.name }}</span>
                                        <div class="text-sm text-gray-500">{{ formatSize(file.size) }}
                                        </div>
                                        <Badge value="已上传" severity="success" />
                                        <Button label="移除" @click="removeUploadedFile(index)" outlined rounded
                                            severity="danger" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <template #empty>
                        <div class="flex items-center justify-center flex-col py-8">
                            <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-4" />
                            <p class="text-gray-600">拖放文件到这里上传</p>
                        </div>
                    </template>
                </FileUpload>
            </div>
        </div>
    </Dialog>
    <Dialog v-model:visible="renameDialogVisible" header="重命名测试点" :modal="true" :style="{ minWidth: '400px' }"
        :dismissableMask="true" class="rounded-lg">
        <div class="p-6">
            <!-- 输入区域 -->
            <div class="space-y-4">
                <label class=" block text-gray-600 text-sm font-medium">
                    新名称
                </label>
                <InputText v-model="newObject.name" placeholder="请输入新名称"
                    class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    autocomplete="off" autofocus />
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-end space-x-2 mt-6">
                <Button label="取消" severity="secondary" @click="renameDialogVisible = false"
                    class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" />
                <Button label="确认" severity="primary" @click="handleConfirm"
                    class="px-4 py-2 rounded-lg transition-colors" />
            </div>
        </div>
    </Dialog>


</template>
<script setup lang="ts">
import { defineProps, onMounted, reactive, ref } from 'vue'
import { type TestCaseSpace, renameTestcase, getTestcases, getTestcase, uploadTestcase, addTestcase, updateTestcase, deleteTestcase } from '@/admin/api/testcase'
import globalMessage from '@/common/utils/toast';
import InputNumber from 'primevue/inputnumber';
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();
const selectedTestcase = ref<TestCaseSpace.TestCase[]>([])
const dialogType = ref('edit')
const uploadType = ref('normal')
const uploadDialog = ref(false)
const editDialog = ref(false)
const testcases = ref<TestCaseSpace.TestCase[]>([])
const testcaseInfo = ref<TestCaseSpace.TestCaseInfo>({
    id: 0,
    input: '',
    output: '',
    score: 0,
    subtask: 0,
})

const renameDialogVisible = ref(false);
const newObject: TestCaseSpace.RenameTestcaseDTO = reactive({
    id: 0,
    name: '',
});

const open = (id: number) => {
    newObject.id = id;
    newObject.name = ''
    renameDialogVisible.value = true;
};

const handleConfirm = async () => {
    if (!newObject.name) {
        globalMessage.error('错误', '名称不能为空');
        return;
    }
    await renameTestcase(newObject).then(res => {
        globalMessage.success('重命名成功', res.message);
        loadTestcases()
    }).catch(err => {
        globalMessage.error('重命名失败', err.message);
    });
    renameDialogVisible.value = false;
};
const isUploading = ref<boolean>(false);
const uploadProgress = ref(0);
const selectedFiles = ref<File[]>([]);
const uploadedFiles = ref<File[]>([]); // 存储已上传的文件列表
// 处理文件选择（只存储文件，不上传）
const handleFileSelect = (event: any) => {
    selectedFiles.value = event.files; // 获取文件列表
};
const handleFileUpload = async () => {
    uploadProgress.value = 0;
    isUploading.value = true;
    if (!selectedFiles.value) return;

    const formData = new FormData();
    selectedFiles.value.forEach((file) => {
        formData.append("files", file); // 直接传 File 类型
    });
    formData.append("id", props.id.toString());
    formData.append("type", uploadType.value);
    await uploadTestcase(formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent: any) => {
            // 计算上传进度
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            uploadProgress.value = progress;
        },
    }).then(res => {
        globalMessage.success("上传成功", res.message);
        loadTestcases()
        // **关键：将已上传的文件存入 uploadedFiles**
        uploadedFiles.value.push(...selectedFiles.value);
        // **清空 selectedFiles，但不影响 FileUpload 组件**
        selectedFiles.value = [];
        loadTestcases();
        isUploading.value = false;
    }).catch(error => {
        selectedFiles.value = [];
        isUploading.value = false;
        console.log("上传失败:", error);
        globalMessage.error('上传失败', error.message);
    })
};
const clearAllFiles = () => {
    selectedFiles.value = [];
    uploadedFiles.value = [];
    isUploading.value = false;
    uploadProgress.value = 0;
};
const removeUploadedFile = (index: number) => {
    uploadedFiles.value.splice(index, 1);
};

// 格式化文件大小
const formatSize = (bytes: any) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
function uploadZip() {
    uploadType.value = 'zip'
    uploadDialog.value = true
}
function uploadNormal() {
    uploadType.value = 'normal'
    uploadDialog.value = true
}
async function refrush() {
    testcases.value = []
    selectedFiles.value = []
    uploadedFiles.value = []
    selectedTestcase.value = []
    await loadTestcases()
    globalMessage.success("通知", "刷新成功")
}
function allTestcaseSelected() {
    selectedTestcase.value = testcases.value
}
function invertSelection() {
    selectedTestcase.value = testcases.value.filter(item => !selectedTestcase.value.includes(item))
}
const props = defineProps<{
    id: number
}>()
onMounted(() => {
    loadTestcases()
})

async function loadTestcases() {
    if (!props.id) {
        return
    }
    await getTestcases(props.id).then(res => {
        testcases.value = res.data as unknown as TestCaseSpace.TestCase[];
    }).catch(err => {
        globalMessage.error("加载测试点异常", err.message)
    })
}
async function loadSingleTestcase(id: number) {
    await getTestcase(id).then(res => {
        testcaseInfo.value = res.data as unknown as TestCaseSpace.TestCaseInfo
    }).catch(err => {
        globalMessage.error("加载测试点异常", err.message)
    })

}
function submit() {
    if (dialogType.value === 'edit') {
        submitUpdateTestcase()
    } else {
        submitCreateTestcase()
    }
}
async function submitUpdateTestcase() {
    const data: TestCaseSpace.CreateAndUpdateDTO = {
        pid: props.id,
        input: testcaseInfo.value.input,
        output: testcaseInfo.value.output,
        score: testcaseInfo.value.score,
        subtask: testcaseInfo.value.subtask,
    }
    await updateTestcase(testcaseInfo.value.id, data).then(res => {
        globalMessage.success("更新测试点成功", res.message)
        loadTestcases()
        editDialog.value = false
    }).catch(err => {
        globalMessage.error("更新测试点异常", err.message)
    })

}
async function submitCreateTestcase() {
    const data: TestCaseSpace.CreateAndUpdateDTO = {
        pid: props.id,
        input: testcaseInfo.value.input,
        output: testcaseInfo.value.output,
        score: testcaseInfo.value.score,
        subtask: testcaseInfo.value.subtask,
    }
    await addTestcase(data).then(res => {
        globalMessage.success("新建测试点成功", res.message)
        loadTestcases()
        editDialog.value = false
    }).catch(err => {
        globalMessage.error("新建测试点异常", err.message)
    })
}
async function deleteTestcases(ids: any, type: string) {
    if (type === 'single' && !Array.isArray(ids)) {
        ids = [ids]
    } else if (type === 'mult') {
        ids = selectedTestcase.value.map(item => item.id)
    } else {
        return;
    }
    const idsString = ids.join(',');
    await deleteTestcase(idsString).then(res => {
        globalMessage.success("删除测试点成功", res.message)
        loadTestcases()
    }).catch(err => {
        globalMessage.error("删除测试点异常", err.message)
    })
}
const edit = (id: number) => {
    editDialog.value = true
    dialogType.value = 'edit'
    loadSingleTestcase(id)
}
const createTestcase = () => {
    editDialog.value = true
    dialogType.value = 'create'
    testcaseInfo.value = {
        id: 0,
        input: '',
        output: '',
        score: 0,
        subtask: 0,
    }
}
const deleteConfirm = (event: any, slotProps: any, type: string) => {
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
            console.log('Delete')
            deleteTestcases(slotProps, type)
        },
        reject: () => {
            //reject action
        }
    });
};
</script>
<style scoped>
/* 更改选中行的背景颜色 */
/* 选中行颜色 */
::v-deep(.p-datatable-tbody > tr.p-datatable-row-selected) {
    background-color: black !important;
    /* 选中变淡蓝色 */
    color: white !important;
    border-color: black !important;
    /* 文字颜色 */
}

::v-deep(.p-fileupload-content .p-progressbar) {
    height: 6px !important;
}
</style>