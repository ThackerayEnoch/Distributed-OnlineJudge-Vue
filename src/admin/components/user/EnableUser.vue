<template>
    <div class="space-y-6 w-full p-2">
        <!-- 用户列表模块 -->
        <div class="space-y-2 w-full">
            <label class="block font-medium text-gray-700">
                待启用用户
                <span class="text-sm text-gray-500">（每行输入一个学号/用户名）</span>
            </label>
            <div class="flex gap-4 h-96">
                <!-- 输入区 -->
                <div class="flex-1">
                    <Textarea v-model="usernamesRaw" class="w-full h-full font-mono" :autoResize="false" placeholder="示例：
  202231222024
  202231222062
  202231222107" />
                </div>

                <!-- 操作按钮列 -->
                <div class="flex flex-col justify-center gap-2">
                    <Button icon="pi pi-arrow-right" severity="secondary" @click="parseUsersEvent" class="!px-3"
                        v-tooltip="'解析用户'" :loading="parsing" />
                    <Button icon="pi pi-replay" severity="secondary" @click="clearData" class="!px-3"
                        v-tooltip="'重置所有'" />
                </div>

                <!-- 解析结果区 -->
                <div class="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto border">
                    <div v-if="parsedUsers.length === 0" class="text-gray-400 h-full flex items-center justify-center">
                        <i class="pi pi-info-circle mr-2"></i>
                        <span>解析结果将在此显示</span>
                    </div>
                    <div v-else class="space-y-2">
                        <div v-for="(user, index) in parsedUsers" :key="index"
                            class="flex items-center p-3 bg-white rounded shadow-sm border hover:shadow-md transition">
                            <Avatar :label="String(index + 1)" class="!bg-primary-100 !text-primary-600 mr-3" />
                            <div class="flex-1">
                                <div class="font-mono font-medium">{{ user.nickname }}</div>
                                <div class="text-sm text-gray-500">用户ID: {{ user.studentId || '待生成' }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 在原有布局基础上修改密码设置模块 -->
        <div class="grid grid-cols-2 gap-6 mt-8">
            <!-- 密码设置模块 -->
            <div class="space-y-6 p-6 bg-gray-50 rounded-lg border">
                <div class="font-medium text-lg text-gray-700">全局密码策略</div>

                <div class="space-y-4">
                    <!-- 密码模式选择 -->
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-3">
                            <RadioButton v-model="passwordMode" inputId="mode-default" value="default" />
                            <label for="mode-default" class="flex items-center gap-2 cursor-pointer">
                                <span class="font-medium">统一默认密码</span>
                                <span class="text-sm text-gray-500">(所有用户使用相同密码)</span>
                            </label>
                        </div>

                        <div class="flex items-center gap-3">
                            <RadioButton v-model="passwordMode" inputId="mode-random" value="random" />
                            <label for="mode-random" class="flex items-center gap-2 cursor-pointer">
                                <span class="font-medium">独立随机密码</span>
                                <span class="text-sm text-gray-500">(每个用户生成不同密码)</span>
                            </label>
                        </div>
                    </div>

                    <!-- 默认密码设置 -->
                    <div v-if="passwordMode === 'default'" class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">
                            默认密码设置
                            <span class="text-gray-400 text-xs">（至少6位，包含字母和数字）</span>
                        </label>
                        <div class="flex gap-2">
                            <InputText v-model="defaultPassword" toggleMask class="flex-1" :feedback="false"
                                placeholder="输入统一密码" />
                            <Button label="重置默认" severity="secondary" @click="resetDefaultPassword" class="!px-4" />
                        </div>
                    </div>

                    <!-- 随机密码设置 -->
                    <div v-if="passwordMode === 'random'" class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">
                            随机密码规则
                            <span class="text-gray-400 text-xs">（6位，包含数字和字母）</span>
                        </label>
                        <div class="flex items-center gap-2 p-3 bg-white rounded border">
                            <i class="pi pi-lock text-primary-600"></i>
                            <span class="text-sm">示例：{{ randomPasswordExample }}</span>
                            <Button icon="pi pi-refresh" severity="secondary" @click="refreshRandomExample"
                                class="!px-2 ml-auto" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- API操作区 -->
            <div class="flex flex-col justify-between p-6 bg-gray-50 rounded-lg border">
                <div class="space-y-2">
                    <div class="font-medium text-lg text-gray-700">批量操作</div>
                    <div class="text-sm text-gray-500">
                        即将启用 {{ parsedUsers.length }} 个用户
                        <span class="block mt-1 text-primary-600">
                            （密码模式：{{ passwordMode === 'default' ? '统一密码' : '独立随机' }}）
                        </span>
                    </div>
                </div>
                <Button label="提交启用" icon="pi pi-check" severity="success" :loading="isSubmitting" @click="handleSubmit"
                    :disabled="parsedUsers.length === 0 || passwordInvalid || isSubmitting" class="w-full mt-4" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { type UserSpace, parseUsers, enableUser } from '@/admin/api/userAPI';
import globalMessage from '@/common/utils/toast';
// 响应式数据
const usernamesRaw = ref('');
const parsedUsers = ref<UserSpace.AdminParseUsers[]>([]);
const parsing = ref(false);
const defaultPassword = ref('Ujn@12345');
const randomPassword = ref('');
type PasswordMode = 'default' | 'random';
const passwordMode = ref<PasswordMode>('default');
const randomPasswordExample = ref(generateRandomPassword());
// 解析用户
const parseUsersEvent = async () => {
    parsing.value = true;
    const processedStudentNames = usernamesRaw.value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    await parseUsers(processedStudentNames)
        .then((res) => {
            parsedUsers.value = res.data as UserSpace.AdminParseUsers[];
        })
        .catch((err) => {
            console.error('解析用户失败:', err);
        })
        .finally(() => {
            parsing.value = false;
        });
};
// 密码有效性验证
const passwordInvalid = computed(() => {
    if (passwordMode.value === 'default') {
        return !/(?=.*[A-Za-z])(?=.*\d).{6,}/.test(defaultPassword.value);
    }
    return false;
});
// 刷新随机示例
const refreshRandomExample = () => {
    randomPasswordExample.value = generateRandomPassword();
};
// 生成随机密码示例
function generateRandomPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    return Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join('');
}
// 重置默认密码
const resetDefaultPassword = () => {
    defaultPassword.value = 'ujn@12345';
};
// 清空数据
const clearData = () => {
    usernamesRaw.value = '';
    parsedUsers.value = [];
    defaultPassword.value = 'ujn@12345';
    randomPassword.value = '';
};
const isSubmitting = ref(false);
// 提交处理
const handleSubmit = async () => {
    isSubmitting.value = true;
    let dto: UserSpace.EnableUserDTO[] = [];
    if (passwordMode.value === 'random') {
        // 为每个用户生成随机密码
        dto.push(
            ...parsedUsers.value.map(user => ({
                username: user.studentId,
                password: generateRandomPassword(),
            }))
        );
    } else if (passwordMode.value === 'default') {
        // 使用统一密码
        dto.push(
            ...parsedUsers.value.map(user => ({
                username: user.studentId,
                password: defaultPassword.value,
            }))
        );
    } else {
        globalMessage.error('操作失败', '未知的密码模式');
        isSubmitting.value = false;
        return;
    }
    await enableUser(dto)
        .then(() => {
            // 清空数据
            clearData();
            // 提示成功
            globalMessage.success('操作成功', '用户启用成功');
        })
        .catch((err) => {
            globalMessage.error('操作失败', err.message);
        }).finally(() => {
            isSubmitting.value = false;
        });
};
</script>