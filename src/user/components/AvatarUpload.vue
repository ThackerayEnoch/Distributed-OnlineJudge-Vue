<template>
    <div class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">头像</h2>
        <div class="flex flex-col md:flex-row items-center">
            <!-- 用户头像显示 -->
            <div class="md:w-1/4 w-full flex justify-center">
                <img class="rounded-full w-32 h-32 object-cover" :src="avatarUrl" alt="用户头像" />
            </div>

            <!-- 头像上传按钮 -->
            <div class="md:w-3/4 w-full mt-6 md:mt-0 md:pl-6">
                <FileUpload v-model="file" name="avatar" accept="image/*" customUpload :auto="true"
                    :chooseLabel="'选择文件'" @upload="handleUpload" class="p-button-primary" />

                <span v-if="errorMessage" class="text-red-500">{{ errorMessage }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// 头像相关状态
const avatarUrl = ref('https://r2.wcfs.dokidokiujn.ninja/WCFS/User/ProfilePhoto/EdReO11VAAIQygI.jpg');
const file = ref(null);
const errorMessage = ref('');

// 上传处理逻辑
const handleUpload = () => {
    const selectedFile = file.value.files[0];

    // 校验文件类型和大小
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(selectedFile.type)) {
        errorMessage.value = '仅支持 JPG, PNG, GIF 格式的图片。';
        return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) { // 限制大小为2MB
        errorMessage.value = '图片大小不能超过 2MB。';
        return;
    }

    // 文件符合要求，读取并显示头像
    const reader = new FileReader();
    reader.onload = (e) => {
        avatarUrl.value = e.target.result;
        errorMessage.value = ''; // 清空错误信息
    };
    reader.readAsDataURL(selectedFile);
};
</script>

<style scoped>
/* 可根据需要定制样式 */
</style>