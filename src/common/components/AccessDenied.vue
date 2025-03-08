<template>
    <div class="w-full h-full">
        <div class="flex justify-center items-start pt-16 h-full p-4">
            <div class="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300">
                <div class="p-8 space-y-6">
                    <!-- 图标部分 -->
                    <div class="flex justify-center">
                        <i class="pi pi-lock text-7xl text-red-400 animate-bounce"></i>
                    </div>

                    <!-- 标题 -->
                    <h1 class="text-3xl font-bold text-gray-800 text-center">
                        <i class="pi pi-shield mr-3 text-red-500"></i>
                        访问受限
                    </h1>

                    <!-- 信息内容 -->
                    <div class="space-y-4 text-center">
                        <div class="bg-red-50 rounded-lg p-4">
                            <p class="text-red-600 font-medium text-lg">
                                {{ message || '权限校验未通过' }}
                            </p>
                        </div>
                        <p class="text-gray-500 text-sm">
                            济南大学OJ系统认证提示（错误码：403）
                        </p>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="pt-6 border-t border-gray-100">
                        <div class="flex flex-col sm:flex-row justify-center gap-4">
                            <router-link :to="btnTo" class="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl 
                       transition-all duration-200 flex items-center justify-center space-x-2" v-wave>
                                <i :class="btnIcon"></i>
                                <span>{{ btnLabel }}</span>
                            </router-link>
                            <button @click.prevent="$router.back()" class="flex-1 sm:flex-none px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl
                       transition-all duration-200 flex items-center justify-center space-x-2" v-wave>
                                <i class="pi pi-arrow-left"></i>
                                <span>返回上一级</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        message: {
            type: String,
            required: true
        },
        btnLabel: {
            type: String,
            default: '立即登录'
        },
        btnIcon: {
            type: String,
            default: 'pi pi-sign-in'
        },
        btnTo: {
            type: String,
            default: '/auth/login'
        }
    }
}
</script>

<style scoped>
/* 微调动画效果 */
.animate-bounce {
    animation: bounce 1.5s infinite;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}
</style>