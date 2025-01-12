import { createRouter, createWebHistory } from 'vue-router';
import notFoundRoute from '@/common/routes/notFoundRoutes';
import layoutRoutes from '@/common/routes/layoutRoutes';
import authRoutes from '@/auth/routes/authRoutes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...layoutRoutes,
    ...authRoutes,
    notFoundRoute
  ]
});

export default router;