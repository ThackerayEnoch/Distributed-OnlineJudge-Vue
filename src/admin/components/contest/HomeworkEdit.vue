<template>
    <HomeworkCreate type="edit" :id="id" />
</template>
<script setup lang="ts">
import HomeworkCreate from '@/admin/components/contest/HomeworkCreate.vue';
import { defineProps } from 'vue';

defineProps({
    id: Number,
});
</script>