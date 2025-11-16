<template>
    <div class="w-full mx-auto p-4">
        <div class="grid md:grid-cols-12 gap-6">
            <!-- 主表单区域 -->
            <div class="md:col-span-8">
                <Card>
                    <template #title>新建问题反馈</template>
                    <template #content>
                        <form @submit.prevent="submitForm" class="space-y-6">
                            <!-- 标题输入 -->
                            <div>
                                <label for="title" class="block text-sm font-medium mb-2">标题</label>
                                <InputText id="title" v-model="formData.title" class="w-full" maxlength="40"
                                    :class="{ 'p-invalid': errors.title }" @blur="validateField('title')" />
                                <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
                            </div>

                            <!-- Markdown编辑器 -->
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <label class="text-sm font-medium">详细描述</label>
                                    <div class="space-x-2">
                                        <Button label="预览" class="p-button-text p-button-sm"
                                            :class="{ 'text-primary': isPreview }" @click="togglePreview" />
                                        <Button label="编辑" class="p-button-text p-button-sm"
                                            :class="{ 'text-primary': !isPreview }" @click="togglePreview" />
                                    </div>
                                </div>
                                <div v-show="!isPreview">
                                    <MdEditor v-model="formData.content" :theme="theme" placeholder="请详细描述您的问题..."
                                        :toolbars="toolbars" class="markdown-editor" @on-upload-img="onUploadImg" />
                                    <small v-if="errors.content" class="p-error">{{ errors.content }}</small>
                                </div>
                                <div v-show="isPreview" class="preview-container border p-4 rounded">
                                    <MdPreview :modelValue="formData.content" />
                                </div>
                            </div>

                            <!-- 标签选择 -->
                            <div>
                                <label class="block text-sm font-medium mb-2">标签</label>
                                <MultiSelect v-model="formData.labels" :options="availableLabels" optionLabel="name"
                                    optionValue="value" display="chip" class="w-full" />
                            </div>

                            <!-- 提交按钮 -->
                            <div class="flex justify-end gap-2">
                                <Button label="取消" severity="secondary" @click="cancelForm" />
                                <Button type="submit" label="提交反馈" icon="pi pi-send" :loading="isSubmitting" />
                            </div>
                        </form>
                    </template>
                </Card>
            </div>

            <!-- 右侧辅助信息 -->
            <div class="md:col-span-4">
                <Card class="shadow-none border">
                    <template #title>提交指南</template>
                    <template #content>
                        <div class="prose prose-sm text-gray-600">
                            <MdPreview :modelValue="guidanceContent" />
                        </div>
                    </template>
                </Card>

                <!-- 状态选择 -->
                <Card class="shadow-none border mt-4">
                    <template #title>其他选项</template>
                    <template #content>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">优先级</label>
                                <Dropdown v-model="formData.priority" :options="priorityOptions" optionLabel="label"
                                    optionValue="value" class="w-full" />
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { ToolbarNames } from 'md-editor-v3'
import { useRouter } from 'vue-router'
import { MdEditor, MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { type IssueSpace, createIssue, uploadFile } from '@/issue/api/IssueAPI'
import globalMessage from '@/common/utils/toast'

const router = useRouter()
const theme = ref<'light' | 'dark'>('light')
const isPreview = ref(false)
const isSubmitting = ref(false)

// 本地暂存上传文件：key=blobUrl, value=File
const pendingUploads = ref<Record<string, File>>({});

// 表单数据
const formData = reactive<IssueSpace.AddIssueDTO>({
    title: '',
    content: '',
    labels: [],
    priority: 0
})

// 验证错误信息
const errors = reactive({
    title: '',
    content: '',
    priority: ''
})

// 可用标签选项
const availableLabels = [
    { name: '功能请求', value: 1 },
    { name: 'BUG报告', value: 2 },
    { name: '性能问题', value: 3 },
    { name: '使用疑问', value: 4 },
    { name: '其他问题', value: 5 }
]

const priorityOptions = [
    { label: '低', value: 0 },
    { label: '中', value: 1 },
    { label: '高', value: 2 }
]

const toolbars = [
    'bold',
    'underline',
    'italic',
    'strikeThrough',
    'codeRow',
    'link',
    'table',
    'image',
    'code',
    'prettier',
    'save',
    'pageFullscreen'
] as ToolbarNames[]

// 提交指南内容（Markdown格式）
const guidanceContent = `
  ### 济南大学OJ系统问题反馈指南

1. 请清晰描述问题现象
2. 提供您尝试过的操作步骤（如果有）
3. 提供题目编号和提交记录（如果有）
4. 请注明浏览器版本及操作系统
5. 如果可能，提供截图或错误信息

**示例模板**：
\`\`\`markdown
## 问题描述
（简要概述问题）
    加入比赛输入密码后提示加入成功，但无页面跳转，刷新依旧显示无权访问。
    再次输入密码确认后显示用户已加入。
## 题目编号或比赛编号
（如：P1001）
    Contest2134
## 复现步骤
（例如：选择题目后点击提交按钮，页面未响应）
    1.从比赛页面打开Contest2134。
    2.输入密码，点击确认。
    3.提示加入成功，但页面无跳转，刷新后显示无权访问。
## 错误信息
（例如：服务器错误，页面显示“500 Internal Server Error”）
    第一次无错误信息，第二次加入显示用户已加入。
## 附加信息
（设备型号/浏览器版本等）
    Windows11 Firefox 142.0
\`\`\`

  `

const validateField = (field: keyof typeof errors) => {
    if (field === 'title') {
        errors.title = formData.title.trim() ? '' : '标题不能为空'
    }
    if (field === 'content') {
        errors.content = formData.content.trim() ? '' : '内容不能为空'
    }
}

const togglePreview = () => {
    isPreview.value = !isPreview.value
}

const cancelForm = () => {
    router.push('/issues')
}

const submitForm = async () => {
    validateField('title')
    validateField('content')
    // 校验 priority 必选
    if (typeof formData.priority === 'undefined' || formData.priority === null) {
        errors.priority = '请选择类型';
    } else {
        errors.priority = '';
    }

    // 去除 labels 中的空字符串并校验
    if (Array.isArray(formData.labels)) {
        formData.labels = formData.labels.filter((l: any) => String(l).trim() !== '');
        if (formData.labels.length === 0) {
            globalMessage.error('提示', '请至少选择一个标签');
            return;
        }
    }

    if (errors.title || errors.content || errors.priority) return
    isSubmitting.value = true
    try {
        // 先处理待上传的本地文件（blob: URLs）
        const blobRegex = /blob:[^\s)"']+/g;
        const localUrls = Array.from(new Set((formData.content.match(blobRegex) || [])));
        if (localUrls.length > 0) {
            // 预校验：确保所有本地 URL 对应的文件仍存在于 pendingUploads 且为合法图片
            const missing = localUrls.filter(u => !pendingUploads.value[u]);
            if (missing.length > 0) {
                globalMessage.error('上传失败', '部分附件尚未准备或已失效，请重新插入或刷新页面');
                isSubmitting.value = false;
                return;
            }
            const invalid = localUrls.filter(u => {
                const f = pendingUploads.value[u];
                return !f || !f.name || String(f.name).trim() === '' || !f.type || !String(f.type).startsWith('image/');
            });
            if (invalid.length > 0) {
                globalMessage.error('上传失败', '部分附件不合法（必须为图片且文件名不可为空）');
                isSubmitting.value = false;
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
                    // 后端可能返回字符串、数组或对象，尝试提取第一个可用的 URL/路径
                    let remoteUrl = '';
                    if (typeof data === 'string') remoteUrl = data;
                    else if (Array.isArray(data) && data.length > 0) remoteUrl = data[0];
                    else if (data && typeof data === 'object') remoteUrl = data.url || data.path || JSON.stringify(data);
                    // 保持后端返回的路径原样（例如 /api/u/issue/upload/xxx.jpg），不要强制添加 origin

                    // 清理本地临时 URL
                    try { URL.revokeObjectURL(localUrl); } catch (e) { /* ignore */ }
                    delete pendingUploads.value[localUrl];
                    return { local: localUrl, remote: remoteUrl };
                }));

                // 用返回的远端地址替换内容中的本地地址
                uploadResults.forEach(r => {
                    if (r.remote && r.remote !== r.local) {
                        formData.content = formData.content.split(r.local).join(r.remote);
                    }
                });
            } catch (err: any) {
                console.error('上传附件失败', err);
                globalMessage.error('上传失败', err?.message || '部分附件上传失败');
                isSubmitting.value = false;
                return;
            }
        }

        // 所有附件替换完成后再提交 issue
        await createIssue(formData).then(() => {
            globalMessage.success('提示', '问题反馈提交成功')
            router.push('/issues')
        }).catch((err) => {
            globalMessage.error('提示', err.message)
        })

    } finally {
        isSubmitting.value = false
    }
}
const onUploadImg = async (files: any, callback: any) => {
    // 校验并过滤文件：文件名不能空，且必须为图片类型
    const validFiles: File[] = [];
    const invalidReasons: string[] = [];
    files.forEach((file: any) => {
        if (!(file instanceof File)) {
            invalidReasons.push('存在非文件对象，已忽略');
            return;
        }
        if (!file.name || String(file.name).trim() === '') {
            invalidReasons.push('文件名不能为空');
            return;
        }
        if (!file.type || !file.type.startsWith('image/')) {
            invalidReasons.push(`${file.name} 不是图片类型，已忽略`);
            return;
        }
        validFiles.push(file);
    });

    if (invalidReasons.length > 0) {
        // 只提示一次，避免过多弹窗
        globalMessage.warn('上传提醒', invalidReasons.join('; '));
    }

    // 为通过校验的文件生成本地 blob URL 并暂存
    const urls = validFiles.map((file: File) => {
        const blobUrl = URL.createObjectURL(file);
        pendingUploads.value[blobUrl] = file;
        return blobUrl;
    });
    // 将本地临时地址返回给编辑器以便立即显示
    callback(urls);
};
</script>

<style scoped>
.container {
    max-width: 1280px;
}

.markdown-editor {
    min-height: 400px;
}

.preview-container {
    min-height: 400px;
    background: var(--surface-card);
}

/* 调整卡片间距 */
.p-card-content {
    @apply space-y-6;
}
</style>
<style scoped>
/* 自定义滚动条样式 */
::v-deep(.md-editor-preview-wrapper) {
    max-height: 500px;
    overflow-y: auto;
}
</style>