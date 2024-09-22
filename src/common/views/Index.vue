<template>
    <Button label="Submit" @click="getUserData" />
    <Panel v-if="currentUser != null" header="UserInfo">
        <p>{{ currentUser }}</p>
    </Panel>
</template>

<script lang="ts">
import { getUserInfo } from '@/user/userAPI';
import { useUserStore } from '@/common/utils/store'
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { ResponseCode } from '../constant/ResponseCode';
import { User } from '@/user/entity/user';
export default {
    name: 'HomeIndex',
    setup() {
        const userStore = useUserStore();
        const { currentUser, setUser } = userStore
        // 1. 定义状态
        const count = ref(0);
        const state = reactive({
            message: 'Hello, world!',
        });

        // 2. 定义计算属性
        const doubledCount = computed(() => count.value * 2);

        // 3. 定义侦听器
        watch(count, (newValue, oldValue) => {
            console.log(`Count changed from ${oldValue} to ${newValue}`);
        });
        // 4. 使用组合函数

        // 5. 定义方法
        const getUserData = async () => {
            const res = await getUserInfo();
            if (res.status === ResponseCode.SUCCESS) {
                const user = new User();
                user.id = res.data?.id ?? '';
                user.username = res.data?.username ?? '';
                user.originalUsername = res.data?.originalUsername ?? '';
                user.password = res.data?.password ?? '';
                user.salt = res.data?.salt ?? '';
                user.email = res.data?.email ?? '';
                user.role = res.data?.role ?? '';
                user.createTime = res.data?.createTime ?? '';
                user.updateTime = res.data?.updateTime ?? '';
                console.log(user)
                setUser(user);
                console.log(currentUser)
            } else {
                console.log('获取用户信息失败')
            }
        };

        // 6. 生命周期钩子
        onMounted(() => {
            console.log('Component mounted');
        });

        onUnmounted(() => {
            console.log('Component unmounted');
        });

        return {
            count,
            state,
            doubledCount,
            getUserData,
            currentUser,
        };
    },
};
</script>

<style scoped>
/* Your component's styles go here */
</style>