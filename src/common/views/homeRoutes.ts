export default [
    {
      path:'/',
      name:'Home',
      components: {
        main: () => import('@/common/views/Index.vue')
      }
    }
];