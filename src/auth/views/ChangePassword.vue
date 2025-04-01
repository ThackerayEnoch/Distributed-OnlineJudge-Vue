<template>
    <div class="flex min-h-screen items-center justify-center h-full w-full">
        <div class="bg-surface-50 dark:bg-surface-900 w-full max-w-md p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center mb-6">UJN账户密码修改</h2>
            <form @submit.prevent="handleSubmit">
                <!-- 新密码 -->
                <div class="mb-4">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-key"></i>
                        </InputGroupAddon>
                        <Password placeholder="新密码（至少6位）" v-model="newPassword" :feedback="false" toggleMask
                            class="w-full" />
                    </InputGroup>
                    <small v-if="errors.newPassword" class="text-red-500">
                        {{ errors.newPassword }}
                    </small>
                </div>

                <!-- 确认新密码 -->
                <div class="mb-8">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-check-circle"></i>
                        </InputGroupAddon>
                        <Password placeholder="确认新密码" v-model="confirmPassword" :feedback="false" toggleMask
                            class="w-full" />
                    </InputGroup>
                    <small v-if="errors.confirmPassword" class="text-red-500">
                        {{ errors.confirmPassword }}
                    </small>
                </div>

                <Button label="修改密码" class="w-full p-button-primary" :loading="isSubmitting" type="submit" />
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { type Auth, firstChangePassword } from '@/auth/authAPI';
import globalMessage from '@/common/utils/toast';
const router = useRouter();
// 响应式数据
const newPassword = ref('');
const confirmPassword = ref('');
const isSubmitting = ref(false);
const errors = ref({
    newPassword: '',
    confirmPassword: ''
});

// 验证规则
const validateForm = () => {
    let isValid = true;

    errors.value = {
        newPassword: '',
        confirmPassword: ''
    };


    if (newPassword.value.length < 6) {
        errors.value.newPassword = '密码长度至少需要6位';
        isValid = false;
    }

    if (newPassword.value !== confirmPassword.value) {
        errors.value.confirmPassword = '两次输入的密码不一致';
        isValid = false;
    }

    return isValid;
};

// 提交处理
const handleSubmit = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;

    const dto: Auth.FirstChangePasswordDTO = {
        password: newPassword.value,
    };
    await firstChangePassword(dto)
        .then(() => {
            router.push('/home');
            globalMessage.success('操作成功', '密码修改成功！');
        })
        .catch((error) => {
            globalMessage.error("错误", error.message);
        })
        .finally(() => {
            isSubmitting.value = false;
        });
};
</script>