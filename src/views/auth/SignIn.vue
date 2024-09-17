<template>
    <FloatingConfigurator />
    <div class="flex min-h-screen items-center justify-center h-full w-full">
        <div class="bg-surface-50 dark:bg-surface-900 w-full max-w-md p-6 rounded-lg shadow-md ">
            <h2 class="text-2xl font-bold text-center mb-6">欢迎来到 WCSF!</h2>
            <h3 class="text-sm text-center mb-6">登录以继续</h3>
            <div class="mb-4">
                <InputGroup>
                    <InputGroupAddon>
                        <i class="pi pi-user"></i>
                    </InputGroupAddon>
                    <InputText placeholder="学号" v-model="user.username" class="w-full" />
                </InputGroup>
            </div>
            <div class="mb-6">
                <InputGroup>
                    <InputGroupAddon>
                        <i class="pi pi-lock"></i>
                    </InputGroupAddon>
                    <Password placeholder="密码" v-model="user.password" :feedback="false" toggleMask class="w-full" />
                </InputGroup>
            </div>
            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                <div class="flex items-center">
                    <Checkbox v-model="user.isRememberMe" id="rememberme1" binary class="mr-2"></Checkbox>
                    <label for="rememberme1">保持登录</label>
                </div>
                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">忘记密码?</span>
            </div>
            <Button label="登录" class="w-full p-button-primary" @click="signIn" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import globalMessage from '@/utils/toast';
import { login } from '@/api/auth'
import { ResponseCode } from '@/api';
import router from '@/router';

const user = reactive({
    username: '',
    password: '',
    isRememberMe: false
});
const signIn = async () => {
    const result = await login(user);
    console.log(result);
    if (result != undefined && result.status === ResponseCode.SUCCESS) {
        // 将 temporaryToken 存储在本地存储
        localStorage.setItem('temporaryToken', result.data.temporaryToken);

        globalMessage.success('成功', '登录成功');
        router.push('/');

    } else {
        const message = result ? result.message : '登录失败';
        globalMessage.error('失败', message);
    }
}
</script>

<style scoped></style>