<template>
    <div class="w-full flex flex-col space-y-8 pt-8 pb-4">
        <!-- 欢迎图独立容器 -->
        <div class="max-w-7xl w-full mx-auto px-4">
            <div class="bg-white border rounded-lg shadow-sm">
                <div class="p-4">
                    <img src="@/common/assets/logo.png" alt="济南大学在线测评系统"
                        class="w-full h-64 object-cover rounded-lg bg-gray-100" />
                </div>
            </div>
        </div>

        <!-- 公告独立容器 -->
        <div class="max-w-7xl w-full mx-auto px-4">
            <div class="bg-white dark:bg-gray-900 border rounded-lg shadow-sm">
                <h2
                    class="text-2xl font-bold text-ujn-red bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b dark:border-gray-600">
                    系统公告
                </h2>
                <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                    <li v-for="(notice, index) in notices" :key="index"
                        class="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div class="flex items-center justify-between text-gray-700 dark:text-gray-300">
                            <RouterLink :to="`/notices/${notice.id}`" class="truncate">{{ notice.title }}</RouterLink>
                            <span class="text-sm text-gray-500 dark:text-gray-400 ml-4">{{ notice.createTime }}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>


        <!-- 页脚独立容器 -->
        <div class="max-w-7xl w-full mx-auto px-4 mt-auto">
            <footer class="pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                <p class="mt-2">
                    推荐浏览器：Chrome Edge Firefox
                </p>
                <p>
                    {{ new Date().getFullYear() }} UJNOJ | 部分功能基于
                    <a href="https://github.com/HimitZH/HOJ" class="text-blue-600 hover:underline mx-1">
                        HOJ
                    </a>
                    和
                    <a href="https://github.com/criyle/go-judge" class="text-blue-600 hover:underline mx-1">
                        go-judge
                    </a>
                    开发。
                </p>
            </footer>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import { type NoticesSpace, getAllNotices } from '@/common/views/noticeAPI';
export default {
    name: 'HomeIndex',
    setup() {
        const notices = ref<NoticesSpace.NoticesVO[]>([]);
        function openLink(url: string) {
            window.open(url, '_blank');
        }
        onMounted(() => {
            loadAllNotices();
        });
        async function loadAllNotices() {
            await getAllNotices(5).then((res) => {
                notices.value = res.data as NoticesSpace.NoticesVO[];
            }).catch((err) => {
                console.error('获取通知列表失败！' + err.message);
            });
        }
        return {
            openLink,
            notices,
        };
    },
};
</script>

<style scoped>
/* Your component's styles go here */
</style>