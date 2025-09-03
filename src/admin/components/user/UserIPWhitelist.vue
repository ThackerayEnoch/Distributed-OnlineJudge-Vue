<template>
    <div class="container mx-auto p-4">
        <!-- 搜索区域 -->
        <div class="flex flex-wrap gap-4 mb-6 items-center">
            <div class="flex gap-2 flex-1 min-w-[200px]">
                <InputText v-model="searchText" placeholder="搜索学号/昵称" class="flex-1" @keyup.enter="loadData" />
                <Button icon="pi pi-search" @click="loadData" v-tooltip.top="'搜索'" />
            </div>
            <Dropdown v-model="selectedStatus" :options="statusOptions" optionLabel="label" placeholder="状态筛选"
                class="w-32" />
            <Dropdown v-model="selectedCreatedType" :options="createdTypeOptions" optionLabel="label" placeholder="创建人"
                class="w-36" />
            <Button label="新增IP规则" icon="pi pi-plus" @click="openEditDialog(null)" />
            <Button label="刷新" icon="pi pi-refresh" class="p-button-secondary" @click="loadData" />
        </div>

        <!-- 数据表格 -->
        <DataTable :value="tableData" class="p-datatable-sm" stripedRows paginator :rows="10"
            :totalRecords="totalRecords" :loading="loading" lazy @page="onPageChange"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            currentPageReportTemplate="显示 {first} 到 {last} 条，共 {totalRecords} 条" @sort="onSort">
            <Column field="username" header="学号" sortable></Column>
            <Column field="nickname" header="昵称" sortable></Column>
            <Column header="IPv4策略" class="policy-column">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-desktop text-blue-500 text-sm"></i>
                        <div class="flex flex-col gap-1">
                            <Tag :severity="getPolicySeverity(data.ipv4Mode)" class="policy-tag">
                                {{ getIpModeLabel(data.ipv4Mode) }}
                            </Tag>
                            <span v-if="data.ipv4Mode === WhitelistSpace.IpMode.WHITELIST"
                                class="text-xs text-gray-500 pl-1">
                                {{ getIpv4Count(data) }} 个IP
                            </span>
                        </div>
                    </div>
                </template>
            </Column>
            <Column header="IPv6策略" class="policy-column">
                <template #body="{ data }">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-globe text-green-500 text-sm"></i>
                        <div class="flex flex-col gap-1">
                            <Tag :severity="getPolicySeverity(data.ipv6Mode)" class="policy-tag">
                                {{ getIpModeLabel(data.ipv6Mode) }}
                            </Tag>
                            <span v-if="data.ipv6Mode === WhitelistSpace.IpMode.WHITELIST"
                                class="text-xs text-gray-500 pl-1">
                                {{ getIpv6Count(data) }} 个IP
                            </span>
                        </div>
                    </div>
                </template>
            </Column>
            <Column field="ipScope" header="登录区域" sortable>
                <template #body="{ data }">
                    <Tag :severity="getAreaSeverity(data.ipScope)" class="!text-xs">
                        {{ getIpScopeLabel(data.ipScope) }}
                    </Tag>
                </template>
            </Column>
            <Column field="expireTime" header="过期时间" sortable>
                <template #body="{ data }">
                    <span v-if="data.expireTime" :class="{ 'text-red-500': isExpired(data.expireTime) }">
                        {{ formatDate(data.expireTime) }}
                    </span>
                    <span v-else class="text-gray-400">
                        <!-- 永不过期显示空白 -->
                    </span>
                </template>
            </Column>
            <Column field="isEnabled" header="状态" class="w-32">
                <template #body="{ data }">
                    <ToggleButton v-model="data.isEnabled" onLabel="启用" offLabel="禁用" onIcon="pi pi-check"
                        offIcon="pi pi-times" class="w-24" @change="toggleStatus(data)" />
                </template>
            </Column>
            <Column header="操作" class="w-40">
                <template #body="{ data }">
                    <div class="flex gap-1">
                        <Button icon="pi pi-eye" class="p-button-text p-button-sm" @click="showDetail(data)"
                            v-tooltip.top="'查看详情'" />
                        <Button icon="pi pi-pencil" class="p-button-text p-button-sm" @click="openEditDialog(data)"
                            v-tooltip.top="'编辑'" />
                        <Button icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger"
                            @click="deleteRecord(data)" v-tooltip.top="'删除'" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- 编辑弹窗 -->
        <Dialog v-model:visible="showDialog" :header="isEditMode ? 'IP规则编辑' : '新增IP规则'" :style="{ width: '600px' }"
            modal>
            <div class="grid gap-4 p-4">
                <div class="col-12 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-info-circle text-blue-500"></i>
                        <span class="text-sm text-blue-700 font-medium">
                            配置用户的IP访问策略，支持IPv4和IPv6策略独立设置
                        </span>
                    </div>
                </div>
                <div class="col-12">
                    <label class="block mb-2 font-medium text-gray-700">
                        <i class="pi pi-user text-indigo-500 mr-1"></i>
                        选择用户
                    </label>
                    <AutoComplete v-model="selectedUser" :suggestions="userSuggestions" @complete="searchUsers"
                        optionLabel="nickname" placeholder="输入用户名或昵称搜索" class="w-full" :disabled="isEditMode" dropdown
                        :minLength="0" :delay="300">
                        <template #option="{ option }">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-user text-blue-500"></i>
                                <div>
                                    <div class="font-medium">{{ option.nickname }}</div>
                                    <div class="text-xs text-gray-500">{{ option.username }}</div>
                                </div>
                            </div>
                        </template>
                    </AutoComplete>
                    <small v-if="isEditMode" class="text-gray-500 mt-1 block">
                        编辑模式下不能更改用户
                    </small>
                </div>

                <div class="col-12">
                    <label class="block mb-2 font-medium text-gray-700">
                        <i class="pi pi-desktop text-blue-500 mr-1"></i>
                        IPv4策略
                    </label>
                    <Dropdown v-model="editData.ipv4Mode" :options="policyOptions" optionLabel="label"
                        optionValue="value" class="w-full" />
                </div>

                <div v-if="editData.ipv4Mode === WhitelistSpace.IpMode.WHITELIST" class="col-12">
                    <label class="block mb-2 font-medium text-gray-700">IPv4白名单 (按回车保存)</label>
                    <Chips v-model="editData.ipv4" placeholder="请输入IP地址或CIDR网段" class="w-full" @add="onAddIpv4" />
                    <small class="text-gray-500 mt-1 block">
                        例如：192.168.1.1,10.0.0.0/24,172.16.1.100/32,203.0.113.0/28 (单独IP会自动添加/32)
                    </small>
                </div>

                <div class="col-12">
                    <label class="block mb-2 font-medium text-gray-700">
                        <i class="pi pi-globe text-green-500 mr-1"></i>
                        IPv6策略
                    </label>
                    <Dropdown v-model="editData.ipv6Mode" :options="policyOptions" optionLabel="label"
                        optionValue="value" class="w-full" />
                </div>

                <div v-if="editData.ipv6Mode === WhitelistSpace.IpMode.WHITELIST" class="col-12">
                    <label class="block mb-2 font-medium text-gray-700">IPv6白名单 (按回车保存)</label>
                    <Chips v-model="editData.ipv6" placeholder="请输入IPv6地址或CIDR网段" class="w-full" @add="onAddIpv6" />
                    <small class="text-gray-500 mt-1 block">
                        例如：2001:db8::1,2001:db8:1::/48,fe80::/64,::1/128 (单独IP会自动添加/128)
                    </small>
                </div>

                <div class="col-12">
                    <label class="block mb-2 font-medium text-gray-700">
                        <i class="pi pi-map-marker text-orange-500 mr-1"></i>
                        访问区域
                    </label>
                    <Dropdown v-model="editData.ipScope" :options="accessAreaOptions" optionLabel="label"
                        optionValue="value" class="w-full" />
                </div>

                <div class="col-12">
                    <label class="block mb-2 font-medium text-gray-700">
                        <i class="pi pi-calendar text-purple-500 mr-1"></i>
                        过期时间
                    </label>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2">
                            <Checkbox v-model="neverExpire" binary />
                            <label for="neverExpire" class="text-sm">永不过期</label>
                        </div>
                        <Calendar v-if="!neverExpire" v-model="editExpireDate" showTime hourFormat="24" class="w-full"
                            placeholder="选择过期时间" dateFormat="yy/mm/dd" />
                    </div>
                </div>

                <div class="col-12 flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <Button label="取消" icon="pi pi-times" class="p-button-text p-button-secondary"
                        @click="showDialog = false" />
                    <Button label="保存" icon="pi pi-check" class="p-button-success" @click="saveData()" />
                </div>
            </div>
        </Dialog>

        <!-- 详情弹窗 -->
        <Dialog v-model:visible="showDetailDialog" header="规则详情" :style="{ width: '700px' }" modal>
            <div v-if="selectedDetail" class="space-y-6">
                <!-- 基本信息 -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">基本信息</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600 font-medium">学号:</span>
                                <span class="text-gray-900">{{ selectedDetail.username }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600 font-medium">昵称:</span>
                                <span class="text-gray-900">{{ selectedDetail.nickname }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600 font-medium">过期时间:</span>
                                <span v-if="selectedDetail.expireTime" class="text-gray-900"
                                    :class="{ 'text-red-500': isExpired(selectedDetail.expireTime) }">
                                    {{ formatDate(selectedDetail.expireTime) }}
                                </span>
                                <span v-else class="text-gray-400">
                                    永不过期
                                </span>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-600 font-medium">登录区域:</span>
                                <Tag :severity="getAreaSeverity(selectedDetail.ipScope)" class="!text-xs">
                                    {{ getIpScopeLabel(selectedDetail.ipScope) }}
                                </Tag>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600 font-medium">创建人:</span>
                                <Tag severity="info" class="!text-xs">
                                    {{ selectedDetail.createdUsername }}
                                </Tag>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600 font-medium">状态:</span>
                                <Tag :severity="selectedDetail.isEnabled ? 'success' : 'danger'" class="!text-xs">
                                    {{ selectedDetail.isEnabled ? '启用' : '禁用' }}
                                </Tag>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- IP策略设置 -->
                <div class="grid grid-cols-2 gap-6">
                    <!-- IPv4设置 -->
                    <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                        <div class="flex items-center gap-2 mb-3">
                            <i class="pi pi-desktop text-blue-500"></i>
                            <h4 class="font-semibold text-blue-700">IPv4策略设置</h4>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 font-medium">策略类型:</span>
                                <Tag :severity="getPolicySeverity(selectedDetail.ipv4Mode)" class="policy-tag">
                                    {{ getIpModeLabel(selectedDetail.ipv4Mode) }}
                                </Tag>
                            </div>
                            <div v-if="selectedDetail.ipv4Mode === WhitelistSpace.IpMode.WHITELIST" class="mt-3">
                                <span class="text-gray-600 font-medium block mb-2">白名单IP:</span>
                                <div class="bg-white p-3 rounded border text-sm">
                                    <div v-if="selectedDetail.whitelist && Array.isArray(selectedDetail.whitelist) && selectedDetail.whitelist.filter(w => w.ipType === WhitelistSpace.IpType.IPv4).length > 0"
                                        class="space-y-1">
                                        <div v-for="item in selectedDetail.whitelist.filter(w => w.ipType === WhitelistSpace.IpType.IPv4)"
                                            :key="item.ipCidr"
                                            class="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                                            {{ item.ipCidr }}
                                        </div>
                                    </div>
                                    <div v-else class="text-gray-400 italic">
                                        未设置白名单IP
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- IPv6设置 -->
                    <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                        <div class="flex items-center gap-2 mb-3">
                            <i class="pi pi-globe text-green-500"></i>
                            <h4 class="font-semibold text-green-700">IPv6策略设置</h4>
                        </div>
                        <div class="space-y-3">
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 font-medium">策略类型:</span>
                                <Tag :severity="getPolicySeverity(selectedDetail.ipv6Mode)" class="policy-tag">
                                    {{ getIpModeLabel(selectedDetail.ipv6Mode) }}
                                </Tag>
                            </div>
                            <div v-if="selectedDetail.ipv6Mode === WhitelistSpace.IpMode.WHITELIST" class="mt-3">
                                <span class="text-gray-600 font-medium block mb-2">白名单IP:</span>
                                <div class="bg-white p-3 rounded border text-sm">
                                    <div v-if="selectedDetail.whitelist && Array.isArray(selectedDetail.whitelist) && selectedDetail.whitelist.filter(w => w.ipType === WhitelistSpace.IpType.IPv6).length > 0"
                                        class="space-y-1">
                                        <div v-for="item in selectedDetail.whitelist.filter(w => w.ipType === WhitelistSpace.IpType.IPv6)"
                                            :key="item.ipCidr"
                                            class="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
                                            {{ item.ipCidr }}
                                        </div>
                                    </div>
                                    <div v-else class="text-gray-400 italic">
                                        未设置白名单IP
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 关闭按钮 -->
                <div class="flex justify-end pt-4 border-t border-gray-200">
                    <Button label="关闭" icon="pi pi-times" class="p-button-secondary"
                        @click="showDetailDialog = false" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { WhitelistSpace } from '@/admin/api/whitelist'
import globalMessage from '@/common/utils/toast';
import type { APIError } from '@/common/entity/exception/APIException';

interface User {
    userId: number;
    username: string;
    nickname: string;
}

// 用户缓存和搜索相关
const users = ref<User[]>([]); // 缓存的用户列表
const userSuggestions = ref<User[]>([]); // 搜索建议列表

// 响应式数据
const isEditMode = ref(false);
const searchText = ref('');
const selectedStatus = ref({ label: '全部', value: null });
const selectedCreatedType = ref({ label: '全部', value: 'all' });
const showDialog = ref(false);
const showDetailDialog = ref(false);
const tableData = ref<WhitelistSpace.UserIpStrategyVO[]>([]);
const selectedDetail = ref<WhitelistSpace.UserIpStrategyVO>();
const selectedUser = ref<User>();
const loading = ref(false);
const totalRecords = ref(0);
const currentPage = ref(0);
const pageSize = 10; // 固定每页显示10条
const neverExpire = ref(false); // 永不过期选项
const editData = reactive<WhitelistSpace.UserWhitelistDTO>({
    id: 0,
    ipv4Mode: WhitelistSpace.IpMode.ALLOW_ALL,
    ipv6Mode: WhitelistSpace.IpMode.ALLOW_ALL,
    ipScope: WhitelistSpace.IpScope.ALL,
    ipv4: [],
    ipv6: [],
    remark: '',
    expireTime: Date.now() + 365 * 24 * 60 * 60 * 1000 // 默认一年后过期
});

// 完整选项配置
const policyOptions = [
    { label: '放行', value: WhitelistSpace.IpMode.ALLOW_ALL },
    { label: '禁止', value: WhitelistSpace.IpMode.DENY_ALL },
    { label: '白名单', value: WhitelistSpace.IpMode.WHITELIST }
];

const statusOptions = [
    { label: '全部', value: null },
    { label: '启用', value: true },
    { label: '禁用', value: false }
];
const accessAreaOptions = [
    { label: '全部区域', value: WhitelistSpace.IpScope.ALL },
    { label: '仅内网', value: WhitelistSpace.IpScope.PRIVATE_ONLY },
    { label: '仅外网', value: WhitelistSpace.IpScope.PUBLIC_ONLY }
];

const createdTypeOptions = [
    { label: '全部', value: 'all' },
    { label: '仅自己', value: 'own' },
];

// 新增辅助函数
const getIpModeLabel = (mode: WhitelistSpace.IpMode): string => {
    switch (mode) {
        case WhitelistSpace.IpMode.ALLOW_ALL:
            return '放行';
        case WhitelistSpace.IpMode.DENY_ALL:
            return '禁止';
        case WhitelistSpace.IpMode.WHITELIST:
            return '白名单';
        default:
            return '未知';
    }
};

const getIpScopeLabel = (scope: WhitelistSpace.IpScope): string => {
    switch (scope) {
        case WhitelistSpace.IpScope.ALL:
            return '全部区域';
        case WhitelistSpace.IpScope.PRIVATE_ONLY:
            return '仅内网';
        case WhitelistSpace.IpScope.PUBLIC_ONLY:
            return '仅外网';
        default:
            return '未知';
    }
};

const getIpv4Count = (data: WhitelistSpace.UserIpStrategyVO): number => {
    if (!data.whitelist || !Array.isArray(data.whitelist)) return 0;
    return data.whitelist.filter(item => item.ipType === WhitelistSpace.IpType.IPv4).length;
};

const getIpv6Count = (data: WhitelistSpace.UserIpStrategyVO): number => {
    if (!data.whitelist || !Array.isArray(data.whitelist)) return 0;
    return data.whitelist.filter(item => item.ipType === WhitelistSpace.IpType.IPv6).length;
};

// 日期编辑计算属性
const editExpireDate = computed({
    get: () => {
        if (editData.expireTime) {
            return new Date(editData.expireTime);
        }
        return null; // 支持设置为永不过期
    },
    set: (value: Date | null) => {
        editData.expireTime = value ? value.getTime() : undefined;
    }
});

// 用户选择监听
watch(selectedUser, (newUser) => {
    if (newUser) {
        editData.id = newUser.userId;
    }
});

// 监听筛选条件变化，重新加载数据（排除搜索文本和访问类型）
watch([selectedStatus, selectedCreatedType], () => {
    currentPage.value = 0;
    loadData();
}, { deep: true });

// 监听永不过期选项
watch(neverExpire, (newValue) => {
    if (newValue) {
        editData.expireTime = undefined;
    } else {
        editData.expireTime = Date.now() + 365 * 24 * 60 * 60 * 1000; // 默认一年后过期
    }
});

// 数据加载函数
const loadData = async () => {
    try {
        loading.value = true;

        // 构建API参数
        const offset = currentPage.value * pageSize;
        const status = getStatusApiValue(selectedStatus.value.value);
        const filter = getFilterApiValue();
        const searchContent = searchText.value || undefined;

        // 同时加载数据和总数
        const [dataResponse, countResponse] = await Promise.all([
            WhitelistSpace.getUserWhitelists(offset, status, filter, searchContent),
            WhitelistSpace.getUserWhitelistCount(status, filter, searchContent)
        ]);

        tableData.value = dataResponse.data || [];
        totalRecords.value = countResponse.data || 0;
    } catch (error: any) {
        globalMessage.error('加载数据失败', error.message);
        tableData.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
};

// 分页处理
const onPageChange = (event: any) => {
    currentPage.value = event.page;
    // pageSize现在是固定值，不需要从event中获取
    loadData();
};

// 排序处理
const onSort = (event: any) => {
    // 这里可以实现排序逻辑，如果后端支持的话
    console.log('排序:', event);
    loadData();
};

// 状态转换为API参数
const getStatusApiValue = (statusValue: boolean | null): number => {
    if (statusValue === null) return 2; // 全部
    return statusValue ? 1 : 0; // 启用:1, 禁用:0
};

// 过滤条件转换为API参数
const getFilterApiValue = (): string => {
    // 只根据创建类型生成filter参数，不过滤内网外网
    const createdType = selectedCreatedType.value.value;

    // 创建类型过滤
    if (createdType === 'own') {
        return 'own';
    }

    return 'all';
};

// 组件挂载时加载数据
onMounted(() => {
    loadData();
    initializeUserCache();
});

// 初始化用户缓存
const initializeUserCache = async () => {
    try {
        // 预加载一些常用用户，使用一个更合理的默认查询
        // 如果空字符串不被API接受，尝试使用一个通用的字符
        const response = await WhitelistSpace.searchUserWhitelist('admin');
        const initialUsers = response.data || [];

        initialUsers.forEach(apiUser => {
            const existingUser = users.value.find(u => u.userId === apiUser.id);
            if (!existingUser) {
                users.value.push({
                    userId: apiUser.id,
                    username: apiUser.username,
                    nickname: apiUser.nickname
                });
            }
        });
    } catch (error) {
        console.log('初始化用户缓存失败，将在用户搜索时动态加载:', error);
        // 静默失败，不影响其他功能
        // 缓存将在用户实际搜索时建立
    }
};

// 搜索用户方法
const searchUsers = async (event: any) => {
    const query = event.query?.trim();

    // 如果查询为空，显示缓存中的前几个用户作为建议
    if (!query) {
        userSuggestions.value = users.value.slice(0, 10);
        return;
    }

    try {
        // 首先从缓存中查找
        const cachedResults = users.value.filter(user =>
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.nickname.toLowerCase().includes(query.toLowerCase())
        );

        // 如果查询长度小于2，只显示缓存结果
        if (query.length < 2) {
            userSuggestions.value = cachedResults.slice(0, 10);
            return;
        }

        // 调用API搜索
        const response = await WhitelistSpace.searchUserWhitelist(query);
        const apiResults = response.data || [];

        // 将API结果添加到缓存中（去重）
        apiResults.forEach(apiUser => {
            const existingUser = users.value.find(u => u.userId === apiUser.id);
            if (!existingUser) {
                users.value.push({
                    userId: apiUser.id,
                    username: apiUser.username,
                    nickname: apiUser.nickname
                });
            }
        });

        // 合并缓存结果和API结果，去重
        const allResults = new Map<number, User>();

        // 添加缓存结果
        cachedResults.forEach(user => {
            allResults.set(user.userId, user);
        });

        // 添加API结果
        apiResults.forEach(apiUser => {
            allResults.set(apiUser.id, {
                userId: apiUser.id,
                username: apiUser.username,
                nickname: apiUser.nickname
            });
        });

        userSuggestions.value = Array.from(allResults.values()).slice(0, 20); // 限制最多20个建议
    } catch (error) {
        console.error('搜索用户失败:', error);
        // 如果API失败，至少显示缓存结果
        userSuggestions.value = users.value.filter(user =>
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.nickname.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);
    }
};

// CIDR格式检测和补全函数
const isCidrFormat = (ip: string): boolean => {
    return ip.includes('/') && /\/\d+$/.test(ip);
};

// IPv4添加事件处理 - 在添加后进行CIDR格式检查和转换
const onAddIpv4 = (event: any) => {
    const newArray = event.value || [];
    if (!Array.isArray(newArray)) return;

    // 使用setTimeout确保DOM更新后再处理数组
    setTimeout(() => {
        // 检查并转换所有IP为CIDR格式
        const processedArray = newArray.map(ip => {
            const trimmedIp = ip.trim();
            if (trimmedIp && !isCidrFormat(trimmedIp)) {
                // 不是CIDR格式，自动添加/32
                return trimmedIp + '/32';
            }
            return trimmedIp;
        });

        // 去重处理
        const uniqueArray = [...new Set(processedArray)];

        // 更新editData.ipv4为处理后的数组
        editData.ipv4 = uniqueArray;
    }, 0);
};

// IPv6添加事件处理 - 在添加后进行CIDR格式检查和转换
const onAddIpv6 = (event: any) => {
    const newArray = event.value || [];
    if (!Array.isArray(newArray)) return;

    // 使用setTimeout确保DOM更新后再处理数组
    setTimeout(() => {
        // 检查并转换所有IP为CIDR格式
        const processedArray = newArray.map(ip => {
            const trimmedIp = ip.trim();
            if (trimmedIp && !isCidrFormat(trimmedIp)) {
                // 不是CIDR格式，自动添加/128
                return trimmedIp + '/128';
            }
            return trimmedIp;
        });

        // 去重处理
        const uniqueArray = [...new Set(processedArray)];

        // 更新editData.ipv6为处理后的数组
        editData.ipv6 = uniqueArray;
    }, 0);
};// 辅助方法
const getPolicySeverity = (mode: WhitelistSpace.IpMode) => {
    switch (mode) {
        case WhitelistSpace.IpMode.ALLOW_ALL:
            return 'success';   // 绿色 - 放行
        case WhitelistSpace.IpMode.DENY_ALL:
            return 'danger';    // 红色 - 禁止
        case WhitelistSpace.IpMode.WHITELIST:
            return 'warning';   // 橙色 - 白名单
        default:
            return 'info';
    }
};

const getAreaSeverity = (scope: WhitelistSpace.IpScope) => {
    switch (scope) {
        case WhitelistSpace.IpScope.ALL:
            return 'success';
        case WhitelistSpace.IpScope.PRIVATE_ONLY:
            return 'warning';
        case WhitelistSpace.IpScope.PUBLIC_ONLY:
            return 'danger';
        default:
            return 'info';
    }
};

const formatDate = (date: Date | string | number) => {
    if (!date) return '';

    let dateObj: Date;
    if (date instanceof Date) {
        dateObj = date;
    } else {
        dateObj = new Date(date);
    }

    return dateObj.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const isExpired = (date: Date | string | number | null) => {
    if (!date) return false; // null表示永不过期

    let dateObj: Date;
    if (date instanceof Date) {
        dateObj = date;
    } else {
        dateObj = new Date(date);
    }

    return dateObj < new Date();
};

// 详情显示方法
const showDetail = (data: WhitelistSpace.UserIpStrategyVO) => {
    // 深拷贝数据，确保whitelist数组也被正确复制
    selectedDetail.value = JSON.parse(JSON.stringify(data));
    showDetailDialog.value = true;
};

// 编辑弹窗方法
const openEditDialog = (data: WhitelistSpace.UserIpStrategyVO | null) => {
    userSuggestions.value = []; // 清空搜索建议
    users.value = []; // 清空用户缓存
    if (data) {
        isEditMode.value = true;
        // 编辑现有记录
        editData.id = data.userId;
        editData.ipv4Mode = data.ipv4Mode;
        editData.ipv6Mode = data.ipv6Mode;
        editData.ipScope = data.ipScope;
        editData.remark = data.remark || '';

        // 处理过期时间 - 修复日期类型转换问题
        if (data.expireTime) {
            // 如果是Date对象，转换为时间戳
            const expireTimestamp = data.expireTime instanceof Date ? data.expireTime.getTime() : new Date(data.expireTime).getTime();
            editData.expireTime = expireTimestamp;
            neverExpire.value = false;
        } else {
            editData.expireTime = undefined;
            neverExpire.value = true;
        }

        // 提取白名单IP - 添加安全检查和调试信息
        if (data.whitelist && Array.isArray(data.whitelist)) {
            const ipv4List = data.whitelist.filter(item => item.ipType === WhitelistSpace.IpType.IPv4).map(item => item.ipCidr);
            const ipv6List = data.whitelist.filter(item => item.ipType === WhitelistSpace.IpType.IPv6).map(item => item.ipCidr);
            editData.ipv4 = ipv4List;
            editData.ipv6 = ipv6List;
        } else {
            editData.ipv4 = [];
            editData.ipv6 = [];
        }

        selectedUser.value = users.value.find(u => u.userId === data.userId);

        // 如果缓存中没有找到用户，创建一个临时用户对象
        if (!selectedUser.value) {
            selectedUser.value = {
                userId: data.userId,
                username: data.username,
                nickname: data.nickname
            };
            // 将用户添加到缓存中
            users.value.push(selectedUser.value);
        }
    } else {
        // 新增记录
        isEditMode.value = false;
        Object.assign(editData, {
            id: 0,
            ipv4Mode: WhitelistSpace.IpMode.ALLOW_ALL,
            ipv6Mode: WhitelistSpace.IpMode.ALLOW_ALL,
            ipScope: WhitelistSpace.IpScope.ALL,
            ipv4: [],
            ipv6: [],
            remark: '',
            expireTime: Date.now() + 365 * 24 * 60 * 60 * 1000 // 默认一年后过期
        });
        neverExpire.value = false;
        selectedUser.value = undefined;
    }
    showDialog.value = true;
};

// 保存数据方法
const saveData = async (data?: WhitelistSpace.UserWhitelistDTO) => {
    const dataToSave = data || editData;

    // 验证必填字段
    if (!selectedUser.value) {
        globalMessage.warn('警告', '请选择一个用户');
        return;
    }

    // 确保设置正确的用户ID
    dataToSave.id = selectedUser.value.userId;

    // 验证白名单IP格式（简单验证）
    if (dataToSave.ipv4Mode === WhitelistSpace.IpMode.WHITELIST && (!dataToSave.ipv4 || dataToSave.ipv4.length === 0)) {
        globalMessage.warn('警告', 'IPv4策略选择白名单时，请填写白名单IP');
        return;
    }

    if (dataToSave.ipv6Mode === WhitelistSpace.IpMode.WHITELIST && (!dataToSave.ipv6 || dataToSave.ipv6.length === 0)) {
        globalMessage.warn('警告', 'IPv6策略选择白名单时，请填写白名单IP');
        return;
    }

    try {
        if (isEditMode.value) {
            // 检查是否是编辑现有记录（通过检查原始数据是否存在）
            const existingRecord = tableData.value.find(item => item.userId === dataToSave.id);
            if (existingRecord) {
                // 更新现有记录
                await WhitelistSpace.updateUserWhitelist(dataToSave);
                globalMessage.success('成功', 'IP规则更新成功');
            } else {
                // 添加新记录
                await WhitelistSpace.createUserWhitelist(dataToSave);
                globalMessage.success('成功', 'IP规则新增成功');
            }
        } else {
            // 添加新记录
            await WhitelistSpace.createUserWhitelist(dataToSave);
            globalMessage.success('成功', 'IP规则新增成功');
        }

        // 重新加载数据
        await loadData();
        showDialog.value = false;
    } catch (error) {
        globalMessage.error('错误', '保存IP规则失败，请重试' + ((error && typeof error === 'object' && 'message' in error) ? (error as any).message : String(error)));
    }
};

// 删除记录方法
const deleteRecord = async (data: WhitelistSpace.UserIpStrategyVO) => {
    if (confirm(`确认删除用户 ${data.nickname}(${data.username}) 的IP策略吗？`)) {
        try {
            await WhitelistSpace.deleteUserWhitelist(data.userId);
            console.log('删除记录成功:', data);

            // 重新加载数据
            await loadData();
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败，请重试');
        }
    }
};

// 切换状态方法
const toggleStatus = async (data: WhitelistSpace.UserIpStrategyVO) => {
    try {
        const status = data.isEnabled ? 1 : 0;
        // 修复API调用 - 传递status作为查询参数
        await WhitelistSpace.updateUserWhitelistStatus(data.userId, status);
        globalMessage.success('成功', `用户 ${data.nickname}(${data.username}) 状态已更新为 ${data.isEnabled ? '启用' : '禁用'}`);
    } catch (error) {
        globalMessage.error('错误', '更新状态失败，请重试' + ((error && typeof error === 'object' && 'message' in error) ? (error as any).message : String(error)));
        // 回滚状态
        data.isEnabled = !data.isEnabled;
    }
};

// 其他操作方法保持不变...
</script>

<style>
/* 详情项样式 */
.detail-item {
    @apply flex items-start gap-2 py-2 border-b border-gray-100 last:border-0;
}

.detail-label {
    @apply w-24 text-gray-500 font-medium flex-shrink-0;
}

.detail-value {
    @apply flex-1 text-gray-800 break-all;
}

/* Tag颜色增强 */
.p-tag-success {
    @apply bg-green-100 text-green-800 border border-green-300;
    font-weight: 500;
}

.p-tag-danger {
    @apply bg-red-100 text-red-800 border border-red-300;
    font-weight: 500;
}

.p-tag-info {
    @apply bg-blue-100 text-blue-800 border border-blue-300;
    font-weight: 500;
}

.p-tag-warning {
    @apply bg-amber-100 text-amber-800 border border-amber-300;
    font-weight: 500;
}

/* IPv4/IPv6 策略列样式 */
.policy-column {
    min-width: 140px;
}

.policy-tag {
    border-radius: 6px;
    font-size: 11px;
    padding: 4px 8px;
    font-weight: 600;
    letter-spacing: 0.025em;
}

/* 自定义DataTable样式 */
.p-datatable .p-datatable-thead>tr>th {
    font-weight: 600;
    color: #374151;
    background-color: #f9fafb;
}

.p-datatable .p-datatable-tbody>tr>td {
    padding: 12px 8px;
}

.p-datatable .p-datatable-tbody>tr:hover {
    background-color: #f8fafc;
}
</style>