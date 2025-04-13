<template>
    <div class="bg-white dark:bg-gray-800 mt-1 ml-2 mr-2 p-4 rounded-none shadow-md">
        <div id="functionArea">
            <!-- 题目列表标题 -->
            <div class="p-4 space-x-4 flex items-center">
                <h2 class="text-2xl font-bold text-blue-500">题目列表</h2>
                <ToggleSwitch v-tooltip.top="'只显示自己创建的题目'" @change="ownChange" v-model="isMe" />
            </div>
            <!-- 操作栏 -->
            <div class="flex items-center space-x-5 p-4">
                <!-- 搜索框 -->
                <span class="relative">
                    <InputText placeholder="输入关键词" v-model:model-value="content"
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
        <!-- 题目列表 -->
        <DataTable :value="problems" class="rounded-lg shadow-sm" :paginator="true" :rows="row" lazy
            :total-records="totalRecords" :first="first" @page="onPageChange"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            currentPageReportTemplate="共 {totalRecords} 条" dataKey="id">
            <Column field="id" header="题目ID" class="font-medium" style="max-width: 8%;"></Column>
            <Column field="title" header="题目标题" class="font-medium"></Column>

            <Column field="tags" header="题目标签">
                <template #body="slotProps">
                    <div class="flex overflow-x-hidden gap-1 max-w-[550px]">
                        <template v-for="(tag, index) in slotProps.data.tags" :key="index">
                            <span :style="{ backgroundColor: tag.color }" class="text-sm font-bold rounded px-2 py-1 
                 text-white shadow-sm whitespace-nowrap
                 transition-colors hover:brightness-110">
                                {{ tag.name }}
                            </span>
                        </template>
                    </div>
                </template>
            </Column>

            <Column header="操作" class="w-28">
                <template #body="slotProps">
                    <Button icon="pi pi-tag" @click="onTagDialogOpen(slotProps.data)"
                        class="p-button-rounded p-button-text !text-primary-600" v-tooltip.top="'编辑标签'" />
                </template>
            </Column>
        </DataTable>

        <!-- 标签编辑对话框 -->
        <Dialog v-model:visible="tagDialogVisible" header="标签管理" :modal="true" class="min-w-[360px]">
            <!-- 搜索与新建区域 -->
            <div class="space-y-4 p-4">
                <div class="flex gap-2">
                    <InputText v-model="searchText" placeholder="搜索标签..." class="flex-1" />
                    <Button icon="pi pi-plus" @click="showCreate = !showCreate"
                        class="!px-3 !py-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700" />
                </div>

                <!-- 新建标签表单 -->
                <div v-if="showCreate" class="space-y-3 border-t pt-4">
                    <InputText v-model="newTagName" placeholder="新标签名称" class="w-full !text-sm" />
                    <div class="flex flex-wrap gap-2">
                        <div v-for="(color, index) in colorPalette" :key="index" @click="selectedColor = color"
                            class="w-6 h-6 rounded-full cursor-pointer border-2 transition-all"
                            :class="[selectedColor === color ? 'scale-110 ring-2 ring-blue-500' : 'hover:scale-105']"
                            :style="{ backgroundColor: color }" />
                    </div>
                    <Button label="添加新标签" @click="createTagEvent"
                        class="!text-sm !px-3 !py-1.5 w-full bg-blue-500 hover:bg-blue-600 text-white"
                        :disabled="!newTagName || !selectedColor" />
                </div>
            </div>

            <!-- 标签选择列表 -->
            <div class="max-h-[50vh] overflow-y-auto border-t">
                <div v-if="filteredTags.length" class="p-4 grid gap-3">
                    <div v-for="tag in filteredTags" :key="tag.name" @click="toggleTag(tag)"
                        class="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors" :class="[isTagSelected(tag)
                            ? 'bg-blue-50 dark:bg-blue-900/50'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        ]">
                        <span class="w-4 h-4 rounded-full shadow-inner" :style="{ backgroundColor: tag.color }" />
                        <span class="text-sm">{{ tag.name }}</span>
                        <i v-if="isTagSelected(tag)" class="pi pi-check ml-auto text-blue-500" />
                    </div>
                </div>
                <div v-else class="p-6 text-center text-gray-400 text-sm">
                    未找到相关标签
                </div>
            </div>
            <Button label="保存" :loading="isSaving" @click="updateProblemTags"
                class="!px-4 !py-2 !mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white" />
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { type TagsSpace, getTags, createTag } from '@/admin/api/tagAPI';
import { type ProblemSpace, getAdminProblemAndTagVO, getAdminProblemCount, UpdateProblemTags } from '@/admin/api/problemAPI';
import globalMessage from '@/common/utils/toast';
// Base
const isMe = ref<boolean>(false)
const content = ref<string>('');
const row = 20;
const first = ref<number>(0);
const totalRecords = ref<number>(0);
const selectedStatus = ref<number>(0);
const problems = ref<ProblemSpace.ProblemAndTagVO[]>([])
const selectedProblem = ref<ProblemSpace.ProblemAndTagVO>({
    id: 0,
    title: '',
    tags: []
})
const showOptions = ref([
    { label: '全部题目', value: 0 },
    { label: '公开题目', value: 1 },
    { label: '隐藏题目', value: 2 },
]);
// 加载数据
onMounted(() => {
    loadAllProblems();
    loadAllProblemCount();
});
const ownChange = (event: any) => {
    isMe.value = event.data;
    loadAllProblems();
    loadAllProblemCount();
};
const modeChange = () => {
    loadAllProblems();
    loadAllProblemCount();
};
const onPageChange = (event: { first: number; rows: number }) => {
    first.value = event.first;
    loadAllProblems();
};
// 异步函数
async function loadAllProblems() {
    await getAdminProblemAndTagVO(first.value, isMe.value, selectedStatus.value, content.value)
        .then((res) => {
            problems.value = res.data as ProblemSpace.ProblemAndTagVO[];
        }).catch((err) => {
            globalMessage.error('获取题目列表失败', err.message);
        });
}
async function loadAllProblemCount() {
    await getAdminProblemCount(first.value, isMe.value, selectedStatus.value, content.value).then((res) => {
        totalRecords.value = res.data as number;
    }).catch((err) => {
        globalMessage.error('获取题目数量失败', err.message);
    });
}
const isSaving = ref(false);
async function updateProblemTags() {
    isSaving.value = true;
    if (selectedProblem.value.id === 0) {
        globalMessage.error('错误', '请选择题目');
        return;
    }
    const dto: ProblemSpace.UpdateProblemTagsDTO = {
        id: selectedProblem.value.id,
        tagIds: []
    };
    tags.value.forEach((tag) => {
        dto.tagIds.push(tag.id);
    });

    await UpdateProblemTags(dto).then(() => {
        globalMessage.success('成功', '更新题目标签成功');
        loadAllProblems();
    }).catch((err) => {
        globalMessage.error('更新题目标签失败', err.message);
    }).finally(() => {
        // 重置选中题目
        selectedProblem.value = {
            id: 0,
            title: '',
            tags: []
        };
        // 关闭对话框
        tagDialogVisible.value = false;
        isSaving.value = false;
    });

}
// Tag区域--Start
const tagDialogVisible = ref(false);
const allTags = ref<TagsSpace.TagVO[]>([]);
const searchText = ref('')
const newTagName = ref('')
const selectedColor = ref('#3B82F6')
const showCreate = ref(false)
const tags = ref<TagsSpace.TagVO[]>([]);
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
const onTagDialogOpen = (problem: ProblemSpace.ProblemAndTagVO) => {
    selectedProblem.value = problem;
    if (!problem.tags) {
        tags.value = [];
    } else {
        tags.value = JSON.parse(JSON.stringify(problem.tags));
    }
    tagDialogVisible.value = true;
    loadAllTags();
};
const loadAllTags = async () => {
    await getTags(searchText.value).then((res) => {
        allTags.value = res.data as TagsSpace.TagVO[];
    }).catch((err) => {
        globalMessage.error('获取标签列表失败', err.message);
    });
};
const createTagEvent = async () => {
    if (!newTagName.value) {
        globalMessage.error('错误', '标签名称不能为空');
        return;
    }
    const newTag = {
        name: newTagName.value,
        color: selectedColor.value
    };
    await createTag(newTag).then(() => {
        loadAllTags();
    }).catch((err) => {
        globalMessage.error('创建标签失败', err.message);
    });
    newTagName.value = '';
};
// 搜索过滤
const filteredTags = computed(() => {
    if (!searchText.value) {
        return allTags.value;
    }
    return allTags.value.filter(tag =>
        tag.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
})

// 标签选择逻辑
const isTagSelected = (tag: TagsSpace.TagVO) =>
    tags.value.some(t => t.name === tag.name)

const toggleTag = (tag: TagsSpace.TagVO) => {
    const index = tags.value.findIndex(t => t.name === tag.name)
    index === -1 ? tags.value.push(tag) : tags.value.splice(index, 1)
}
// Tag区域--End
</script>

<style scoped>
/* 自定义滚动条 */
::-webkit-scrollbar {
    @apply w-2 h-2;
}

::-webkit-scrollbar-thumb {
    @apply bg-surface-300 rounded-full;
}

/* 表格悬停效果 */
.p-datatable .p-datatable-tbody>tr {
    @apply transition-colors duration-200 hover:bg-surface-100;
}

/* 多选组件样式 */
.p-multiselect {
    @apply border-surface-300 rounded-lg;

    .p-multiselect-label {
        @apply gap-2;
    }
}
</style>