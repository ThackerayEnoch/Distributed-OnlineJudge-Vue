export default [
    {
      path:'/home',
      name:'Home',
      components: {
        main: () => import('@/common/views/Index.vue')
      }
    },
    {
      path:'/notices/:id',
      name:'Notices',
      components: {
        main: () => import('@/common/views/NoticesView.vue')
      },
      props: true
    },
    {
      path:'/forbidden',
      name:'Forbidden',
      components: {
        main: () => import('@/common/components/ForbiddenView.vue')
      }
    }
];