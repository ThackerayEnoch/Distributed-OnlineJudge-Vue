<!-- IssueDetail.vue -->
<template>
    <div v-if="isloading" class="flex flex-col items-center justify-center h-screen">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent" animationDuration=".5s"
            aria-label="Custom ProgressSpinner" />
        <span class="mt-2 text-gray-500">加载数据中...</span>
    </div>
    <div v-else class="w-full mx-auto p-0">
        <Card>
            <!-- 头部 -->
            <template #title>
                <div class="flex items-center justify-between">
                    <div class="space-y-2">
                        <h1 class="text-2xl font-bold">{{ issue.title }} <span class="text-gray-500">#{{ issue.id
                        }}</span></h1>
                        <div class="flex items-center gap-2 text-sm text-gray-600">
                            <Tag :severity="statusSeverityMap(issue.status)" :value="statusValueMap(issue.status)" />
                            <span>{{ issue.author }}</span>
                            <span>创建于 {{ formatDate(issue.date) }}</span>
                        </div>
                    </div>
                    <div v-if="counterStore.currentUser.roleId <= Role.TEACHER" class="space-x-2">
                        <Button v-if="issue.visible" label="设置为隐藏" icon="pi pi-eye-slash"
                            class="p-button-outlined p-button-secondary" @click="changeVisible(false)" />
                        <Button v-else label="开启" icon="pi pi-eye" class="p-button-outlined p-button-secondary"
                            @click="changeVisible(true)" />
                        <Dropdown v-model="issue.status" :options="statusOptions" optionLabel="label"
                            optionValue="value" @change="changeStatus()" class="w-40" size="small" placeholder="选择状态" />
                    </div>
                </div>
            </template>

            <template #content>
                <div class="grid md:grid-cols-12 gap-6">
                    <!-- 主内容 -->
                    <div class="md:col-span-8 space-y-6">
                        <!-- 问题正文 -->
                        <div class="shadow-none p-0 mt-2 mb-4 border rounded">
                            <MdPreview :modelValue="issue.content" :theme="theme" />
                        </div>

                        <!-- 评论列表 -->
                        <div v-for="comment in issue.comments" :key="comment.id">
                            <div class="flex gap-3">
                                <Avatar icon="pi pi-user" shape="circle" size="large" />
                                <div class="flex-1 border p-4 rounded">
                                    <div class="flex items-center gap-2 mb-2">
                                        <span class="font-semibold">{{ comment.author }}</span>
                                        <Tag v-if="comment.roleId !== null && comment.roleId !== 5" severity="info"
                                            :value="RoleMap[comment.roleId as keyof typeof RoleMap]" />
                                        <span class="text-xs text-gray-500">{{ formatDate(comment.date) }}</span>
                                    </div>
                                    <MdPreview :modelValue="comment.content" :theme="theme" />
                                </div>
                            </div>
                        </div>

                        <!-- 新增评论 -->
                        <div class="shadow-none flex gap-3">
                            <Avatar icon="pi pi-user" shape="circle" size="large" />
                            <div class="flex-1 border p-4 rounded">
                                <span v-if="issue.status !== 4" class="font-bold">添加评论</span>
                                <MdEditor v-if="issue.status !== 4" v-model:model-value="newComment"
                                    style="max-height: 250px;;" class="mt-2" :theme="theme" placeholder="请输入您的评论..."
                                    @on-upload-img="onUploadImg" :toolbars="toolbars" />
                                <div v-else class="mt-2 p-4 bg-gray-100 text-gray-500 rounded">
                                    该问题已关闭，无法添加评论。
                                </div>
                                <div class="mt-4 flex justify-end">
                                    <Button v-if="issue.status === 4" label="重新打开"
                                        class="p-button-outlined mr-2 p-button-secondary" icon="pi pi-refresh"
                                        @click="changeStatus(0)" />
                                    <Button label="提交评论" icon="pi pi-send" :loading="isSubmiting" @click="submitComment"
                                        :disabled="issue.status === 4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 侧边栏 -->
                    <div class="md:col-span-4 space-y-4">
                        <Card class="shadow-none border">
                            <template #title>Details</template>
                            <template #content>
                                <ul class="space-y-3 text-sm">
                                    <li class="flex items-center gap-2">
                                        <i class="pi pi-user"></i>
                                        <span>提交者: {{ issue.author }}</span>
                                    </li>
                                    <li class="flex items-center gap-2">
                                        <i class="pi pi-tag"></i>
                                        <div class="flex flex-wrap gap-2">
                                            <Tag v-for="label in issue.labels" :key="label" :value="label"
                                                severity="info" />
                                        </div>
                                    </li>
                                </ul>
                            </template>
                        </Card>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { format } from 'date-fns'
