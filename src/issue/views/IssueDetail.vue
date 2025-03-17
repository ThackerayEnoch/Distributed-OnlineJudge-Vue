<!-- IssueDetail.vue -->
<template>
    <div class="w-full mx-auto p-0">
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
                    <div class="space-x-2">
                        <Dropdown v-model="issue.status" :options="statusOptions" optionLabel="label"
                            optionValue="value" class="w-40" size="small" placeholder="选择状态" />
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
                                <span class="font-bold">添加评论</span>
                                <MdEditor v-model="newComment" style="max-height: 250px;;" class="mt-2" :theme="theme"
                                    placeholder="请输入您的评论..." :toolbars="toolbars" />
                                <div class="mt-4 flex justify-end">
                                    <Button v-if="issue.status === 'closed'" label="重新打开"
                                        class="p-button-outlined mr-2 p-button-secondary" icon="pi pi-refresh"
                                        @click="reopenComment" />
                                    <Button label="提交评论" icon="pi pi-send" @click="submitComment"
                                        :disabled="issue.status === 'closed'" />
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

                        <Card class="shadow-none border" v-if="issue.dueDate">
                            <template #title>时间跟踪</template>
                            <template #content>
                                <Timeline :value="timelineEvents" align="alternate" class="py-2">
                                    <template #content="{ item }">
                                        <div class="text-xs p-2">
                                            {{ item.status }}<br>
                                            <span class="text-gray-500">{{ formatDate(item.date) }}</span>
                                        </div>
                                    </template>
                                </Timeline>
                            </template>
                        </Card>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { MdEditor, MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

// 类型定义
interface User {
    id: string
    name: string
    avatar: string
}

interface Comment {
    id: number
    content: string
    author: string
    avatar: string
    date: Date
}

interface Issue {
    id: number
    title: string
    content: string
    status: 'open' | 'closed' | 'inprogress' | 'resolved' | 'pending'
    author: string
    date: Date
    labels: string[]
    assignee?: string
    comments: Comment[]
    dueDate?: Date
}

// Mock数据（实际开发时从API获取）
const issue = ref<Issue>({
    id: 123,
    title: '校园地图定位不准确问题',
    content: `
---

# OJ系统错误描述

**错误编号**：[填写错误编号]
**错误级别**：[低 / 中 / 高 / 致命]  
**错误时间**：[YYYY - MM - DD HH: MM: SS]  
**提交编号**：[填写提交ID]
**用户ID**：[填写用户ID]
**比赛/作业名称**：[填写比赛或作业名称]  
**题目编号**：[填写题目编号]  
**浏览器/客户端**：[Chrome / Firefox / Edge / 其他]  
**操作系统**：[Windows / Mac / Linux / 其他]  
**判题机版本**：[填写判题机版本]  
**Web服务版本**：[填写Web服务版本]  

---

## 错误现象
简要描述错误现象，例如页面崩溃、无法提交、判题错误等。

示例：  
- 页面显示“500 Internal Server Error”。  
- 提交后评测状态长时间卡在“Pending”。  
- 代码提交成功但无判题记录。  

---

## 错误截图
请粘贴截图或附上截图文件，标明关键错误信息。

---

## 重现步骤
描述如何触发该错误，便于开发人员复现。

1. 打开[页面URL]。  
2. 登录账号[用户ID]。  
3. 进入[比赛 / 作业名称]的[题目编号]页面。  
4. 点击“提交”按钮。  
5. 错误出现，页面显示[错误信息]。  

---

## 预期行为
描述在正常情况下系统应有的行为。  

示例：  
- 页面应正常显示提交结果并更新评测状态。  
- 评测结果应在合理时间内更新为[Accepted / Rejected]。  

---

## 日志信息
请附上相关日志信息，包含判题机和Web服务的日志。  

**判题机日志**：  

    [日志内容]


**Web服务日志**：  

    [日志内容]


---

## 其他信息
- 是否尝试清除缓存：[是 / 否]  
- 是否尝试更换浏览器：[是 / 否]  
- 是否尝试重启服务：[是 / 否]  
- 其他相关描述：[填写其他有助于定位问题的信息]  

---

## 联系人
**报告人**：[填写姓名]  
**联系方式**：[填写联系方式]  

---
`,
    status: 'closed',
    author: '张三同学',
    date: new Date(2024, 2, 15),
    labels: ['系统BUG', '定位服务'],
    assignee: '李四（信息处）',
    comments: [
        {
            id: 1,
            content: '已安排实地测量，预计3个工作日内更新地理信息数据',
            author: '李四（信息处）',
            avatar: '/path/to/avatar.jpg',
            date: new Date(2024, 2, 16)
        }
    ],
    dueDate: new Date(2024, 2, 20)
})

// 评论相关
const newComment = ref('')
const toolbars = [
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
const statusValueMap = (status: Issue['status']) => {
    return {
        open: '已提交',
        closed: '已关闭',
        inprogress: '解决中',
        resolved: '已解决',
        pending: '待解决'
    }[status]
}
const statusSeverityMap = (status: Issue['status']) => {
    return {
        open: 'info',
        closed: 'danger',
        inprogress: 'success',
        resolved: 'success',
        pending: 'primary'
    }[status]
}
// 主题控制
const theme = ref<'light' | 'dark'>('light')
// 问题状态
const statusOptions = [
    { label: '已提交', value: 'open' },
    { label: '待解决', value: 'pending' },
    { label: '解决中 ', value: 'inprogress' },
    { label: '已解决', value: 'resolved' },
    { label: '已关闭', value: 'closed' }
]
// 时间线数据
const timelineEvents = [
    { status: '问题创建', date: issue.value.date },
    { status: '管理员回复', date: new Date(2024, 2, 16) },
    { status: '问题解决', date: new Date(2024, 2, 18) },
    { status: '问题关闭', date: new Date(2024, 2, 20) }
]

// 提交评论
const submitComment = () => {
    if (!newComment.value.trim()) return

    issue.value.comments.push({
        id: issue.value.comments.length + 1,
        content: newComment.value,
        author: '计科2202张鹏飞(管理员)',
        avatar: '/path/to/current-user-avatar.jpg',
        date: new Date()
    })

    newComment.value = ''
}

// 公共方法
const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd HH:mm')
}
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