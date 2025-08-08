<template>
    <div class="container mx-auto p-6 w-full">
        <!-- 页面标题 -->
        <div class="flex items-center gap-3 mb-8">
            <i class="pi pi-upload text-3xl text-indigo-600"></i>
            <div>
                <h1 class="text-3xl font-bold text-gray-800">IP策略批量导入</h1>
                <p class="text-gray-600 mt-1">批量配置用户IP访问策略，支持统一设置或个性化配置</p>
            </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <!-- 左侧：策略配置区域 -->
            <div class="space-y-6">
                <!-- 用户选择区域 -->
                <Card class="shadow-lg border-0">
                    <template #header>
                        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-t-lg">
                            <h2 class="text-xl font-semibold flex items-center gap-2">
                                <i class="pi pi-users"></i>
                                用户选择
                            </h2>
                        </div>
                    </template>
                    <template #content>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">选择导入用户</label>
                                <Textarea v-model="userInput"
                                    placeholder="请输入用户名，每行一个用户&#10;例如：&#10;202231222024&#10;202231222027" rows="6"
                                    class="w-full" @input="parseUsers" />
                                <small class="text-gray-500 mt-1 block">
                                    输入用户名（学号），每行一个，系统将自动解析并验证。已识别 <span class="font-semibold text-indigo-600">{{
                                        parsedUsers.length }}</span> 个有效用户
                                </small>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- IPv4策略配置 -->
                <Card class="shadow-lg border-0">
                    <template #header>
                        <div class="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-t-lg">
                            <h2 class="text-xl font-semibold flex items-center gap-2">
                                <i class="pi pi-desktop"></i>
                                IPv4策略配置
                            </h2>
                        </div>
                    </template>
                    <template #content>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">IPv4访问策略</label>
                                <Dropdown v-model="config.ipv4Mode" :options="policyOptions" optionLabel="label"
                                    optionValue="value" class="w-full" />
                            </div>

                            <div v-if="config.ipv4Mode === IpMode.WHITELIST" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">白名单配置方式</label>
                                    <div class="flex gap-4">
                                        <div class="flex items-center">
                                            <RadioButton v-model="config.ipv4WhitelistMode" inputId="ipv4_unified"
                                                value="unified" />
                                            <label for="ipv4_unified" class="ml-2">统一白名单</label>
                                        </div>
                                        <div class="flex items-center">
                                            <RadioButton v-model="config.ipv4WhitelistMode" inputId="ipv4_individual"
                                                value="individual" />
                                            <label for="ipv4_individual" class="ml-2">个性化配置</label>
                                        </div>
                                    </div>
                                </div>

                                <!-- 统一白名单 -->
                                <div v-if="config.ipv4WhitelistMode === 'unified'">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">统一IPv4白名单</label>
                                    <Chips v-model="config.ipv4UnifiedWhitelist" placeholder="输入IP地址或CIDR网段，按回车添加"
                                        class="w-full" @add="onAddIPv4Unified" />
                                    <small class="text-gray-500 mt-1 block">
                                        例如：192.168.1.1, 10.0.0.0/24, 172.16.1.100/32 (单独IP会自动添加/32)
                                    </small>
                                </div>

                                <!-- 个性化配置 -->
                                <div v-if="config.ipv4WhitelistMode === 'individual'">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">个性化IPv4白名单配置</label>
                                    <Textarea v-model="config.ipv4IndividualInput"
                                        :placeholder="getIndividualPlaceholder()" rows="8" class="w-full"
                                        @input="parseIndividualIPv4" />
                                    <small class="text-gray-500 mt-1 block">
                                        每行对应一个用户的白名单，多个IP用逗号分隔。行数与用户顺序对应。
                                    </small>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- IPv6策略配置 -->
                <Card class="shadow-lg border-0">
                    <template #header>
                        <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-t-lg">
                            <h2 class="text-xl font-semibold flex items-center gap-2">
                                <i class="pi pi-globe"></i>
                                IPv6策略配置
                            </h2>
                        </div>
                    </template>
                    <template #content>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">IPv6访问策略</label>
                                <Dropdown v-model="config.ipv6Mode" :options="policyOptions" optionLabel="label"
                                    optionValue="value" class="w-full" />
                            </div>

                            <div v-if="config.ipv6Mode === IpMode.WHITELIST" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">白名单配置方式</label>
                                    <div class="flex gap-4">
                                        <div class="flex items-center">
                                            <RadioButton v-model="config.ipv6WhitelistMode" inputId="ipv6_unified"
                                                value="unified" />
                                            <label for="ipv6_unified" class="ml-2">统一白名单</label>
                                        </div>
                                        <div class="flex items-center">
                                            <RadioButton v-model="config.ipv6WhitelistMode" inputId="ipv6_individual"
                                                value="individual" />
                                            <label for="ipv6_individual" class="ml-2">个性化配置</label>
                                        </div>
                                    </div>
                                </div>

                                <!-- 统一白名单 -->
                                <div v-if="config.ipv6WhitelistMode === 'unified'">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">统一IPv6白名单</label>
                                    <Chips v-model="config.ipv6UnifiedWhitelist" placeholder="输入IPv6地址或CIDR网段，按回车添加"
                                        class="w-full" @add="onAddIPv6Unified" />
                                    <small class="text-gray-500 mt-1 block">
                                        例如：2001:db8::1, fe80::/64, ::1/128 (单独IP会自动添加/128)
                                    </small>
                                </div>

                                <!-- 个性化配置 -->
                                <div v-if="config.ipv6WhitelistMode === 'individual'">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">个性化IPv6白名单配置</label>
                                    <Textarea v-model="config.ipv6IndividualInput"
                                        :placeholder="getIndividualPlaceholder()" rows="8" class="w-full"
                                        @input="parseIndividualIPv6" />
                                    <small class="text-gray-500 mt-1 block">
                                        每行对应一个用户的白名单，多个IP用逗号分隔。行数与用户顺序对应。
                                    </small>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- 全局设置 -->
                <Card class="shadow-lg border-0">
                    <template #header>
                        <div class="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-t-lg">
                            <h2 class="text-xl font-semibold flex items-center gap-2">
                                <i class="pi pi-cog"></i>
                                全局设置
                            </h2>
                        </div>
                    </template>
                    <template #content>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">访问区域限制</label>
                                <Dropdown v-model="config.ipScope" :options="accessAreaOptions" optionLabel="label"
                                    optionValue="value" class="w-full" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">过期时间设置</label>
                                <div class="flex items-center gap-3 mb-3">
                                    <Checkbox v-model="config.neverExpire" binary />
                                    <label class="text-sm">永不过期</label>
                                </div>
                                <Calendar v-if="!config.neverExpire" v-model="config.expireTime" showTime
                                    hourFormat="24" class="w-full" placeholder="选择过期时间" dateFormat="yy/mm/dd" />
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- 操作按钮 -->
                <div class="flex gap-4">
                    <Button label="预览配置" icon="pi pi-eye" class="p-button-info flex-1" @click="generatePreview" />
                    <Button label="批量导入" icon="pi pi-upload" class="p-button-success flex-1"
                        :disabled="parsedUsers.length === 0" @click="batchImport" />
                    <Button label="重置配置" icon="pi pi-refresh" class="p-button-secondary" @click="resetConfig" />
                </div>
            </div>

            <!-- 右侧：实时预览区域 -->
            <div class="space-y-6">
                <Card class="shadow-lg border-0">
                    <template #header>
                        <div class="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-t-lg">
                            <h2 class="text-xl font-semibold flex items-center gap-2">
                                <i class="pi pi-eye"></i>
                                策略预览
                                <Badge :value="previewData.length" class="ml-2" />
                            </h2>
                        </div>
                    </template>
                    <template #content>
                        <div v-if="previewData.length === 0" class="text-center py-12">
                            <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
                            <p class="text-gray-500 text-lg">暂无预览数据</p>
                            <p class="text-gray-400 text-sm">请先配置用户和策略信息</p>
                        </div>

                        <div v-else class="space-y-4 max-h-96 overflow-y-auto">
                            <div v-for="user in previewData" :key="user.username"
                                class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">

                                <!-- 用户信息头部 -->
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-user text-indigo-600"></i>
                                        <span class="font-semibold text-gray-800">{{ getUserDisplayName(user.username)
                                            }}</span>
                                        <Badge :value="user.username" severity="secondary" class="text-xs" />
                                    </div>
                                    <div class="flex items-center gap-2 text-sm text-gray-500">
                                        <Tag :severity="getAreaSeverity(user.ipScope)" class="text-xs">
                                            {{ getIpScopeLabel(user.ipScope) }}
                                        </Tag>
                                    </div>
                                </div>

                                <!-- IPv4策略 -->
                                <div class="grid grid-cols-2 gap-4 mb-3">
                                    <div class="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                                        <div class="flex items-center gap-2 mb-2">
                                            <i class="pi pi-desktop text-blue-600 text-sm"></i>
                                            <span class="text-sm font-medium text-blue-800">IPv4策略</span>
                                        </div>
                                        <Tag :severity="getPolicySeverity(user.ipv4Mode)" class="text-xs mb-2">
                                            {{ getIpModeLabel(user.ipv4Mode) }}
                                        </Tag>
                                        <div v-if="user.ipv4Mode === IpMode.WHITELIST && user.ipv4Whitelist.length > 0"
                                            class="text-xs text-gray-600">
                                            <div v-for="ip in user.ipv4Whitelist.slice(0, 3)" :key="ip"
                                                class="bg-white px-2 py-1 rounded mb-1 font-mono">
                                                {{ ip }}
                                            </div>
                                            <div v-if="user.ipv4Whitelist.length > 3" class="text-gray-400">
                                                +{{ user.ipv4Whitelist.length - 3 }} 更多...
                                            </div>
                                        </div>
                                    </div>

                                    <!-- IPv6策略 -->
                                    <div class="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                                        <div class="flex items-center gap-2 mb-2">
                                            <i class="pi pi-globe text-green-600 text-sm"></i>
                                            <span class="text-sm font-medium text-green-800">IPv6策略</span>
                                        </div>
                                        <Tag :severity="getPolicySeverity(user.ipv6Mode)" class="text-xs mb-2">
                                            {{ getIpModeLabel(user.ipv6Mode) }}
                                        </Tag>
                                        <div v-if="user.ipv6Mode === IpMode.WHITELIST && user.ipv6Whitelist.length > 0"
                                            class="text-xs text-gray-600">
                                            <div v-for="ip in user.ipv6Whitelist.slice(0, 3)" :key="ip"
                                                class="bg-white px-2 py-1 rounded mb-1 font-mono">
                                                {{ ip }}
                                            </div>
                                            <div v-if="user.ipv6Whitelist.length > 3" class="text-gray-400">
                                                +{{ user.ipv6Whitelist.length - 3 }} 更多...
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 过期时间 -->
                                <div class="flex items-center gap-2 text-xs text-gray-500">
                                    <i class="pi pi-calendar"></i>
                                    <span v-if="user.expireTime">
                                        过期时间: {{ formatDate(user.expireTime) }}
                                    </span>
                                    <span v-else>永不过期</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- 统计信息 -->
                <Card class="shadow-lg border-0">
                    <template #header>
                        <div class="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-4 rounded-t-lg">
                            <h2 class="text-xl font-semibold flex items-center gap-2">
                                <i class="pi pi-chart-bar"></i>
                                导入统计
                            </h2>
                        </div>
                    </template>
                    <template #content>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="text-center p-4 bg-indigo-50 rounded-lg">
                                <div class="text-2xl font-bold text-indigo-600">{{ parsedUsers.length }}</div>
                                <div class="text-sm text-gray-600">待导入用户</div>
                            </div>
                            <div class="text-center p-4 bg-green-50 rounded-lg">
                                <div class="text-2xl font-bold text-green-600">{{ previewData.length }}</div>
                                <div class="text-sm text-gray-600">已配置策略</div>
                            </div>
                            <div class="text-center p-4 bg-blue-50 rounded-lg">
                                <div class="text-2xl font-bold text-blue-600">
                                    {{previewData.filter(u => u.ipv4Mode === IpMode.WHITELIST).length}}
                                </div>
                                <div class="text-sm text-gray-600">IPv4白名单</div>
                            </div>
                            <div class="text-center p-4 bg-emerald-50 rounded-lg">
                                <div class="text-2xl font-bold text-emerald-600">
                                    {{previewData.filter(u => u.ipv6Mode === IpMode.WHITELIST).length}}
                                </div>
                                <div class="text-sm text-gray-600">IPv6白名单</div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- 成功导入提示 -->
        <Toast />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { WhitelistSpace } from '@/admin/api/whitelist';

