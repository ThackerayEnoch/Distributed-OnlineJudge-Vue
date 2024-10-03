<script setup lang="ts">
import { RouterView } from 'vue-router'
import AuthTopBar from '@/auth/components/AuthTopBar.vue';
</script>
<template>
    <AuthTopBar />
    <RouterView name="auth"></RouterView>
</template>