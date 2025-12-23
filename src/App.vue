<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
const router = useRouter();
// 监听路由变化并更新进度条
router.beforeEach((to, from, next) => {
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
});
</script>

<template>
  <Toast />
  <Toast position="bottom-right" group="bl" />
  <RouterView name="app" />
</template>

<style scoped></style>
