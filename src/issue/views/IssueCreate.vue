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
    content: ''
})

// 可用标签选项
const availableLabels = [
    { name: '功能请求', value: 1 },
    { name: 'BUG', value: 2 },
    { name: '性能问题', value: 3 },
    { name: '其他', value: 4 }
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

## 题目编号
（如：P1001）

## 操作步骤
（例如：选择题目后点击提交按钮，页面未响应）

## 错误信息
（例如：服务器错误，页面显示“500 Internal Server Error”）

## 附加信息
（设备型号/浏览器版本等）
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

    if (errors.title || errors.content) return
    isSubmitting.value = true
    try {
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
    const res = await Promise.all(
        files.map((file: File) => {
            return new Promise((rev, rej) => {
                const form = new FormData();
                form.append('files', file);
                uploadFile(form, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                }).then((res) => {
                    rev(res)
                }).catch((err) => {
                    rej(err)
                })
            });
        })
    );

    callback(res.map((item) => item.data[0]));
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