<template>
    <Button label="Submit" />
</template>

<script lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
export default {
    name: 'HomeIndex',
    setup() {
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
        };
    },
};
</script>

<style scoped>
/* Your component's styles go here */
</style>