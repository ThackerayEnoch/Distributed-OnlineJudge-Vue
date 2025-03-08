import { computed, reactive,ref, readonly } from 'vue';

export const layoutConfig = reactive({
    preset: 'Aura',
    primary: 'emerald',
    surface: null,
    darkTheme: false,
    menuMode: 'static'
});

const layoutState = reactive({
    staticMenuDesktopInactive: true,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    activeMenuItem: null,
    activeMenuItems: ref<string[]>([])
});

export function useLayout() {
    const setPrimary = (value: string) => {
        layoutConfig.primary = value;
    };

    const setSurface = (value: null) => {
        layoutConfig.surface = value;
    };

    const setPreset = (value: string) => {
        layoutConfig.preset = value;
    };

    const setActiveMenuItem = (item: { value: any; }) => {
        layoutState.activeMenuItem = item.value || item;
    };

    const setMenuMode = (mode: string) => {
        layoutConfig.menuMode = mode;
    };
    function toggleMenuItem(itemKey: string) {
        const index = layoutState.activeMenuItems.indexOf(itemKey);
        if (index > -1) {
            layoutState.activeMenuItems.splice(index, 1);
        } else {
            layoutState.activeMenuItems.push(itemKey);
        }
    }
    
    function isMenuItemActive(itemKey: string): boolean {
        return layoutState.activeMenuItems.includes(itemKey);
    }
    const toggleDarkMode = () => {
        if (!(document as any).startViewTransition) {
            executeDarkModeToggle();

            return;
        }
        !(document as any).startViewTransition(() => executeDarkModeToggle());
    };

    const executeDarkModeToggle = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme;
        document.documentElement.classList.toggle('app-dark');
    };

    const onMenuToggle = () => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        if (window.innerWidth > 991) {
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    const resetMenu = () => {
        layoutState.overlayMenuActive = false;
        layoutState.staticMenuMobileActive = false;
        layoutState.menuHoverActive = false;
    };

    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive);

    const isDarkTheme = computed(() => layoutConfig.darkTheme);

    const getPrimary = computed(() => layoutConfig.primary);

    const getSurface = computed(() => layoutConfig.surface);

    return { layoutConfig: readonly(layoutConfig), layoutState: readonly(layoutState), toggleMenuItem,isMenuItemActive, onMenuToggle, isSidebarActive, isDarkTheme, getPrimary, getSurface, setActiveMenuItem, toggleDarkMode, setPrimary, setSurface, setPreset, resetMenu, setMenuMode };
}