// 使用API中的枚举定义
const { IpScope, IpMode } = WhitelistSpace;

// 使用Toast
const toast = useToast();

// 接口定义 - 使用API中的类型
interface UserPolicy {
    username: string;
    ipv4Mode: WhitelistSpace.IpMode;
    ipv6Mode: WhitelistSpace.IpMode;
    ipScope: WhitelistSpace.IpScope;
    ipv4Whitelist: string[];
    ipv6Whitelist: string[];
    expireTime?: Date;
}

interface BatchConfig {
    ipv4Mode: WhitelistSpace.IpMode;
    ipv6Mode: WhitelistSpace.IpMode;
    ipScope: WhitelistSpace.IpScope;
    ipv4WhitelistMode: 'unified' | 'individual';
    ipv6WhitelistMode: 'unified' | 'individual';
    ipv4UnifiedWhitelist: string[];
    ipv6UnifiedWhitelist: string[];
    ipv4IndividualWhitelist: Record<string, string[]>;
    ipv6IndividualWhitelist: Record<string, string[]>;
    ipv4IndividualInput: string;
    ipv6IndividualInput: string;
    neverExpire: boolean;
    expireTime?: Date;
}

// 响应式数据
const userInput = ref('');

const parsedUsers = ref<WhitelistSpace.WhitelistImportParseVO[]>([]);
const previewData = ref<UserPolicy[]>([]);

