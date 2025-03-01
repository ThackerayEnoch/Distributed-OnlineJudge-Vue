<script setup>
import AppTopBar from '@/common/views/layout/AppTopBar.vue';
import { useLayout } from '@/common/views/layout/layout';
import { computed } from 'vue';

const { layoutConfig, layoutState } = useLayout();


const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    };
});

</script>
<template>
    <div class="layout-wrapper" :class="containerClass">
        <AppTopBar />
        <div class="layout-main-container">
            <div class="layout-main">
                <RouterView name="main" />
            </div>
        </div>
        <div class="layout-mask animate-fadein"></div>
    </div>
</template>
<style scoped>
html,
body {
    height: 100%;
    margin: 0;
}

.layout-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.layout-main-container {
    display: flex;
    flex: 1;
}

.layout-main {
    display: flex;
    justify-content: center;
    /* 水平方向居中 */
    flex: 1;
}
</style>