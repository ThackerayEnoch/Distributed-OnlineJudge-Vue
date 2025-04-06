<template>
    <div class="w-full p-4 bg-gray-50">
        <!-- 集成搜索框的标题栏 -->
        <div class="flex justify-between items-center mb-6">
            <!-- 左侧标题和搜索容器 -->
            <div class="flex items-center gap-4 flex-1">
                <h1 class="text-2xl font-bold text-gray-800">题目标签管理</h1>

                <!-- 搜索输入组 -->
                <div class="p-inputgroup flex-1" style="max-width: 360px">
                    <InputText v-model="searchQuery" placeholder="输入搜索关键词" class="!rounded-r-none border-r-0"
                        @keyup.enter="handleSearch" />
                    <Button icon="pi pi-search" @click="handleSearch"
                        class="bg-ujn-blue border-ujn-blue hover:bg-ujn-blue-dark text-white !rounded-l-none" />
                </div>
            </div>

            <!-- 右侧新增按钮 -->
            <Button label="新增标签" icon="pi pi-plus" @click="openNew"
                class="bg-ujn-blue hover:bg-ujn-blue-dark text-white" />
        </div>

        <!-- 标签展示区域 -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div v-for="tag in tags" :key="tag.id"
                class="flex items-center justify-between p-3 rounded-lg shadow-sm transition-all hover:shadow-md"
                :style="{ backgroundColor: tag.color }">
                <span class="font-bold text-white text-sm" :class="textColor(tag.color)">
                    {{ tag.name }}
                </span>
                <div class="flex space-x-2">
                    <i class="pi pi-pencil cursor-pointer hover:text-white" :class="textColor(tag.color)"
                        @click="editTag(tag)"></i>
                    <i class="pi pi-trash cursor-pointer hover:text-red-500" :class="textColor(tag.color)"
                        @click="confirmDelete(tag)"></i>
                </div>
            </div>
        </div>

        <!-- 新增/编辑对话框 -->
        <Dialog v-model:visible="dialogVisible" :header="formTitle" :style="{ width: '400px' }">
            <div class="space-y-4">
                <InputText v-model="currentTag.name" placeholder="标签名称" class="w-full" />

                <!-- 颜色选择器 -->
                <div class="grid grid-cols-5 gap-2">
                    <div v-for="color in colorPalette" :key="color"
                        class="h-8 w-full rounded cursor-pointer border-2 transition-all"
                        :class="{ 'border-white scale-110': currentTag.color === color }"
                        :style="{ backgroundColor: color }" @click="currentTag.color = color"></div>
                </div>
            </div>

            <template #footer>
                <Button label="取消" class="p-button-text" @click="closeDialog" />
                <Button :label="formAction" class="bg-ujn-blue text-white" :loading="saving" @click="saveTag" />
            </template>
        </Dialog>

        <!-- 删除确认 -->
        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { type TagsSpace, getTags, createTag, updateTag, deleteTag } from '@/admin/api/tagAPI';
import globalMessage from '@/common/utils/toast';
const searchQuery = ref('');

onMounted(() => {
    loadAllTags();
});
const handleSearch = () => {
    loadAllTags();
};
async function deleteTagEvent(tag: TagsSpace.TagVO) {
    await deleteTag(tag.id).then(() => {
        loadAllTags();
    }).catch((err) => {
        globalMessage.error('删除标签失败', err.message);
    });
}
async function updateTagEvent(tag: TagsSpace.AdminCreateAndUpdateTagDTO) {
    await updateTag(tag).then(() => {
        loadAllTags();
    }).catch((err) => {
        globalMessage.error('更新标签失败', err.message);
    });
}
async function createTagEvent(tag: TagsSpace.AdminCreateAndUpdateTagDTO) {
    await createTag(tag).then(() => {
        loadAllTags();
    }).catch((err) => {
        globalMessage.error('创建标签失败', err.message);
    });
}
async function loadAllTags() {
    await getTags(searchQuery.value).then((res) => {
        tags.value = res.data as TagsSpace.TagVO[];
    }).catch((err) => {
        globalMessage.error('获取标签列表失败', err.message);
    });
}
// 济南大学主题色板（包含UJN蓝）
const colorPalette = [
    "#8b5cf6",  // 深紫
    "#6366f1",  // 靛蓝
    "#d946ef",  // 紫红
    "#a855f7",  // 学士服紫
    "#ef4444",  // 警戒红
    "#64748b",  // 石板灰
    "#f472b6",  // 粉红
    "#14b8a6",  // 蓝绿
    "#06b6d4",  // 青色
    "#10b981",  // 翡翠绿
    "#22c55e",  // 成功绿
    "#0ea5e9",  // 天空蓝
    "#f59e0b",  // 琥珀黄
    "#eab308",  // 黄金黄
    "#84cc16"   // 酸橙绿
];

const tags = ref<TagsSpace.TagVO[]>([]);

const dialogVisible = ref(false);
const currentTag = ref<TagsSpace.TagVO>({ id: 0, name: '', color: colorPalette[0] });
const isEditMode = ref(false);
const confirm = useConfirm();

// 计算文字颜色（根据背景亮度自动切换）
const textColor = (hexColor: string) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'text-gray-800' : 'text-white';
};

const formTitle = computed(() => isEditMode.value ? '编辑标签' : '新建标签');
const formAction = computed(() => isEditMode.value ? '更新' : '创建');

const openNew = () => {
    currentTag.value = { id: 0, name: '', color: colorPalette[0] };
    isEditMode.value = false;
    dialogVisible.value = true;
};

const editTag = (tag: TagsSpace.TagVO) => {
    currentTag.value = { ...tag };
    isEditMode.value = true;
    dialogVisible.value = true;
};
const saving = ref(false);
const saveTag = async () => {
    if (!currentTag.value.name.trim()) return;
    saving.value = true;
    if (isEditMode.value) {
        await updateTagEvent(currentTag.value).then(() => {
            const index = tags.value.findIndex(t => t.id === currentTag.value.id);
            tags.value[index] = { ...currentTag.value };
            globalMessage.success('提示', '更新标签成功');
        }).catch((err) => {
            globalMessage.error('更新标签失败', err.message);
        });

    } else {
        await createTagEvent(currentTag.value).then(() => {
            tags.value.push({
                ...currentTag.value,
                id: Math.max(...tags.value.map(t => t.id)) + 1
            });
            globalMessage.success('提示', '创建标签成功');
        }).catch((err) => {
            globalMessage.error('创建标签失败', err.message);
        });
    }
    closeDialog();
    saving.value = false;
};
const isDeleting = ref(false);
const confirmDelete = (tag: TagsSpace.TagVO) => {
    confirm.require({
        message: `确定要删除 "${tag.name}" 标签吗？`,
        header: '确认删除',
        accept: async () => {
            isDeleting.value = true;
            await deleteTagEvent(tag).then(() => {
                globalMessage.success('提示', '删除标签成功');
                tags.value = tags.value.filter(t => t.id !== tag.id);
            }).catch((err) => {
                globalMessage.error('删除标签失败', err.message);
            }).finally(() => {
                isDeleting.value = false;
            });
        }
    });
};

const closeDialog = () => {
    dialogVisible.value = false;
};
</script>

<style scoped>
/* 自定义济南大学主题蓝 */
.bg-ujn-blue {
    background-color: #2A5CAA;
}

.hover\:bg-ujn-blue-dark:hover {
    background-color: #1E416F;
}
</style>