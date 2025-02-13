export default [
    {
      path:'/home',
      name:'Home',
      components: {
        main: () => import('@/common/views/Index.vue')
      }
    },
    {
      path:'/forbidden',
      name:'Forbidden',
      components: {
        main: () => import('@/common/components/ForbiddenView.vue')
      }
    }
];