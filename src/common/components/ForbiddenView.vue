<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="text-center">
            <i class="pi pi-lock text-6xl text-red-500 mb-4"></i>
            <h1 class="text-4xl font-bold mb-2">403 Forbidden</h1>
            <p class="text-lg text-gray-700">You don't have permission to access this page.</p>
            <router-link to="/" class="mt-4 inline-block px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                Go to Home
            </router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ForbiddenView',
}
</script>

<style scoped>
</style>