<template>
    <h1 class="text-gray-600 text-2xl dark:text-white">作业简介</h1>
    <div class="mt-3 p-4 bg-gray-200 rounded-md dark:text-black">{{ description }}</div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';

const props = defineProps<{
    description: string;
}>();
onMounted(() => {
    console.log(props.description);
});
</script>