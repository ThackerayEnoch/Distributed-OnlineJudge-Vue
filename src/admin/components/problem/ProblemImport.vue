<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FileUploadSelectEvent } from 'primevue/fileupload'
import { useToast } from 'primevue/usetoast'
import { importFPSProblem, importQDUOJProblem, importHydroProblem } from '@/admin/api/problemImport'
import type { importSpace } from '@/admin/api/problemImport'

// 接口定义
interface ImportFormat {
    value: string
    label: string
    description: string
    icon: string
    enabled: boolean
}

interface ImportResult {
    success: boolean
    message: string
    data?: {
        importedCount: number
        failedCount: number
        problems: importSpace.ProblemImportResultVO[]
    }
}

// 状态管理
const selectedFormat = ref<string>('')
const uploadedFile = ref<File | null>(null)
const isImporting = ref(false)
const importResult = ref<ImportResult | null>(null)
const showResult = ref(false)

const toast = useToast()

// 支持的导入格式
const importFormats: ImportFormat[] = [
    {
        value: 'fps',
        label: 'FPS格式',
        description: 'HustOJ格式，支持标准题目结构',
        icon: 'pi pi-file-excel',
        enabled: true
    },
    {
        value: 'qduoj',
        label: 'QDUOJ格式',
        description: '青岛大学OJ导出格式，兼容性强',
        icon: 'pi pi-database',
        enabled: false
    },
    {
        value: 'hydro',
        label: 'Hydro格式',
        description: 'Hydro OJ平台标准格式',
        icon: 'pi pi-cloud',
        enabled: false
    }
]

// 计算属性
const canImport = computed(() => {
    return selectedFormat.value && uploadedFile.value && !isImporting.value
})

// 文件上传处理
const onFileSelect = (event: FileUploadSelectEvent) => {
    if (Array.isArray(event.files) && event.files.length > 0) {
        uploadedFile.value = event.files[0]
        toast.add({
            severity: 'success',
            summary: '文件选择成功',
            detail: `已选择文件: ${event.files[0].name}`,
            life: 3000
        })
    }
}

const onFileRemove = () => {
    uploadedFile.value = null
    toast.add({
        severity: 'info',
        summary: '文件已移除',
        detail: '请重新选择文件',
        life: 3000
    })
}

// 真实API调用
const callImportAPI = async (): Promise<ImportResult> => {
    if (!uploadedFile.value || !selectedFormat.value) {
        throw new Error('文件或格式未选择')
    }

    try {
        let apiResult: any

        // 根据选择的格式调用对应的API
        switch (selectedFormat.value) {
            case 'fps':
                apiResult = await importFPSProblem(uploadedFile.value)
                break
            case 'qduoj':
                apiResult = await importQDUOJProblem(uploadedFile.value)
                break
            case 'hydro':
                apiResult = await importHydroProblem(uploadedFile.value)
                break
            default:
                throw new Error(`不支持的格式: ${selectedFormat.value}`)
        }

        // 提取实际的数据
        const apiResponse: importSpace.ProblemImportResultVO[] = apiResult.data || apiResult

        // 统计导入结果
        const importedCount = apiResponse.filter(item => item.result).length
        const failedCount = apiResponse.filter(item => !item.result).length

        return {
            success: true,
            message: '导入完成',
            data: {
                importedCount,
                failedCount,
                problems: apiResponse
            }
        }
    } catch (error: any) {
        console.error('导入失败:', error)
        return {
            success: false,
            message: error.message || '导入过程中发生错误'
        }
    }
}

// 执行导入
const executeImport = async () => {
    if (!canImport.value) return

    isImporting.value = true
    showResult.value = false

    try {
        toast.add({
            severity: 'info',
            summary: '开始导入',
            detail: '正在解析文件，请稍候...',
            life: 3000
        })

        const result = await callImportAPI()
        importResult.value = result
        showResult.value = true

        if (result.success) {
            toast.add({
                severity: 'success',
                summary: '导入完成',
                detail: result.message,
                life: 5000
            })
        } else {
            toast.add({
                severity: 'error',
                summary: '导入失败',
                detail: result.message,
                life: 5000
            })
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: '导入异常',
            detail: '系统出现异常，请稍后重试',
            life: 5000
        })
    } finally {
        isImporting.value = false
    }
}

