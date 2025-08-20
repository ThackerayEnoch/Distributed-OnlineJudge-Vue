<template>
    <GroupCreate type="edit" :id="props.id" />
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import GroupCreate from '@/group/GroupCreate.vue'
const props = defineProps({
    type: String,
    id: String
});
</script>