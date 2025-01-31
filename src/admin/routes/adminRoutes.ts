export default [
    {
      path:'/admin',
      name: 'Admin',
      components:{
        app: () => import('@/admin/views/AdminLayout.vue')
      },
      children: [
        {
          path: '/admin',
          redirect: '/admin/dashboard'
        },
        {
          path:'/admin/dashboard',
          name:'Dashboard',
          components: {
            admin: () => import('@/admin/views/DashboardView.vue')
          }
        },
        {
          path:'/admin/problems/list',
          name:'ProblemList',
          components: {
            admin: () => import('@/admin/views/ProblemList.vue')
          }
        }
      ]
    }
];