const config = reactive<BatchConfig>({
    ipv4Mode: IpMode.ALLOW_ALL,
    ipv6Mode: IpMode.ALLOW_ALL,
    ipScope: IpScope.ALL,
    ipv4WhitelistMode: 'unified',
    ipv6WhitelistMode: 'unified',
    ipv4UnifiedWhitelist: [],
    ipv6UnifiedWhitelist: [],
    ipv4IndividualWhitelist: {},
    ipv6IndividualWhitelist: {},
    ipv4IndividualInput: '',
    ipv6IndividualInput: '',
    neverExpire: false,
    expireTime: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000) // 默认一月后过期
});

// 选项配置
const policyOptions = [
    { label: '放行', value: IpMode.ALLOW_ALL },
    { label: '禁止', value: IpMode.DENY_ALL },
    { label: '白名单', value: IpMode.WHITELIST }
];

const accessAreaOptions = [
    { label: '不限制', value: IpScope.ALL },
    { label: '仅内网', value: IpScope.PRIVATE_ONLY },
    { label: '仅外网', value: IpScope.PUBLIC_ONLY }
];

// 解析用户输入
const parseUsers = async () => {
    const usernames = userInput.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (usernames.length === 0) {
        parsedUsers.value = [];
        previewData.value = [];
        return;
    }

    try {
        // 使用API解析用户名
        const response = await WhitelistSpace.parseWhitelistImport(usernames);
        parsedUsers.value = response.data || [];

        // 初始化个性化白名单配置
        parsedUsers.value.forEach(user => {
            if (!config.ipv4IndividualWhitelist[user.username]) {
                config.ipv4IndividualWhitelist[user.username] = [];
            }
            if (!config.ipv6IndividualWhitelist[user.username]) {
                config.ipv6IndividualWhitelist[user.username] = [];
            }
        });

        // 重新解析个性化输入
        parseIndividualIPv4();
        parseIndividualIPv6();

        // 自动生成预览
        generatePreview();

        // 显示解析结果
        if (parsedUsers.value.length > 0) {
            toast.add({
                severity: 'success',
                summary: '解析成功',
                detail: `成功解析 ${parsedUsers.value.length} 个用户`,
                life: 3000
            });
        } else {
            toast.add({
                severity: 'warn',
                summary: '解析结果',
                detail: '未找到有效用户',
                life: 3000
            });
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: '解析失败',
            detail: '用户解析失败，请检查用户名格式',
            life: 3000
        });
        parsedUsers.value = [];
        previewData.value = [];
    }
};