import { MdEditor, MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import {
    type IssueSpace, getIssueById, appendMessage,
    uploadFile, updateIssueVisible, updateIssueStatus
} from '@/issue/api/IssueAPI'
import { useUserStore } from '@/common/utils/store';
import { RoleMap } from '@/common/constant/Role';
const counterStore = useUserStore();
const isloading = ref(false);
const props = defineProps({
    id: {
        type: string,
        required: true
    }
})
// Mock数据（实际开发时从API获取）
const issue = ref<IssueSpace.IssueVO>({
    id: 123,
    title: '校园地图定位不准确问题',
    content: '',
    status: 0,
    author: '张三同学',
    priority: 0,
    issueTimelines: [],
    date: new Date(2024, 2, 15),
    labels: ['系统BUG', '定位服务'],
    visible: true,
    comments: [
        {
            id: 1,
            content: '已安排实地测量，预计3个工作日内更新地理信息数据',
            author: '李四（信息处）',
            roleId: 5,
            avatar: '/path/to/avatar.jpg',
            date: new Date(2024, 2, 16)
        }
    ],
})

// 评论相关
const newComment = ref('')
import type { ToolbarNames } from 'md-editor-v3'
import { Role } from '@/common/constant/Role';
import { string } from 'yup'
import globalMessage from '@/common/utils/toast'

const toolbars: ToolbarNames[] = [
    'bold',
    'underline',
    'italic',
    'strikeThrough',
    'sub',
    'sup',
    'codeRow',
    'link',
    'table',
    'image',
    'code',
    'prettier',
]
const statusValueMap = (status: IssueSpace.IssueVO['status']) => {
    return {
        0: '已提交',
        4: '已关闭',
        2: '解决中',
        3: '已解决',
        1: '待解决'
    }[status]
}
const statusSeverityMap = (status: IssueSpace.IssueVO['status']) => {
    return {
        0: 'info',
        4: 'danger',
        2: 'success',
        3: 'success',
        1: 'primary'
    }[status]
}
onMounted(() => {
    loadDetail();
})

const changeVisible = async (visible: boolean) => {
    // 调用API更新可见性
    await updateIssueVisible(Number(props.id), visible).then(() => {
        issue.value.visible = visible
        globalMessage.success("操作成功", "更新为" + (visible ? "可见" : "隐藏"))
    }).catch((err) => {
        globalMessage.error("更新可见性失败", err.message)
    })
}
const changeStatus = async (status?: number) => {
    // 调用API更新状态
    const statusTmp = status == undefined ? issue.value.status : status
    await updateIssueStatus(Number(props.id), statusTmp).then(() => {
        issue.value.status = status || issue.value.status
        globalMessage.success("操作成功", "更新为" + statusValueMap(statusTmp))
        //刷新
        loadDetail();
    }).catch((err) => {
        globalMessage.error("更新状态失败", err.message)
    })
}
const loadDetail = async () => {
    isloading.value = true
    await getIssueById(Number(props.id)).then((res) => {
        issue.value = res.data as IssueSpace.IssueVO
    }).catch((err) => {
        globalMessage.error("获取问题详情失败", err.message)
    }).finally(() => {
        isloading.value = false
    })
}
// 主题控制
const theme = ref<'light' | 'dark'>('light')
// 问题状态
const statusOptions = [
    { label: '已提交', value: 0 },
    { label: '待解决', value: 1 },
    { label: '解决中 ', value: 2 },
    { label: '已解决', value: 3 },
    { label: '已关闭', value: 4 }
]
const isSubmiting = ref(false);
// 提交评论
const submitComment = async () => {
    isSubmiting.value = true;
    try {
        if (!newComment.value.trim()) {
            isSubmiting.value = false;
            return;
        }

        // 先检测并上传本地临时图片（blob: URL）
        const blobRegex = /blob:[^\s)"']+/g;
        const localUrls = Array.from(new Set((newComment.value.match(blobRegex) || [])));
        if (localUrls.length > 0) {
            // 预校验：确保 pendingUploads 中存在对应文件且合法
            const missing = localUrls.filter(u => !pendingUploads.value[u]);
            if (missing.length > 0) {
                globalMessage.error('上传失败', '部分附件尚未准备或已失效，请重新插入或刷新页面');
                isSubmiting.value = false;
                return;
            }
            const invalid = localUrls.filter(u => {
                const f = pendingUploads.value[u];
                return !f || !f.name || String(f.name).trim() === '' || !f.type || !String(f.type).startsWith('image/');
            });
            if (invalid.length > 0) {
                globalMessage.error('上传失败', '部分附件不合法（必须为图片且文件名不可为空）');
                isSubmiting.value = false;
                return;
            }

            try {
                const uploadResults = await Promise.all(localUrls.map(async (localUrl) => {
                    const file = pendingUploads.value[localUrl];
                    if (!file) return { local: localUrl, remote: localUrl };
                    const form = new FormData();
                    form.append('files', file);
                    const resp = await uploadFile(form, {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    });
                    const data = (resp as any).data ?? resp;
                    let remoteUrl = '';
                    if (typeof data === 'string') remoteUrl = data;
                    else if (Array.isArray(data) && data.length > 0) remoteUrl = data[0];
                    else if (data && typeof data === 'object') remoteUrl = data.url || data.path || JSON.stringify(data);

                    // 清理本地临时 URL
                    try { URL.revokeObjectURL(localUrl); } catch (e) { /* ignore */ }
                    delete pendingUploads.value[localUrl];
                    return { local: localUrl, remote: remoteUrl };
                }));

                // 替换评论内容中的本地地址为远端地址
                uploadResults.forEach(r => {
                    if (r.remote && r.remote !== r.local) {
                        newComment.value = newComment.value.split(r.local).join(r.remote);
                    }
                });
            } catch (err: any) {
                console.error('上传附件失败', err);
                globalMessage.error('上传失败', err?.message || '部分附件上传失败');
                isSubmiting.value = false;
                return;
            }
        }

        // 上传并替换完成后提交评论
        const res = await appendMessage(Number(props.id), newComment.value);
        const data = res.data as IssueSpace.CommentVO;
        issue.value.comments.push(data);
        newComment.value = '';
    } catch (err: any) {
        globalMessage.error('提交失败', err?.message || String(err));
    } finally {
        isSubmiting.value = false;
    }
}

// 公共方法
const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd HH:mm')
}
// 本地暂存上传文件：key=blobUrl, value=File
const pendingUploads = ref<Record<string, File>>({});

const onUploadImg = async (files: any, callback: any) => {
    // 不立即上传；先将文件保存为本地 blob URL，交给编辑器预览，并在提交时统一上传
    const urls = files.map((file: File) => {
        const blobUrl = URL.createObjectURL(file);
        pendingUploads.value[blobUrl] = file;
        return blobUrl;
    });
    // 将本地临时地址返回给编辑器以便立即显示
    callback(urls);
};
</script>

<style scoped>
/* 自定义滚动条样式 */
::v-deep(.md-editor-preview-wrapper) {
    max-height: 500px;
    overflow-y: auto;
}

/* Timeline样式增强 */
::v-deep(.p-timeline-event-connector) {
    @apply bg-gray-200;
}

::v-deep(svg.md-editor-icon) {
    width: 23px !important;
    height: 23px !important;
}
</style>