<template>
    <div class="p-4 min-h-screen">
        <!-- 顶部操作栏 -->
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-semibold text-gray-800">通知公告管理</h1>
            <Button label="新增通知" icon="pi pi-plus" class="p-button-primary" @click="openCreateDialog" />
        </div>

        <!-- 数据表格 -->
        <div class="card shadow-lg rounded-lg">
            <DataTable ref="dt" :value="notices" paginator :rows="10"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                currentPageReportTemplate="显示 {first} 到 {last} 共 {totalRecords} 条">

                <Column field="title" header="标题" class="font-medium"></Column>
                <Column field="author" header="发布人" class="text-gray-600"></Column>
                <Column field="createTime" header="发布时间">
                    <template #body="{ data }">
                        {{ formatDate(data.createTime) }}
                    </template>
                </Column>
                <Column field="lastUpdater" header="最后更新人"></Column>
                <Column field="updateTime" header="更新时间">
                    <template #body="{ data }">
                        {{ formatDate(data.update) }}
                    </template>
                </Column>
                <Column headerStyle="width: 8rem">
                    <template #body="{ data }">
                        <div class="flex space-x-2">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-button-text"
                                @click="onEditOpen(data.id)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text"
                                @click="onDelete(data.id)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- 新增创建对话框 -->
        <Dialog v-model:visible="addDialog" header="新建通知" :modal="true" class="w-full max-w-6xl">
            <div class="p-fluid grid gap-4">
                <div class="field col-12">
                    <label class="block mb-2 font-medium">标题</label>
                    <InputText v-model.trim="newNotice.title" class="w-full" autofocus placeholder="请输入标题" required />
                </div>

                <div class="field col-12">
                    <label class="block mb-2 font-medium">内容</label>
                    <MdEditor v-model="newNotice.content" class="prose max-w-full border rounded-lg"
                        :toolbarsExclude="['github']" previewTheme="vuepress" :max-length="10000"
                        :page-fullscreen="false" />
                </div>

                <div class="col-12 flex justify-end gap-3 mt-4">
                    <Button label="取消" class="p-button-text" @click="addDialog = false" />
                    <Button label="创建" icon="pi pi-check" class="p-button-primary" @click="createNotice" />
                </div>
            </div>
        </Dialog>

        <!-- 修改编辑对话框保存逻辑 -->
        <Dialog v-model:visible="editDialog" header="编辑通知" :modal="true" class="w-full max-w-6xl">
            <div class="p-fluid grid gap-4">
                <div class="field col-12">
                    <label class="block mb-2 font-medium">标题</label>
                    <InputText v-model.trim="selectedNotice.title" class="w-full" autofocus placeholder="请输入标题"
                        required />
                </div>
                <!-- 原有内容不变 -->
                <div class="field col-12">
                    <label class="block mb-2 font-medium">内容</label>
                    <MdEditor v-model="selectedNotice.content" class="prose max-w-full border rounded-lg" :toolbars="[
                        'bold', 'italic', 'strikeThrough', '-', 'title',
                        'sub', 'code', 'link', 'image', '-', 'preview'
                    ]" previewTheme="github" placeholder="请输入详细通知内容..." />
                </div>
                <!-- 原有内容不变 -->
                <div class="col-12 flex justify-end gap-3 mt-4">
                    <Button label="取消" class="p-button-text" @click="editDialog = false" />
                    <Button label="保存" icon="pi pi-check" class="p-button-primary" @click="saveNotice" />
                </div>
            </div>
        </Dialog>
    </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import dayjs from 'dayjs';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import globalMessage from '@/common/utils/toast';
import { type NoticesSpace, getAdminNoticeById, getAdminNotices, createAdminNotice, updateAdminNotice, deleteAdminNotice } from '@/admin/api/noticesAPI';


// Mock数据
const notices = ref<NoticesSpace.AdminNoticesVO[]>([]);

const selectedNotice = reactive<NoticesSpace.AdminNoticesVO>({
    id: 0,
    title: '',
    content: '',
    author: '',
    lastUpdater: '',
    createTime: new Date(),
    updateTime: new Date()

} as NoticesSpace.AdminNoticesVO);
const editDialog = ref(false);
const dt = ref();

// 日期格式显示
const formatDate = (date: Date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm');
};
// 新增状态
const addDialog = ref(false);
const newNotice = reactive<Partial<NoticesSpace.AddUpdateNoticeDTO>>({
    title: '',
    content: '',
});

// 打开创建对话框
function openCreateDialog() {
    newNotice.title = '';
    newNotice.content = '';
    addDialog.value = true;
};

// 创建通知
function createNotice() {
    if (!newNotice.title?.trim() || !newNotice.content?.trim()) {
        globalMessage.error('错误', '标题和内容不能为空');
    }
    const notice: NoticesSpace.AddUpdateNoticeDTO = {
        id: notices.value.length + 1,
        title: newNotice.title!,
        content: newNotice.content!,
    };
    createNoticeEvent(notice);
    addDialog.value = false;
};
function onEditOpen(id: number) {
    editDialog.value = true;
    loadSingleNotice(id);
}
function onDelete(id: number) {
    deleteNotice(id);
}
// 修改编辑界面保存逻辑
function saveNotice() {
    if (!selectedNotice.title?.trim() || !selectedNotice.content?.trim()) {
        globalMessage.error('错误', '标题和内容不能为空！');
    }
    updateNotice(selectedNotice.id!);
    editDialog.value = false;
};
async function deleteNotice(id: number) {
    await deleteAdminNotice(id).then(() => {
        globalMessage.success('成功', '删除通知成功！');
        loadAllNotices();
    }).catch((err) => {
        globalMessage.error('错误', '删除通知失败！' + err.message);
    });
}
async function updateNotice(id: number) {
    await updateAdminNotice(id, selectedNotice).then(() => {
        globalMessage.success('成功', '修改通知成功！');
        loadAllNotices();
    }).catch((err) => {
        globalMessage.error('错误', '修改通知失败！' + err.message);
    });
}
async function createNoticeEvent(dto: NoticesSpace.AddUpdateNoticeDTO) {
    await createAdminNotice(dto).then(() => {
        globalMessage.success('成功', '创建通知成功！');
        loadAllNotices();
    }).catch((err) => {
        globalMessage.error('错误', '创建通知失败！' + err.message);
    });
}
async function loadSingleNotice(id: number) {
    await getAdminNoticeById(id).then((res) => {
        const data = res.data as NoticesSpace.AdminNoticesVO;
        selectedNotice.id = data.id;
        selectedNotice.title = data.title;
        selectedNotice.content = data.content;
    }).catch((err) => {
        globalMessage.error('错误', '获取通知详情失败！' + err.message);
    });
}
async function loadAllNotices() {
    await getAdminNotices().then((res) => {
        notices.value = res.data as NoticesSpace.AdminNoticesVO[];
    }).catch((err) => {
        globalMessage.error('错误', '获取通知列表失败！' + err.message);
    });
}
onMounted(() => {
    loadAllNotices();
});
</script>
<style scoped>
:deep(.p-datatable) th {
    @apply bg-gray-50 font-semibold text-gray-700;
}

:deep(.p-paginator) {
    @apply rounded-b-lg border-t-0;
}

.p-fluid .field label {
    @apply text-gray-700;
}

:deep(.p-dialog-content) {
    @apply bg-white rounded-b-lg;
}

::v-deep(svg.md-editor-icon) {
    width: 23px !important;
    height: 23px !important;
}
</style>