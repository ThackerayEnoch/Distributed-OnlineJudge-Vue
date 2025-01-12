import homeRoute from '@/common/views/homeRoutes';
import demoRoutes from '@/demo/routes/demoRoutes';
import profileRoutes from '@/user/routes/profileRoutes';
import problemRoutes from '@/problem/routes/problemRoutes';
export default [
  {
    path: '/',
    name: 'Layout',
    redirect: () => `/home`,
    components:{
      app: () => import('@/common/views/layout/AppLayout.vue')
    },
    children: [
      ...homeRoute,
      ...profileRoutes,
      ...demoRoutes,
      ...problemRoutes
    ]
  }
];