// CIDR格式检测和补全函数
const isCidrFormat = (ip: string): boolean => {
    return ip.includes('/') && /\/\d+$/.test(ip);
};

// 处理IPv4地址，自动添加/32
const processIPv4Address = (ip: string): string => {
    const trimmedIp = ip.trim();
    if (trimmedIp && !isCidrFormat(trimmedIp)) {
        return trimmedIp + '/32';
    }
    return trimmedIp;
};

// 处理IPv6地址，自动添加/128
const processIPv6Address = (ip: string): string => {
    const trimmedIp = ip.trim();
    if (trimmedIp && !isCidrFormat(trimmedIp)) {
        return trimmedIp + '/128';
    }
    return trimmedIp;
};

// IPv4统一白名单添加事件处理
const onAddIPv4Unified = (event: any) => {
    const newArray = event.value || [];
    if (!Array.isArray(newArray)) return;

    setTimeout(() => {
        // 检查并转换所有IP为CIDR格式
        const processedArray = newArray.map(ip => processIPv4Address(ip));
        // 去重处理
        const uniqueArray = [...new Set(processedArray)];
        // 更新统一白名单
        config.ipv4UnifiedWhitelist = uniqueArray;
    }, 0);
};

// IPv6统一白名单添加事件处理
const onAddIPv6Unified = (event: any) => {
    const newArray = event.value || [];
    if (!Array.isArray(newArray)) return;

    setTimeout(() => {
        // 检查并转换所有IP为CIDR格式
        const processedArray = newArray.map(ip => processIPv6Address(ip));
        // 去重处理
        const uniqueArray = [...new Set(processedArray)];
        // 更新统一白名单
        config.ipv6UnifiedWhitelist = uniqueArray;
    }, 0);
};

