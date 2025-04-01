<template>
    <div class="flex min-h-screen items-center justify-center h-full w-full">
        <div class="bg-surface-50 dark:bg-surface-900 w-full max-w-md p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center mb-6">欢迎来到 UJNOJ!</h2>
            <h3 class="text-sm text-center mb-6">登录以继续</h3>
            <form @submit.prevent="onSubmit">
                <div class="mb-4">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-user"></i>
                        </InputGroupAddon>
                        <InputText placeholder="用户名(学号)" v-model="username" class="w-full" />
                    </InputGroup>
                    <small v-if="usernameError != ''" class="text-red-500">{{ usernameError }}</small>
                </div>
                <div class="mb-8">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <Password placeholder="密码" v-model="password" :feedback="false" toggleMask class="w-full" />
                    </InputGroup>
                    <small v-if="passwordError != ''" class="text-red-500">{{ passwordError }}</small>
                </div>
                <Button label="登录" class="w-full p-button-primary" :loading="isloading" type="submit" />
                <Button label="统一身份认证" @click="loginByUJN" class="w-full mt-2 p-button-secondary" />
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { ref } from 'vue';
import { login } from '@/auth/authAPI'
import { useForm, useField } from 'vee-validate';
import globalMessage from '@/common/utils/toast';
import router from '@/common/utils/router';
import { useUserStore } from '@/common/utils/store';
import { User } from '@/common/entity/user'
import { Role } from '@/common/constant/Role'
const counterStore = useUserStore();

const isloading = ref(false);
// 定义表单验证规则
const schema = yup.object({
    username: yup.string().required('用户名是必填项'),
    password: yup.string().required('密码是必填项').min(6, '密码至少需要6个字符'),
});

// 使用 useForm 进行表单验证和处理
const { handleSubmit } = useForm({
    validationSchema: schema,
});

// 使用 useField 绑定各个表单字段
const { value: username, errorMessage: usernameError } = useField<string>('username');
const { value: password, errorMessage: passwordError } = useField<string>('password');

const onSubmit = handleSubmit(async (values) => {
    isloading.value = true;
    try {
        const res = await login({
            username: values.username,
            password: values.password,
        });

        if (res?.data) {
            const user = new User(res.data.userId, res.data.username, res.data.nickname, res.data.roleId ?? Role.STUDENT);
            counterStore.setUser(user);
            globalMessage.success('操作成功', '登录成功');
            if (!res.data.isLoggedIn) {
                router.push('/auth/password');
            } else {
                router.push('/');
            }
        } else {
            globalMessage.error('操作失败', '登录失败');
        }
    } catch (error: any) {
        globalMessage.error('操作失败', error.message);
    } finally {
        isloading.value = false;
    }
});
const loginByUJN = () => {
    globalMessage.info('操作提示', '正在开发中，请耐心等待！');
};

</script>

<style scoped></style>