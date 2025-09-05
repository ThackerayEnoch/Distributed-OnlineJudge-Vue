<template>
    <div class="p-4 bg-white">
        <label class="block font-bold text-xl mb-2">导入用户</label>
        <FileUpload name="inFile" :customUpload="true" @select="handleFileSelect" @uploader="handleFileUpload"
            :multiple="true" :maxFileSize="104857600" accept=".xls,.xlsx">
            <template #header="{ chooseCallback, uploadCallback, }">
                <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
                    <div class="flex gap-2">
                        <Button @click="chooseCallback()" label="选择文件" rounded outlined :disabled="isUploading"
                            severity="secondary"></Button>
                        <Button @click="uploadCallback()" label="解析文件" rounded outlined severity="success"
                            :disabled="!selectedFiles || selectedFiles.length === 0 || isUploading"></Button>
                        <Button @click="clearAllFiles" label="清空文件" rounded outlined severity="danger" :disabled="!selectedFiles || !uploadedFiles
                            || selectedFiles.length === 0 && uploadedFiles.length === 0
                            || isUploading"></Button>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-700">过期时间</span>
                            <DatePicker v-model="expireTime" dateFormat="yy/mm/dd" />
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-700">使用随机密码</span>
                            <ToggleSwitch v-model="isRandomPassword" :disabled="isUploading" class="ml-2" />
                        </div>
                    </div>
                </div>
            </template>

            <template #content="{ files, messages }">
                <div class="flex flex-col gap-8 pt-4">
                    <Message v-for="message of messages" :key="message"
                        :class="{ 'mb-8': !files.length && !uploadedFiles.length }" severity="error">
                        {{ message }}
                    </Message>
                    <div v-if="selectedFiles.length > 0">
                        <h5 class="text-lg font-semibold mb-4">待解析文件</h5>
                        <div class="flex flex-wrap gap-4">
                            <div v-for="(file, index) of selectedFiles" :key="file.name + file.type + file.size"
                                class="p-4 rounded-lg border border-gray-200 flex flex-col items-center gap-2">
                                <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{
                                    file.name }}</span>
                                <div class="text-sm text-gray-500">{{ formatSize(file.size) }}
                                </div>
                                <Badge v-if="isUploading" value="解析中" severity="info" />
                                <Badge v-else value="待解析" severity="warn" />
                                <Button label="移除" @click="removeSelectedFile(index)" outlined rounded severity="danger"
                                    :disabled="isUploading" />
                            </div>
                        </div>
                    </div>

                    <div v-if="uploadedFiles.length > 0">
                        <h5 class="text-lg font-semibold mb-4">已解析文件</h5>
                        <div class="flex flex-wrap gap-4">
                            <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size"
                                class="p-4 rounded-lg border border-gray-200 flex flex-col items-center gap-2">
                                <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">{{
                                    file.name }}</span>
                                <div class="text-sm text-gray-500">{{ formatSize(file.size) }}
                                </div>
                                <Badge value="已解析" severity="success" />
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
    <Dialog v-model:visible="displayDialog" :style="{ width: '60vw' }" :modal="true" @hide="displayDialog = false">
        <template #header>
            <div class="flex justify-between items-center w-full">
                <h3 class="font-bold text-lg">用户信息</h3>
                <span class="text-gray-400 text-base">双击点击用户名或昵称可编辑, 已有用户不会覆盖密码</span>
                <Button id="export" @click="exportCSV" label="导出" icon="pi pi-download" class="ml-2 mr-4" />
            </div>
        </template>
        <div class="p-4">
            <DataTable :value="users" editMode="cell" v-model:editingRows="usersEdit" dataKey="id"
                @cell-edit-complete="onCellEditComplete" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20]">
                <Column header="序号" style="width: 15%" exportable>
                    <template #body="{ index }">{{ index + 1 }}</template>
                </Column>

                <Column field="username" header="用户名">
                    <template #editor="{ data, field }">
                        <InputText v-model="data[field]" class="w-full" />
                    </template>
                </Column>

                <Column field="nickname" header="昵称">
                    <template #editor="{ data, field }">
                        <InputText v-model="data[field]" class="w-full" />
                    </template>
                </Column>
                <Column field="password" header="密码" />
                <Column id="操作" header="操作">
                    <template #body="{ data }">
                        <button @click="() => users.splice(users.indexOf(data), 1)"
                            class="bg-red-500 text-white p-2 rounded flex items-center justify-center w-12 h-8 hover:bg-red-600"
                            v-tooltip.top="'删除用户'">
                            <i class="fas fa-trash"></i>
                        </button>
                    </template>
                </Column>
            </DataTable>
        </div>
        <template #footer>
            <div class="flex justify-end items-center gap-4 pt-4 border-t border-gray-100">
                <Button @click="displayDialog = false" label="取消" severity="secondary" class="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-all 
                   duration-200 font-semibold text-base border border-gray-200
                   hover:border-gray-300 w-32 justify-center" />
                <Button @click="saveEvent" :loading="isloading" label="保存" severity="primary" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600
                   text-white rounded-xl shadow-lg hover:shadow-xl transition-all
                   duration-200 font-semibold text-base w-32 justify-center
                   transform hover:scale-[1.02] active:scale-95">
                </Button>
            </div>
        </template>
    </Dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import globalMessage from '@/common/utils/toast';
