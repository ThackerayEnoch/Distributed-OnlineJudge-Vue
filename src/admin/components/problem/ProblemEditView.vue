<template>
    <div>
        <ProblemEdit :id="props.id" type="edit" />
    </div>
</template>
<script setup lang="ts">
import ProblemEdit from '@/admin/components/ProblemEdit.vue'
import { defineProps } from 'vue'
const props = defineProps<{
    id: number
}>()
</script>
<style scoped></style>