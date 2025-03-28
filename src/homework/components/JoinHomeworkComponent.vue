<template>
    <div class="w-full h-full flex justify-center items-center p-4">
        <div class="max-w-xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all">
            <div class="p-8 space-y-6">
                <!-- 动态图标 -->
                <div class="flex justify-center">
                    <i :class="iconClass" class="text-7xl animate-pulse"></i>
                </div>

                <!-- 标题 -->
                <h2 class="text-2xl font-bold text-center text-gray-800 dark:text-white">
                    <i class="pi pi-trophy mr-2 text-primary-500"></i>
                    {{ props.title }}
                </h2>

                <!-- 认证区域 -->
                <div class="space-y-4">
                    <!-- 公开竞赛 -->
                    <div v-if="props.auth === 0" class="text-center">
                        <p class="text-gray-600 mb-4">该作业对所有人开放</p>
                        <Button label="立即加入" :loading="isloading" icon="pi pi-arrow-right"
                            class="w-full bg-primary-500 hover:bg-primary-600" @click="handleJoin" />
                    </div>

                    <!-- 保护竞赛 -->
                    <div v-else class="space-y-4">
                        <Message severity="warn" :closable="false">
                            该作业受保护，需要验证密码
                        </Message>

                        <div class="space-y-4">
                            <InputText v-model="password" placeholder="请输入竞赛访问密码" :feedback="false" type="password"
                                class="w-full" />

                            <Button label="验证加入" :loading="isloading" icon="pi pi-lock-open"
                                :disabled="!password || isloading" class="w-full bg-primary-500 hover:bg-primary-600"
                                @click="handleJoin" />
                        </div>
                    </div>
                </div>

                <!-- 底部信息 -->
                <div class="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p class="text-sm text-center text-gray-500">
                        <i class="pi pi-info-circle mr-2"></i>
                        济南大学OJ系统
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';
import { type JoinHomeworkSpace, joinHomework } from '@/homework/api/joinHomeworkAPI';
import globalMessage from '@/common/utils/toast';
import { useRouter } from 'vue-router';
const router = useRouter();

const props = defineProps<{
    contestId: number;
    auth: number;
    title: string;
    onSuccess: () => void;
}>();


const password = ref('');

const iconClass = computed(() => ({
    'pi pi-globe text-green-400': props.auth === 0,
    'pi pi-lock text-red-400': props.auth === 1,
}));
const isloading = ref(false);
const handleJoin = async () => {
    isloading.value = true;
    const dto: JoinHomeworkSpace.JoinHomeworkDTO = {
        contestId: Number(props.contestId),
        password: password.value,
    };
    await joinHomework(dto).then(() => {
        props.onSuccess();
        globalMessage.success('提示', '加入作业成功');
    }).catch((err) => {
        globalMessage.error('错误', err.message);
    }).finally(() => {
        isloading.value = false;
    });
};
</script>

<style scoped>
:deep(.p-inputtext) {
    @apply rounded-xl py-3 border-gray-200 hover:border-primary-300 focus:border-primary-500;
}

:deep(.p-message) {
    @apply rounded-xl border-0 bg-orange-50 text-orange-700;
}

:deep(.p-button) {
    @apply rounded-xl px-8 py-3 transition-all;
}
</style>