// 生成个性化配置的占位符
const getIndividualPlaceholder = () => {
    if (parsedUsers.value.length === 0) {
        return '请先输入用户列表';
    }

    const examples = parsedUsers.value.map((user, index) => {
        if (index < 3) { // 只显示前3个作为示例
            return `192.168.1.${index + 1}/32,10.0.0.${index + 1}/32`;
        }
        return null;
    }).filter(Boolean);

    return examples.join('\n') + (parsedUsers.value.length > 3 ? '\n...' : '');
};

// 解析IPv4个性化输入
const parseIndividualIPv4 = () => {
    const lines = config.ipv4IndividualInput
        .split('\n')
        .map(line => line.trim());

    parsedUsers.value.forEach((user, index) => {
        const line = lines[index] || '';
        if (line) {
            // 解析IP地址，用逗号分隔，并自动添加CIDR格式
            const ips = line.split(',')
                .map(ip => processIPv4Address(ip))
                .filter(ip => ip.length > 0);
            config.ipv4IndividualWhitelist[user.username] = ips;
        } else {
            config.ipv4IndividualWhitelist[user.username] = [];
        }
    });

    // 自动生成预览
    if (parsedUsers.value.length > 0) {
        generatePreview();
    }
};

// 解析IPv6个性化输入
const parseIndividualIPv6 = () => {
    const lines = config.ipv6IndividualInput
        .split('\n')
        .map(line => line.trim());

    parsedUsers.value.forEach((user, index) => {
        const line = lines[index] || '';
        if (line) {
            // 解析IP地址，用逗号分隔，并自动添加CIDR格式
            const ips = line.split(',')
                .map(ip => processIPv6Address(ip))
                .filter(ip => ip.length > 0);
            config.ipv6IndividualWhitelist[user.username] = ips;
        } else {
            config.ipv6IndividualWhitelist[user.username] = [];
        }
    });

    // 自动生成预览
    if (parsedUsers.value.length > 0) {
        generatePreview();
    }
};

// 生成预览数据
const generatePreview = () => {
    previewData.value = parsedUsers.value.map(user => {
        const policy: UserPolicy = {
            username: user.username,
            ipv4Mode: config.ipv4Mode,
            ipv6Mode: config.ipv6Mode,
            ipScope: config.ipScope,
            ipv4Whitelist: [],
            ipv6Whitelist: [],
            expireTime: config.neverExpire ? undefined : config.expireTime
        };

        // 处理IPv4白名单
        if (config.ipv4Mode === IpMode.WHITELIST) {
            if (config.ipv4WhitelistMode === 'unified') {
                policy.ipv4Whitelist = [...config.ipv4UnifiedWhitelist];
            } else {
                policy.ipv4Whitelist = [...(config.ipv4IndividualWhitelist[user.username] || [])];
            }
        }

        // 处理IPv6白名单
        if (config.ipv6Mode === IpMode.WHITELIST) {
            if (config.ipv6WhitelistMode === 'unified') {
                policy.ipv6Whitelist = [...config.ipv6UnifiedWhitelist];
            } else {
                policy.ipv6Whitelist = [...(config.ipv6IndividualWhitelist[user.username] || [])];
            }
        }

        return policy;
    });
};

