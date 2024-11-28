export default {
    path: '/:pathMatch(.*)*', // 捕获所有未匹配路径
    name: 'NotFound',
    components:{
        app: () => import('@/common/components/NotFound.vue')
    },
};