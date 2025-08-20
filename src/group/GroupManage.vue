<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from "primevue/useconfirm";
import { type GroupSpace, getAdminGroups, deleteAdminGroup, getAdminGroupCount } from '@/group/api/groupAPI';
import globalMessage from '@/common/utils/toast';

const router = useRouter();
const confirm = useConfirm();

// 状态管理
const loading = ref(true);
const classes = ref<GroupSpace.AdminGroupVO[]>([]);
const totalRecords = ref(0);

const filters = reactive({
    showMine: true,
    statusFilter: -1,
    selectedAuths: [0, 1, 2],
    page: 1,
    limit: 9
});

const statusOptions = [
    { name: '全部状态', value: -1 },
    { name: '进行中', value: 0 },
    { name: '已结束', value: 1 }
];

const visibilityOptions = [
    { name: '公开', value: 0 },
    { name: '保护', value: 1 },
    { name: '私有', value: 2 }
];
const refrush = () => {
    loadGroups();
    loadGroupCount();
};

// API
const loadGroups = async () => {
    loading.value = true;
    try {
        await getAdminGroups(
            (filters.page - 1) * filters.limit,
            filters.showMine ? 'own' : 'all',
            filters.selectedAuths,
            filters.statusFilter
        ).then(response => {
            classes.value = response.data as GroupSpace.AdminGroupVO[];
        }).catch(err => {
            globalMessage.error("加载班级列表失败", err.message);
        }).finally(() => {
            loading.value = false;
        });
    } finally {
        loading.value = false;
    }

};
const loadGroupCount = async () => {
    await getAdminGroupCount(
        filters.showMine ? 'own' : 'all',
        filters.selectedAuths,
        filters.statusFilter
    ).then(response => {
        totalRecords.value = response.data as number;
    }).catch(err => {
        globalMessage.error("加载班级总数失败", err.message);
    });
}
// 格式化日期
const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// 操作处理
const confirmDelete = (cls: GroupSpace.AdminGroupVO) => {
    confirm.require({
        message: `确定要删除班级《${cls.name}》吗？`,
        header: '删除确认',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: '确认删除',
        rejectLabel: '取消',
        accept: () => {
            // 调用删除接口
            deleteAdminGroup(cls.id).then(() => {
                globalMessage.success('通知', '删除成功');
                loadGroups();
            }).catch(err => {
                globalMessage.error('删除失败', err.message);
            });
        }
    });
};

const handlePageChange = (event: any) => {
    filters.page = event.page + 1;
    loadGroups();
};

// 初始加载
onMounted(() => {
    loadGroups();
    loadGroupCount();
});
</script>

<template>
    <div class="container mx-auto p-4">
        <ConfirmDialog />

        <!-- 过滤控制区 -->
        <div class="mb-6 p-4 bg-white rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
            <!-- 新建按钮 -->
            <Button label="新建班级" icon="pi pi-plus" class="shadow-lg bg-blue-600 border-blue-600 hover:bg-blue-700"
                @click="router.push('/admin/group/create')" />
            <div class="flex items-center gap-2">
                <ToggleButton v-model="filters.showMine" onLabel="我创建的" offLabel="全部班级" onIcon="pi pi-user"
                    offIcon="pi pi-users" class="w-32" @change="refrush" />
            </div>

            <Divider layout="vertical" />

            <div class="flex items-center gap-2">
                <span class="text-gray-600">状态：</span>
                <Dropdown v-model="filters.statusFilter" :options="statusOptions" option-value="value"
                    optionLabel="name" placeholder="选择状态" class="w-48" @change="refrush" />
            </div>

            <Divider layout="vertical" />

            <div class="flex items-center gap-2">
                <span class="text-gray-600">权限：</span>
                <MultiSelect v-model="filters.selectedAuths" :options="visibilityOptions" optionLabel="name"
                    placeholder="选择权限" option-value="value" @change="refrush" display="chip" class="min-w-[180px]" />
            </div>
        </div>

        <!-- 加载骨架屏 -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="n in 6" :key="n" class="bg-white rounded-lg shadow-sm p-4">
                <Skeleton width="60%" height="24px" class="mb-3" />
                <div class="flex gap-2 mb-2">
                    <Skeleton width="80px" height="24px" />
                    <Skeleton width="80px" height="24px" />
                </div>
                <Skeleton width="100%" height="16px" class="mb-2" />
                <Skeleton width="100%" height="16px" class="mb-4" />
                <div class="flex justify-between">
                    <Skeleton width="80px" height="16px" />
                    <Skeleton width="80px" height="16px" />
                </div>
                <div class="mt-4 flex justify-end gap-2">
                    <Skeleton shape="circle" size="2rem" />
                    <Skeleton shape="circle" size="2rem" />
                    <Skeleton shape="circle" size="2rem" />
                </div>
            </div>
        </div>

        <!-- 班级列表 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="cls in classes" :key="cls.id"
                class="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            {{ cls.name }}
                            <span v-if="cls.isOwner" class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                我的班级
                            </span>
                        </h3>
                        <div class="flex items-center gap-2 mt-1">
                            <Tag :value="cls.auth == 0 ? '公开' : cls.auth == 1 ? '保护' : '私有'" :severity="cls.auth === 0 ? 'success' :
                                cls.auth === 1 ? 'warning' : 'danger'" />
                            <Tag :value="cls.isEnded ? '已结束' : '进行中'" :severity="cls.isEnded ? 'danger' : 'success'" />
                        </div>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                        {{ cls.userCount }}人
                    </div>
                </div>

                <!-- 创建人信息 -->
                <div class="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <i class="pi pi-user"></i>
                    <span>{{ cls.creatorName }}</span>
                </div>

                <p class="text-gray-600 mt-3 text-sm line-clamp-2">
                    {{ cls.description }}
                </p>

                <!-- 时间信息 -->
                <div class="mt-4 text-sm text-gray-500 space-y-1">
                    <div class="flex justify-between">
                        <span>开始时间</span>
                        <span>{{ formatDate(cls.startTime.toString()) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>结束时间</span>
                        <span :class="{ 'text-red-500': cls.isEnded }">
                            {{ formatDate(cls.endTime.toString()) }}
                        </span>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="mt-4 flex justify-end gap-2">
                    <Button icon="pi pi-pencil" class="p-button-text p-button-sm text-blue-600 rounded-full"
                        @click="router.push(`/admin/group/edit/${cls.id}`)" />
                    <Button icon="pi pi-trash" class="p-button-text p-button-sm text-red-600 rounded-full"
                        @click="confirmDelete(cls)" />
                </div>
            </div>
        </div>

        <!-- 分页控件 -->
        <div class="mt-6">
            <Paginator :rows="filters.limit" :totalRecords="totalRecords" @page="handlePageChange"
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                currentPageReportTemplate="第 {first} - {last} 条，共 {totalRecords} 条" class="bg-white p-2 rounded-lg">
            </Paginator>
        </div>
    </div>
</template>

<style>
.p-tag {
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
}

.p-button.p-button-sm {
    padding: 0.5rem;
}

.p-avatar.p-avatar-lg {
    width: 3.5rem;
    height: 3.5rem;
}
</style>