// 批量导入
const batchImport = async () => {
    if (previewData.value.length === 0) {
        toast.add({
            severity: 'warn',
            summary: '警告',
            detail: '没有可导入的数据',
            life: 3000
        });
        return;
    }

    try {
        // 转换预览数据为API需要的格式
        const whitelistData: WhitelistSpace.UserWhitelistDTO[] = previewData.value.map(policy => {
            // 找到对应的用户ID
            const user = parsedUsers.value.find(u => u.username === policy.username);
            if (!user) {
                throw new Error(`未找到用户 ${policy.username} 的ID`);
            }

            return {
                id: user.userId,
                ipv4Mode: policy.ipv4Mode,
                ipv6Mode: policy.ipv6Mode,
                ipScope: policy.ipScope,
                ipv4: policy.ipv4Mode === IpMode.WHITELIST ? policy.ipv4Whitelist : undefined,
                ipv6: policy.ipv6Mode === IpMode.WHITELIST ? policy.ipv6Whitelist : undefined,
                expireTime: policy.expireTime ? policy.expireTime.getTime() : undefined,
                remark: `批量导入 - ${new Date().toLocaleDateString()}`
            };
        });

        // 调用批量导入API
        await WhitelistSpace.importWhitelist(whitelistData);

        toast.add({
            severity: 'success',
            summary: '导入成功',
            detail: `成功导入 ${previewData.value.length} 个用户的IP策略配置！`,
            life: 5000
        });

        // 可选：清空当前配置
        resetConfig();

    } catch (error) {
        console.error('批量导入失败:', error);
        toast.add({
            severity: 'error',
            summary: '导入失败',
            detail: error instanceof Error ? error.message : '批量导入失败，请稍后重试',
            life: 5000
        });
    }
};

// 重置配置
const resetConfig = () => {
    userInput.value = '';
    parsedUsers.value = [];
    previewData.value = [];
    Object.assign(config, {
        ipv4Mode: IpMode.ALLOW_ALL,
        ipv6Mode: IpMode.ALLOW_ALL,
        ipScope: IpScope.ALL,
        ipv4WhitelistMode: 'unified',
        ipv6WhitelistMode: 'unified',
        ipv4UnifiedWhitelist: [],
        ipv6UnifiedWhitelist: [],
        ipv4IndividualWhitelist: {},
        ipv6IndividualWhitelist: {},
        ipv4IndividualInput: '',
        ipv6IndividualInput: '',
        neverExpire: false,
        expireTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });
};

// 辅助函数
const getIpModeLabel = (mode: WhitelistSpace.IpMode): string => {
    switch (mode) {
        case IpMode.ALLOW_ALL: return '放行';
        case IpMode.DENY_ALL: return '禁止';
        case IpMode.WHITELIST: return '白名单';
        default: return '未知';
    }
};

const getIpScopeLabel = (scope: WhitelistSpace.IpScope): string => {
    switch (scope) {
        case IpScope.ALL: return '不限制';
        case IpScope.PRIVATE_ONLY: return '仅内网';
        case IpScope.PUBLIC_ONLY: return '仅外网';
        default: return '未知';
    }
};

const getPolicySeverity = (mode: WhitelistSpace.IpMode) => {
    switch (mode) {
        case IpMode.ALLOW_ALL: return 'success';
        case IpMode.DENY_ALL: return 'danger';
        case IpMode.WHITELIST: return 'warning';
        default: return 'info';
    }
};

const getAreaSeverity = (scope: WhitelistSpace.IpScope) => {
    switch (scope) {
        case IpScope.ALL: return 'success';
        case IpScope.PRIVATE_ONLY: return 'warning';
        case IpScope.PUBLIC_ONLY: return 'danger';
        default: return 'info';
    }
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 获取用户显示名称（昵称）
const getUserDisplayName = (username: string): string => {
    const user = parsedUsers.value.find(u => u.username === username);
    return user?.nickname || username;
};

// 监听配置变化，自动更新预览
watch([
    () => config.ipv4Mode,
    () => config.ipv6Mode,
    () => config.ipScope,
    () => config.ipv4WhitelistMode,
    () => config.ipv6WhitelistMode,
    () => config.ipv4UnifiedWhitelist,
    () => config.ipv6UnifiedWhitelist,
    () => config.ipv4IndividualInput,
    () => config.ipv6IndividualInput,
    () => config.neverExpire,
    () => config.expireTime
], () => {
    if (parsedUsers.value.length > 0) {
        generatePreview();
    }
}, { deep: true });

// 初始化
// parseUsers(); // 取消自动初始化，等用户输入
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 卡片悬停效果 */
.hover\:shadow-md:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 渐变背景动画 */
.bg-gradient-to-r {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}
</style>
