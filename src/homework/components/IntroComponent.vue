<template>
    <div>
        <h1 class="text-gray-600 text-2xl dark:text-white">作业简介</h1>
        <MdPreview :theme="layoutConfig.darkTheme ? 'dark' : 'light'" :modelValue="props.description" />
    </div>
</template>
<script lang="ts" setup>
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import { layoutConfig } from '@/common/views/layout/layout';
const props = defineProps<{
    description: string;
}>();
</script>