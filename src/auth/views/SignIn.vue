<template>
    <div class="flex min-h-screen items-center justify-center h-full w-full">
        <div class="bg-surface-50 dark:bg-surface-900 w-full max-w-md p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center mb-6">欢迎来到 UJNOJ!</h2>
            <div class="flex items-center justify-center mb-6 gap-2">
                <h3 class="text-sm text-center">登录以继续</h3>
                <i class="pi pi-question-circle text-red-500 cursor-pointer hover:text-red-600 transition-colors"
                    style="font-size: 1.00rem" @click="visible = true"></i>
            </div>
            <form @submit.prevent="onSubmit">
                <div class="mb-4">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-user"></i>
                        </InputGroupAddon>
                        <InputText placeholder="用户名(学号)" v-model="username" class="w-full" />
                    </InputGroup>
                    <small v-if="usernameError" class="text-red-500">{{ usernameError }}</small>
                </div>
                <div class="mb-4">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <Password placeholder="密码" v-model="password" :feedback="false" toggleMask class="w-full" />
                    </InputGroup>
                    <small v-if="passwordError" class="text-red-500">{{ passwordError }}</small>
                </div>
                <Button label="登录" class="w-full p-button-primary" :loading="isloading"
                    :disabled="isHustojLogin || isloading" type="submit" />
            </form>
        </div>
    </div>

    <!-- Dialog for Announcement -->
    <Dialog v-model:visible="visible" header="公告" :modal="true" class="w-full max-w-md rounded-lg"
        :style="{ width: '90vw', maxWidth: '400px' }">
        <div class="p-4">
            <p class="text-lg text-gray-700 dark:text-gray-300 mb-2">
                如果您是首次登录，请使用旧系统中的密码进行登录。
            </p>
        </div>
        <template #footer>
            <Button label="关闭" class="p-button-text" @click="visible = false" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { ref, onMounted } from 'vue';
import { login, survive, hustojLogin } from '@/auth/authAPI'
import { useForm, useField } from 'vee-validate';
import globalMessage from '@/common/utils/toast';
import router from '@/common/utils/router';
import { useUserStore } from '@/common/utils/store';
import { User } from '@/common/entity/user'
import { Role } from '@/common/constant/Role'
const counterStore = useUserStore();

const isloading = ref(false);
const isHustojLogin = ref(false);
const visible = ref(false);
onMounted(() => {
    isLoggedIn();
})
const isLoggedIn = async () => {
    await survive().then((res) => {
        if (res) {
            router.push('/home')
        } else {
            router.push('/auth/password');
        }
        globalMessage.info('提示', '您已登录。如需重新登录，请先在导航栏右上角登出。');
    }).catch(() => {
        // do nothing
    })
}
const hustojLoginFun = async () => {
    isHustojLogin.value = true;
    await hustojLogin()
        .then(res => {
            if (res?.data) {
                const user = new User(res.data.userId, res.data.username, res.data.nickname, res.data.roleId ?? Role.STUDENT);
                counterStore.setUser(user);
                globalMessage.success('提示', '通过旧系统登录成功');
                if (!res.data.isLoggedIn) {
                    router.push('/auth/password');
                } else {
                    router.push('/');
                }
            }
        })
        .catch((error) => {
            globalMessage.error('错误', error.data);
            // 等待 2 秒后进行 URL 跳转
            setTimeout(() => {
                window.location.href = '/'; // 替换为目标跳转路径
            }, 2000);
        })
        .finally(() => {
            isHustojLogin.value = false;
        });
};
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
            globalMessage.success('提示', '登录成功');
            if (!res.data.isLoggedIn) {
                router.push('/auth/password');
            } else {
                router.push('/');
            }
        } else {
            globalMessage.error('错误', '登录失败');
        }
    } catch (error: any) {
        globalMessage.error('登录失败', error?.message || String(error));
    } finally {
        isloading.value = false;
    }
});



</script>

<style scoped></style>