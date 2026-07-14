<template>
    <div class="flex justify-center items-center w-full py-8">
        <!-- 用户信息卡片 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-7xl space-y-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">您的信息</h1>

            <!-- 用户头像编辑区域 -->
            <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">头像</h2>
                <div class="flex flex-col md:flex-row items-center">
                    <!-- 用户头像 -->
                    <div class="md:w-1/4 w-full flex justify-center">
                        <img class="rounded-full w-32 h-32 object-cover" alt="用户头像" />
                    </div>
                    <!-- 头像修改按钮 -->
                    <div class="md:w-3/4 w-full mt-6 md:mt-0 md:pl-6">
                        <Button label="更改头像" icon="pi pi-camera" class="p-button-primary" />
                    </div>
                </div>
            </div>

            <!-- 用户基本信息区域 -->
            <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">基本信息</h2>
                <div class="space-y-6">
                    <!-- 用户名 -->
                    <div class="flex flex-col">
                        <label for="username" class="font-semibold text-gray-900 dark:text-gray-100">用户名</label>
                        <InputText id="username" v-model="user.username" class="w-full" />
                    </div>
                    <!-- 邮箱 -->
                    <div class="flex flex-col">
                        <label for="email" class="font-semibold text-gray-900 dark:text-gray-100">邮箱</label>
                        <InputText id="email" v-model="user.email" class="w-full" disabled />
                    </div>
                    <!-- 个人简介 -->
                    <div class="flex flex-col">
                        <label for="bio" class="font-semibold text-gray-900 dark:text-gray-100">个人简介</label>
                        <Textarea id="bio" v-model="user.bio" class="w-full" rows="3" />
                    </div>
                </div>
            </div>

            <!-- 用户安全区域 -->
            <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
                <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">安全设置</h2>
                <div class="space-y-6">
                    <!-- 当前密码 -->
                    <div class="flex flex-col">
                        <label for="currentPassword" class="font-semibold text-gray-900 dark:text-gray-100">当前密码</label>
                        <Password id="currentPassword" v-model="user.currentPassword" class="w-full" />
                    </div>
                    <!-- 新密码 -->
                    <div class="flex flex-col">
                        <label for="newPassword" class="font-semibold text-gray-900 dark:text-gray-100">新密码</label>
                        <Password id="newPassword" v-model="user.newPassword" class="w-full" />
                    </div>
                    <!-- 确认密码 -->
                    <div class="flex flex-col">
                        <label for="confirmPassword"
                            class="font-semibold text-gray-900 dark:text-gray-100">确认新密码</label>
                        <Password id="confirmPassword" v-model="user.confirmPassword" class="w-full" />
                    </div>
                </div>
            </div>

            <!-- 保存按钮 -->
            <div class="flex justify-end">
                <Button label="保存" icon="pi pi-check" @click="saveUserInfo" />
            </div>
        </div>
    </div>
</template>

<script>
import { reactive } from 'vue';
export default {
    name: 'ProfileInfo',
    props: ['username'],
    setup(props) {
        const user = reactive({
            username: props.username,
            email: 'HU@qq.com',
            bio: 'Hello World!',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        const saveUserInfo = () => {
            console.log('保存用户信息', user.value);
        };
        return {
            user,
            saveUserInfo
        };
    }
};
</script>

<style scoped>
/* 自定义样式 */
</style>