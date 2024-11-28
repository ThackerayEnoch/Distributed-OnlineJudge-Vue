import homeRoute from '@/common/views/homeRoutes';
import demoRoutes from '@/demo/routes/demoRoutes';
import profileRoutes from '@/user/routes/profileRoutes';

export default [
  {
    path: '/',
    name: 'Layout',
    components:{
      app: () => import('@/common/views/layout/AppLayout.vue')
    },
    children: [
      ...homeRoute,
      ...profileRoutes,
      ...demoRoutes
    ]
  }
];