import { type ExcelUser, parseExcelFiles, exportToExcel } from '@/common/utils/excel';
import { createUserBatch, type UserSpace } from '@/admin/api/userAPI'

const displayDialog = ref<boolean>(false);
const isUploading = ref<boolean>(false);
const isloading = ref<boolean>(false);
const expireTime = ref<Date>(new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000)); // 过期时间
const selectedFiles = ref<File[]>([]);
const uploadedFiles = ref<File[]>([]); // 存储已上传的文件列表
// 处理文件选择（只存储文件，不上传）
const handleFileSelect = (event: any) => {
    selectedFiles.value = event.files; // 获取文件列表
};
const handleFileUpload = () => {
    isUploading.value = true;
    if (!selectedFiles.value) return;
    parseExcelFiles(selectedFiles.value).then((data) => {
        users.value = data.users;
        uploadedFiles.value.push(...selectedFiles.value);
        selectedFiles.value = [];
        // 随机密码
        users.value.forEach((user) => {
            user.password = isRandomPassword.value ? generateRandomPassword(8) : 'ujn@12345';
        });
        globalMessage.success('Excel解析', '文件解析成功');
        displayDialog.value = true;
        isUploading.value = false;
    }).catch((error) => {
        globalMessage.error('Excel解析', error.message);
        isUploading.value = false;
    });
};
const clearAllFiles = () => {
    selectedFiles.value = [];
    uploadedFiles.value = [];
    isUploading.value = false;
};
const removeUploadedFile = (index: number) => {
    uploadedFiles.value.splice(index, 1);
};

const removeSelectedFile = (index: number) => {
    selectedFiles.value.splice(index, 1);
};
function saveEvent() {
    saveUsers();
}
async function saveUsers() {
    isUploading.value = true;
    isloading.value = true;
    let userDTO: UserSpace.AdminCreateUserBatchDTO[] = [];
    for (let user of users.value) {
        userDTO.push({
            username: user.username,
            nickname: user.nickname,
            needChangePassword: true,
            password: user.password as string,
            expireTime: expireTime.value.getTime(),
        });
    }
    try {
        await createUserBatch(userDTO);
        globalMessage.success('用户导入', '用户导入成功');
        users.value = []; // 清空用户列表
        uploadedFiles.value = []; // 清空已上传的文件列表
    } catch (error: any) {
        globalMessage.error('用户导入', error.message);
    }
    isUploading.value = false;
    isloading.value = false;
    displayDialog.value = false;
}

// 格式化文件大小
const formatSize = (bytes: any) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
// Excel解析
const users = ref<ExcelUser[]>([])
const usersEdit = ref<any>([])
const isRandomPassword = ref<boolean>(true)
// 单元格编辑完成
const onCellEditComplete = (event: any) => {
    let { data, newValue, field } = event;
    switch (field) {
        case 'username':
            if (newValue.trim().length > 0) data[field] = newValue;
            else event.preventDefault();
            break;
        case 'nickname':
            if (newValue.trim().length > 0) data[field] = newValue;
            else event.preventDefault();
            break;
        default:
            break;
    }
};
const generateRandomPassword = (length: number): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
};

const headers = [
    { key: 'username', title: '用户名' },
    { key: 'nickname', title: '昵称' },
    { key: 'password', title: '密码' },
];
// 导出 CSV
const exportCSV = () => {
    exportToExcel(users.value, headers, '用户信息', true);
};

</script>

<style scoped>
/* Your styles here */
</style>