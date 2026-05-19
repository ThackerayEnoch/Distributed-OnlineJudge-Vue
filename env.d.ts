/// <reference types="vite/client" />
interface Window {
    initTianaiCaptcha: any; // 或者具体的函数类型
}
declare module '@/common/utils/tac/js/tac.min.js' {
    const initTianaiCaptcha: any;
    export { initTianaiCaptcha };
}