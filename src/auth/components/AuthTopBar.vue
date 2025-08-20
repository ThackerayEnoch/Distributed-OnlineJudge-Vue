<script lang="ts">
import { useLayout } from '@/common/views/layout/layout';
import AppConfigurator from '@/common/views/layout/AppConfigurator.vue';
export default {
    name: 'AuthTopBar',
    setup() {
        const { toggleDarkMode, isDarkTheme } = useLayout();
        return { toggleDarkMode, isDarkTheme };
    },
    components: {
        AppConfigurator,
    },
};
</script>
<template>
    <div class="layout-topbar bg-surface-50 dark:bg-surface-900">
        <div class="layout-topbar-logo-container">
            <router-link to="/home" class="layout-topbar-logo">
                <img src="@/common/assets/ujn.svg" alt="Logo" style="width: 13%; height: auto;" />
                <span class="ml-1">UJNOJ</span>
            </router-link>
        </div>
        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button" class="layout-topbar-action layout-topbar-action-highlight">
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>
        </div>
    </div>
</template>