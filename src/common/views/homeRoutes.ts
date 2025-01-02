export default [
    {
      path:'/home',
      name:'Home',
      components: {
        main: () => import('@/common/views/Index.vue')
      }
    }
];