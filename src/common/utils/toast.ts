import app from '@/main';
const toast = app.config.globalProperties.$toast;
const globalMessage = {
    success: (title: string, msg: string) => {
        toast.add({ severity: 'success', summary: title, detail: msg, life: 3000 });
    },
    info: (title: string, msg: string) => {
        toast.add({ severity: 'info', summary: title, detail: msg, life: 3000 });
    },
    warn: (title: string, msg: string) => {
        toast.add({ severity: 'warn', summary: title, detail: msg, life: 3000 });
    },
    error: (title: string, msg: string) => {
        toast.add({ severity: 'error', summary: title, detail: msg, life: 3000 });
    },
    secondary: (title: string, msg: string) => {
        toast.add({ severity: 'secondary', summary: title, detail: msg, life: 3000 });
    },
    contrast: (title: string, msg: string) => {
        toast.add({ severity: 'contrast', summary: title, detail: msg, life: 3000 });
    }
};
export default globalMessage;