// 重置表单
const resetForm = () => {
    selectedFormat.value = ''
    uploadedFile.value = null
    importResult.value = null
    showResult.value = false
}
</script>

<template>
    <div class="problem-import-container p-8">
        <!-- 页面标题 -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">题目导入</h1>
            <p class="text-gray-600">选择格式并上传XML文件来批量导入题目</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- 导入配置区域 -->
            <div class="lg:col-span-2">
                <Card class="mb-6">
                    <template #title>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-cog text-blue-500"></i>
                            <span>导入配置</span>
                        </div>
                    </template>
                    <template #content>
                        <!-- 格式选择 -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-3">
                                选择导入格式 *
                            </label>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div v-for="format in importFormats" :key="format.value" class="format-option" :class="{
                                    'selected': selectedFormat === format.value,
                                    'disabled': !format.enabled
                                }" @click="format.enabled && (selectedFormat = format.value)">
                                    <div class="flex items-start gap-3">
                                        <i :class="format.icon" class="text-xl mt-1"></i>
                                        <div class="flex-1">
                                            <h3 class="font-semibold"
                                                :class="format.enabled ? 'text-gray-900' : 'text-gray-400'">
                                                {{ format.label }}
                                                <span v-if="!format.enabled"
                                                    class="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded ml-2">
                                                    即将上线
                                                </span>
                                            </h3>
                                            <p class="text-sm mt-1"
                                                :class="format.enabled ? 'text-gray-600' : 'text-gray-400'">
                                                {{ format.description }}
                                            </p>
                                        </div>
                                    </div>
                                    <div v-if="selectedFormat === format.value && format.enabled" class="check-mark">
                                        <i class="pi pi-check"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- 文件上传 -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-3">
                                上传XML文件 *
                            </label>
                            <FileUpload accept=".xml" :maxFileSize="104857600" :auto="false" :multiple="false"
                                chooseLabel="选择文件" mode="basic" @select="onFileSelect" @remove="onFileRemove"
                                class="w-full">
                                <template #empty>
                                    <div class="flex flex-col items-center justify-center py-8">
                                        <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-4"></i>
                                        <p class="text-gray-500 mb-2">点击选择XML文件或拖拽文件到此处</p>
                                        <p class="text-sm text-gray-400">支持最大100MB的XML文件</p>
                                    </div>
                                </template>
                            </FileUpload>

                            <!-- 已选择文件信息 -->
                            <div v-if="uploadedFile" class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-file text-blue-500"></i>
                                        <div>
                                            <p class="font-medium text-blue-900">{{ uploadedFile.name }}</p>
                                            <p class="text-sm text-blue-600">{{ (uploadedFile.size / 1024).toFixed(1) }}
                                                KB</p>
                                        </div>
                                    </div>
                                    <Button @click="onFileRemove" icon="pi pi-times" severity="danger" text
                                        size="small" />
                                </div>
                            </div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="flex gap-3">
                            <Button @click="executeImport" :disabled="!canImport" :loading="isImporting" class="flex-1">
                                <i class="pi pi-upload mr-2"></i>
                                {{ isImporting ? '导入中...' : '开始导入' }}
                            </Button>
                            <Button @click="resetForm" severity="secondary" outlined :disabled="isImporting">
                                <i class="pi pi-refresh mr-2"></i>
                                重置
                            </Button>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- 帮助信息区域 -->
            <div class="lg:col-span-1">
                <Card>
                    <template #title>
                        <div class="flex items-center gap-2">
                            <i class="pi pi-info-circle text-green-500"></i>
                            <span>导入说明</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="space-y-4 text-sm">
                            <div>
                                <h4 class="font-semibold text-gray-900 mb-2">支持的格式</h4>
                                <ul class="space-y-1 text-gray-600">
                                    <li>• FPS格式：HustOJ题目格式</li>
                                    <li>• QDUOJ格式：青岛大学OJ格式</li>
                                    <li>• Hydro格式：Hydro平台格式</li>
                                </ul>
                            </div>

                            <div>
                                <h4 class="font-semibold text-gray-900 mb-2">文件要求</h4>
                                <ul class="space-y-1 text-gray-600">
                                    <li>• 文件格式：XML</li>
                                    <li>• 文件大小：最大100MB</li>
                                    <li>• 编码格式：UTF-8</li>
                                </ul>
                            </div>

                            <div>
                                <h4 class="font-semibold text-gray-900 mb-2">注意事项</h4>
                                <ul class="space-y-1 text-gray-600">
                                    <li>• 请确保XML格式正确</li>
                                    <li>• 包含测试数据的题目会自动导入</li>
                                    <li>• 重复题目将被跳过</li>
                                </ul>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- 导入结果 -->
        <div v-if="showResult && importResult" class="mt-8">
            <Card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <i
                            :class="importResult.success ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-500'"></i>
                        <span>导入结果</span>
                    </div>
                </template>
                <template #content>
                    <div v-if="importResult.success && importResult.data" class="space-y-4">
                        <!-- 统计信息 -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-check-circle text-green-500 text-xl"></i>
                                    <div>
                                        <p class="text-lg font-semibold text-green-900">{{
                                            importResult.data.importedCount }}</p>
                                        <p class="text-sm text-green-600">成功导入</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-times-circle text-red-500 text-xl"></i>
                                    <div>
                                        <p class="text-lg font-semibold text-red-900">{{ importResult.data.failedCount
                                            }}</p>
                                        <p class="text-sm text-red-600">导入失败</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 详细结果 -->
                        <div>
                            <h4 class="font-semibold text-gray-900 mb-3">题目详情</h4>
                            <div class="space-y-2">
                                <div v-for="(problem, index) in importResult.data.problems" :key="index"
                                    class="flex items-center justify-between p-3 rounded-lg border"
                                    :class="problem.result ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
                                    <div class="flex items-center gap-3">
                                        <i
                                            :class="problem.result ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i>
                                        <span class="font-medium">{{ problem.title }}</span>
                                    </div>
                                    <div v-if="problem.message" class="text-sm text-gray-600">
                                        {{ problem.message }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 失败信息 -->
                    <div v-else class="text-center py-8">
                        <i class="pi pi-times-circle text-red-500 text-4xl mb-4"></i>
                        <h3 class="text-lg font-semibold text-red-900 mb-2">导入失败</h3>
                        <p class="text-red-600">{{ importResult.message }}</p>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.problem-import-container {
    margin: 0 auto;
}

.format-option {
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

.format-option:hover {
    border-color: #93c5fd;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.format-option.selected {
    border-color: #3b82f6;
    background-color: #eff6ff;
}

.format-option.disabled {
    cursor: not-allowed;
    background-color: #f9fafb;
    border-color: #e5e7eb;
    opacity: 0.6;
}

.format-option.disabled:hover {
    border-color: #e5e7eb;
    box-shadow: none;
}

.check-mark {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 1.5rem;
    height: 1.5rem;
    background-color: #3b82f6;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
}

:deep(.p-fileupload-basic) {
    width: 100%;
}

:deep(.p-fileupload-choose) {
    width: 100%;
    justify-content: center;
}

:deep(.p-fileupload-buttonbar) {
    display: none !important;
}

:deep(.p-fileupload-files) {
    display: none !important;
}

:deep(.p-fileupload-content) {
    border: 2px dashed #d1d5db;
    border-radius: 0.5rem;
    background: #fafafa;
    transition: all 0.2s;
}

:deep(.p-fileupload-content:hover) {
    border-color: #93c5fd;
    background: #f8fafc;
}

:deep(.p-card-title) {
    font-size: 1.125rem;
    font-weight: 600;
}

:deep(.p-card-content) {
    padding-top: 0;
}
</style>