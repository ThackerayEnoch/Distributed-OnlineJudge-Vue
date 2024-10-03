<template>
    <div class="flex min-h-screen items-center justify-center h-full w-full">
        <div class="bg-surface-50 dark:bg-surface-900 w-full max-w-md p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold text-center mb-6">欢迎注册 WCFS!</h2>
            <h3 class="text-sm text-center mb-6">创建一个新账户</h3>
            <form @submit.prevent="onSubmit">
                <div class="mb-4">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-user"></i>
                        </InputGroupAddon>
                        <InputText placeholder="用户名" v-model="username" class="w-full" />
                    </InputGroup>
                    <small v-if="usernameError != ''" class="text-red-500">{{ usernameError }}</small>
                </div>
                <div class="mb-4">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-envelope"></i>
                        </InputGroupAddon>
                        <InputText placeholder="邮箱" v-model="email" class="w-full" />
                    </InputGroup>
                    <small v-if="emailError != ''" class="text-red-500">{{ emailError }}</small>
                </div>
                <div class="mb-4">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <Password placeholder="密码" v-model="password" :feedback="true" toggleMask class="w-full"
                            promptLabel="请输入密码" weakLabel="简单" mediumLabel="中等" strongLabel="复杂" />
                    </InputGroup>
                    <small v-if="passwordError != ''" class="text-red-500">{{ passwordError }}</small>
                </div>
                <div class="mb-6">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-lock"></i>
                        </InputGroupAddon>
                        <Password placeholder="确认密码" v-model="confirmPassword" :feedback="false" toggleMask
                            class="w-full" />
                    </InputGroup>
                    <small v-if="confirmPasswordError != ''" class="text-red-500">{{ confirmPasswordError }}</small>
                </div>
                <div class="mb-4">
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-verified"></i>
                        </InputGroupAddon>
                        <InputText placeholder="邮箱验证码" v-model="captcha" class="w-full" />
                        <Button :label="buttonLabel" :disabled="isButtonDisabled" class="p-button-primary"
                            @click="sendVerificationCode" />
                    </InputGroup>
                    <small v-if="captchaError != ''" class="text-red-500">{{ captchaError }}</small>
                </div>
                <Button label="注册" class="w-full p-button-primary" type="submit" />
            </form>
            <div class="flex justify-center mt-8 mb-2">
                <RouterLink to="/auth/login" class="font-medium no-underline cursor-pointer text-primary">已有账户? 点击登录
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import globalMessage from '@/common/utils/toast';
import { sendCaptcha, register } from '@/auth/authAPI';
import { ResponseCode } from '@/common/constant/ResponseCode';
import router from '@/common/utils/router';

const isButtonDisabled = ref(false);
const buttonLabel = ref('获取验证码');
let timer: number | undefined;
// 定义表单验证规则
const schema = yup.object({
    username: yup.string().required('用户名是必填项'),
    email: yup.string().required('邮箱是必填项').email('请输入有效的邮箱地址'),
    password: yup.string().required('密码是必填项').min(6, '密码至少需要6个字符'),
    confirmPassword: yup.string().required('确认密码是必填项').oneOf([yup.ref('password')], '密码和确认密码不一致'),
    captcha: yup.string().required('验证码是必填项'),
});

// 使用 useForm 进行表单验证和处理
const { handleSubmit } = useForm({
    validationSchema: schema,
});

// 使用 useField 绑定各个表单字段
const { value: username, errorMessage: usernameError } = useField<string>('username');
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: password, errorMessage: passwordError } = useField<string>('password');
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword');
const { value: captcha, errorMessage: captchaError } = useField<string>('captcha');



const sendVerificationCode = async () => {
    // 发送验证码逻辑
    if (email.value === '') {
        globalMessage.error("验证码发送失败", '请输入邮箱');
        return;
    }
    const result = await sendCaptcha({ email: email.value });
    if (result != undefined && result.status === ResponseCode.SUCCESS) {
        globalMessage.successNoTitle('验证码已发送');
        startTimer();
    } else {
        globalMessage.error("验证码发送失败", result?.message);
    }
};
// 验证码60s倒计时
const startTimer = () => {
    let countdown = 60;
    isButtonDisabled.value = true;
    buttonLabel.value = `${countdown}秒后重试`;

    timer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            buttonLabel.value = `${countdown}秒后重试`;
        } else {
            clearInterval(timer);
            isButtonDisabled.value = false;
            buttonLabel.value = '获取验证码';
        }
    }, 1000);
};
// 注册提交逻辑
const onSubmit = handleSubmit(async values => {

    const result = await register({
        username: values.username,
        email: values.email,
        password: values.password,
        captcha: values.captcha,
    });
    if (result != undefined && result.status === ResponseCode.SUCCESS) {
        router.push('/auth/login');
        globalMessage.success('注册成功', '欢迎加入 WCFS!');
    }
});
</script>

<style scoped></style>