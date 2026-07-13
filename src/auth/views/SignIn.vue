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
                <Button label="通过旧系统登录" @click="hustojLoginFun" :loading="isHustojLogin"
                    :disabled="isHustojLogin || isloading" class="w-full mt-2 p-button-secondary" />
            </form>
        </div>
    </div>

    <!-- Dialog for Announcement -->
    <Dialog v-model:visible="visible" header="公告" :modal="true" class="w-full max-w-md rounded-lg"
        :style="{ width: '90vw', maxWidth: '400px' }">
        <div class="p-4">
            <p class="text-lg text-gray-700 dark:text-gray-300 mb-2">
                如果您是首次登录，请登录旧系统后点击通过旧系统登录按钮进行登录。
            </p>
        </div>
        <template #footer>
            <Button label="关闭" class="p-button-text" @click="visible = false" />
        </template>
    </Dialog>
    <div id="captcha-box" v-show="isCaptchaVisible"></div>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { ref, onMounted } from 'vue';
import { login as loginApi, survive, hustojLogin } from '@/auth/authAPI'
import { useForm, useField } from 'vee-validate';
import globalMessage from '@/common/utils/toast';
import router from '@/common/utils/router';
import { useUserStore } from '@/common/utils/store';
import { User } from '@/common/entity/user'
import { Role } from '@/common/constant/Role'
import { ResponseCode } from '@/common/constant/ResponseCode'
import '@/common/utils/tac/css/tac.css';
import '@/common/utils/tac/js/tac.min.js';

type CaptchaRequestChain = {
    postRequest?: (name: string, request: unknown, response: any) => void;
};

type CaptchaConfig = {
    addRequestChain?: (chain: CaptchaRequestChain) => void;
};

type CaptchaInstance = {
    init: () => void;
    destroyWindow: () => void;
    reloadCaptcha: () => void;
    config?: CaptchaConfig;
};

type CaptchaStyle = {
    logoUrl?: string | null;
} & Record<string, unknown>;

declare global {
    interface Window {
        TAC?: new (config: unknown, style: CaptchaStyle) => CaptchaInstance;
    }
}
const counterStore = useUserStore();

const isloading = ref(false);
const isHustojLogin = ref(false);
const visible = ref(false);
const isCaptchaVisible = ref(false);
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
    await submitHustojLogin({
        username: username.value || '',
        password: password.value || ''
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

const normalizeCaptchaResponse = (response: any) => {
    if (!response || typeof response !== 'object') {
        return;
    }

    if (typeof response.code === 'undefined' && typeof response.status !== 'undefined') {
        response.code = response.status;
    }

    if (typeof response.msg === 'undefined' && typeof response.message !== 'undefined') {
        response.msg = response.message;
    }
};

const createCaptcha = (config: unknown, style: CaptchaStyle): CaptchaInstance => {
    if (!window.TAC) {
        throw new Error('TAC script not loaded');
    }
    const captcha = new window.TAC(config, style);
    captcha.config?.addRequestChain?.({
        postRequest: (_name, _request, response) => {
            normalizeCaptchaResponse(response);
        }
    });

    return captcha;
};

type LoginValues = { username: string; password: string };

const submitLogin = async (values: LoginValues, captchaToken?: string) => {
    isloading.value = true;
    try {
        const params = {
            username: values.username,
            password: values.password,
            ...(captchaToken ? { captchaToken } : {})
        };
        const res = await loginApi(params);

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
        if (error?.code === ResponseCode.CAPTCHA_ERROR_OR_REQUIRED && !captchaToken) {
            globalMessage.info('提示', '需要验证码验证，请完成验证后继续登录');
            await openCaptcha(values, async (token) => {
                await submitLogin(values, token);
            });
            return;
        }
        globalMessage.error('登录失败', error?.message || String(error));
    } finally {
        isloading.value = false;
    }
};

const submitHustojLogin = async (values: LoginValues, captchaToken?: string) => {
    isHustojLogin.value = true;
    try {
        const params = {
            username: values.username,
            password: values.password,
            ...(captchaToken ? { captchaToken } : {})
        };
        const res = await hustojLogin(params);
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
    } catch (error: any) {
        if (error?.code === ResponseCode.CAPTCHA_ERROR_OR_REQUIRED && !captchaToken) {
            globalMessage.info('提示', '需要验证码验证，请完成验证后继续登录');
            await openCaptcha(values, async (token) => {
                await submitHustojLogin(values, token);
            });
            return;
        }
        globalMessage.error('错误', error?.message || String(error));
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    } finally {
        isHustojLogin.value = false;
    }
};

const openCaptcha = async (values: LoginValues, onSuccess: (token: string) => Promise<void>) => {
    const config = {
        requestCaptchaDataUrl: '/api/a/captcha/gen',
        validCaptchaUrl: '/api/a/captcha/check',
        bindEl: '#captcha-box',
        validSuccess: async (res: any, _captcha: unknown, tac?: CaptchaInstance) => {
            tac?.destroyWindow();
            isCaptchaVisible.value = false;
            const token = res?.data?.token || res?.data?.id;
            if (!token) {
                globalMessage.error('错误', '验证码校验成功但未返回 token');
                return;
            }
            await onSuccess(token);
        },
        validFail: (_res: any, captcha: CaptchaInstance) => {
            globalMessage.error('错误', '验证码验证失败，请重试');
            captcha.reloadCaptcha();
        },
        btnRefreshFun: (_el: unknown, captcha: CaptchaInstance) => {
            captcha.reloadCaptcha();
        },
        btnCloseFun: (_el: unknown, captcha: CaptchaInstance) => {
            captcha.destroyWindow();
            isCaptchaVisible.value = false;
        }
    };

    const style: CaptchaStyle = {
        logoUrl: null
    };

    try {
        isCaptchaVisible.value = true;
        const captcha = createCaptcha(config, style);
        captcha.init();
    } catch (error) {
        isCaptchaVisible.value = false;
        globalMessage.error('错误', '初始化验证码失败');
        console.error('初始化tac失败', error);
    }
};

const onSubmit = handleSubmit(async (values) => {
    await submitLogin({
        username: values.username,
        password: values.password
    });
});



</script>

<style scoped>
#captcha-box {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    background: rgba(0, 0, 0, 0.35);
}

#captcha-box:empty {
    display: none;
}
</style>
